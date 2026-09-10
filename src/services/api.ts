import type {
  CostDriverAnalytics,
  DataQualityReport,
  EarlyWarningAlert,
  ModelEvaluation,
  PortfolioSummary,
  Project,
} from "../types/api"

const API_BASE = "http://localhost:8000/api/v1"

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`API error ${res.status}: ${errorText}`)
  }
  return res.json() as Promise<T>
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  return fetchJson<PortfolioSummary>(`${API_BASE}/portfolio/summary`)
}

export async function getProjects(params?: {
  page?: number
  page_size?: number
  state?: string
  agency?: string
  ministry?: string
  sector?: string
  tier?: string
  coverage?: string
  search?: string
  sort_by?: string
  order?: string
}): Promise<{
  total_records: number
  page: number
  page_size: number
  total_pages: number
  data: Project[]
}> {
  const q = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        q.append(key, String(val))
      }
    })
  }
  return fetchJson(`${API_BASE}/projects?${q.toString()}`)
}

export async function getRanking(params?: {
  limit?: number
  offset?: number
  tier?: string
  coverage?: string
}): Promise<{
  total_records: number
  limit: number
  offset: number
  data: Project[]
}> {
  const q = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        q.append(key, String(val))
      }
    })
  }
  return fetchJson(`${API_BASE}/projects/ranking?${q.toString()}`)
}

export async function getProjectDetail(keyOrId: string): Promise<{
  project: Project
  risk: any
  intervention: any
  drivers: any
}> {
  return fetchJson(`${API_BASE}/projects/${encodeURIComponent(keyOrId)}`)
}

export async function getAlerts(params?: {
  severity?: string
  alert_type?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{
  total_alerts: number
  limit: number
  offset: number
  alerts: EarlyWarningAlert[]
}> {
  const q = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        q.append(key, String(val))
      }
    })
  }
  return fetchJson(`${API_BASE}/alerts?${q.toString()}`)
}

export async function getDataQuality(): Promise<DataQualityReport> {
  return fetchJson<DataQualityReport>(`${API_BASE}/data-quality`)
}

export async function getModelEvaluation(): Promise<ModelEvaluation> {
  return fetchJson<ModelEvaluation>(`${API_BASE}/models/evaluation`)
}

export async function getCostDriverAnalytics(): Promise<CostDriverAnalytics> {
  return fetchJson<CostDriverAnalytics>(`${API_BASE}/analytics/cost-drivers`)
}

export async function getMonthlyReports(): Promise<{
  total_reports: number
  reports: Array<any>
}> {
  return fetchJson(`${API_BASE}/portfolio/monthly-reports`)
}

export async function queryAssistant(query: string): Promise<{
  query: string
  answer: string
  matched_projects?: Project[]
  matched_sectors?: any[]
  intent: string
}> {
  return fetchJson(`${API_BASE}/assistant/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
}
