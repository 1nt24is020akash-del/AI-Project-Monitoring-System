import { useEffect, useState } from "react"
import { BarChart3, Brain, CheckCircle2, Cpu, Database, HelpCircle, Layers, ShieldCheck } from "lucide-react"
import { getModelEvaluation } from "../../services/api"
import type { ModelEvaluation } from "../../types/api"

export default function ModelInsights() {
  const [modelEval, setModelEval] = useState<ModelEvaluation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getModelEvaluation()
      .then((res) => {
        setModelEval(res)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Model & Data Insights</h1>
        <p className="mt-1 text-sm text-slate-500">
          Empirical evaluation of AI/ML predictive performance, statistical baselines, CUF variable comparison, and explainability.
        </p>
      </div>

      {/* High-Level Framework Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Model</p>
          <p className="mt-2 text-xl font-bold text-slate-900">Random Forest Ensemble</p>
          <p className="mt-1 text-xs text-slate-500">Non-linear decision tree architecture</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Statistical Baseline</p>
          <p className="mt-2 text-xl font-bold text-slate-900">Logistic Regression</p>
          <p className="mt-1 text-xs text-slate-500">Linear probability benchmark</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accuracy Gain</p>
          <p className="mt-2 text-xl font-bold text-emerald-600">
            +{modelEval?.cost_overrun_model?.enhanced_gain_pct || 2.93}%
          </p>
          <p className="mt-1 text-xs text-slate-500">AI/ML gain over conventional baseline</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluation Cohort</p>
          <p className="mt-2 text-xl font-bold text-blue-600">
            {modelEval?.dataset_cohort_size || 1775} Projects
          </p>
          <p className="mt-1 text-xs text-slate-500">Official MoSPI holdout split</p>
        </div>
      </div>

      {/* SIH Question (b) Detailed Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            SIH Dimension (b): Conventional Statistical Methods vs. AI / Machine Learning
          </h2>
          <p className="text-xs text-slate-500">
            Direct quantitative evaluation answering whether AI/ML provides significant gains over conventional statistical approaches.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="px-4 py-3">Task & Architecture</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Precision</th>
                <th className="px-4 py-3">Recall (High Risk)</th>
                <th className="px-4 py-3">F1 Score</th>
                <th className="px-4 py-3">ROC-AUC</th>
                <th className="px-4 py-3">Brier Calibration</th>
              </tr>
            </thead>
            <tbody>
              {/* Cost Model */}
              <tr className="border-b border-slate-100 bg-blue-50/30">
                <td className="px-4 py-3 font-bold text-blue-900">
                  Cost Overrun: Random Forest (AI/ML)
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">
                  {modelEval?.cost_overrun_model?.ai_ml_random_forest?.accuracy}%
                </td>
                <td className="px-4 py-3">{modelEval?.cost_overrun_model?.ai_ml_random_forest?.precision}%</td>
                <td className="px-4 py-3 font-bold text-emerald-700">
                  {modelEval?.cost_overrun_model?.ai_ml_random_forest?.recall}%
                </td>
                <td className="px-4 py-3">{modelEval?.cost_overrun_model?.ai_ml_random_forest?.f1_score}%</td>
                <td className="px-4 py-3 font-bold text-blue-700">
                  {modelEval?.cost_overrun_model?.ai_ml_random_forest?.roc_auc}
                </td>
                <td className="px-4 py-3">{modelEval?.cost_overrun_model?.ai_ml_random_forest?.brier_score}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-600">
                  Cost Overrun: Logistic Regression (Baseline)
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {modelEval?.cost_overrun_model?.statistical_baseline_logistic?.accuracy}%
                </td>
                <td className="px-4 py-3">{modelEval?.cost_overrun_model?.statistical_baseline_logistic?.precision}%</td>
                <td className="px-4 py-3 text-slate-600">
                  {modelEval?.cost_overrun_model?.statistical_baseline_logistic?.recall}%
                </td>
                <td className="px-4 py-3">{modelEval?.cost_overrun_model?.statistical_baseline_logistic?.f1_score}%</td>
                <td className="px-4 py-3 text-slate-600">
                  {modelEval?.cost_overrun_model?.statistical_baseline_logistic?.roc_auc}
                </td>
                <td className="px-4 py-3">{modelEval?.cost_overrun_model?.statistical_baseline_logistic?.brier_score}</td>
              </tr>

              {/* Schedule Model */}
              <tr className="border-b border-slate-100 bg-indigo-50/30">
                <td className="px-4 py-3 font-bold text-indigo-900">
                  Schedule Delay: Random Forest (AI/ML)
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">
                  {modelEval?.schedule_slippage_model?.ai_ml_random_forest?.accuracy}%
                </td>
                <td className="px-4 py-3">{modelEval?.schedule_slippage_model?.ai_ml_random_forest?.precision}%</td>
                <td className="px-4 py-3 font-bold text-emerald-700">
                  {modelEval?.schedule_slippage_model?.ai_ml_random_forest?.recall}%
                </td>
                <td className="px-4 py-3">{modelEval?.schedule_slippage_model?.ai_ml_random_forest?.f1_score}%</td>
                <td className="px-4 py-3 font-bold text-indigo-700">
                  {modelEval?.schedule_slippage_model?.ai_ml_random_forest?.roc_auc}
                </td>
                <td className="px-4 py-3">{modelEval?.schedule_slippage_model?.ai_ml_random_forest?.brier_score}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-600">
                  Schedule Delay: Logistic Regression (Baseline)
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {modelEval?.schedule_slippage_model?.statistical_baseline_logistic?.accuracy}%
                </td>
                <td className="px-4 py-3">{modelEval?.schedule_slippage_model?.statistical_baseline_logistic?.precision}%</td>
                <td className="px-4 py-3 text-slate-600">
                  {modelEval?.schedule_slippage_model?.statistical_baseline_logistic?.recall}%
                </td>
                <td className="px-4 py-3">{modelEval?.schedule_slippage_model?.statistical_baseline_logistic?.f1_score}%</td>
                <td className="px-4 py-3 text-slate-600">
                  {modelEval?.schedule_slippage_model?.statistical_baseline_logistic?.roc_auc}
                </td>
                <td className="px-4 py-3">{modelEval?.schedule_slippage_model?.statistical_baseline_logistic?.brier_score}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
          <strong>Evaluation Finding:</strong> {modelEval?.cost_overrun_model?.recommendation}
        </div>
      </div>

      {/* SIH Dimension (c): CUF vs Enhanced Features & Feature Importance */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* CUF vs Enhanced */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              SIH Dimension (c): CUF vs. Enhanced Variables
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Assessment of prediction performance attributable to existing Common Upload Form (CUF) fields vs. derived features.
            </p>

            <div className="mt-5 space-y-4 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">CUF-Only Model (Sanction, Expenditure, Progress)</span>
                  <span className="text-slate-900 font-bold">
                    {modelEval?.cuf_vs_enhanced_comparison?.cuf_features_only_accuracy}% Accuracy
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400"
                    style={{ width: `${modelEval?.cuf_vs_enhanced_comparison?.cuf_features_only_accuracy}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-blue-900 font-bold">Enhanced Model (+ Divergence Index & Project Age)</span>
                  <span className="text-blue-700 font-extrabold">
                    {modelEval?.cuf_vs_enhanced_comparison?.enhanced_features_accuracy}% Accuracy
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${modelEval?.cuf_vs_enhanced_comparison?.enhanced_features_accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <strong>Conclusion:</strong> {modelEval?.cuf_vs_enhanced_comparison?.conclusion}
          </div>
        </div>

        {/* Feature Importance Rankings */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Feature Attribution & Importance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gini impurity importance weights in the Random Forest ensemble model.
          </p>

          <div className="mt-4 space-y-3">
            {modelEval?.feature_importance_ranking?.map((f, idx) => (
              <div key={f.feature} className="text-xs">
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>
                    {idx + 1}. {f.feature.replace(/_/g, " ")}
                  </span>
                  <span className="font-bold text-slate-900">{(f.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${Math.min(100, f.importance * 250)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}