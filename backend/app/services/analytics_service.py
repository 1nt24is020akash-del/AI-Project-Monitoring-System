from collections import Counter, defaultdict
from typing import Any, Dict, List


def calculate_portfolio_summary(projects: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes portfolio-wide aggregates, coverage distributions, and tier metrics.
    """
    total = len(projects)
    if total == 0:
        return {}

    orig_sum = sum(p.get("original_cost_crore", 0.0) for p in projects)
    rev_sum = sum(p.get("revised_cost_crore", 0.0) for p in projects)
    exp_sum = sum(p.get("cumulative_expenditure_crore", 0.0) for p in projects)
    overrun_sum = sum(p.get("cost_overrun_crore", 0.0) for p in projects)

    full_count = sum(1 for p in projects if p.get("risk_coverage") == "FULL")
    partial_count = total - full_count

    tier_counts = Counter(p.get("attention_tier", "Tier 4") for p in projects)
    priority_counts = Counter(p.get("intervention_priority", "PRIORITY_4") for p in projects)
    action_counts = Counter(p.get("primary_action", "BASELINE_MONITORING") for p in projects)
    focus_counts = Counter(p.get("risk_focus", "BASELINE_MONITORING") for p in projects)

    delayed_projects = sum(1 for p in projects if (p.get("delay_months") or 0) > 0)
    cost_overrun_projects = sum(1 for p in projects if (p.get("cost_overrun_crore") or 0) > 0)

    return {
        "total_projects": total,
        "delayed_projects": delayed_projects,
        "cost_overrun_projects": cost_overrun_projects,
        "total_original_cost_crore": round(orig_sum, 2),
        "total_revised_cost_crore": round(rev_sum, 2),
        "total_expenditure_crore": round(exp_sum, 2),
        "total_cost_overrun_crore": round(overrun_sum, 2),
        "portfolio_cost_escalation_pct": round(((rev_sum - orig_sum) / orig_sum * 100.0) if orig_sum > 0 else 0.0, 2),
        "portfolio_expenditure_ratio": round((exp_sum / rev_sum * 100.0) if rev_sum > 0 else 0.0, 2),
        "coverage_breakdown": {
            "full_coverage": full_count,
            "partial_coverage": partial_count,
            "full_coverage_pct": round((full_count / total) * 100, 2),
            "partial_coverage_pct": round((partial_count / total) * 100, 2),
        },
        "tier_distribution": {
            "Tier 1": tier_counts.get("Tier 1", 0),
            "Tier 2": tier_counts.get("Tier 2", 0),
            "Tier 3": tier_counts.get("Tier 3", 0),
            "Tier 4": tier_counts.get("Tier 4", 0),
        },
        "intervention_priority_distribution": {
            "PRIORITY_1": priority_counts.get("PRIORITY_1", 0),
            "PRIORITY_2": priority_counts.get("PRIORITY_2", 0),
            "PRIORITY_3": priority_counts.get("PRIORITY_3", 0),
            "PRIORITY_4": priority_counts.get("PRIORITY_4", 0),
        },
        "action_distribution": dict(action_counts.most_common()),
        "risk_focus_distribution": dict(focus_counts.most_common()),
    }


def calculate_cost_driver_analytics(projects: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes cost escalation drivers across Sectors, Ministries, States, and Project Size tiers.
    """
    # 1. Sector breakdown
    sector_data = defaultdict(lambda: {"count": 0, "orig": 0.0, "rev": 0.0, "exp": 0.0, "overrun": 0.0, "delayed": 0})
    for p in projects:
        sec = p.get("sector") or "Other"
        sector_data[sec]["count"] += 1
        sector_data[sec]["orig"] += p.get("original_cost_crore", 0.0)
        sector_data[sec]["rev"] += p.get("revised_cost_crore", 0.0)
        sector_data[sec]["exp"] += p.get("cumulative_expenditure_crore", 0.0)
        sector_data[sec]["overrun"] += p.get("cost_overrun_crore", 0.0)
        if (p.get("delay_months") or 0) > 0:
            sector_data[sec]["delayed"] += 1

    by_sector = []
    for sec, d in sector_data.items():
        by_sector.append({
            "sector": sec,
            "project_count": d["count"],
            "original_cost_crore": round(d["orig"], 2),
            "revised_cost_crore": round(d["rev"], 2),
            "cost_overrun_crore": round(d["overrun"], 2),
            "cost_escalation_pct": round(((d["rev"] - d["orig"]) / d["orig"] * 100.0) if d["orig"] > 0 else 0.0, 2),
            "delayed_projects": d["delayed"],
            "delayed_rate_pct": round((d["delayed"] / d["count"] * 100.0) if d["count"] > 0 else 0.0, 1)
        })
    by_sector.sort(key=lambda x: x["cost_overrun_crore"], reverse=True)

    # 2. Ministry breakdown
    ministry_data = defaultdict(lambda: {"count": 0, "orig": 0.0, "rev": 0.0, "overrun": 0.0})
    for p in projects:
        min_name = p.get("ministry") or "Unspecified"
        ministry_data[min_name]["count"] += 1
        ministry_data[min_name]["orig"] += p.get("original_cost_crore", 0.0)
        ministry_data[min_name]["rev"] += p.get("revised_cost_crore", 0.0)
        ministry_data[min_name]["overrun"] += p.get("cost_overrun_crore", 0.0)

    by_ministry = []
    for m, d in ministry_data.items():
        by_ministry.append({
            "ministry": m,
            "project_count": d["count"],
            "original_cost_crore": round(d["orig"], 2),
            "revised_cost_crore": round(d["rev"], 2),
            "cost_overrun_crore": round(d["overrun"], 2),
            "cost_escalation_pct": round(((d["rev"] - d["orig"]) / d["orig"] * 100.0) if d["orig"] > 0 else 0.0, 2),
        })
    by_ministry.sort(key=lambda x: x["cost_overrun_crore"], reverse=True)

    # 3. State risk breakdown
    state_data = defaultdict(lambda: {"count": 0, "tier1": 0, "avg_attention": []})
    for p in projects:
        st = p.get("state") or "Multi-State"
        state_data[st]["count"] += 1
        if p.get("attention_tier") == "Tier 1":
            state_data[st]["tier1"] += 1
        state_data[st]["avg_attention"].append(p.get("attention_score", 0.0))

    by_state = []
    for st, d in state_data.items():
        avg_att = sum(d["avg_attention"]) / len(d["avg_attention"]) if d["avg_attention"] else 0.0
        by_state.append({
            "state": st,
            "project_count": d["count"],
            "tier1_count": d["tier1"],
            "average_attention_score": round(avg_att, 4),
        })
    by_state.sort(key=lambda x: (x["tier1_count"], x["average_attention_score"]), reverse=True)

    # 4. Project size breakdown (Mega >= 1000 Cr vs Major < 1000 Cr)
    mega = [p for p in projects if (p.get("original_cost_crore") or 0) >= 1000.0]
    major = [p for p in projects if (p.get("original_cost_crore") or 0) < 1000.0]

    def size_stats(subset, name):
        c = len(subset)
        orig = sum(p.get("original_cost_crore", 0) for p in subset)
        rev = sum(p.get("revised_cost_crore", 0) for p in subset)
        over = sum(p.get("cost_overrun_crore", 0) for p in subset)
        return {
            "size_category": name,
            "project_count": c,
            "original_cost_crore": round(orig, 2),
            "cost_overrun_crore": round(over, 2),
            "escalation_pct": round(((rev - orig) / orig * 100) if orig > 0 else 0, 2),
        }

    by_size = [
        size_stats(mega, "Mega Projects (>= ₹1,000 Crore)"),
        size_stats(major, "Major Projects (< ₹1,000 Crore)")
    ]

    return {
        "sectors": by_sector,
        "ministries": by_ministry[:15],
        "states": by_state[:15],
        "project_size_tiers": by_size,
    }
