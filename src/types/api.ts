export interface Project {
  canonical_project_key: string
  source_project_id: number
  sl_no: number
  project_name: string
  agency: string
  legacy_ocms_code?: string
  pmgid?: string
  ministry: string
  sector: string
  state: string
  approval_date?: string | null
  start_date?: string | null
  original_doc?: string | null
  revised_doc?: string | null
  original_cost_crore: number
  revised_cost_crore: number
  cost_overrun_crore: number
  cost_escalation_pct: number
  cumulative_expenditure_crore: number
  expenditure_ratio?: number | null
  physical_progress_pct: number
  divergence: number
  delay_months?: number | null
  project_age_months: number
  remaining_duration_months?: number | null
  source_file?: string
  source_page?: number
  snapshot_date?: string
  risk_coverage: "FULL" | "PARTIAL"
  attention_score: number
  portfolio_rank: number
  attention_tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4"
  intervention_priority: "PRIORITY_1" | "PRIORITY_2" | "PRIORITY_3" | "PRIORITY_4"
  cost_risk_probability: number
  schedule_risk_probability?: number | null
  compound_exposure?: number | null
  primary_action: string
  secondary_action: string
  risk_focus: string
  priority_reason: string
  evidence_feature: string
  evidence_value: number
  governance_note: string
  explainable_drivers?: {
    cost_drivers: Array<{
      rank: number
      feature: string
      feature_value: number
      impact: number
      direction: string
      source_fact: string
    }>
    schedule_drivers: Array<{
      rank: number
      feature: string
      feature_value: number
      impact: number
      direction: string
      source_fact: string
    }>
  }
}

export interface PortfolioSummary {
  total_projects: number
  delayed_projects: number
  cost_overrun_projects: number
  total_original_cost_crore: number
  total_revised_cost_crore: number
  total_expenditure_crore: number
  total_cost_overrun_crore: number
  portfolio_cost_escalation_pct: number
  portfolio_expenditure_ratio: number
  coverage_breakdown: {
    full_coverage: number
    partial_coverage: number
    full_coverage_pct: number
    partial_coverage_pct: number
  }
  tier_distribution: {
    "Tier 1": number
    "Tier 2": number
    "Tier 3": number
    "Tier 4": number
  }
  intervention_priority_distribution: {
    PRIORITY_1: number
    PRIORITY_2: number
    PRIORITY_3: number
    PRIORITY_4: number
  }
  action_distribution: Record<string, number>
  risk_focus_distribution: Record<string, number>
}

export interface EarlyWarningAlert {
  id: string
  canonical_project_key: string
  project_name: string
  agency: string
  state: string
  sector: string
  alert_type: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO"
  detected_value: string
  reference_value: string
  reason: string
  recommended_action: string
  created_at: string
}

export interface DataQualityReport {
  total_records: number
  valid_records: number
  duplicate_records: number
  overall_completeness_pct: number
  data_health_grade: string
  column_completeness: Record<string, number>
  missing_counts: Record<string, number>
  coverage_breakdown: {
    full_coverage: number
    partial_coverage: number
    full_coverage_pct: number
    partial_coverage_pct: number
  }
  outliers_detected: number
  integrity_rules_passed: number
  integrity_rules_total: number
  source_authority: string
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  roc_auc: number
  brier_score: number
}

export interface ModelEvaluation {
  dataset_cohort_size: number
  test_sample_size: number
  cost_overrun_model: {
    statistical_baseline_logistic: ModelMetrics
    ai_ml_random_forest: ModelMetrics
    enhanced_gain_pct: number
    recommendation: string
  }
  schedule_slippage_model: {
    statistical_baseline_logistic: ModelMetrics
    ai_ml_random_forest: ModelMetrics
    enhanced_gain_pct: number
  }
  cuf_vs_enhanced_comparison: {
    cuf_features_only_accuracy: number
    enhanced_features_accuracy: number
    divergence_feature_gain_pct: number
    conclusion: string
  }
  feature_importance_ranking: Array<{
    feature: string
    importance: number
  }>
}

export interface CostDriverAnalytics {
  sectors: Array<{
    sector: string
    project_count: number
    original_cost_crore: number
    revised_cost_crore: number
    cost_overrun_crore: number
    cost_escalation_pct: number
    delayed_projects: number
    delayed_rate_pct: number
  }>
  ministries: Array<{
    ministry: string
    project_count: number
    original_cost_crore: number
    revised_cost_crore: number
    cost_overrun_crore: number
    cost_escalation_pct: number
  }>
  states: Array<{
    state: string
    project_count: number
    tier1_count: number
    average_attention_score: number
  }>
  project_size_tiers: Array<{
    size_category: string
    project_count: number
    original_cost_crore: number
    cost_overrun_crore: number
    escalation_pct: number
  }>
}
