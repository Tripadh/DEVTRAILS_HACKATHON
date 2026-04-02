import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

os.makedirs("models", exist_ok=True)
os.makedirs("data", exist_ok=True)

np.random.seed(42)
n = 10000

cities = ["Hyderabad", "Bangalore", "Mumbai", "Chennai", "Delhi", "Pune"]
personas = ["food", "ecommerce", "grocery"]
disruption_types = ["heavy_rain", "flood", "extreme_heat", "severe_pollution", "curfew", "strike"]

df = pd.DataFrame({
    "rainfall_mm":              np.random.uniform(0, 120, n),
    "temperature_celsius":      np.random.uniform(22, 48, n),
    "aqi":                      np.random.uniform(50, 400, n),
    "wind_speed_kmh":           np.random.uniform(0, 80, n),
    "disruption_type":          np.random.choice(disruption_types, n),
    "city":                     np.random.choice(cities, n),
    "persona":                  np.random.choice(personas, n),
    "worker_zone_risk_score":   np.random.uniform(0.1, 1.0, n),
    "hours_lost":               np.random.uniform(0, 8, n),
})

def calculate_payout(row):
    base = 100

    if row["rainfall_mm"] > 50:              base += 150
    if row["temperature_celsius"] > 42:      base += 100
    if row["aqi"] > 300:                     base += 100
    if row["disruption_type"] in ["flood", "curfew"]: base += 80

    if row["persona"] == "grocery":          base += 40
    elif row["persona"] == "food":           base += 20

    if row["city"] in ["Mumbai", "Chennai"]: base += 30
    elif row["city"] == "Delhi":             base += 20

    base += row["hours_lost"] * 20
    base += row["worker_zone_risk_score"] * 50

    return round(min(max(base, 300), 500), 2)

df["payout_amount"] = df.apply(calculate_payout, axis=1)

df.to_csv("data/synthetic_data.csv", index=False)
print("Synthetic data saved → data/synthetic_data.csv")

le_disruption = LabelEncoder()
le_city       = LabelEncoder()
le_persona    = LabelEncoder()

df["disruption_encoded"] = le_disruption.fit_transform(df["disruption_type"])
df["city_encoded"]       = le_city.fit_transform(df["city"])
df["persona_encoded"]    = le_persona.fit_transform(df["persona"])

features = [
    "rainfall_mm", "temperature_celsius", "aqi", "wind_speed_kmh",
    "disruption_encoded", "city_encoded", "persona_encoded",
    "worker_zone_risk_score", "hours_lost"
]

X = df[features]
y = df["payout_amount"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

payout_model = RandomForestRegressor(n_estimators=100, random_state=42)
payout_model.fit(X_train, y_train)
print(f"Payout model trained  |  Test R²: {payout_model.score(X_test, y_test):.3f}")

fraud_features = np.column_stack([
    np.random.uniform(0, 1, n),
    np.random.randint(1, 4, n),
    np.random.randint(0, 2, n),
])

fraud_model = IsolationForest(contamination=0.1, random_state=42)
fraud_model.fit(fraud_features)
print("Fraud model trained")

joblib.dump(payout_model,  "models/payout_model.pkl")
print("Payout model saved  → models/payout_model.pkl")

joblib.dump(fraud_model,   "models/fraud_model.pkl")
print("Fraud model saved   → models/fraud_model.pkl")

joblib.dump(le_disruption, "models/le_disruption.pkl")
print("le_disruption saved → models/le_disruption.pkl")

joblib.dump(le_city,       "models/le_city.pkl")
print("le_city saved       → models/le_city.pkl")

joblib.dump(le_persona,    "models/le_persona.pkl")
print("le_persona saved    → models/le_persona.pkl")

print("\nTraining complete! All models and encoders saved.")