import { Bell, Bot, Database, ShieldAlert, ShieldCheck } from "lucide-react"
import { useApp } from "../context/AppContext"

export default function Header() {
  const { openAlertCenter, openDataQuality, openAssistant, activeAlertsCount } = useApp()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-[#0b1f3a] px-6 text-white">
      {/* Left side */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold tracking-wide">
            PAIMANA Predictive Risk Intelligence
          </h2>
          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
            SIH 2026
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Ministry of Statistics and Programme Implementation (MoSPI) · DIID
        </p>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-3">
        {/* Assistant Button */}
        <button
          onClick={openAssistant}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Bot size={15} />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Data Quality Button */}
        <button
          onClick={openDataQuality}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition"
        >
          <Database size={15} className="text-emerald-400" />
          <span className="hidden md:inline">Data Quality</span>
        </button>

        {/* Alerts Notification Button */}
        <button
          onClick={openAlertCenter}
          title="Early Warning Alert Center"
          className="relative rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          <Bell size={18} />
          {activeAlertsCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {activeAlertsCount > 99 ? "99+" : activeAlertsCount}
            </span>
          )}
        </button>

        {/* Government Authority Badge */}
        <div className="hidden items-center gap-2 border-l border-white/10 pl-3 md:flex">
          <ShieldCheck size={18} className="text-blue-300" />
          <div className="text-left">
            <p className="text-xs font-bold text-white leading-tight">Govt. of India</p>
            <p className="text-[10px] text-slate-400 leading-tight">IPMD / PAIMANA</p>
          </div>
        </div>
      </div>
    </header>
  )
}