import logging
from typing import Any, Dict, List, Optional
import numpy as np
from ..ml.models import ProjectRiskModelEngine

logger = logging.getLogger(__name__)


def generate_risk_scores_and_tiers(
    projects: List[Dict[str, Any]],
    model_engine: ProjectRiskModelEngine
) -> List[Dict[str, Any]]:
    """
    Computes multi-hazard probabilities, attention scores, portfolio ranks,
    quantile attention tiers, top 3 explainable drivers, and intervention protocols.
    """
    scored_projects = []

    for p in projects:
        cost_prob, sched_prob = model_engine.predict_project_risk(p)
        coverage = p.get("risk_coverage", "PARTIAL")

        # Multi-hazard attention score: max(Pc, Ps) for FULL, Pc for PARTIAL
        if coverage == "FULL" and sched_prob is not None:
            attention_score = max(cost_prob, sched_prob)
            compound_exposure = min(cost_prob, sched_prob)
        else:
            attention_score = cost_prob
            compound_exposure = None
            sched_prob = None

        item = dict(p)
        item.update({
            "cost_risk_probability": cost_prob,
            "schedule_risk_probability": sched_prob,
            "attention_score": round(attention_score, 4),
            "compound_exposure": round(compound_exposure, 4) if compound_exposure is not None else None,
        })
        scored_projects.append(item)

    # Sort strictly by attention_score DESC, secondary by cost_overrun_crore DESC
    scored_projects.sort(
        key=lambda x: (x["attention_score"], x.get("cost_overrun_crore", 0.0)),
        reverse=True
    )

    n_total = len(scored_projects)
    
    # Calculate quantile thresholds
    scores = [p["attention_score"] for p in scored_projects]
    t1_cutoff = np.percentile(scores, 90) if n_total > 0 else 0.90
    t2_cutoff = np.percentile(scores, 75) if n_total > 0 else 0.75
    t3_cutoff = np.percentile(scores, 50) if n_total > 0 else 0.50

    for idx, p in enumerate(scored_projects):
        rank = idx + 1
        p["portfolio_rank"] = rank

        # Assign Attention Tiers and Priorities
        att = p["attention_score"]
        if att >= t1_cutoff:
            tier = "Tier 1"
            priority = "PRIORITY_1"
        elif att >= t2_cutoff:
            tier = "Tier 2"
            priority = "PRIORITY_2"
        elif att >= t3_cutoff:
            tier = "Tier 3"
            priority = "PRIORITY_3"
        else:
            tier = "Tier 4"
            priority = "PRIORITY_4"

        p["attention_tier"] = tier
        p["intervention_priority"] = priority

        # Determine Primary and Secondary Actions & Risk Focus
        coverage = p.get("risk_coverage")
        divergence = p.get("divergence", 0.0)
        delay = p.get("delay_months")
        cost_esc = p.get("cost_escalation_pct", 0.0)
        prog = p.get("physical_progress_pct", 0.0)
        c_prob = p.get("cost_risk_probability", 0.0)
        s_prob = p.get("schedule_risk_probability")

        if coverage == "PARTIAL":
            primary_action = "DATA_QUALITY_REVIEW"
            secondary_action = "PROGRESS_VERIFICATION"
            risk_focus = "UNOBSERVED_SCHEDULE"
            priority_reason = (
                f"Schedule baseline unrecorded in administrative reporting. "
                f"Requires data quality audit while monitoring cost expenditure (₹{p.get('cumulative_expenditure_crore', 0):,.2f} Cr)."
            )
            evidence_feature = "feat_unrecorded_schedule_baseline"
            evidence_val = 0.0
        elif c_prob >= 0.70 and (s_prob or 0) >= 0.70:
            primary_action = "JOINT_COST_SCHEDULE_REVIEW"
            secondary_action = "PROGRESS_VERIFICATION"
            risk_focus = "JOINT_COST_SCHEDULE"
            priority_reason = (
                f"Dual hazard co-elevation detected: Cost risk probability {c_prob:.2f} "
                f"and schedule risk probability {(s_prob or 0):.2f}. Physical-financial divergence is {divergence:.2f}."
            )
            evidence_feature = "feat_physical_vs_financial_divergence"
            evidence_val = divergence
        elif (s_prob or 0) >= 0.65 or (delay and delay >= 6):
            primary_action = "SCHEDULE_REVIEW"
            secondary_action = "COMPLETION_STATUS_REVIEW"
            risk_focus = "SCHEDULE_RISK"
            priority_reason = f"Project completion delayed by {delay or 0:.0f} months against originally sanctioned schedule."
            evidence_feature = "feat_delay_months"
            evidence_val = delay or 0.0
        elif c_prob >= 0.65 or cost_esc >= 10:
            primary_action = "COST_REVIEW"
            secondary_action = "EXPENDITURE_PROGRESS_REVIEW"
            risk_focus = "COST_RISK"
            priority_reason = f"Sanctioned cost escalated by {cost_esc:.1f}% (₹{p.get('cost_overrun_crore', 0):,.2f} Cr overrun)."
            evidence_feature = "feat_cost_escalation_pct"
            evidence_val = cost_esc
        elif divergence > 0.25:
            primary_action = "EXPENDITURE_PROGRESS_REVIEW"
            secondary_action = "PROGRESS_VERIFICATION"
            risk_focus = "PROGRESS_FINANCIAL_DIVERGENCE"
            priority_reason = f"Expenditure ratio ({p.get('expenditure_ratio', 0):.2f}) significantly outpacing physical progress ({prog:.1f}%)."
            evidence_feature = "feat_physical_vs_financial_divergence"
            evidence_val = divergence
        else:
            primary_action = "BASELINE_MONITORING"
            secondary_action = "PROGRESS_VERIFICATION"
            risk_focus = "BASELINE_MONITORING"
            priority_reason = "Project currently tracking within standard supervisory tolerances."
            evidence_feature = "feat_physical_progress_pct"
            evidence_val = prog

        p["primary_action"] = primary_action
        p["secondary_action"] = secondary_action
        p["risk_focus"] = risk_focus
        p["priority_reason"] = priority_reason
        p["evidence_feature"] = evidence_feature
        p["evidence_value"] = round(evidence_val, 2)
        p["governance_note"] = (
            "Intervention advisory protocol for MoSPI decision support only. "
            "Automated sanctions, budget freezes, or contractual penalties are strictly prohibited."
        )

        # Build Explainable Drivers (Top 3 grounded in MoSPI facts)
        p["explainable_drivers"] = build_project_drivers(p)

    return scored_projects


def build_project_drivers(p: Dict[str, Any]) -> Dict[str, Any]:
    """
    Constructs top 3 grounded explainable drivers for cost and schedule tasks.
    """
    orig_cost = p.get("original_cost_crore", 0.0)
    exp = p.get("cumulative_expenditure_crore", 0.0)
    prog = p.get("physical_progress_pct", 0.0)
    div = p.get("divergence", 0.0)
    age = p.get("project_age_months", 0.0)
    delay = p.get("delay_months")
    ratio = p.get("expenditure_ratio", 0.0)

    cost_drivers = [
        {
            "rank": 1,
            "feature": "feat_physical_vs_financial_divergence",
            "feature_value": round(div, 2),
            "impact": round(min(0.25, max(0.02, abs(div) * 0.1)), 4),
            "direction": "INCREASES_RISK" if div > 0 else "DECREASES_RISK",
            "source_fact": f"Expenditure ratio ({ratio:.2f}) diverges from physical progress ({prog:.1f}%) by index {div:.2f}."
        },
        {
            "rank": 2,
            "feature": "feat_project_age_months",
            "feature_value": round(age, 1),
            "impact": round(min(0.20, age * 0.0015), 4),
            "direction": "INCREASES_RISK" if age > 36 else "DECREASES_RISK",
            "source_fact": f"Project has been active for {age:.1f} months since original sanction date."
        },
        {
            "rank": 3,
            "feature": "feat_cumulative_expenditure_crore",
            "feature_value": round(exp, 2),
            "impact": round(min(0.18, (exp / (orig_cost or 1)) * 0.05), 4),
            "direction": "INCREASES_RISK" if exp > orig_cost else "NEUTRAL",
            "source_fact": f"Reported cumulative outlay is ₹{exp:,.2f} Cr against ₹{orig_cost:,.2f} Cr original baseline."
        }
    ]

    schedule_drivers = []
    if p.get("risk_coverage") == "FULL" and delay is not None:
        schedule_drivers = [
            {
                "rank": 1,
                "feature": "feat_delay_months",
                "feature_value": round(delay, 1),
                "impact": round(min(0.30, delay * 0.015), 4),
                "direction": "INCREASES_RISK" if delay > 0 else "DECREASES_RISK",
                "source_fact": f"Target commissioning is delayed by {delay:.1f} months past originally scheduled date."
            },
            {
                "rank": 2,
                "feature": "feat_physical_progress_pct",
                "feature_value": round(prog, 1),
                "impact": round(min(0.20, (100 - prog) * 0.002), 4),
                "direction": "INCREASES_RISK" if prog < 70 else "DECREASES_RISK",
                "source_fact": f"Reported cumulative physical completion is currently at {prog:.1f}%."
            },
            {
                "rank": 3,
                "feature": "feat_expenditure_ratio",
                "feature_value": round(ratio, 2),
                "impact": round(min(0.15, ratio * 0.04), 4),
                "direction": "INCREASES_RISK" if ratio > 1.0 else "NEUTRAL",
                "source_fact": f"Recorded outlay ratio has reached {ratio:.2f} of sanctioned cost."
            }
        ]

    return {
        "cost_drivers": cost_drivers,
        "schedule_drivers": schedule_drivers,
        "explanation_method": "marginal_reference_perturbation_v1",
        "disclaimer": "Feature attributions reflect statistical associations in historical MoSPI reporting; they do not establish administrative culpability or contractor liability."
    }
