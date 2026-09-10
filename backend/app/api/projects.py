from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
def get_projects(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    state: Optional[str] = None,
    agency: Optional[str] = None,
    ministry: Optional[str] = None,
    sector: Optional[str] = None,
    tier: Optional[str] = None,
    coverage: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("portfolio_rank"),
    order: str = Query("asc")
) -> Dict[str, Any]:
    """
    Paginated, filterable, and searchable catalog of infrastructure projects
    with composite risk scores and intervention badges.
    """
    projects: List[Dict[str, Any]] = request.app.state.scored_projects

    # Filtering
    filtered = projects
    if state:
        filtered = [p for p in filtered if p.get("state", "").lower() == state.lower()]
    if agency:
        filtered = [p for p in filtered if agency.lower() in p.get("agency", "").lower()]
    if ministry:
        filtered = [p for p in filtered if ministry.lower() in p.get("ministry", "").lower()]
    if sector:
        filtered = [p for p in filtered if sector.lower() in p.get("sector", "").lower()]
    if tier:
        filtered = [p for p in filtered if p.get("attention_tier", "").lower() == tier.lower()]
    if coverage:
        filtered = [p for p in filtered if p.get("risk_coverage", "").lower() == coverage.lower()]
    if search:
        s_lower = search.lower()
        filtered = [
            p for p in filtered
            if s_lower in p.get("project_name", "").lower()
            or s_lower in p.get("canonical_project_key", "").lower()
            or s_lower in str(p.get("source_project_id", ""))
            or s_lower in p.get("agency", "").lower()
        ]

    # Sorting
    reverse = (order.lower() == "desc")
    if sort_by in ["portfolio_rank", "attention_score", "cost_risk_probability", "project_name", "original_cost_crore", "cumulative_expenditure_crore", "physical_progress_pct"]:
        filtered.sort(key=lambda x: (x.get(sort_by) is None, x.get(sort_by, 0)), reverse=reverse)

    total_records = len(filtered)
    total_pages = max(1, (total_records + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    data = filtered[start_idx:end_idx]

    return {
        "total_records": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "data": data,
    }


@router.get("/ranking")
def get_ranking(
    request: Request,
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    tier: Optional[str] = None,
    coverage: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns the portfolio ranking leaderboard ordered strictly by portfolio_rank ascending.
    """
    projects: List[Dict[str, Any]] = request.app.state.scored_projects
    filtered = projects

    if tier:
        filtered = [p for p in filtered if p.get("attention_tier", "").lower() == tier.lower()]
    if coverage:
        filtered = [p for p in filtered if p.get("risk_coverage", "").lower() == coverage.lower()]

    total_records = len(filtered)
    data = filtered[offset:offset + limit]

    return {
        "total_records": total_records,
        "limit": limit,
        "offset": offset,
        "data": data,
    }


@router.get("/{canonical_project_key}")
def get_project_detail(canonical_project_key: str, request: Request) -> Dict[str, Any]:
    """
    Retrieves comprehensive unified profile for a single project,
    merging administrative metadata, multi-hazard risk scores, explainable drivers,
    and intervention directives.
    """
    projects: List[Dict[str, Any]] = request.app.state.scored_projects
    target_key = canonical_project_key.strip().lower()

    matched = None
    for p in projects:
        if (p.get("canonical_project_key", "").lower() == target_key or
            str(p.get("source_project_id", "")) == target_key or
            p.get("canonical_project_key", "").lower().endswith(target_key)):
            matched = p
            break

    if not matched:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "RESOURCE_NOT_FOUND",
                    "message": f"Project with key '{canonical_project_key}' was not found.",
                    "details": None,
                }
            }
        )

    drivers_data = matched.get("explainable_drivers", {})

    return {
        "project": {
            "canonical_project_key": matched.get("canonical_project_key"),
            "source_project_id": matched.get("source_project_id"),
            "project_name": matched.get("project_name"),
            "state": matched.get("state"),
            "agency": matched.get("agency"),
            "ministry": matched.get("ministry"),
            "sector": matched.get("sector"),
            "original_cost_crore": matched.get("original_cost_crore"),
            "revised_cost_crore": matched.get("revised_cost_crore"),
            "cost_overrun_crore": matched.get("cost_overrun_crore"),
            "cost_escalation_pct": matched.get("cost_escalation_pct"),
            "cumulative_expenditure_crore": matched.get("cumulative_expenditure_crore"),
            "physical_progress_pct": matched.get("physical_progress_pct"),
            "divergence": matched.get("divergence"),
            "project_age_months": matched.get("project_age_months"),
            "remaining_duration_months": matched.get("remaining_duration_months"),
            "approval_date": matched.get("approval_date"),
            "start_date": matched.get("start_date"),
            "original_doc": matched.get("original_doc"),
            "revised_doc": matched.get("revised_doc"),
            "snapshot_date": matched.get("snapshot_date"),
            "source_file": matched.get("source_file"),
            "source_page": matched.get("source_page")
        },
        "risk": {
            "attention_score": matched.get("attention_score"),
            "portfolio_rank": matched.get("portfolio_rank"),
            "attention_tier": matched.get("attention_tier"),
            "risk_coverage": matched.get("risk_coverage"),
            "cost_risk_probability": matched.get("cost_risk_probability"),
            "schedule_risk_probability": matched.get("schedule_risk_probability"),
            "compound_exposure": matched.get("compound_exposure"),
            "is_eligible_cost_target": 1,
            "is_eligible_schedule_target": 1 if matched.get("risk_coverage") == "FULL" else 0,
            "models": {
                "cost_model": "RandomForestClassifier",
                "cost_probability_variant": "raw_uncalibrated",
                "schedule_model": "RandomForestClassifier",
                "schedule_probability_variant": "raw_uncalibrated"
            },
            "scoring_method_version": "module4_v1"
        },
        "intervention": {
            "intervention_priority": matched.get("intervention_priority"),
            "primary_action": matched.get("primary_action"),
            "secondary_action": matched.get("secondary_action"),
            "risk_focus": matched.get("risk_focus"),
            "priority_reason": matched.get("priority_reason"),
            "evidence_feature": matched.get("evidence_feature"),
            "evidence_value": matched.get("evidence_value"),
            "governance_note": matched.get("governance_note")
        },
        "drivers": drivers_data
    }
