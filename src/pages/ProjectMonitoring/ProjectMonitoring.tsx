import { useEffect, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Filter,
  FolderKanban,
  RotateCcw,
  Search,
  SlidersHorizontal,
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

  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [sectorFilter, setSectorFilter] = useState("ALL")
  const [delayFilter, setDelayFilter] = useState("ALL")
  const [yearFilter, setYearFilter] = useState("ALL")
  const [sortOption, setSortOption] = useState("portfolio_rank:asc")
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
    const [sortByParam, sortOrderParam] = sortOption.split(":")

    getProjects({
      page,
      page_size: pageSize,
      search: searchTerm || undefined,
      sector: sectorFilter === "ALL" ? undefined : sectorFilter,
      year: yearFilter === "ALL" ? undefined : yearFilter,
      sort_by: sortByParam,
      order: sortOrderParam,
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
  }, [page, pageSize, searchTerm, sectorFilter, delayFilter, yearFilter, sortOption])

  const toggleYearSort = () => {
    if (sortOption === "approval_year:desc") {
      setSortOption("approval_year:asc")
    } else if (sortOption === "approval_year:asc") {
      setSortOption("portfolio_rank:asc")
    } else {
      setSortOption("approval_year:desc")
    }
    setPage(1)
  }

  const isFilteredOrSorted =
    Boolean(searchTerm) ||
    sectorFilter !== "ALL" ||
    delayFilter !== "ALL" ||
    yearFilter !== "ALL" ||
    sortOption !== "portfolio_rank:asc"

  const resetAllFilters = () => {
    setSearchTerm("")
    setSectorFilter("ALL")
    setDelayFilter("ALL")
    setYearFilter("ALL")
    setSortOption("portfolio_rank:asc")
    setPage(1)
  }

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
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
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

          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sector Filter */}
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              title="Filter by Sector"
            >
              <option value="ALL">All Sectors</option>
              <option value="Railways">Railways</option>
              <option value="Road Transport and Highways">Road Transport</option>
              <option value="Power">Power</option>
              <option value="Petroleum">Petroleum</option>
              <option value="Coal">Coal</option>
              <option value="Water Resources">Water Resources</option>
              <option value="Atomic Energy">Atomic Energy</option>
              <option value="Urban Development">Urban Development</option>
              <option value="Civil Aviation">Civil Aviation</option>
            </select>

            {/* Delay Status Filter */}
            <select
              value={delayFilter}
              onChange={(e) => {
                setDelayFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              title="Filter by Schedule Status"
            >
              <option value="ALL">All Statuses</option>
              <option value="DELAYED">Delayed Only</option>
              <option value="ON_TIME">On Schedule Only</option>
            </select>

            {/* Year Filter */}
            <div className="flex items-center gap-1">
              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
                title="Filter by Sanction Year"
              >
                <option value="ALL">All Sanction Years</option>
                <option value="2026">Sanctioned 2026</option>
                <option value="2025">Sanctioned 2025</option>
                <option value="2024">Sanctioned 2024</option>
                <option value="2023">Sanctioned 2023</option>
                <option value="2022">Sanctioned 2022</option>
                <option value="2021">Sanctioned 2021</option>
                <option value="2020">Sanctioned 2020</option>
                <option value="2019">Sanctioned 2019</option>
                <option value="2018">Sanctioned 2018</option>
                <option value="pre-2018">Sanctioned Pre-2018</option>
              </select>
            </div>

            {/* SORT BY YEAR & ATTRIBUTES DROPDOWN */}
            <div className="flex items-center gap-1">
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value)
                  setPage(1)
                }}
                className={`rounded-lg border py-1.5 px-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none transition ${
                  sortOption.includes("year")
                    ? "border-blue-400 bg-blue-50/80 text-blue-900"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
                title="Sort Projects by Year, Priority, Cost, or Delay"
              >
                <optgroup label="Sort by Year">
                  <option value="approval_year:desc">📅 Sanction Year: Newest First (2026 → Oldest)</option>
                  <option value="approval_year:asc">📅 Sanction Year: Oldest First (1983 → Newest)</option>
                  <option value="completion_year:asc">🎯 Target DOC: Earliest Completion First</option>
                  <option value="completion_year:desc">🎯 Target DOC: Furthest Completion First</option>
                </optgroup>
                <optgroup label="Standard Metrics">
                  <option value="portfolio_rank:asc">🏆 Portfolio Priority Rank (Default)</option>
                  <option value="cost:desc">💰 Revised Cost: Highest to Lowest</option>
                  <option value="progress:desc">⚡ Physical Progress: Highest to Lowest</option>
                  <option value="delay:desc">⏱️ Schedule Delay: Longest Delayed First</option>
                </optgroup>
              </select>
            </div>

            {/* Reset Button */}
            {isFilteredOrSorted && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                title="Reset all filters and sorting"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Criteria Indicator Bar */}
        {isFilteredOrSorted && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Active view:</span>
            {sortOption !== "portfolio_rank:asc" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-[11px]">
                <Calendar size={11} />
                {sortOption === "approval_year:desc" && "Sorted by Sanction Year (Newest First)"}
                {sortOption === "approval_year:asc" && "Sorted by Sanction Year (Oldest First)"}
                {sortOption === "completion_year:asc" && "Sorted by Target DOC (Earliest First)"}
                {sortOption === "completion_year:desc" && "Sorted by Target DOC (Furthest First)"}
                {sortOption === "cost:desc" && "Sorted by Cost (Highest First)"}
                {sortOption === "progress:desc" && "Sorted by Progress (Highest First)"}
                {sortOption === "delay:desc" && "Sorted by Delay (Longest First)"}
              </span>
            )}
            {yearFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 font-medium text-indigo-800 text-[11px]">
                Year: {yearFilter}
              </span>
            )}
            {sectorFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-800 text-[11px]">
                Sector: {sectorFilter}
              </span>
            )}
            {delayFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-800 text-[11px]">
                Status: {delayFilter === "DELAYED" ? "Delayed Only" : "On Schedule Only"}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-800 text-[11px]">
                Search: "{searchTerm}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Project Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <th className="px-4 py-3">Project Title & Key</th>
                <th className="px-4 py-3">Executing Agency</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">State</th>

                {/* Interactive Year Column Header */}
                <th
                  onClick={toggleYearSort}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/80 transition select-none group"
                  title="Click to toggle Sanction Year sort (Newest / Oldest)"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={sortOption.includes("approval_year") ? "text-blue-700 font-bold" : ""}>
                      Sanction / DOC Year
                    </span>
                    {sortOption === "approval_year:desc" ? (
                      <span className="flex items-center text-blue-600 font-bold text-[10px]">
                        <ArrowDown size={12} /> New
                      </span>
                    ) : sortOption === "approval_year:asc" ? (
                      <span className="flex items-center text-blue-600 font-bold text-[10px]">
                        <ArrowUp size={12} /> Old
                      </span>
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-400 group-hover:text-blue-600 transition" />
                    )}
                  </div>
                </th>

                {/* Revised Cost Column Header */}
                <th
                  onClick={() => {
                    setSortOption(sortOption === "cost:desc" ? "portfolio_rank:asc" : "cost:desc")
                    setPage(1)
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/80 transition select-none group"
                  title="Click to sort by Revised Cost"
                >
                  <div className="flex items-center gap-1">
                    <span className={sortOption === "cost:desc" ? "text-blue-700 font-bold" : ""}>
                      Revised Cost
                    </span>
                    {sortOption === "cost:desc" ? (
                      <ArrowDown size={12} className="text-blue-600" />
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </div>
                </th>

                <th className="px-4 py-3">Cumulative Outlay</th>

                {/* Physical Progress Column Header */}
                <th
                  onClick={() => {
                    setSortOption(sortOption === "progress:desc" ? "portfolio_rank:asc" : "progress:desc")
                    setPage(1)
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/80 transition select-none group"
                  title="Click to sort by Physical Progress"
                >
                  <div className="flex items-center gap-1">
                    <span className={sortOption === "progress:desc" ? "text-blue-700 font-bold" : ""}>
                      Physical Progress
                    </span>
                    {sortOption === "progress:desc" ? (
                      <ArrowDown size={12} className="text-blue-600" />
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </div>
                </th>

                <th className="px-4 py-3">Schedule Status</th>
                <th className="px-4 py-3">Tier</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Loading authentic MoSPI project records...
                    </div>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
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

                    {/* Timeline & Year Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">
                            <Calendar size={11} className="text-blue-500" />
                            {p.approval_date ? p.approval_date : "—"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Target: {p.revised_doc || p.original_doc || "N/A"}
                        </span>
                      </div>
                    </td>

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
