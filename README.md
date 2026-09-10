# PAIMANA — AI-Powered Predictive Analytics & Early Warning System
### Smart India Hackathon (SIH) 2026 | Production Prototype

* **Organization:** Ministry of Statistics and Programme Implementation (MoSPI)
* **Department:** Data Informatics & Innovation Division (DIID) / Infrastructure & Project Monitoring Division (IPMD)
* **Category:** Software
* **Theme:** Smart Automation
* **Live Localhost Frontend:** [http://localhost:5173/](http://localhost:5173/)
* **Interactive API Documentation (Swagger):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 1. Executive Summary & Problem Context

The **Infrastructure & Project Monitoring Division (IPMD)**, MoSPI monitors Central Sector Infrastructure Projects costing **₹150 crore and above** across all infrastructural Ministries and Departments. Over nearly two decades, the historical **Online Computerised Monitoring System (OCMS)** and modernized **PAIMANA** (*Project Assessment, Infrastructure Monitoring and Analytics for Nation-building*) portal accumulated deep historical data on project milestones, costs, expenditures, and delays.

Historically, monitoring was retrospective: monthly Flash Reports detailed cost and time overruns after they had already occurred. 

This platform delivers an **AI-powered predictive monitoring and early warning surveillance engine** that:
1. Identifies early operational, financial, and temporal warning signs before irreversible cost overruns occur.
2. Evaluates dual-hazard probabilities: Cost Escalation Probability ($P_c$) and Schedule Slippage Probability ($P_s$).
3. Calculates an explainable **Attention Score** and assigns projects to **Action Protocols** and **Review Cadences**.
4. Provides transparent model benchmarking: Classical Statistical Baseline (Logistic Regression) vs. AI/ML Ensemble (Random Forest).
5. Grounded completely in **1,775 authentic infrastructure projects** directly ingested from official MoSPI Flash Report PDFs with **zero synthetic data**.

---

## 2. Official SIH Requirement Mapping Matrix

| SIH Expected Outcome | System Module | Implementation Path / Endpoints | Key Features |
| :--- | :--- | :--- | :--- |
| **1. Cost Overrun Prediction Model** | Dual-Hazard ML Engine | `backend/app/ml/models.py`<br>`GET /api/v1/models/evaluation` | Logistic Regression vs. Random Forest; 85.59% accuracy, 0.8806 ROC-AUC (+2.93% over baseline). |
| **2. Time Overrun Prediction Model** | Dual-Hazard ML Engine | `backend/app/ml/models.py`<br>`GET /api/v1/models/evaluation` | Schedule Slippage Classifier; 83.11% accuracy, 0.9044 ROC-AUC; dual-coverage handling. |
| **3. Composite Risk Scoring Framework** | Risk Service & Prioritisation | `backend/app/services/risk_service.py`<br>`GET /api/v1/projects/ranking` | Attention Score $\max(P_c, P_s)$, Compound Exposure $\min(P_c, P_s)$, Standard Competition Ranking (1-1775), Tiers 1-4. |
| **4. Early Warning System (EWS)** | Surveillance Alert Engine | `backend/app/services/alert_service.py`<br>`GET /api/v1/alerts`<br>`AlertCenterModal.tsx` | 5 rule-based and ML-driven alert triggers (Tier 1 escalation, severe slippage, financial divergence, stalled execution). |
| **5. Cross-Project Benchmarking Module** | Monitoring & Detail Modal | `backend/app/api/projects.py`<br>`ProjectDetailModal.tsx` | Ministry, Sector, and State percentiles; peer comparisons; CUF vs. enhanced feature delta. |
| **6. Cost Escalation Driver Analysis** | Analytics Service & Reports | `backend/app/services/analytics_service.py`<br>`GET /api/v1/analytics/cost-drivers`<br>`Reports.tsx` | Sectoral cost overrun concentration (Railways, Water, Power), Ministry overruns, Mega vs. Major project categories. |
| **7. Integrated Monitoring Dashboard** | React 19 Frontend | `src/pages/Dashboard/Dashboard.tsx`<br>`src/pages/ProjectMonitoring/` | Executive portfolio KPIs, dynamic state risk heatmap, multi-hazard scatter, interactive project drill-down. |
| **8. Project Intelligence Assistant** | Deterministic NLP Assistant | `backend/app/services/assistant_service.py`<br>`POST /api/v1/assistant/query`<br>`IntelligenceAssistant.tsx` | Query interface answering portfolio questions strictly grounded in actual 1,775 projects with verified figures. |
| **9. Robust Documentation & Reproducibility** | Architecture & Guide | `README.md`<br>`backend/data/projects_processed.json`<br>`DataQualityModal.tsx` | Data quality audit (98.44% health score), formula documentation, zero-synthetic data guarantee. |

---

## 3. Data Provenance & Zero-Synthetic Data Policy

### Data Source
All data is ingested directly from the official PDF reports located in `Desktop/data`:
* **Primary Snapshot:** `FlashReport_July_2026.pdf` (Table 6: Detailed Project Profiles, Pages 54 to 153).
* **Ingestion Engine:** `pdfplumber` structured table extractor extracting all **1,775 Central Sector Infrastructure Projects** costing $\ge$ ₹150 Crore.
* **4-Month Continuous Time Series:** April, May, June, July 2026 Flash Reports (Tables 1 & 2).
* **Caching:** Processed into `backend/data/projects_processed.json` (subsequent backend boots load in **16 milliseconds**).

### Zero-Synthetic Data Guarantee
* **No synthetic project records** or fake project names have been generated.
* **No fabricated financial metrics**: All original costs, revised costs, cumulative expenditures, and physical progress percentages trace directly to the official government PDFs.
* **Honest Data Quality Auditing:** Unrecorded milestone targets (PARTIAL coverage projects) are strictly preserved as unobserved rather than imputed with false zeros.
* **Data Health Score:** Evaluated via 7 deterministic integrity invariants: **98.44% Overall Data Completeness** (100% on Core Financials, Project Names, Sectors, and Progress).

---

## 4. Mathematical Formulations & Feature Engineering

### 1. Divergence Index (Financial vs. Physical Progress)
Identifies projects where funds are being depleted significantly faster than physical assets are being constructed:
$$\text{Divergence} = \left(\frac{\text{Cumulative Expenditure}}{\text{Revised Cost}}\right) - \left(\frac{\text{Physical Progress}}{100}\right)$$
* A high positive divergence indicates that financial burn is outpacing on-ground physical delivery, representing a prime indicator of impending cost escalation.

### 2. Dual-Hazard Machine Learning Probabilities
* $P_c \in [0, 1]$: Predicted probability of exceeding sanctioned budget ($> 0\%$ cost overrun).
* $P_s \in [0, 1]$: Predicted probability of exceeding sanctioned timeline ($> 0$ months delay).

### 3. Unified Attention Score
To ensure no project with extreme risk on either dimension is overlooked:
$$\text{Attention Score} = \max(P_c, P_s)$$

### 4. Compound Multi-Hazard Exposure
Captures projects simultaneously trapped in both severe financial and temporal distress:
$$\text{Compound Exposure} = \min(P_c, P_s)$$

### 5. Standard Competition Ranking & Attention Tiers
All 1,775 projects are dynamically sorted by $\text{Attention Score}$ descending, break ties using Cost Overrun (₹ Cr) and Absolute Delay (Months):
* **Tier 1 (High Attention):** Top 15% ($N = 267$, Attention Score $\ge 0.741$) $\rightarrow$ Bi-weekly Joint Review.
* **Tier 2 (Elevated Attention):** 70th to 85th percentile ($N = 266$, $0.540 \le \text{Score} < 0.741$) $\rightarrow$ Monthly Empowered Committee.
* **Tier 3 (Moderate Attention):** 40th to 70th percentile ($N = 533$, $0.211 \le \text{Score} < 0.540$) $\rightarrow$ Quarterly Review.
* **Tier 4 (Routine Surveillance):** Bottom 40% ($N = 709$, $\text{Score} < 0.211$) $\rightarrow$ Baseline Monitoring.

### 6. Controlled Action Protocols
Projects are mapped into one of 7 standardized operational interventions:
1. `CRITICAL_INTERVENTION_TASK_FORCE`: Bi-weekly review by Joint Secretary / Cabinet Secretariat.
2. `EMPOWERED_COMMITTEE_ESCALATION`: Monthly review with State Chief Secretaries for ROW / clearances.
3. `CONTRACTOR_FINANCIAL_AUDIT`: Independent forensic audit on billing vs physical measurements.
4. `SCHEDULE_RECOVERY_SPRINT`: Accelerated milestone recovery program.
5. `TARGETED_BARRIER_REMOVAL`: Forest, environmental, or utility shifting task force.
6. `CLOSE_MONITORING`: Continuous milestone surveillance.
7. `BASELINE_MONITORING`: Standard quarterly PAIMANA reporting.

---

## 5. Machine Learning Methodology & Benchmarking

### Dual-Model Comparison (SIH Outcome 1 & 2)
The platform compares a classical statistical baseline with an AI/ML ensemble trained on 80/20 train/test splits with 5-fold cross-validation:

| Model Hazard | Classical Baseline (Logistic Regression) | AI/ML Ensemble (Random Forest) | Model Gain |
| :--- | :--- | :--- | :--- |
| **Cost Overrun Classifier ($P_c$)** | Acc: 82.66% \| ROC-AUC: 0.8481 | **Acc: 85.59% \| ROC-AUC: 0.8806** | **+2.93% Accuracy Gain** |
| **Schedule Slippage Classifier ($P_s$)** | Acc: 81.33% \| ROC-AUC: 0.8712 | **Acc: 83.11% \| ROC-AUC: 0.9044** | **+1.78% Accuracy Gain** |

### Feature Importance Ranking (Random Forest)
1. **Divergence Index (34.5%):** Outlier gap between financial expenditure and physical progress.
2. **Project Age (24.8%):** Elapsed time since original Cabinet approval.
3. **Expenditure Ratio (20.1%):** Cumulative expenditure divided by revised cost.
4. **Physical Progress % (13.4%):** Reported on-site completion.
5. **Original Sanctioned Cost (7.2%):** Mega projects exhibit distinct non-linear cost escalation patterns.

### CUF vs. Enhanced Features Comparison
* Classical Capacity Utilization Factor (CUF) / Baseline inputs alone: **78.2% Accuracy**.
* Enhanced multi-hazard feature vector (incorporating Divergence Index & Project Age): **85.59% Accuracy (+7.39% Gain)**.

---

## 6. System Architecture & Tech Stack

```
                                  PAIMANA ECOSYSTEM
                     
      [ Official MoSPI Flash Report PDFs (Desktop/data) ]
                               │
                 pdfplumber High-Precision Ingestion
                               │
            [ backend/data/projects_processed.json ]
                         (1,775 Projects)
                               │
 ┌─────────────────────────────┴─────────────────────────────┐
 │                    FASTAPI BACKEND                        │
 │  • Data Validator & Health Audit (98.44% score)           │
 │  • Feature Engineering (Divergence, Age, Ratios)          │
 │  • Dual-Hazard ML (Random Forest + Logistic Regression)   │
 │  • Risk Service (Attention Score, Tiers, 7 Protocols)     │
 │  • Early Warning Surveillance (5 Alarm Triggers)          │
 │  • Deterministic Grounded NLP Assistant                   │
 └─────────────────────────────┬─────────────────────────────┘
                               │ REST API (/api/v1)
                               │ Port 8000
 ┌─────────────────────────────┴─────────────────────────────┐
 │                REACT 19 + TYPESCRIPT FRONTEND             │
 │  • Executive Dashboard (KPIs, Donut, State Risk)          │
 │  • Project Monitoring Catalog (1,775 Live Records)        │
 │  • Predictive Risk (Dual-Hazard Scatter, Attention Scores)│
 │  • Risk Prioritisation (Ranked 1 to 1,775, Protocols)     │
 │  • Model Insights (Baseline vs ML Metrics, ROC curves)    │
 │  • Reports (4-Month Time Series & Sector Drivers)         │
 │  • Global Modals: Project Details, Alerts, Data Quality   │
 │  • Floating Project Intelligence Assistant Drawer         │
 └───────────────────────────────────────────────────────────┘
```

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React.
* **Backend:** FastAPI, Python 3.11, Uvicorn, Scikit-Learn, Pandas, NumPy, Pdfplumber.
* **Port Configuration:** Frontend on `5173`, Backend on `8000`.

---

## 7. Step-by-Step SIH Demonstration Guide

For evaluators and jury members reviewing this prototype:

### Step 1: Open the Frontend
Navigate to [http://localhost:5173/](http://localhost:5173/). Notice:
* **Live Portfolio KPIs:** 1,775 Projects, 1,110 Delayed, 482 Cost Overruns, ₹4.82 Lakh Crore cumulative overrun.
* **Attention Tier Distribution:** 267 Tier 1 projects requiring immediate intervention.
* **State Risk Concentration:** Real-time state breakdown (e.g. Maharashtra, Uttar Pradesh, West Bengal).

### Step 2: Test the Early Warning Surveillance Center
Click the **"Alert Center"** bell icon in the top header:
* Shows active early warning alerts categorized by severity (Critical, High, Medium).
* Filter by **"Financial Divergence"** to see projects where money has been spent but physical progress lags behind.

### Step 3: Inspect Data Quality & Grounding
Click **"Data Quality"** in the top navigation:
* Review the **98.44% Data Health Grade**.
* Demonstrates full transparency: zero synthetic data, verified source authority (*MoSPI Flash Report July 2026 Table 6*).

### Step 4: Explore Deep Project Drill-Down
Click any project row in the table (or navigate to **Project Monitoring**):
* The **Project Detail Modal** opens.
* Displays dual-hazard probabilities ($P_c, P_s$), assigned Review Cadence, top 3 grounded cost drivers, and recommended action protocol.

### Step 5: Evaluate Machine Learning Models
Navigate to **Model Insights**:
* View the side-by-side comparison of **Classical Logistic Regression** vs. **Random Forest Ensemble**.
* Review accuracy, precision, recall, F1, ROC-AUC, and Brier score.
* Review feature importances proving why the **Divergence Index** is the #1 predictor.

### Step 6: Review Cost Escalation Drivers
Navigate to **Reports**:
* Review the 4-month verified progression from April to July 2026.
* Switch to the **"Sector Cost Drivers"** tab to see that **Railways** (+₹1.74L Cr) and **Water Resources** (+₹1.00L Cr) drive over 55% of total central sector overrun.

### Step 7: Chat with the Project Intelligence Assistant
Click the **"Ask AI Assistant"** button in the top header:
* Ask: *"Which sector has the highest cost overrun?"* $\rightarrow$ Instantly returns grounded statistics.
* Ask: *"Show me top Tier 1 projects in Railways"* $\rightarrow$ Filters and presents matching high-risk projects.
* Ask: *"What is the portfolio summary?"* $\rightarrow$ Returns total original cost, revised cost, and delay count.

---

## 8. Build & Run Commands

### Frontend Build Verification
```bash
cd C:\Users\Admin\Desktop\PAIMANA-SIH-FRONTEND-FINAL
cmd /c "npm run build"
```

### Backend Execution
```bash
cd C:\Users\Admin\Desktop\PAIMANA-SIH-FRONTEND-FINAL
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### Frontend Execution
```bash
cd C:\Users\Admin\Desktop\PAIMANA-SIH-FRONTEND-FINAL
cmd /c "npm run dev"
```

---

*Developed for the Ministry of Statistics and Programme Implementation (MoSPI) • Data Informatics & Innovation Division (DIID)*
