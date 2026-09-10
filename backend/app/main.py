from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import alerts, analytics, assistant, models, portfolio, projects, quality
from .data.loader import get_raw_projects
from .data.validator import calculate_data_quality
from .ml.features import enrich_dataset
from .ml.models import ProjectRiskModelEngine
from .services.alert_service import generate_early_warnings
from .services.analytics_service import calculate_cost_driver_analytics, calculate_portfolio_summary
from .services.risk_service import generate_risk_scores_and_tiers

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("paimana_backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=========================================================================")
    logger.info("Starting PAIMANA Predictive Risk Intelligence Platform (MoSPI / DIID)")
    logger.info("Loading official project dataset from Desktop/data...")
    logger.info("=========================================================================")

    # 1. Ingest / extract raw projects from Flash Report PDF
    raw_projects = get_raw_projects()

    # 2. Evaluate data quality & completeness
    data_quality = calculate_data_quality(raw_projects)

    # 3. Feature engineering & derived metrics
    enriched_projects = enrich_dataset(raw_projects)

    # 4. Train ML models & statistical baselines
    model_engine = ProjectRiskModelEngine()
    model_eval = model_engine.train_and_evaluate(enriched_projects)

    # 5. Multi-hazard risk scoring, attention scores, tiers & explainability
    scored_projects = generate_risk_scores_and_tiers(enriched_projects, model_engine)

    # 6. Generate early warning alerts
    alert_list = generate_early_warnings(scored_projects)

    # 7. Portfolio and cost driver analytics
    portfolio_summary = calculate_portfolio_summary(scored_projects)
    cost_analytics = calculate_cost_driver_analytics(scored_projects)

    # Attach to application state for low-latency queries
    app.state.raw_projects = raw_projects
    app.state.data_quality = data_quality
    app.state.scored_projects = scored_projects
    app.state.model_evaluation = model_eval
    app.state.alerts = alert_list
    app.state.portfolio_summary = portfolio_summary
    app.state.cost_driver_analytics = cost_analytics
    app.state.model_engine = model_engine

    logger.info(f"System ready: {len(scored_projects)} projects scored across 4 attention tiers.")
    logger.info(f"Active early warnings: {len(alert_list)} alerts generated.")
    yield
    logger.info("Shutting down PAIMANA Predictive Risk Intelligence Platform...")


app = FastAPI(
    title="PAIMANA — Predictive Risk Intelligence API",
    description="Official SIH 2026 AI-Powered Infrastructure Risk Surveillance & Early Warning Backend (MoSPI / DIID)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration allowing local frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API routers under /api/v1
app.include_router(projects.router, prefix="/api/v1")
app.include_router(portfolio.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(quality.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(assistant.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "platform": "PAIMANA Predictive Risk Intelligence",
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "department": "Data Informatics & Innovation Division (DIID)",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "api_v1_base": "/api/v1"
    }


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "paimana-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
