import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import ProjectDetailModal from "../components/ProjectDetailModal"
import AlertCenterModal from "../components/AlertCenterModal"
import DataQualityModal from "../components/DataQualityModal"
import IntelligenceAssistant from "../components/IntelligenceAssistant"
import { AppProvider, useApp } from "../context/AppContext"

function LayoutInner() {
  const {
    selectedProjectKey,
    closeProjectDetail,
    openProjectDetail,
    isAlertCenterOpen,
    closeAlertCenter,
    isDataQualityOpen,
    closeDataQuality,
    isAssistantOpen,
    closeAssistant,
  } = useApp()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Intelligence Drawers */}
      <ProjectDetailModal
        projectKey={selectedProjectKey}
        onClose={closeProjectDetail}
      />

      <AlertCenterModal
        isOpen={isAlertCenterOpen}
        onClose={closeAlertCenter}
        onSelectProject={openProjectDetail}
      />

      <DataQualityModal
        isOpen={isDataQualityOpen}
        onClose={closeDataQuality}
      />

      <IntelligenceAssistant
        isOpen={isAssistantOpen}
        onClose={closeAssistant}
        onSelectProject={openProjectDetail}
      />
    </div>
  )
}

export default function MainLayout() {
  return (
    <AppProvider>
      <LayoutInner />
    </AppProvider>
  )
}