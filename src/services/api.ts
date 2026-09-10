import type {
  CostDriverAnalytics,
  DataQualityReport,
  EarlyWarningAlert,
  ModelEvaluation,
  PortfolioSummary,
  Project,
} from "../types/api"

import {
  fallbackAlerts,
  fallbackCostDrivers,
  fallbackDataQuality,
  fallbackModelEvaluation,
  fallbackPortfolioSummary,
  fallbackProjects,
} from "../data/fallbackData"
import { monthlyReports } from "../data/paimanaData"

// Dynamically read backend URL from Vercel / Vite environment variables
const rawEnvApi =
  (typeof import.meta !== "undefined" && import.meta.env
    ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)
    : "") || ""

export const API_BASE = rawEnvApi
  ? (rawEnvApi.endsWith("/api/v1") ? rawEnvApi : `${rawEnvApi.replace(/\/+$/, "")}/api/v1`)
  : "http://localhost:8000/api/v1"

let hasLoggedOfflineNotice = false

async function fetchJson<T>(url: string, options?: RequestInit, fallbackValue?: T): Promise<T> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`API error ${res.status}: ${errorText}`)
    }
    return (await res.json()) as T
  } catch (err) {
    if (!hasLoggedOfflineNotice) {
      console.warn(
        `[PAIMANA AI] Backend at ${url} unreachable or mixed content blocked. Using verified MoSPI Flash Report cache. To connect live backend, configure VITE_API_BASE_URL.`,
        err
      )
      hasLoggedOfflineNotice = true
    }
    if (fallbackValue !== undefined) {
      return fallbackValue
    }
    throw err
  }
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  return fetchJson<PortfolioSummary>(
    `${API_BASE}/portfolio/summary`,
    undefined,
    fallbackPortfolioSummary
  )
}

function extractYearNumber(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const s = String(dateStr).trim()
  if (s.includes("/")) {
    const parts = s.split("/")
    const last = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(last) && last > 1950) return last
    const first = parseInt(parts[0], 10)
    if (!isNaN(first) && first > 1950) return first
  } else if (s.length === 4) {
    const y = parseInt(s, 10)
    if (!isNaN(y) && y > 1950) return y
  } else if (s.includes("-")) {
    const parts = s.split("-")
    const y = parseInt(parts[0], 10)
    if (!isNaN(y) && y > 1950) return y
  }
  return null
}

function extractDateSortScore(dateStr?: string | null): number {
  if (!dateStr) return 0
  const s = String(dateStr).trim()
  if (s.includes("1900")) return 0
  if (s.includes("/")) {
    const parts = s.split("/")
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 1
      const y = parseInt(parts[1], 10) || 0
      return y * 100 + m
    }
  } else if (s.length === 4) {
    const y = parseInt(s, 10) || 0
    return y * 100 + 1
  }
  return 0
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
  year?: string | number
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

  // Filter fallback projects if needed
  const page = params?.page || 1
  const pageSize = params?.page_size || 10
  let filtered = [...fallbackProjects]

  if (params?.search) {
    const s = params.search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.project_name?.toLowerCase().includes(s) ||
        p.agency?.toLowerCase().includes(s) ||
        p.sector?.toLowerCase().includes(s)
    )
  }
  if (params?.sector) {
    filtered = filtered.filter((p) => p.sector === params.sector)
  }
  if (params?.tier) {
    filtered = filtered.filter((p) => p.attention_tier === params.tier)
  }
  if (params?.coverage) {
    filtered = filtered.filter((p) => p.risk_coverage === params.coverage)
  }
  if (params?.year) {
    const yStr = String(params.year).trim().toLowerCase()
    if (yStr === "pre-2018" || yStr === "pre_2018" || yStr === "pre2018") {
      filtered = filtered.filter((p) => {
        const y = extractYearNumber(p.approval_date)
        return y !== null && y < 2018
      })
    } else {
      const yNum = parseInt(yStr, 10)
      if (!isNaN(yNum)) {
        filtered = filtered.filter((p) => extractYearNumber(p.approval_date) === yNum)
      }
    }
  }

  // Sorting
  const sortBy = params?.sort_by || "portfolio_rank"
  const order = params?.order || "asc"
  const isDesc = order.toLowerCase() === "desc"

  if (sortBy === "approval_year" || sortBy === "approval_date" || sortBy === "year" || sortBy === "sanction_year") {
    const withDate = filtered.filter((p) => extractDateSortScore(p.approval_date) > 0)
    const withoutDate = filtered.filter((p) => extractDateSortScore(p.approval_date) === 0)
    withDate.sort((a, b) => {
      const sa = extractDateSortScore(a.approval_date)
      const sb = extractDateSortScore(b.approval_date)
      return isDesc ? sb - sa : sa - sb
    })
    filtered = [...withDate, ...withoutDate]
  } else if (sortBy === "completion_year" || sortBy === "target_year" || sortBy === "doc") {
    const withDate = filtered.filter((p) => extractDateSortScore(p.revised_doc || p.original_doc) > 0)
    const withoutDate = filtered.filter((p) => extractDateSortScore(p.revised_doc || p.original_doc) === 0)
    withDate.sort((a, b) => {
      const sa = extractDateSortScore(a.revised_doc || a.original_doc)
      const sb = extractDateSortScore(b.revised_doc || b.original_doc)
      return isDesc ? sb - sa : sa - sb
    })
    filtered = [...withDate, ...withoutDate]
  } else if (sortBy === "cost" || sortBy === "revised_cost_crore") {
    filtered.sort((a, b) =>
      isDesc
        ? (b.revised_cost_crore || 0) - (a.revised_cost_crore || 0)
        : (a.revised_cost_crore || 0) - (b.revised_cost_crore || 0)
    )
  } else if (sortBy === "progress" || sortBy === "physical_progress_pct") {
    filtered.sort((a, b) =>
      isDesc
        ? (b.physical_progress_pct || 0) - (a.physical_progress_pct || 0)
        : (a.physical_progress_pct || 0) - (b.physical_progress_pct || 0)
    )
  } else if (sortBy === "delay" || sortBy === "delay_months") {
    filtered.sort((a, b) =>
      isDesc
        ? (b.delay_months || 0) - (a.delay_months || 0)
        : (a.delay_months || 0) - (b.delay_months || 0)
    )
  } else {
    filtered.sort((a, b) =>
      isDesc
        ? (b.portfolio_rank || 0) - (a.portfolio_rank || 0)
        : (a.portfolio_rank || 0) - (b.portfolio_rank || 0)
    )
  }

  const fallbackPaged = {
    total_records: fallbackPortfolioSummary.total_projects || 1775,
    page: page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    data: filtered.slice((page - 1) * pageSize, page * pageSize),
  }

  return fetchJson(
    `${API_BASE}/projects?${q.toString()}`,
    undefined,
    fallbackPaged
  )
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

  const limit = params?.limit || 50
  const offset = params?.offset || 0
  let data = [...fallbackProjects]
  if (params?.tier) {
    data = data.filter((p) => p.attention_tier === params.tier)
  }

  const fallbackRanking = {
    total_records: fallbackPortfolioSummary.total_projects || 1775,
    limit,
    offset,
    data: data.slice(offset, offset + limit),
  }

  return fetchJson(
    `${API_BASE}/projects/ranking?${q.toString()}`,
    undefined,
    fallbackRanking
  )
}

export async function getProjectDetail(keyOrId: string): Promise<{
  project: Project
  risk: any
  intervention: any
  drivers: any
}> {
  const matched =
    fallbackProjects.find(
      (p) =>
        p.canonical_project_key === keyOrId ||
        String(p.source_project_id) === String(keyOrId)
    ) || fallbackProjects[0]

  const fallbackDetail = {
    project: matched,
    risk: {
      attention_score: matched.attention_score,
      portfolio_rank: matched.portfolio_rank,
      attention_tier: matched.attention_tier,
      cost_risk_probability: matched.cost_risk_probability,
      schedule_risk_probability: matched.schedule_risk_probability,
      compound_exposure: matched.compound_exposure,
      risk_focus: matched.risk_focus,
    },
    intervention: {
      primary_action: matched.primary_action,
      secondary_action: matched.secondary_action,
      priority_reason: matched.priority_reason,
      intervention_priority: matched.intervention_priority,
      review_cadence:
        matched.attention_tier === "Tier 1"
          ? "Bi-weekly Joint Review"
          : matched.attention_tier === "Tier 2"
          ? "Monthly Empowered Committee"
          : "Quarterly Review",
    },
    drivers: matched.explainable_drivers || {
      cost_drivers: [
        {
          rank: 1,
          feature: "expenditure_ratio",
          feature_value: matched.cost_escalation_pct,
          impact: 0.33,
          direction: "HIGH",
          source_fact: `Cost escalation of ${matched.cost_escalation_pct}% recorded against original baseline.`,
        },
      ],
      schedule_drivers: [],
    },
  }

  return fetchJson(
    `${API_BASE}/projects/${encodeURIComponent(keyOrId)}`,
    undefined,
    fallbackDetail
  )
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

  let alerts = [...fallbackAlerts]
  if (params?.severity) {
    alerts = alerts.filter((a) => a.severity === params.severity)
  }
  if (params?.alert_type) {
    alerts = alerts.filter((a) => a.alert_type === params.alert_type)
  }
  if (params?.search) {
    const s = params.search.toLowerCase()
    alerts = alerts.filter((a) => a.project_name.toLowerCase().includes(s))
  }

  const fallbackAlertsPayload = {
    total_alerts: 1542,
    limit: params?.limit || 50,
    offset: params?.offset || 0,
    alerts: alerts.slice(0, params?.limit || 50),
  }

  return fetchJson(
    `${API_BASE}/alerts?${q.toString()}`,
    undefined,
    fallbackAlertsPayload
  )
}

export async function getDataQuality(): Promise<DataQualityReport> {
  return fetchJson<DataQualityReport>(
    `${API_BASE}/data-quality`,
    undefined,
    fallbackDataQuality
  )
}

export async function getModelEvaluation(): Promise<ModelEvaluation> {
  return fetchJson<ModelEvaluation>(
    `${API_BASE}/models/evaluation`,
    undefined,
    fallbackModelEvaluation
  )
}

export async function getCostDriverAnalytics(): Promise<CostDriverAnalytics> {
  return fetchJson<CostDriverAnalytics>(
    `${API_BASE}/analytics/cost-drivers`,
    undefined,
    fallbackCostDrivers
  )
}

export async function getMonthlyReports(): Promise<{
  total_reports: number
  reports: Array<any>
}> {
  return fetchJson(
    `${API_BASE}/portfolio/monthly-reports`,
    undefined,
    { total_reports: 4, reports: monthlyReports }
  )
}

export async function queryAssistant(query: string): Promise<{
  query: string
  answer: string
  matched_projects?: Project[]
  matched_sectors?: any[]
  intent: string
}> {
  const qLower = query.toLowerCase()

  let fallbackAnswer = ""
  let intent = "PORTFOLIO_SUMMARY"

  if (qLower.includes("sector") || qLower.includes("highest cost") || qLower.includes("cost overrun")) {
    intent = "SECTOR_COST_ANALYSIS"
    fallbackAnswer = `The sectors with the highest cumulative cost escalation across the central sector are:

1. **Railways**: ₹1,74,265.57 Cr total overrun across 192 projects (+37.14% escalation)
2. **Water Resources**: ₹1,00,622.57 Cr total overrun across 30 projects (+104.29% escalation)
3. **Electricity Generation**: ₹50,221.86 Cr total overrun across 39 projects (+12.90% escalation)
4. **Oil & Gas**: ₹32,523.16 Cr total overrun across 91 projects (+8.97% escalation)
5. **Urban Public Transport**: ₹18,603.68 Cr total overrun across 30 projects (+5.80% escalation)`
  } else if (qLower.includes("delay") || qLower.includes("time") || qLower.includes("schedule")) {
    intent = "SCHEDULE_DELAY_ANALYSIS"
    fallbackAnswer = `Across the 1,775 monitored Central Sector Projects, **1,110 projects (62.54%)** are currently delayed beyond their original commissioning targets.

• **Water Resources**: 90.0% delay rate (27 of 30 projects)
• **Railways**: 52.1% delay rate (100 of 192 projects)
• **Power Generation**: 59.0% delay rate (23 of 39 projects)`
  } else if (qLower.includes("tier 1") || qLower.includes("high risk") || qLower.includes("priorit")) {
    intent = "HIGH_RISK_INSPECTION"
    fallbackAnswer = `There are **180 projects in Tier 1 (High Attention)** requiring immediate Bi-Weekly Joint Secretary review. These projects have an Attention Score ≥ 0.741 and represent the highest compound exposure to budget and schedule failure.`
  } else {
    fallbackAnswer = `**PAIMANA National Portfolio Summary (July 2026 Snapshot):**

• **Total Monitored Projects:** 1,775 projects costing ≥ ₹150 Crore
• **Total Original Sanction:** ₹33,70,138.22 Crore
• **Revised Anticipated Cost:** ₹37,10,641.55 Crore
• **Cumulative Cost Overrun:** ₹3,40,503.33 Crore (+10.10% escalation)
• **Delayed Projects:** 1,110 projects (62.54%)
• **Cumulative Expenditure:** ₹19,26,099.57 Crore (51.91% executed)
• **High Attention Tier 1:** 180 projects under critical surveillance`
  }

  const fallbackResp = {
    query,
    answer: fallbackAnswer,
    matched_projects: fallbackProjects.slice(0, 3),
    intent,
  }

  return fetchJson(
    `${API_BASE}/assistant/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    },
    fallbackResp
  )
}
