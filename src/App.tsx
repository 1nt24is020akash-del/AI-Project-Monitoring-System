import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard/Dashboard"
import ProjectMonitoring from "./pages/ProjectMonitoring/ProjectMonitoring"
import PredictiveRisk from "./pages/PredictiveRisk/PredictiveRisk"
import RiskPrioritisation from "./pages/RiskPrioritisation/RiskPrioritisation"
import ModelInsights from "./pages/ModelInsights/ModelInsights"
import Reports from "./pages/Reports/Reports"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project-monitoring" element={<ProjectMonitoring />} />
          <Route path="/predictive-risk" element={<PredictiveRisk />} />
          <Route
  path="/risk-prioritisation"
  element={<RiskPrioritisation />}
 />
 <Route path="/model-insights" element={<ModelInsights />} />
         <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App