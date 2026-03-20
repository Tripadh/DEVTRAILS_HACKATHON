# 🛡️ GigShield
### AI-powered parametric insurance for gig delivery workers
Free, automatic payouts when rain, heat, or curfews make work impossible - no claims, no forms, money in 15 minutes.

[![Phase](https://img.shields.io/badge/Phase-1%20Submission-orange?style=flat-square)](https://github.com/Tripadh/DEVTRAILS_HACKATHON)
[![Platform](https://img.shields.io/badge/Platform-Mobile%20%28React%20Native%29-blue?style=flat-square)](https://github.com/Tripadh/DEVTRAILS_HACKATHON)
[![Payout Time](https://img.shields.io/badge/Payout%20Time-%3C15%20min-brightgreen?style=flat-square)](https://github.com/Tripadh/DEVTRAILS_HACKATHON)

 🎨 **[Figma Prototype](https://www.figma.com/make/XBmkg1ubjL8MjLYYMIDJZY/GigShield-App-Design?fullscreen=1&t=zO9xtBZ2OdJt265J-1)** | 📹 **[2-min Video](https://youtu.be/x2Gdp-J2RzI?si=XM8ghIRL1aSOBdy1)** | 🌐 **[Full UI Page](https://tripadh.github.io/DEVTRAILS_HACKATHON/)**

---

## 📋 Table of Contents

| # | Section |
|---|---------|
| 01 | [Problem Statement](#01--problem-statement) |
| 02 | [Our Solution](#02--our-solution) |
| 03 | [Persona Definition](#03--persona-definition) |
| 04 | [System Workflow](#04--system-workflow) |
| 05 | [Parametric Triggers](#05--parametric-triggers) |
| 06 | [Coverage Model](#06--coverage-model) |
| 07 | [AI / ML Architecture](#07--ai--ml-architecture) |
| 08 | [Anti-Spoofing Defense](#08--anti-spoofing-defense) |
| 09 | [Fraud Detection Pipeline](#09--fraud-detection-pipeline) |
| 10 | [Tech Stack](#10--tech-stack) |
| 11 | [System Architecture](#11--system-architecture) |
| 12 | [UX Design Flow](#12--ux-design-flow) |
| 13 | [Why Our Solution is Strong](#13--why-our-solution-is-strong) |
| 14 | [Future Scope](#14--future-scope) |

---

<a id="01--problem-statement"></a>
## 01 - Problem Statement

India's 12 million gig delivery workers lose income every time it rains, overheats, or a curfew drops. There is no insurance product designed for this. Filing a traditional claim takes weeks and usually gets rejected.

| Stat | Value |
|------|-------|
| 🛵 Gig delivery workers in India | 12 million+ |
| ⚠️ Experience monthly disruptions | 47% |
| 💸 Average monthly income lost | INR 2,400 |
| 🚫 Existing parametric insurance products for them | Zero |

The gap: when a monsoon hits Bengaluru or a curfew drops in Hyderabad, these workers lose the day with no safety net and no product built for their reality.

---

<a id="02--our-solution"></a>
## 02 - Our Solution

GigShield is a free, mobile-first parametric insurance platform that automatically detects external disruptions and pays workers directly to their UPI accounts, with no forms, no adjusters, and no waiting.

Key innovation: Traditional insurance = worker proves harm -> waits weeks.  
GigShield = system detects event -> pays in 15 minutes.

How it's funded: platform partners (Swiggy, Zomato, Zepto) pay GigShield per enrolled worker as a welfare benefit. Workers pay INR 0.

---

<a id="03--persona-definition"></a>
## 03 - Persona Definition

### 🛵 Ravi Kumar, 28 - Food Delivery Rider, South Bengaluru

| Income Pattern | Daily Life | Pain Points |
|----------------|------------|-------------|
| INR 700-900/day normally | 10-12 hrs, 6 days/week | INR 500-700 lost per rain day |
| Drops 70% on rain days | 18-22 deliveries/day | 3-4 disruption days/month |
| No paid leave or savings | Loses full day in heavy rain | Insurance claim rejected before |
| Sends INR 8,000/month home | Uses UPI for everything | Cannot afford annual premiums |

Ravi's GigShield moment:

> Rain hits Bengaluru. Before he decides whether to ride or wait, his phone buzzes.  
> "Heavy rain in your zone. INR 400 payout sent."  
> He filed nothing. Called no one.

---

<a id="04--system-workflow"></a>
## 04 - System Workflow

### End-to-end flow

```text
Worker App -> AI Risk Engine -> Coverage Live -> Zone Monitor -> Trigger Fires -> Fraud Check -> UPI Payout ✓
  (Signup)     (Zone+profile)   (Instant,free)  (Weather 24/7) (Threshold ✓)   (<30 sec)     (Notified)
```

### What the worker sees

1. Sign up with OTP -> link delivery account + UPI ID.
2. Coverage active immediately -> no payment needed.
3. App shows status: Protected / Checking / Payout processing.
4. Push notification + UPI transfer -> fully automatic.

### What the system does

A. Polls weather APIs every 15 min per geohash zone (~1.2km2).  
B. Matches affected zones to all active covered workers.  
C. Runs 3-layer fraud check in under 30 seconds.  
D. Dispatches UPI payout via Razorpay.

---

<a id="05--parametric-triggers"></a>
## 05 - Parametric Triggers

All payouts are triggered by verifiable external data, not worker claims. Every trigger requires 2+ independent sources to agree before firing.

| Event | Threshold | Payout | Data Source |
|-------|-----------|--------|-------------|
| 🌧️ Heavy Rain | >= 65mm/hr sustained 30+ min | INR 300-500 | IMD + OpenWeatherMap + Rainviewer |
| 🌡️ Extreme Heat | Feels-like >= 42C for 2+ hrs (11am-4pm) | INR 300-500 | IMD Heat Advisory + OWM Heat Index |
| 🚫 Curfew / Shutdown | Official government order in worker zone | INR 400-600 | NDMA + state disaster portals |
| 🌊 Urban Flooding | Municipal flood alert for ward/zone | INR 500-700 | BBMP / GHMC / BMC municipal APIs |
| 🌀 Cyclone Warning | IMD Category 1+ within 200km | INR 600-900 | IMD Cyclone Centre + RSMC |

Cross-validation rule: trigger fires only when at least two independent data sources confirm the same threshold breach.

---

<a id="06--coverage-model"></a>
## 06 - Coverage Model
| Feature / Plan   | 🟢 Basic Plan    | 🔵 Standard Plan ⭐ Recommended | 🔴 Pro Plan             |
| ---------------- | ---------------- | ------------------------------ | ----------------------- |
| Weekly Premium   | ₹25 – ₹35        | ₹40 – ₹60                      | ₹70 – ₹90               |
| Trigger Coverage | 3 Core Triggers  | All 5 Triggers                 | All + Priority Coverage |
| Activation       | Instant          | Instant                        | Instant                 |
| Payout per Event | Up to ₹300       | Up to ₹500                     | Up to ₹800              |
| Claim Processing | Standard         | Faster                         | Priority (Fastest)      |
| AI-Based Pricing | ✅ Yes            | ✅ Yes                          | ✅ Advanced              |
| Fraud Protection | Basic            | Smart Detection                | Advanced Detection      |
| Best For         | Low-risk workers | Most users                     | High-risk / heavy users |


### How it is funded (B2B revenue model)

| Source | How it works |
|--------|--------------|
| 🏢 Platform Partnerships | Swiggy / Zomato / Zepto pay per enrolled worker as welfare coverage |
| 📊 Anonymized Data | Aggregated disruption insights for logistics route planning |
| 🤝 CSR / ESG Funding | Worker welfare programs aligned with ESG reporting |

---

<a id="07--ai--ml-architecture"></a>
## 07 - AI / ML Architecture

Four purpose-built ML systems, each solving one specific problem.

### 1) 💰 Payout Scoring Engine
Calculates exact payout per event using zone severity, weather intensity, and geohash disruption history.

Models: XGBoost, LSTM, Geohash feature encoding.

### 2) 🛡️ Fraud Detection (3-layer)
Detects GPS spoofing, coordinated fraud rings, and fake accounts in under 30 seconds.

Models: DBSCAN clustering, Louvain community detection, ARIMA + LSTM behavioral model.

### 3) 🔮 Disruption Forecasting
Provides 48-hour risk forecasts per geohash cell to help workers and partners plan.

Models: Random Forest, IMD historical data, Geohash spatial encoding.

### 4) 📉 Worker Retention Model
Predicts drop-off risk and sends personalized nudges based on zone risk and engagement signals.

Models: Logistic Regression, engagement event features, A/B-tested notification variants.

---

<a id="08--anti-spoofing-defense"></a>
## 08 - Anti-Spoofing Defense

GPS spoofing is the primary fraud vector. GigShield uses 3 independent layers, and a fraud ring must defeat all three.

- Layer 1 (Device, <500ms): IMU vs GPS, GNSS quality, mock location flags, cell/wifi consistency.
- Layer 2 (Behavior, 2-5s): work-hour baseline, zone history, active session checks, device continuity.
- Layer 3 (Network, 10-30s): DBSCAN clusters, Louvain communities, shared IP/ASN, claim burst detection.

🔒 Replay protection: every GPS report is signed with nonce + timestamp so past valid traces cannot be replayed.

---

<a id="09--fraud-detection-pipeline"></a>
## 09 - Fraud Detection Pipeline

```mermaid
flowchart LR
    A[Data Inputs\nGPS, IMU, IP, activity] --> B[Feature Extraction\nbehavior + cluster features]
    B --> C[Risk Scoring\nL1 + L2 + L3 ensemble]
    C --> D{Decision Engine}
    D -->|0.00-0.35| E[PAY]
    D -->|0.35-0.72| F[HOLD]
    D -->|0.72-1.00| G[REVIEW]
    E --> H[UPI Payout]
    F --> I[Short Hold]
    G --> J[Manual Review]
```

Target: under 2% of legitimate workers reach manual review.

---

<a id="10--tech-stack"></a>
## 10 - Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| 📱 Mobile | React Native (Expo) + Zustand | Single iOS + Android codebase with GPS/IMU access |
| ⚙️ Backend | Node.js + Fastify + BullMQ + Redis | Async fraud jobs do not block payouts |
| 🗄️ Database | PostgreSQL + PostGIS | Geospatial zone queries |
| 🧠 AI / ML | Python + FastAPI + XGBoost + NetworkX + MLflow | Fraud graphs + model lifecycle tracking |
| 🌦️ Weather APIs | IMD + OpenWeatherMap + NDMA + Rainviewer | 2+ source validation before trigger fire |
| 💳 Payments | Razorpay + UPI + DigiLocker | Instant payout rail + KYC support |
| 🔔 Auth / Push | Firebase Auth (OTP) + Firebase FCM | Fast login + real-time payout notifications |
| ☁️ Infra | AWS + Cloudflare + GitHub Actions + Sentry | Scale, protection, CI/CD, and observability |

---

<a id="11--system-architecture"></a>
## 11 - System Architecture

```mermaid
flowchart TD
    U[Worker App] <--> A[Admin Dashboard]
    U --> FE[React Native Frontend]
    A --> FE
    FE --> API[Backend API\nNode.js + Fastify]

    API --> ML[AI/ML Services\nPayout + Fraud Models]
    API --> MON[Event Monitor\nBullMQ + Redis]
    API --> DB[(PostgreSQL + PostGIS)]

    WX[IMD + OWM + NDMA + Rainviewer + Municipal APIs] --> MON
    API --> PAY[Razorpay + UPI]
    API --> IDKYC[Firebase OTP + DigiLocker + FCM]
```

---

<a id="12--ux-design-flow"></a>
## 12 - UX Design Flow

```text
[1 Register] -> [2 Covered] -> [3 Work Normally] -> [4 Get Paid]
```

Design principles:

- 🇮🇳 Hindi + English, zero insurance jargon.
- 📶 Low-connectivity resilience with notification fallback.
- 🧭 Transparent payout explanations.
- 🤝 Non-accusatory review messaging.

---

<a id="13--why-our-solution-is-strong"></a>
## 13 - Why Our Solution is Strong

| # | Strength | Why it matters |
|---|----------|----------------|
| ⚡ | Fully Automated | 95%+ payouts with zero human intervention |
| 🛡️ | Fraud-Resistant | 3 independent layers catch coordinated abuse |
| 📈 | Scalable Business | B2B model scales with worker enrollment |
| 🎯 | Low Literacy Barrier | Auto-enrolled, auto-paid experience |
| 🔍 | Transparent | Threshold logic visible and explainable |
| 🇮🇳 | India-Native | IMD, UPI, DigiLocker, bilingual UX |

---

<a id="14--future-scope"></a>
## 14 - Future Scope

### Phase 2 - April 2025
- Full ML fraud stack deployed.
- First real UPI payouts to pilot workers.
- Layers 1 and 2 anti-spoofing in production.
- Live user testing in Bengaluru.

### Phase 3 - May 2025
- Layer 3 network fraud ring detection live.
- Multi-city rollout (Bengaluru -> Chennai -> Mumbai).
- Fleet operator dashboard.
- Automated retraining pipeline.

### Post-hackathon
- AQI trigger for winter pollution events.
- Regulatory sandbox progression.
- B2B API for gig platform integrations.
- Satellite imagery checks for flood validation.
- Direct delivery platform session-proof integration.

---

## 👥 Team

Built for the GigShield Hackathon - Phase 1 Submission (March 2025).

---

## Links To Be Added

<a id="live-demo-link"></a>
- Live Demo: coming soon

<a id="figma-prototype-link"></a>
- Figma Prototype:https://www.figma.com/make/XBmkg1ubjL8MjLYYMIDJZY/GigShield-App-Design?fullscreen=1&t=zO9xtBZ2OdJt265J-1

<a id="two-min-video-link"></a>
- 2-min Video:(https://youtu.be/x2Gdp-J2RzI?si=XM8ghIRL1aSOBdy1)

---

GigShield - Parametric Insurance for Gig Delivery Workers - India - 2026
