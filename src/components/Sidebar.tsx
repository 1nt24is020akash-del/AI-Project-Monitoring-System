import {
  BarChart3,
  Bot,
  Brain,
  ClipboardList,
  Database,
  FileText,
  Gauge,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Project Monitoring",
    icon: ClipboardList,
    path: "/project-monitoring",
  },
  {
    label: "Predictive Risk Analysis",
    icon: Brain,
    path: "/predictive-risk",
  },
  {
    label: "Risk Prioritisation",
    icon: ShieldAlert,
    path: "/risk-prioritisation",
  },
  {
    label: "Model & Data Insights",
    icon: BarChart3,
    path: "/model-insights",
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/reports",
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openAlertCenter, openDataQuality, openAssistant, activeAlertsCount } = useApp()

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#0b1f3a] text-white">
      {/* Branding */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-md">
            <Gauge size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wide">PAIMANA</h1>
            <p className="text-[11px] text-blue-300 font-medium">Predictive Risk Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Main Navigation
          </p>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Specialized Intelligence Tools */}
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Intelligence Modules
          </p>

          <div className="space-y-1">
            <button
              onClick={openAlertCenter}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={16} className="text-red-400" />
                <span>Early Warnings</span>
              </div>
              {activeAlertsCount > 0 && (
                <span className="rounded-full bg-red-500/30 px-1.5 py-0.2 text-[9px] font-bold text-red-300">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={openDataQuality}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <Database size={16} className="text-emerald-400" />
              <span>Data Quality Audit</span>
            </button>

            <button
              onClick={openAssistant}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <Bot size={16} className="text-blue-400" />
              <span>AI Project Assistant</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer Authority */}
      <div className="border-t border-white/10 p-3">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs font-semibold text-white">MoSPI · IPMD</p>
          <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
            Central Sector Projects (₹150+ Cr)
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>API Connected (Live)</span>
          </div>
        </div>
      </div>
    </aside>
  )
}