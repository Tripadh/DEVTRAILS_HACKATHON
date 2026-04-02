import os
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import joblib
from datetime import datetime
    
app = FastAPI(
    title="Gig Worker Insurance API",
    description="ML-powered payout prediction and fraud detection for gig workers",
    version="1.0.0"
)

MODEL_DIR = os.getenv("MODEL_DIR", "models")

payout_model  = None
fraud_model   = None
le_disruption = None
le_city       = None
le_persona    = None

@app.on_event("startup")
def load_models():
    global payout_model, fraud_model, le_disruption, le_city, le_persona

    artifacts = {
        "payout_model":  "payout_model.pkl",
        "fraud_model":   "fraud_model.pkl",
        "le_disruption": "le_disruption.pkl",
        "le_city":       "le_city.pkl",
        "le_persona":    "le_persona.pkl",
    }

    loaded = {}
    for key, filename in artifacts.items():
        path = os.path.join(MODEL_DIR, filename)
        try:
            loaded[key] = joblib.load(path)
            print(f"[startup] ✓ Loaded {filename}")
        except FileNotFoundError:
            loaded[key] = None
            print(f"[startup] ✗ WARNING: {filename} not found in '{MODEL_DIR}/'")

    payout_model  = loaded["payout_model"]
    fraud_model   = loaded["fraud_model"]
    le_disruption = loaded["le_disruption"]
    le_city       = loaded["le_city"]
    le_persona    = loaded["le_persona"]

EXCLUDED_EVENTS = {"war", "pandemic", "national_emergency", "civil_unrest", "nuclear_event"}

VALID_DISRUPTIONS = {"heavy_rain", "flood", "extreme_heat", "severe_pollution", "curfew", "strike"}
VALID_CITIES      = {"Hyderabad", "Bangalore", "Mumbai", "Chennai", "Delhi", "Pune"}
VALID_PERSONAS    = {"food", "ecommerce", "grocery"}



class PayoutRequest(BaseModel):
    worker_id:               str   = Field(..., example="WRK-00123")
    city:                    str   = Field(..., example="Hyderabad")        # from VALID_CITIES
    persona:                 str   = Field(..., example="food")             # food | ecommerce | grocery
    disruption_type:         str   = Field(..., example="heavy_rain")       # from VALID_DISRUPTIONS
    rainfall_mm:             float = Field(..., ge=0,   le=120,  example=65.0)
    temperature_celsius:     float = Field(..., ge=22,  le=48,   example=38.0)
    aqi:                     float = Field(..., ge=50,  le=400,  example=250.0)
    wind_speed_kmh:          float = Field(..., ge=0,   le=80,   example=25.0)
    worker_zone_risk_score:  float = Field(..., ge=0.1, le=1.0,  example=0.7)
    hours_lost:              float = Field(..., ge=0,   le=8,    example=4.5)

class PayoutResponse(BaseModel):
    worker_id:        str
    eligible:         bool
    exclusion_reason: Optional[str] = None
    predicted_payout: Optional[float] = None
    risk_level:       Optional[str] = None   
    message:          str


class FraudRequest(BaseModel):
    claim_id:                     str   = Field(..., example="CLM-00456")
    worker_id:                    str   = Field(..., example="WRK-00123")
    claim_amount:                 float = Field(..., gt=0,  example=420.0)
    num_claims_last_12_months:    int   = Field(..., ge=0,  example=2)
    claimant_city:                str   = Field(..., example="Mumbai")
    registered_city:              str   = Field(..., example="Mumbai")
    time_since_policy_start_days: int   = Field(..., ge=0,  example=60)

class FraudResponse(BaseModel):
    claim_id:       str
    is_fraud:       bool
    anomaly_score:  float  
    risk_category:  str     
    reason:         str
    recommendation: str

def safe_encode(encoder, value: str, field_name: str) -> int:
    """Encode a categorical value using a fitted LabelEncoder from train.py."""
    if encoder is None:
        raise HTTPException(status_code=503, detail=f"Encoder for '{field_name}' is not loaded.")
    if value not in encoder.classes_:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Invalid {field_name} '{value}'. "
                f"Allowed values: {sorted(encoder.classes_.tolist())}"
            )
        )
    return int(encoder.transform([value])[0])


def payout_risk_level(payout: float) -> str:
    """Classify risk based on payout range (300–500 as per train.py clamp)."""
    if payout >= 450:
        return "high"
    elif payout >= 375:
        return "medium"
    return "low"


def anomaly_to_normalised(raw_score: float) -> float:
    """
    IsolationForest.score_samples() returns values roughly in (-0.5, 0).
    Map to [0, 1] where 1 = most anomalous.
    """
    return round(float(np.clip((raw_score + 0.5) * -2, 0.0, 1.0)), 4)


def fraud_risk_category(score: float) -> str:
    if score >= 0.6:
        return "high"
    elif score >= 0.3:
        return "medium"
    return "low"
@app.get("/health", tags=["Health"])
def health_check():
    """Returns API status and which models/encoders are successfully loaded."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "models_loaded": {
            "payout_model":  payout_model  is not None,
            "fraud_model":   fraud_model   is not None,
            "le_disruption": le_disruption is not None,
            "le_city":       le_city       is not None,
            "le_persona":    le_persona    is not None,
        }
    }


@app.post("/predict-payout", response_model=PayoutResponse, tags=["Payout"])
def predict_payout(req: PayoutRequest):
    """
    Predict insurance payout for a gig worker disruption claim.

    Feature pipeline matches train.py exactly:
      [rainfall_mm, temperature_celsius, aqi, wind_speed_kmh,
       disruption_encoded, city_encoded, persona_encoded,
       worker_zone_risk_score, hours_lost]
    """

    normalized = req.disruption_type.strip().lower().replace(" ", "_")
    if normalized in EXCLUDED_EVENTS:
        return PayoutResponse(
            worker_id=req.worker_id,
            eligible=False,
            exclusion_reason=f"Disruption type '{req.disruption_type}' is excluded from coverage.",
            message="Claim denied due to policy exclusion."
        )

    if payout_model is None:
        raise HTTPException(
            status_code=503,
            detail="Payout model is not loaded. Ensure models/payout_model.pkl exists."
        )

    disruption_enc = safe_encode(le_disruption, req.disruption_type, "disruption_type")
    city_enc       = safe_encode(le_city,       req.city,            "city")
    persona_enc    = safe_encode(le_persona,    req.persona,         "persona")

    features = np.array([[
        req.rainfall_mm,           # rainfall_mm
        req.temperature_celsius,   # temperature_celsius
        req.aqi,                   # aqi
        req.wind_speed_kmh,        # wind_speed_kmh
        disruption_enc,            # disruption_encoded
        city_enc,                  # city_encoded
        persona_enc,               # persona_encoded
        req.worker_zone_risk_score,# worker_zone_risk_score
        req.hours_lost             # hours_lost
    ]])

    try:
        predicted_payout = float(payout_model.predict(features)[0])
        predicted_payout = round(float(np.clip(predicted_payout, 300, 500)), 2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference error: {str(e)}")

    return PayoutResponse(
        worker_id=req.worker_id,
        eligible=True,
        predicted_payout=predicted_payout,
        risk_level=payout_risk_level(predicted_payout),
        message="Payout prediction successful."
    )


@app.post("/detect-fraud", response_model=FraudResponse, tags=["Fraud"])
def detect_fraud(req: FraudRequest):
    """
    Detect potential fraud in a gig worker insurance claim.

    Fraud feature vector matches train.py:
      [normalised_claim_amount (0–1), num_claims_last_12_months, location_mismatch_flag]

    Rule-based checks layer on top of the IsolationForest anomaly score.
    """

    if fraud_model is None:
        raise HTTPException(
            status_code=503,
            detail="Fraud model is not loaded. Ensure models/fraud_model.pkl exists."
        )

    reasons = []

    loc_mismatch = int(
        req.claimant_city.strip().lower() != req.registered_city.strip().lower()
    )
    if loc_mismatch:
        reasons.append(
            f"Location mismatch: claimant is in '{req.claimant_city}' "
            f"but policy is registered in '{req.registered_city}'."
        )

    if req.time_since_policy_start_days < 30:
        reasons.append(
            f"Claim filed only {req.time_since_policy_start_days} day(s) after policy start."
        )
    if req.num_claims_last_12_months >= 3:
        reasons.append(
            f"High claim frequency: {req.num_claims_last_12_months} claims in the last 12 months."
        )

    normalised_claim = float(np.clip(req.claim_amount / 500.0, 0.0, 1.0))

    fraud_features = np.array([[
        normalised_claim,
        req.num_claims_last_12_months,
        loc_mismatch
    ]])

    try:
        raw_score        = float(fraud_model.score_samples(fraud_features)[0])
        normalised_score = anomaly_to_normalised(raw_score)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud scoring error: {str(e)}")

    risk_category = fraud_risk_category(normalised_score)

    is_fraud = risk_category == "high" or len(reasons) >= 2

    reason_text = " | ".join(reasons) if reasons else "No specific red flags detected."

    if is_fraud:
        recommendation = "Escalate to fraud investigation team immediately."
    elif risk_category == "medium":
        recommendation = "Flag for manual review before processing."
    else:
        recommendation = "Proceed with standard claim processing."

    return FraudResponse(
        claim_id=req.claim_id,
        is_fraud=is_fraud,
        anomaly_score=normalised_score,
        risk_category=risk_category,
        reason=reason_text,
        recommendation=recommendation
    )