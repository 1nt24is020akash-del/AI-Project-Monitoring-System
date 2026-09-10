from typing import Any, Dict, List


def generate_early_warnings(projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Early Warning surveillance engine detecting active risk conditions across
    the infrastructure portfolio.
    """
    alerts = []
    alert_counter = 1

    for p in projects:
        key = p.get("canonical_project_key", "")
        name = p.get("project_name", "")
        agency = p.get("agency", "")
        state = p.get("state", "")
        sector = p.get("sector", "")
        tier = p.get("attention_tier", "Tier 4")
        cost_esc = p.get("cost_escalation_pct", 0.0)
        cost_overrun = p.get("cost_overrun_crore", 0.0)
        delay = p.get("delay_months")
        div = p.get("divergence", 0.0)
        prog = p.get("physical_progress_pct", 0.0)
        exp = p.get("cumulative_expenditure_crore", 0.0)
        orig_cost = p.get("original_cost_crore", 0.0)
        age = p.get("project_age_months", 0.0)
        coverage = p.get("risk_coverage", "PARTIAL")

        # 1. Critical Tier 1 Warning
        if tier == "Tier 1":
            alerts.append({
                "id": f"ALT-{alert_counter:04d}",
                "canonical_project_key": key,
                "project_name": name,
                "agency": agency,
                "state": state,
                "sector": sector,
                "alert_type": "TIER_1_SUPERVISORY_ALERT",
                "severity": "CRITICAL",
                "detected_value": f"Attention Score: {p.get('attention_score', 0):.4f}",
                "reference_value": "Portfolio Top 10% Cutoff",
                "reason": f"Project placed in Tier 1 high-attention cohort. {p.get('priority_reason', '')}",
                "recommended_action": "Schedule executive review within 14 business days.",
                "created_at": "2026-07-01"
            })
            alert_counter += 1

        # 2. Major Cost Overrun Alert
        if cost_esc >= 20.0 or cost_overrun >= 500.0:
            alerts.append({
                "id": f"ALT-{alert_counter:04d}",
                "canonical_project_key": key,
                "project_name": name,
                "agency": agency,
                "state": state,
                "sector": sector,
                "alert_type": "COST_ESCALATION_WARNING",
                "severity": "HIGH" if cost_esc < 50.0 else "CRITICAL",
                "detected_value": f"+{cost_esc:.1f}% (+₹{cost_overrun:,.1f} Cr)",
                "reference_value": f"Original: ₹{orig_cost:,.1f} Cr",
                "reason": f"Cost revised upwards from ₹{orig_cost:,.1f} Cr to ₹{p.get('revised_cost_crore', 0):,.1f} Cr.",
                "recommended_action": "Conduct immediate price variation and scope creep audit.",
                "created_at": "2026-07-01"
            })
            alert_counter += 1

        # 3. Schedule Slippage Alert
        if delay is not None and delay >= 12.0:
            alerts.append({
                "id": f"ALT-{alert_counter:04d}",
                "canonical_project_key": key,
                "project_name": name,
                "agency": agency,
                "state": state,
                "sector": sector,
                "alert_type": "SCHEDULE_SLIPPAGE_WARNING",
                "severity": "CRITICAL" if delay >= 24.0 else "HIGH",
                "detected_value": f"{delay:.0f} Months Delayed",
                "reference_value": f"Original DoC: {p.get('original_doc', 'N/A')}",
                "reason": f"Completion date postponed from {p.get('original_doc')} to {p.get('revised_doc')}.",
                "recommended_action": "Convene joint coordination meeting with implementing CPSE to remove right-of-way bottlenecks.",
                "created_at": "2026-07-01"
            })
            alert_counter += 1

        # 4. Expenditure - Physical Progress Divergence
        if div > 0.35 and exp > 200.0:
            alerts.append({
                "id": f"ALT-{alert_counter:04d}",
                "canonical_project_key": key,
                "project_name": name,
                "agency": agency,
                "state": state,
                "sector": sector,
                "alert_type": "FINANCIAL_DIVERGENCE_WARNING",
                "severity": "HIGH",
                "detected_value": f"Divergence Index: {div:.2f}",
                "reference_value": f"Exp Ratio {p.get('expenditure_ratio', 0):.2f} vs Progress {prog:.1f}%",
                "reason": "Financial expenditure is outpacing physical asset creation significantly.",
                "recommended_action": "Verify physical milestone progress on-ground against contractor invoices.",
                "created_at": "2026-07-01"
            })
            alert_counter += 1

        # 5. Stalled Project Warning
        if age >= 36.0 and prog < 15.0:
            alerts.append({
                "id": f"ALT-{alert_counter:04d}",
                "canonical_project_key": key,
                "project_name": name,
                "agency": agency,
                "state": state,
                "sector": sector,
                "alert_type": "STALLED_EXECUTION_WARNING",
                "severity": "CRITICAL",
                "detected_value": f"Active: {age:.0f} Mo, Progress: {prog:.1f}%",
                "reference_value": "Expected Progress > 50%",
                "reason": f"Project sanctioned {age:.0f} months ago but physical completion is stalled at {prog:.1f}%.",
                "recommended_action": "Trigger comprehensive viability assessment and inter-ministerial review.",
                "created_at": "2026-07-01"
            })
            alert_counter += 1

    return alerts
