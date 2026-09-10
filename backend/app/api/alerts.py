from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, Request

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
def get_alerts(
    request: Request,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
) -> Dict[str, Any]:
    """
    Returns filterable active early warnings and surveillance alerts.
    """
    alerts: List[Dict[str, Any]] = request.app.state.alerts
    filtered = alerts

    if severity:
        filtered = [a for a in filtered if a.get("severity", "").lower() == severity.lower()]
    if alert_type:
        filtered = [a for a in filtered if a.get("alert_type", "").lower() == alert_type.lower()]
    if search:
        s_lower = search.lower()
        filtered = [
            a for a in filtered
            if s_lower in a.get("project_name", "").lower()
            or s_lower in a.get("canonical_project_key", "").lower()
            or s_lower in a.get("reason", "").lower()
        ]

    total = len(filtered)
    data = filtered[offset:offset + limit]

    return {
        "total_alerts": total,
        "limit": limit,
        "offset": offset,
        "alerts": data
    }
