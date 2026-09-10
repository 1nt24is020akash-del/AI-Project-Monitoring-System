import { useEffect, useState } from "react"
import { AlertTriangle, Clock, Filter, ShieldAlert, ShieldCheck } from "lucide-react"
import { useApp } from "../../context/AppContext"
import { getPortfolioSummary, getRanking } from "../../services/api"
import type { PortfolioSummary, Project } from "../../types/api"

export default function RiskPrioritisation() {
  const { openProjectDetail } = useApp()

  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [ranking, setRanking] = useState<Project[]>([])
  const [tierFilter, setTierFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getPortfolioSummary(),
      getRanking({
        limit: 50,
        tier: tierFilter === "ALL" ? undefined : tierFilter,
      }),
    ])
      .then(([sumRes, rankRes]) => {
        setSummary(sumRes)
        setRanking(rankRes.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [tierFilter])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risk Prioritisation Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ranked supervisory intervention queue based on prospective multi-hazard risk severity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Portfolio Scored
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {summary?.total_projects ? summary.total_projects.toLocaleString() : "1,775"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Full cohort evaluated</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tier 1 (Priority 1)
          </p>
          <p className="mt-2 text-3xl font-extrabold text-red-600">
            {summary?.tier_distribution?.["Tier 1"] || 180}
          </p>
          <p className="mt-1 text-xs text-slate-500">Executive review within 14 days</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tier 2 (Priority 2)
          </p>
          <p className="mt-2 text-3xl font-extrabold text-amber-600">
            {summary?.tier_distribution?.["Tier 2"] || 264}
          </p>
          <p className="mt-1 text-xs text-slate-500">Monthly committee review</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tier 3 (Priority 3)
          </p>
          <p className="mt-2 text-3xl font-extrabold text-blue-600">
            {summary?.tier_distribution?.["Tier 3"] || 444}
          </p>
          <p className="mt-1 text-xs text-slate-500">Standard quarterly tracking</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 mr-2">Filter Leaderboard:</span>
        {["ALL", "Tier 1", "Tier 2", "Tier 3", "Tier 4"].map((tier) => (
          <button
            key={tier}
            onClick={() => setTierFilter(tier)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              tierFilter === tier
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tier === "ALL" ? "All Projects (Top 50)" : tier}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <th className="px-4 py-3">Portfolio Rank</th>
                <th className="px-4 py-3">Project Details</th>
                <th className="px-4 py-3">Sector & State</th>
                <th className="px-4 py-3">Attention Score</th>
                <th className="px-4 py-3">Tier Band</th>
                <th className="px-4 py-3">Intervention Protocol</th>
                <th className="px-4 py-3">Supervisory Cadence</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Loading prioritised risk rankings...
                    </div>
                  </td>
                </tr>
              ) : (
                ranking.map((p) => (
                  <tr
                    key={p.canonical_project_key}
                    onClick={() => openProjectDetail(p.canonical_project_key)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50 transition text-xs"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                            p.portfolio_rank <= 3
                              ? "bg-red-600 text-white"
                              : p.portfolio_rank <= 10
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {p.portfolio_rank}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.canonical_project_key}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate" title={p.project_name}>
                        {p.project_name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{p.agency}</p>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <p className="font-medium text-slate-800 truncate max-w-[120px]">
                        {p.sector}
                      </p>
                      <p className="text-[10px] text-slate-400">{p.state}</p>
                    </td>

                    <td className="px-4 py-3 font-bold text-blue-600">
                      {p.attention_score.toFixed(4)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          p.attention_tier === "Tier 1"
                            ? "bg-red-500 text-white"
                            : p.attention_tier === "Tier 2"
                            ? "bg-amber-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {p.attention_tier}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800 inline-block">
                        {p.primary_action}
                      </span>
                      <p className="mt-0.5 text-[10px] text-slate-500 truncate max-w-[200px]" title={p.priority_reason}>
                        {p.priority_reason}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          p.intervention_priority === "PRIORITY_1"
                            ? "text-red-700 font-bold"
                            : p.intervention_priority === "PRIORITY_2"
                            ? "text-amber-700 font-semibold"
                            : "text-slate-600"
                        }`}
                      >
                        {p.intervention_priority === "PRIORITY_1"
                          ? "Within 14 Days"
                          : p.intervention_priority === "PRIORITY_2"
                          ? "Monthly Review"
                          : p.intervention_priority === "PRIORITY_3"
                          ? "Quarterly Review"
                          : "Routine Cadence"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}