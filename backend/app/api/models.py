from typing import Any, Dict
from fastapi import APIRouter, Request

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/evaluation")
def get_model_evaluation(request: Request) -> Dict[str, Any]:
    """
    Returns empirical evaluation results comparing Statistical Baselines (Logistic Regression)
    versus AI/ML (Random Forest), CUF comparison, and feature importance rankings.
    """
    return request.app.state.model_evaluation


@router.get("/feature-importance")
def get_feature_importance(request: Request) -> Dict[str, Any]:
    """
    Returns the feature importance rankings across predictive models.
    """
    return {
        "feature_importances": request.app.state.model_evaluation.get("feature_importance_ranking", [])
    }
