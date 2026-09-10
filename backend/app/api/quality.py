from typing import Any, Dict
from fastapi import APIRouter, Request

router = APIRouter(prefix="/data-quality", tags=["data-quality"])


@router.get("")
def get_data_quality(request: Request) -> Dict[str, Any]:
    """
    Returns data quality, completeness, missingness, and validation audits for the ingested dataset.
    """
    return request.app.state.data_quality
