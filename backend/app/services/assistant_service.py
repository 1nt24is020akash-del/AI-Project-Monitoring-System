import re
from typing import Any, Dict, List


def query_project_assistant(query: str, projects: List[Dict[str, Any]], summary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic Project Intelligence Assistant.
    Retrieves and synthesizes answers strictly grounded in actual loaded MoSPI project data.
    """
    q = query.lower().strip()

    # 1. Top high-risk / Tier 1 projects
    if any(term in q for term in ["top risk", "highest risk", "tier 1", "tier1", "critical project", "urgent"]):
        t1_projects = [p for p in projects if p.get("attention_tier") == "Tier 1"][:5]
        response_text = (
            f"Here are the top {len(t1_projects)} projects requiring supervisory attention based on "
            f"predictive attention scoring (Tier 1):\n\n"
        )
        for p in t1_projects:
            response_text += (
                f"• **{p.get('project_name')}** (Rank #{p.get('portfolio_rank')})\n"
                f"  - Agency: {p.get('agency')} | State: {p.get('state')}\n"
                f"  - Attention Score: {p.get('attention_score'):.4f} | Cost Risk: {p.get('cost_risk_probability'):.2f}\n"
                f"  - Primary Protocol: `{p.get('primary_action')}`\n"
                f"  - Reason: {p.get('priority_reason')}\n\n"
            )
        return {
            "query": query,
            "answer": response_text,
            "matched_projects": t1_projects,
            "intent": "HIGH_RISK_PORTFOLIO"
        }

    # 2. Sector cost escalation
    if "sector" in q and any(term in q for term in ["cost", "escalat", "overrun", "highest"]):
        sector_totals = {}
        for p in projects:
            sec = p.get("sector") or "Other"
            if sec not in sector_totals:
                sector_totals[sec] = {"count": 0, "overrun": 0.0, "orig": 0.0}
            sector_totals[sec]["count"] += 1
            sector_totals[sec]["overrun"] += p.get("cost_overrun_crore", 0.0)
            sector_totals[sec]["orig"] += p.get("original_cost_crore", 0.0)

        sorted_sec = sorted(sector_totals.items(), key=lambda x: x[1]["overrun"], reverse=True)[:5]
        response_text = "The sectors with the highest cumulative cost escalation are:\n\n"
        for idx, (sec, d) in enumerate(sorted_sec, 1):
            esc_pct = ((d["overrun"] / d["orig"]) * 100.0) if d["orig"] > 0 else 0.0
            response_text += (
                f"{idx}. **{sec}**: ₹{d['overrun']:,.2f} Cr total overrun across {d['count']} projects "
                f"(+{esc_pct:.1f}% escalation)\n"
            )
        return {
            "query": query,
            "answer": response_text,
            "matched_sectors": sorted_sec,
            "intent": "SECTOR_COST_ANALYSIS"
        }

    # 3. Schedule delay query
    if any(term in q for term in ["delay", "schedule", "slippage", "late"]):
        delayed = [p for p in projects if (p.get("delay_months") or 0) >= 12]
        delayed.sort(key=lambda x: x.get("delay_months", 0), reverse=True)
        sample = delayed[:5]
        response_text = (
            f"Found **{len(delayed)} projects** experiencing major schedule slippage of 12+ months. "
            f"Top 5 most delayed:\n\n"
        )
        for p in sample:
            response_text += (
                f"• **{p.get('project_name')}**: Delayed by **{p.get('delay_months', 0):.0f} months** "
                f"(Originally target: {p.get('original_doc', 'N/A')}, Revised: {p.get('revised_doc', 'N/A')})\n"
                f"  - Progress: {p.get('physical_progress_pct', 0):.1f}% | Outlay: ₹{p.get('cumulative_expenditure_crore', 0):,.1f} Cr\n"
            )
        return {
            "query": query,
            "answer": response_text,
            "matched_projects": sample,
            "intent": "SCHEDULE_DELAY_ANALYSIS"
        }

    # 4. Specific project lookup by name or key
    for p in projects:
        name = p.get("project_name", "").lower()
        key = p.get("canonical_project_key", "").lower()
        code = str(p.get("source_project_id", ""))
        if (len(q) > 4 and (q in name or name in q)) or (key in q) or (code and code in q):
            drivers = p.get("explainable_drivers", {}).get("cost_drivers", [])
            response_text = (
                f"### Project Intelligence: **{p.get('project_name')}**\n\n"
                f"• **Key / ID**: `{p.get('canonical_project_key')}` (Source ID: {p.get('source_project_id')})\n"
                f"• **Sector & Ministry**: {p.get('sector')} | {p.get('ministry')}\n"
                f"• **Executing Agency**: {p.get('agency')} ({p.get('state')})\n"
                f"• **Financials**: Original ₹{p.get('original_cost_crore', 0):,.2f} Cr, "
                f"Revised ₹{p.get('revised_cost_crore', 0):,.2f} Cr (Overrun: ₹{p.get('cost_overrun_crore', 0):,.2f} Cr)\n"
                f"• **Physical Progress**: {p.get('physical_progress_pct', 0):.1f}%\n"
                f"• **Attention Tier**: **{p.get('attention_tier')}** (Rank #{p.get('portfolio_rank')})\n"
                f"• **Attention Score**: `{p.get('attention_score', 0):.4f}` (Coverage: {p.get('risk_coverage')})\n"
                f"• **Recommended Protocol**: `{p.get('primary_action')}`\n"
                f"• **Key Supervisory Drivers**:\n"
            )
            for d in drivers[:2]:
                response_text += f"  - *{d.get('source_fact')}*\n"
            return {
                "query": query,
                "answer": response_text,
                "matched_projects": [p],
                "intent": "PROJECT_PROFILE"
            }

    # Default fallback: Portfolio summary overview
    return {
        "query": query,
        "answer": (
            f"The active PAIMANA portfolio tracks **{summary.get('total_projects', len(projects))} central sector projects** "
            f"with cumulative expenditure of ₹{summary.get('total_expenditure_crore', 0):,.2f} Cr. "
            f"Currently **{summary.get('tier_distribution', {}).get('Tier 1', 0)} projects** are flagged in **Tier 1** (highest supervisory attention), "
            f"and **{summary.get('delayed_projects', 0)} projects** have recorded schedule slippage.\n\n"
            f"Try asking:\n"
            f"• *'Which projects have the highest risk?'*\n"
            f"• *'Which sectors have the highest cost escalation?'*\n"
            f"• *'Show projects with schedule delays'* \n"
            f"• *Or search for a specific project name like 'Kadapa' or 'Vijayawada'*"
        ),
        "matched_projects": [],
        "intent": "GENERAL_SUMMARY"
    }
