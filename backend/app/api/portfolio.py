from typing import Any, Dict
from fastapi import APIRouter, Request
from ..data.loader import load_monthly_portfolio_reports

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/summary")
def get_portfolio_summary(request: Request) -> Dict[str, Any]:
    """
    Returns executive portfolio aggregates, coverage breakdown, tier counts, and action distributions.
    """
    return request.app.state.portfolio_summary


@router.get("/monthly-reports")
def get_monthly_reports() -> Dict[str, Any]:
    """
    Returns the 4-month verified progression (April - July 2026) directly matching
    the four Flash Reports in Desktop/data.
    """
    reports = load_monthly_portfolio_reports()
    return {
        "total_reports": len(reports),
        "reports": reports
    }
