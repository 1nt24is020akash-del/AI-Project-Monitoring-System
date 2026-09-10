import { useEffect, useState } from "react"
import { AlertTriangle, Filter, Search, ShieldAlert, X } from "lucide-react"
import { getAlerts } from "../services/api"
import type { EarlyWarningAlert } from "../types/api"

interface AlertCenterModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProject: (key: string) => void
}

export default function AlertCenterModal({
  isOpen,
  onClose,
  onSelectProject,
}: AlertCenterModalProps) {
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [severityFilter, setSeverityFilter] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    getAlerts({
      severity: severityFilter === "ALL" ? undefined : severityFilter,
      search: searchTerm || undefined,
      limit: 100,
    })
      .then((res) => {
        setAlerts(res.alerts)
        setTotal(res.total_alerts)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isOpen, severityFilter, searchTerm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#0b1f3a] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-600 p-2">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Early Warning Alert Center</h2>
              <p className="text-xs text-slate-300">
                Automated surveillance of cost escalations, schedule slippages, and financial divergences ({total} active warnings)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-1">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  severityFilter === sev
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert by project or CPSE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No early warnings found matching the selected filter.
            </div>
          ) : (
            alerts.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  onClose()
                  onSelectProject(a.canonical_project_key)
                }}
                className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        a.severity === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : a.severity === "HIGH"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {a.alert_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400">({a.id})</span>
                  </div>

                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800">
                    {a.detected_value}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                  {a.project_name}
                </h3>

                <p className="text-xs text-slate-600">{a.reason}</p>

                <div className="mt-1 flex flex-wrap items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span>
                    Agency: <strong>{a.agency}</strong> | {a.state}
                  </span>
                  <span className="font-medium text-blue-600">
                    Action: {a.recommended_action} →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
          <span>Click any alert to inspect the full project profile and explainability facts</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
