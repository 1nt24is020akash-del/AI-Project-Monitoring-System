import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Calendar,
  Database,
} from "lucide-react"

import { monthlyReports as fallbackMonthlyReports } from "../../data/paimanaData"
import { getCostDriverAnalytics, getMonthlyReports } from "../../services/api"
import type { CostDriverAnalytics } from "../../types/api"

export default function Reports() {
  const [reports, setReports] = useState<any[]>(fallbackMonthlyReports)
  const [costDrivers, setCostDrivers] = useState<CostDriverAnalytics | null>(null)
  const [activeTab, setActiveTab] = useState<"monthly" | "sectors" | "ministries" | "size_tiers">("monthly")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [monthlyRes, driverRes] = await Promise.all([
          getMonthlyReports().catch(() => null),
          getCostDriverAnalytics().catch(() => null),
        ])
        if (monthlyRes?.reports && monthlyRes.reports.length > 0) {
          setReports(monthlyRes.reports)
        }
        if (driverRes) {
          setCostDrivers(driverRes)
        }
      } catch (err) {
        console.error("Failed to load reports data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const latestReport = reports[reports.length - 1] || fallbackMonthlyReports[3]

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Executive Monitoring Reports
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <Database className="h-3 w-3" /> Official MoSPI Data
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Official monthly infrastructure monitoring snapshots (April – July 2026) and cost escalation driver analytics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap rounded-lg bg-slate-100 p-1 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`rounded-md px-3 py-1.5 transition-all ${
              activeTab === "monthly"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Monthly Snapshots
          </button>
          <button
            onClick={() => setActiveTab("sectors")}
            className={`rounded-md px-3 py-1.5 transition-all ${
              activeTab === "sectors"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Sector Cost Drivers
          </button>
          <button
            onClick={() => setActiveTab("ministries")}
            className={`rounded-md px-3 py-1.5 transition-all ${
              activeTab === "ministries"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Ministry Overrun
          </button>
          <button
            onClick={() => setActiveTab("size_tiers")}
            className={`rounded-md px-3 py-1.5 transition-all ${
              activeTab === "size_tiers"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Mega vs Major Tiers
          </button>
        </div>
      </div>

      {/* Official Flash Report Metadata Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                MoSPI Infrastructure & Project Monitoring Division (IPMD) Flash Report Series
              </p>
              <p className="text-xs text-slate-600">
                Data extracted directly from official Flash Reports (April, May, June, July 2026). All Central Sector Infrastructure Projects costing ₹150 Crore and above.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-600">
            <span className="font-mono font-medium">Latest Snapshot: <strong className="text-blue-700">July 2026</strong></span>
            <span className="text-slate-300">|</span>
            <span>1,775 Monitored Projects</span>
          </div>
        </div>
      </div>

      {/* 4 Monthly KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <div
            key={report.month}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {report.month}
              </p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">
                {report.monthShort} 2026
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {report.ongoingProjects.toLocaleString()}
            </p>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Ongoing Projects</span>
              <span className="font-semibold text-blue-600">
                ₹{((report.revisedCostCrore || 0) / 100000).toFixed(2)}L Cr Cost
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              <span>Comm: <strong className="text-emerald-700 font-semibold">{report.commissioned}</strong></span>
              <span>•</span>
              <span>Added: <strong className="text-blue-700 font-semibold">{report.newlyAdded}</strong></span>
              <span>•</span>
              <span>Exp: <strong className="text-slate-900 font-semibold">{report.expenditurePercent}%</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* TAB CONTENT: MONTHLY SNAPSHOTS */}
      {activeTab === "monthly" && (
        <>
          {/* Monthly Report Summary Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Monthly Monitoring Summary (April – July 2026)
                </h2>
                <p className="text-xs text-slate-500">
                  Verified indicators from Table 1 & Table 2 of official IPMD Flash Reports.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">4-Month Continuous Time Series</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50/50">
                    <th className="px-3 py-3">Month</th>
                    <th className="px-3 py-3 text-right">Ongoing Projects</th>
                    <th className="px-3 py-3 text-right">Commissioned</th>
                    <th className="px-3 py-3 text-right">Newly Added</th>
                    <th className="px-3 py-3 text-right">Original Cost</th>
                    <th className="px-3 py-3 text-right">Revised Cost</th>
                    <th className="px-3 py-3 text-right">Cost Overrun</th>
                    <th className="px-3 py-3 text-right">Cumulative Exp</th>
                    <th className="px-3 py-3 text-right">Exp %</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {reports.map((report) => {
                    const overrun = (report.revisedCostCrore || 0) - (report.originalCostCrore || 0)
                    const overrunPct = ((overrun / (report.originalCostCrore || 1)) * 100).toFixed(2)
                    return (
                      <tr key={report.month} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-3.5 font-sans font-medium text-slate-900">
                          {report.month}
                        </td>
                        <td className="px-3 py-3.5 text-right font-semibold text-slate-800">
                          {report.ongoingProjects.toLocaleString()}
                        </td>
                        <td className="px-3 py-3.5 text-right text-emerald-700 font-semibold">
                          +{report.commissioned}
                        </td>
                        <td className="px-3 py-3.5 text-right text-blue-700 font-semibold">
                          +{report.newlyAdded}
                        </td>
                        <td className="px-3 py-3.5 text-right text-slate-600">
                          ₹{report.originalCostCrore.toLocaleString()} Cr
                        </td>
                        <td className="px-3 py-3.5 text-right text-slate-900 font-semibold">
                          ₹{report.revisedCostCrore.toLocaleString()} Cr
                        </td>
                        <td className="px-3 py-3.5 text-right text-amber-700 font-semibold">
                          +₹{overrun.toLocaleString()} Cr ({overrunPct}%)
                        </td>
                        <td className="px-3 py-3.5 text-right text-slate-700">
                          ₹{report.expenditureCrore.toLocaleString()} Cr
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-blue-700">
                          {report.expenditurePercent}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Highlights */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Latest Month Highlights (July 2026)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Key movements and milestones observed in the latest reporting cycle.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs font-semibold text-blue-700">July Ongoing Projects</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {latestReport.ongoingProjects.toLocaleString()}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Total monitored Central Sector infrastructure projects.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold text-emerald-700">July Commissioned</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {latestReport.commissioned}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Completed & operationalized projects during the cycle.
                </p>
              </div>

              <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
                <p className="text-xs font-semibold text-amber-700">July Newly Added</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {latestReport.newlyAdded}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  New infrastructure projects inducted into PAIMANA.
                </p>
              </div>

              <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-4">
                <p className="text-xs font-semibold text-purple-700">July Cumulative Expenditure</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {latestReport.expenditurePercent}%
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Reported capital expenditure as % of revised project cost.
                </p>
              </div>
            </div>
          </div>

          {/* Cost Overview Cards */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Cost Overview & Escalation Evolution
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Comparison of Original Cost vs. Revised Cost vs. Expenditure across monthly snapshots.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {reports.map((report) => {
                const costIncrease = report.revisedCostCrore - report.originalCostCrore
                const costIncreasePercent = (costIncrease / report.originalCostCrore) * 100

                return (
                  <div
                    key={report.month}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">
                        {report.monthShort} 2026
                      </p>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        Snapshot
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Original Cost:</span>
                        <span className="font-semibold text-slate-900">
                          ₹{report.originalCostCrore.toLocaleString()} Cr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Revised Cost:</span>
                        <span className="font-semibold text-slate-900">
                          ₹{report.revisedCostCrore.toLocaleString()} Cr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expenditure:</span>
                        <span className="font-semibold text-slate-900">
                          ₹{report.expenditureCrore.toLocaleString()} Cr
                        </span>
                      </div>
                      <div className="border-t border-slate-200 pt-2.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-500">Overrun:</span>
                          <span className="font-bold text-amber-700">
                            +₹{costIncrease.toLocaleString()} Cr
                          </span>
                        </div>
                        <p className="text-right text-[11px] font-medium text-amber-600 mt-0.5">
                          +{costIncreasePercent.toFixed(2)}% escalation
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Expenditure Progress Bars */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Expenditure Realisation Progress
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Capital expenditure relative to revised portfolio cost over time.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {reports.map((report) => (
                <div
                  key={report.month}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {report.monthShort} 2026
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {report.expenditurePercent}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{
                        width: `${report.expenditurePercent}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    ₹{report.expenditureCrore.toLocaleString()} Cr executed
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Expenditure & Cost Escalation Dual Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Cumulative Expenditure Progression
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Reported capital expenditure across April–July 2026 (in ₹ Lakh Crore).
              </p>

              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reports.map((report) => ({
                      month: report.monthShort,
                      expenditure: report.expenditureCrore,
                    }))}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis
                      stroke="#64748b"
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()} Cr`, "Expenditure"]}
                      labelFormatter={(label) => `${label} 2026`}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenditure"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#2563eb" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Original vs Revised Cost Comparison
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Cost escalation delta between original sanction and anticipated completion.
              </p>

              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reports.map((r) => ({
                      month: r.monthShort,
                      Original: r.originalCostCrore,
                      Revised: r.revisedCostCrore,
                    }))}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis
                      stroke="#64748b"
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()} Cr`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="Original" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Revised" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB CONTENT: SECTOR COST DRIVERS (SIH Outcome 6) */}
      {activeTab === "sectors" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Cost Escalation Driver Analysis by Sector
                </h2>
                <p className="text-xs text-slate-500">
                  Identifies primary infrastructure sectors driving portfolio cost overruns and delays.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                SIH Requirement: Outcome 6
              </span>
            </div>

            {costDrivers?.sectors && costDrivers.sectors.length > 0 ? (
              <>
                {/* Sector Overrun Bar Chart */}
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={costDrivers.sectors.slice(0, 8)}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k Cr`}
                        stroke="#64748b"
                      />
                      <YAxis
                        type="category"
                        dataKey="sector"
                        width={90}
                        stroke="#64748b"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(val: any) => [`₹${Number(val).toLocaleString()} Cr`, "Cost Overrun"]}
                      />
                      <Bar dataKey="cost_overrun_crore" fill="#ea580c" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sector Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600">
                        <th className="px-3 py-3">Sector</th>
                        <th className="px-3 py-3 text-right">Projects</th>
                        <th className="px-3 py-3 text-right">Original Cost</th>
                        <th className="px-3 py-3 text-right">Revised Cost</th>
                        <th className="px-3 py-3 text-right">Cost Overrun</th>
                        <th className="px-3 py-3 text-right">Escalation %</th>
                        <th className="px-3 py-3 text-right">Delayed Projects</th>
                        <th className="px-3 py-3 text-right">Delay Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-mono">
                      {costDrivers.sectors.map((sec) => (
                        <tr key={sec.sector} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-3 font-sans font-semibold text-slate-900">
                            {sec.sector}
                          </td>
                          <td className="px-3 py-3 text-right font-sans font-medium text-slate-700">
                            {sec.project_count}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600">
                            ₹{sec.original_cost_crore.toLocaleString()} Cr
                          </td>
                          <td className="px-3 py-3 text-right text-slate-900 font-semibold">
                            ₹{sec.revised_cost_crore.toLocaleString()} Cr
                          </td>
                          <td className={`px-3 py-3 text-right font-semibold ${sec.cost_overrun_crore > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                            ₹{sec.cost_overrun_crore.toLocaleString()} Cr
                          </td>
                          <td className={`px-3 py-3 text-right font-semibold ${sec.cost_escalation_pct > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                            +{sec.cost_escalation_pct}%
                          </td>
                          <td className="px-3 py-3 text-right font-sans font-medium text-slate-700">
                            {sec.delayed_projects}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-900">
                            {sec.delayed_rate_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400">Loading sector analytics...</div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MINISTRY OVERRUN */}
      {activeTab === "ministries" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Ministry Cost Escalation Concentration (Top 15)
              </h2>
              <p className="text-xs text-slate-500">
                Ministries responsible for the highest aggregate cost escalation across the central sector.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Ranked by Overrun (₹ Cr)</span>
          </div>

          {costDrivers?.ministries && costDrivers.ministries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600">
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Ministry</th>
                    <th className="px-3 py-3 text-right">Projects</th>
                    <th className="px-3 py-3 text-right">Original Cost</th>
                    <th className="px-3 py-3 text-right">Revised Cost</th>
                    <th className="px-3 py-3 text-right">Cost Overrun</th>
                    <th className="px-3 py-3 text-right">Escalation %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {costDrivers.ministries.map((min, idx) => (
                    <tr key={min.ministry} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-3 font-sans font-semibold text-slate-900">
                        {min.ministry}
                      </td>
                      <td className="px-3 py-3 text-right font-sans font-medium text-slate-700">
                        {min.project_count}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-600">
                        ₹{min.original_cost_crore.toLocaleString()} Cr
                      </td>
                      <td className="px-3 py-3 text-right text-slate-900 font-semibold">
                        ₹{min.revised_cost_crore.toLocaleString()} Cr
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-amber-700">
                        +₹{min.cost_overrun_crore.toLocaleString()} Cr
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-amber-700">
                        +{min.cost_escalation_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Loading ministry data...</div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEGA VS MAJOR TIERS */}
      {activeTab === "size_tiers" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Project Size Category Analysis (Mega vs. Major)
              </h2>
              <p className="text-xs text-slate-500">
                MoSPI categorizes infrastructure projects into Mega (₹1,000 Cr and above) and Major (below ₹1,000 Cr).
              </p>
            </div>

            {costDrivers?.project_size_tiers && (
              <div className="grid gap-6 md:grid-cols-2">
                {costDrivers.project_size_tiers.map((tier) => {
                  const isMega = tier.size_category.includes("Mega")
                  return (
                    <div
                      key={tier.size_category}
                      className={`rounded-xl border p-6 ${
                        isMega ? "border-amber-200 bg-amber-50/30" : "border-blue-200 bg-blue-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          isMega ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {tier.size_category}
                        </span>
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {tier.project_count} Projects
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-sm">
                          <p className="text-xs text-slate-500">Original Sanction</p>
                          <p className="mt-1 text-lg font-bold text-slate-900 font-mono">
                            ₹{(tier.original_cost_crore / 1000).toFixed(1)}k Cr
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-sm">
                          <p className="text-xs text-slate-500">Total Cost Overrun</p>
                          <p className="mt-1 text-lg font-bold text-amber-700 font-mono">
                            +₹{(tier.cost_overrun_crore / 1000).toFixed(1)}k Cr
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg bg-white p-3 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-medium">Cost Escalation Ratio</span>
                          <span className="font-bold text-amber-700 text-sm">+{tier.escalation_pct}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${isMega ? "bg-amber-600" : "bg-blue-600"}`}
                            style={{ width: `${Math.min(100, tier.escalation_pct * 3)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transparency & Grounding Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-4">
        <span>Ministry of Statistics and Programme Implementation (MoSPI) • DIID</span>
        <span>Zero Synthetic Data Guarantee • Direct PDF Ingestion</span>
      </div>
    </div>
  )
}
