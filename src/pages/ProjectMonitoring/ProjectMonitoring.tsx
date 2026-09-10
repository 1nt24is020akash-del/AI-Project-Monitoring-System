import { useEffect, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Filter,
  FolderKanban,
  Search,
  TrendingUp,
} from "lucide-react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useApp } from "../../context/AppContext"
import { getMonthlyReports, getProjects } from "../../services/api"
import type { Project } from "../../types/api"

export default function ProjectMonitoring() {
  const { openProjectDetail } = useApp()

  const [projects, setProjects] = useState<Project[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [sectorFilter, setSectorFilter] = useState("ALL")
  const [delayFilter, setDelayFilter] = useState("ALL")
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])

  useEffect(() => {
    getMonthlyReports()
      .then((res) => {
        const trendData = res.reports.map((r: any) => ({
          month: r.monthShort,
          ongoing: r.ongoingProjects,
          commissioned: r.commissioned,
          newlyAdded: r.newlyAdded,
        }))
        setMonthlyTrends(trendData)
      })
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    setLoading(true)
    getProjects({
      page,
      page_size: pageSize,
      search: searchTerm || undefined,
      sector: sectorFilter === "ALL" ? undefined : sectorFilter,
      sort_by: "portfolio_rank",
      order: "asc",
    })
      .then((res) => {
        let filtered = res.data
        if (delayFilter === "DELAYED") {
          filtered = filtered.filter((p) => (p.delay_months || 0) > 0)
        } else if (delayFilter === "ON_TIME") {
          filtered = filtered.filter((p) => (p.delay_months || 0) === 0)
        }
        setProjects(filtered)
        setTotalRecords(res.total_records)
        setTotalPages(res.total_pages)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load projects:", err)
        setLoading(false)
      })
  }, [page, pageSize, searchTerm, sectorFilter, delayFilter])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Monitoring</h1>
        <p className="mt-1 text-sm text-slate-500">
          Integrated surveillance of {totalRecords.toLocaleString()} Central Sector Infrastructure Projects (MoSPI / IPMD).
        </p>
      </div>

      {/* Portfolio Trend Graph */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Monthly Project Progression (April – July 2026)
          </h2>
          <p className="text-xs text-slate-500">
            Evolution of ongoing, commissioned, and newly inducted infrastructure assets.
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="ongoing"
                stroke="#2563eb"
                strokeWidth={2.5}
                name="Ongoing Projects"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="commissioned"
                stroke="#16a34a"
                strokeWidth={2}
                name="Commissioned Projects"
              />
              <Line
                type="monotone"
                dataKey="newlyAdded"
                stroke="#d97706"
                strokeWidth={2}
                name="Newly Added"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, ID, or executing agency..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={delayFilter}
            onChange={(e) => {
              setDelayFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="DELAYED">Delayed Projects Only</option>
            <option value="ON_TIME">On Schedule Only</option>
          </select>
        </div>
      </div>

      {/* Project Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <th className="px-4 py-3">Project Title & Key</th>
                <th className="px-4 py-3">Executing Agency</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Revised Cost</th>
                <th className="px-4 py-3">Cumulative Outlay</th>
                <th className="px-4 py-3">Physical Progress</th>
                <th className="px-4 py-3">Schedule Status</th>
                <th className="px-4 py-3">Tier</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Loading authentic MoSPI project records...
                    </div>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No infrastructure projects found matching the criteria.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.canonical_project_key}
                    onClick={() => openProjectDetail(p.canonical_project_key)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50 transition text-xs"
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate" title={p.project_name}>
                        {p.project_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {p.canonical_project_key}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate" title={p.agency}>
                      {p.agency}
                    </td>

                    <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">
                      {p.sector}
                    </td>

                    <td className="px-4 py-3 text-slate-600">{p.state}</td>

                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ₹{p.revised_cost_crore?.toLocaleString()} Cr
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      ₹{p.cumulative_expenditure_crore?.toLocaleString()} Cr
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${Math.min(100, p.physical_progress_pct)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{p.physical_progress_pct}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          (p.delay_months || 0) > 0
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {(p.delay_months || 0) > 0
                          ? `+${p.delay_months} Mo Delayed`
                          : "On Schedule"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRecords)} of {totalRecords} projects
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}