import re
from typing import Any, Dict, List, Optional, Tuple


def parse_month_year(date_str: Optional[str]) -> Optional[Tuple[int, int]]:
    """
    Parses 'MM/YYYY' or 'YYYY-MM' or 'YYYY-MM-DD' into (year, month).
    """
    if not date_str:
        return None
    s = str(date_str).strip()
    
    # MM/YYYY
    m = re.match(r"^(\d{1,2})[/.-](\d{4})$", s)
    if m:
        month, year = int(m.group(1)), int(m.group(2))
        if 1 <= month <= 12:
            return (year, month)
            
    # YYYY-MM or YYYY-MM-DD
    m2 = re.match(r"^(\d{4})[/.-](\d{1,2})", s)
    if m2:
        year, month = int(m2.group(1)), int(m2.group(2))
        if 1 <= month <= 12:
            return (year, month)

    return None


def calculate_months_diff(start_ym: Optional[Tuple[int, int]], end_ym: Optional[Tuple[int, int]]) -> Optional[float]:
    if not start_ym or not end_ym:
        return None
    return float((end_ym[0] - start_ym[0]) * 12 + (end_ym[1] - start_ym[1]))


def build_project_features(p: Dict[str, Any], snapshot_ym: Tuple[int, int] = (2026, 7)) -> Dict[str, Any]:
    """
    Builds all derived mathematical and engineering features for a project record.
    """
    orig_cost = float(p.get("original_cost_crore") or 0.0)
    rev_cost = float(p.get("revised_cost_crore") or orig_cost)
    exp = float(p.get("cumulative_expenditure_crore") or 0.0)
    prog = float(p.get("physical_progress_pct") or 0.0)

    # Cost calculations
    cost_overrun_crore = round(rev_cost - orig_cost, 2)
    cost_escalation_pct = round(((rev_cost - orig_cost) / orig_cost * 100.0) if orig_cost > 0 else 0.0, 2)
    expenditure_ratio = round((exp / orig_cost) if orig_cost > 0 else 0.0, 4)
    financial_progress_pct = round(((exp / rev_cost) * 100.0) if rev_cost > 0 else 0.0, 2)
    divergence = round(expenditure_ratio - (prog / 100.0), 4)

    # Date parsing
    appr_ym = parse_month_year(p.get("approval_date"))
    orig_doc_ym = parse_month_year(p.get("original_doc"))
    rev_doc_ym = parse_month_year(p.get("revised_doc"))

    # Delay duration in months (revised DoC - original DoC)
    delay_months = calculate_months_diff(orig_doc_ym, rev_doc_ym)
    if delay_months is not None and delay_months < 0:
        delay_months = 0.0

    # Project age in months from sanction to snapshot
    project_age_months = calculate_months_diff(appr_ym, snapshot_ym)
    if project_age_months is not None and project_age_months < 0:
        project_age_months = 0.0

    # Remaining duration until original completion
    remaining_duration_months = calculate_months_diff(snapshot_ym, orig_doc_ym)

    # Coverage status
    risk_coverage = "FULL" if orig_doc_ym is not None else "PARTIAL"

    # Targets for ML model evaluation
    has_cost_overrun = 1 if (cost_escalation_pct > 5.0 or cost_overrun_crore > 50.0) else 0
    has_schedule_delay = 1 if (delay_months is not None and delay_months >= 3.0) else (0 if orig_doc_ym is not None else None)

    enriched = dict(p)
    enriched.update({
        "cost_overrun_crore": cost_overrun_crore,
        "cost_escalation_pct": cost_escalation_pct,
        "expenditure_ratio": expenditure_ratio,
        "financial_progress_pct": financial_progress_pct,
        "divergence": divergence,
        "delay_months": delay_months,
        "project_age_months": project_age_months if project_age_months is not None else 24.0,
        "remaining_duration_months": remaining_duration_months,
        "risk_coverage": risk_coverage,
        "target_cost_overrun": has_cost_overrun,
        "target_schedule_delay": has_schedule_delay,
    })
    return enriched


def enrich_dataset(raw_projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [build_project_features(p) for p in raw_projects]
