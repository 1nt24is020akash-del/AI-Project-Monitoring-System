import React, { createContext, useContext, useEffect, useState } from "react"
import { getAlerts } from "../services/api"

interface AppContextType {
  selectedProjectKey: string | null
  openProjectDetail: (key: string) => void
  closeProjectDetail: () => void

  isAlertCenterOpen: boolean
  openAlertCenter: () => void
  closeAlertCenter: () => void

  isDataQualityOpen: boolean
  openDataQuality: () => void
  closeDataQuality: () => void

  isAssistantOpen: boolean
  openAssistant: () => void
  closeAssistant: () => void

  activeAlertsCount: number
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(null)
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false)
  const [isDataQualityOpen, setIsDataQualityOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [activeAlertsCount, setActiveAlertsCount] = useState(0)

  useEffect(() => {
    getAlerts({ severity: "CRITICAL", limit: 1 })
      .then((res) => setActiveAlertsCount(res.total_alerts))
      .catch(() => setActiveAlertsCount(0))
  }, [])

  return (
    <AppContext.Provider
      value={{
        selectedProjectKey,
        openProjectDetail: (key) => setSelectedProjectKey(key),
        closeProjectDetail: () => setSelectedProjectKey(null),

        isAlertCenterOpen,
        openAlertCenter: () => setIsAlertCenterOpen(true),
        closeAlertCenter: () => setIsAlertCenterOpen(false),

        isDataQualityOpen,
        openDataQuality: () => setIsDataQualityOpen(true),
        closeDataQuality: () => setIsDataQualityOpen(false),

        isAssistantOpen,
        openAssistant: () => setIsAssistantOpen(true),
        closeAssistant: () => setIsAssistantOpen(false),

        activeAlertsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
