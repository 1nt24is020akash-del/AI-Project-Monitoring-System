import { useEffect, useState } from "react"
import { AlertTriangle, Brain, Filter, Layers, ShieldCheck } from "lucide-react"
import { useApp } from "../../context/AppContext"
import { getPortfolioSummary, getProjects } from "../../services/api"
import type { PortfolioSummary, Project } from "../../types/api"

export default function PredictiveRisk() {
  const { openProjectDetail } = useApp()

  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTier, setSelectedTier] = useState("Tier 1")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getPortfolioSummary(),
      getProjects({ tier: selectedTier, page_size: 12, sort_by: "attention_score", order: "desc" }),
    ])
      .then(([sumRes, projRes]) => {
        setSummary(sumRes)
        setProjects(projRes.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [selectedTier])

  const riskOverview = [
    {
      label: "Projects Risk Scored",
      value: summary?.total_projects ? summary.total_projects.toLocaleString() : "1,775",
      description: "Active Central Sector holdout cohort",
    },
    {
      label: "Tier 1 High Urgency",
      value: summary?.tier_distribution?.["Tier 1"]?.toLocaleString() || "180",
      description: "Top 10% supervisory attention band",
    },
    {
      label: "Tier 2 Elevated",
      value: summary?.tier_distribution?.["Tier 2"]?.toLocaleString() || "264",
      description: "75th–90th percentile focus",
    },
    {
      label: "Cost Overrun Hazard",
      value: summary?.cost_overrun_projects?.toLocaleString() || "482",
      description: "Projects with cost escalation > 0",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Predictive Risk Assessment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Point-in-Time machine learning models forecasting prospective cost escalation and schedule slippage.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {riskOverview.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Mathematical Framework Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Multi-Hazard Attention Score Formulation
            </h3>
            <p className="mt-1 text-xs text-slate-700 leading-relaxed max-w-4xl">
              Projects are evaluated using dual prospective Random Forest classification models.
              The composite <strong>Attention Score</strong> is defined as{" "}
              <code className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-900 font-mono font-bold">
                attention_score = max(P_cost, P_schedule)
              </code>
              , representing the maximum risk across financial escalation and timeline slippage hazards.
              Dual-vulnerability is tracked via{" "}
              <code className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-900 font-mono font-bold">
                compound_exposure = min(P_cost, P_schedule)
              </code>.
            </p>
          </div>
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 mr-2">Filter by Attention Tier:</span>
        {["Tier 1", "Tier 2", "Tier 3", "Tier 4"].map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              selectedTier === tier
                ? tier === "Tier 1"
                  ? "bg-red-600 text-white shadow-sm"
                  : tier === "Tier 2"
                  ? "bg-amber-500 text-white shadow-sm"
                  : tier === "Tier 3"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-700 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tier} ({summary?.tier_distribution?.[tier as keyof typeof summary.tier_distribution] || 0})
          </button>
        ))}
      </div>

      {/* Scored Projects Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              Loading predictive risk intelligence...
            </div>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.canonical_project_key}
              onClick={() => openProjectDetail(p.canonical_project_key)}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
                    Rank #{p.portfolio_rank}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      p.attention_tier === "Tier 1"
                        ? "bg-red-100 text-red-700"
                        : p.attention_tier === "Tier 2"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {p.attention_tier}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 leading-snug line-clamp-2">
                  {p.project_name}
                </h3>

                <p className="mt-1 text-xs text-slate-500 truncate">{p.agency}</p>
                <p className="text-[11px] text-slate-400">
                  {p.sector} · {p.state}
                </p>

                {/* Probabilities Comparison */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Cost Risk (P_c)</span>
                    <p className="font-bold text-slate-900">
                      {(p.cost_risk_probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Schedule Risk (P_s)</span>
                    <p className="font-bold text-slate-900">
                      {p.schedule_risk_probability !== null && p.schedule_risk_probability !== undefined
                        ? `${(p.schedule_risk_probability * 100).toFixed(1)}%`
                        : "Unrecorded"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2 italic">
                  "{p.priority_reason}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Score: <strong className="text-blue-600 font-bold">{p.attention_score.toFixed(4)}</strong>
                </span>
                <span className="text-blue-600 font-bold group-hover:underline">
                  Explain →
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}