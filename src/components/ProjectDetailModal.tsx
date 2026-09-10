import { useEffect, useState } from "react"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  IndianRupee,
  Info,
  Layers,
  MapPin,
  Shield,
  TrendingUp,
  X,
} from "lucide-react"
import { getProjectDetail } from "../services/api"
import type { Project } from "../types/api"

interface ProjectDetailModalProps {
  projectKey: string | null
  onClose: () => void
}

export default function ProjectDetailModal({
  projectKey,
  onClose,
}: ProjectDetailModalProps) {
  const [data, setData] = useState<{
    project: Project
    risk: any
    intervention: any
    drivers: any
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectKey) return
    setLoading(true)
    setError(null)
    getProjectDetail(projectKey)
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "Failed to load project details")
        setLoading(false)
      })
  }, [projectKey])

  if (!projectKey) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-[#0b1f3a] p-6 text-white">
          <div className="pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                {data?.project?.canonical_project_key || projectKey}
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                MoSPI ID: {data?.project?.source_project_id || "N/A"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  data?.project?.attention_tier === "Tier 1"
                    ? "bg-red-500 text-white"
                    : data?.project?.attention_tier === "Tier 2"
                    ? "bg-amber-500 text-white"
                    : data?.project?.attention_tier === "Tier 3"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-500 text-white"
                }`}
              >
                {data?.project?.attention_tier || "Tier 1"}
              </span>
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                Rank #{data?.project?.portfolio_rank || 1}
              </span>
            </div>

            <h2 className="mt-2 text-xl font-bold leading-snug">
              {data?.project?.project_name || "Loading Project..."}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Layers size={14} className="text-blue-400" />
                {data?.project?.sector || "Sector"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-blue-400" />
                {data?.project?.state || "State"}
              </span>
              <span>Agency: {data?.project?.agency || "N/A"}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Supervisory Recommendation Banner */}
              <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-600 p-2 text-white">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        Prescriptive Intervention Protocol
                      </span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                        {data.intervention.primary_action}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {data.intervention.priority_reason}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {data.intervention.governance_note}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Financial & Timeline Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">Original Cost</span>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ₹{data.project.original_cost_crore?.toLocaleString()} Cr
                  </p>
                  <span className="text-[11px] text-slate-400">Baseline Sanction</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">Revised Cost</span>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ₹{data.project.revised_cost_crore?.toLocaleString()} Cr
                  </p>
                  <span
                    className={`text-[11px] font-semibold ${
                      data.project.cost_overrun_crore > 0 ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {data.project.cost_overrun_crore > 0
                      ? `+₹${data.project.cost_overrun_crore.toLocaleString()} Cr (+${data.project.cost_escalation_pct}%)`
                      : "No Escalation"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">Cumulative Expenditure</span>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ₹{data.project.cumulative_expenditure_crore?.toLocaleString()} Cr
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Outlay Ratio: {data.project.expenditure_ratio}x
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">Physical Progress</span>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {data.project.physical_progress_pct}%
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${Math.min(100, data.project.physical_progress_pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Predictive Intelligence & Multi-Hazard Scoring */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                  AI Multi-Hazard Risk Scoring
                </h3>
                <p className="text-xs text-slate-500">
                  Model-estimated probabilities evaluated strictly using Point-in-Time administrative features.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-600">
                      Cost Risk Probability (P_c)
                    </span>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {(data.project.cost_risk_probability * 100).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-400">Random Forest Classifier</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-600">
                      Schedule Risk Probability (P_s)
                    </span>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {data.project.schedule_risk_probability !== null &&
                      data.project.schedule_risk_probability !== undefined
                        ? `${(data.project.schedule_risk_probability * 100).toFixed(1)}%`
                        : "N/A (Unrecorded Baseline)"}
                    </p>
                    <p className="text-[10px] text-slate-400">Delay ≥ 3 Months Model</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-600">
                      Attention Score [max(P_c, P_s)]
                    </span>
                    <p className="mt-1 text-xl font-bold text-blue-600">
                      {data.project.attention_score?.toFixed(4)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Quantile Tier: {data.project.attention_tier}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline & Milestones */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">Implementation Timeline</h3>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Sanction / Approval Date</span>
                      <span className="font-semibold text-slate-800">{data.project.approval_date || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Ground Start Date</span>
                      <span className="font-semibold text-slate-800">{data.project.start_date || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Original Target Completion</span>
                      <span className="font-semibold text-slate-800">{data.project.original_doc || "Unrecorded"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Revised Target Completion</span>
                      <span className="font-semibold text-slate-800">{data.project.revised_doc || "Same as original"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Recorded Delay Duration</span>
                      <span className={`font-bold ${(data.project.delay_months || 0) > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {(data.project.delay_months || 0) > 0
                          ? `${data.project.delay_months} Months Delayed`
                          : "On Schedule"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Explainable Risk Drivers */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Explainable Risk Drivers (MoSPI Evidence)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Key factors mathematically contributing to this project's supervisory score.
                  </p>

                  <div className="mt-3 space-y-2.5">
                    {data.drivers?.cost_drivers?.map((d: any) => (
                      <div
                        key={d.rank}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{d.feature.replace("feat_", "").replace(/_/g, " ")}</span>
                          <span className={d.direction === "INCREASES_RISK" ? "text-red-600" : "text-emerald-600"}>
                            {d.direction}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600">{d.source_fact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Source Provenance */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                <span>
                  Source: MoSPI Flash Report ({data.project.source_file}, Page {data.project.source_page})
                </span>
                <span>Cutoff: {data.project.snapshot_date}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}
