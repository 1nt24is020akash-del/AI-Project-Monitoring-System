from typing import Any, Dict
from fastapi import APIRouter, Request

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/cost-drivers")
def get_cost_drivers(request: Request) -> Dict[str, Any]:
    """
    Returns cost escalation and delay driver breakdowns by sector, ministry, state, and project size.
    """
    return request.app.state.cost_driver_analytics
