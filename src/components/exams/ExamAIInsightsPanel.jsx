import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Target, Activity, BookOpen, Clock } from "lucide-react";

export default function ExamAIInsightsPanel({ exams, userProgress, risks, controls, compliance }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(exams) && exams.length > 0) {
      if (!insights && !loading) {
        generateInsights();
      }
    }
  }, [exams, userProgress, risks, controls, compliance]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validExams = Array.isArray(exams) ? exams : [];
      const validProgress = Array.isArray(userProgress) ? userProgress : [];
      const validRisks = Array.isArray(risks) ? risks : [];
      const validControls = Array.isArray(controls) ? controls : [];
      const validCompliance = Array.isArray(compliance) ? compliance : [];

      // Exam-specific metrics
      const scheduledExams = validExams.filter(e => e?.status === 'scheduled');
      const inProgressExams = validExams.filter(e => e?.status === 'in_preparation' || e?.status === 'in_progress');
      const completedExams = validExams.filter(e => e?.status === 'completed');
      const upcomingExams = validExams.filter(e => {
        if (!e?.exam_date) return false;
        const examDate = new Date(e.exam_date);
        const today = new Date();
        const daysUntil = (examDate - today) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 90;
      });

      // Calculate average readiness
      const examsWithReadiness = validExams.filter(e => e?.readiness_score);
      const avgReadiness = examsWithReadiness.length > 0
        ? Math.round(examsWithReadiness.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / examsWithReadiness.length)
        : 0;

      // Exam types distribution
      const examsByType = {};
      validExams.forEach(e => {
        const type = e?.exam_type || 'unknown';
        examsByType[type] = (examsByType[type] || 0) + 1;
      });

      // Study progress
      const totalProgress = validProgress.length > 0
        ? Math.round(validProgress.reduce((sum, p) => sum + (p?.progress_percentage || 0), 0) / validProgress.length)
        : 0;

      // Workflow stages
      const byWorkflowStage = {};
      validExams.forEach(e => {
        const stage = e?.workflow_stage || 'not_started';
        byWorkflowStage[stage] = (byWorkflowStage[stage] || 0) + 1;
      });

      // GRC readiness for exams
      const criticalRisks = validRisks.filter(r => ((r?.likelihood || 0) * (r?.impact || 0)) >= 16);
      const weakControls = validControls.filter(c => c?.effectiveness < 3 || c?.status === 'ineffective');
      const nonCompliant = validCompliance.filter(c => c?.status === 'non_compliant');

      const context = {
        total_exams: validExams.length,
        scheduled: scheduledExams.length,
        in_progress: inProgressExams.length,
        completed: completedExams.length,
        upcoming_90_days: upcomingExams.length,
        avg_readiness: avgReadiness,
        exams_by_type: examsByType,
        workflow_stages: byWorkflowStage,
        study_progress: totalProgress,
        top_exams: validExams.slice(0, 5).map(e => ({
          title: e?.exam_title,
          type: e?.exam_type,
          status: e?.status,
          exam_date: e?.exam_date,
          readiness_score: e?.readiness_score
        })),
        grc_readiness: {
          critical_risks: criticalRisks.length,
          weak_controls: weakControls.length,
          non_compliant: nonCompliant.length,
          grc_risk_level: (criticalRisks.length > 5 || weakControls.length > 10 || nonCompliant.length > 10) ? 'high' : 
                          (criticalRisks.length > 2 || weakControls.length > 5 || nonCompliant.length > 5) ? 'medium' : 'low'
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a regulatory exam preparation expert, analyze this exam portfolio and provide actionable insights:

EXAM PORTFOLIO SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED EXAM READINESS ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall exam readiness posture (Exam Ready/On Track/At Risk/Critical)
   - Total exams: ${validExams.length} (${scheduledExams.length} scheduled, ${inProgressExams.length} in progress)
   - Average readiness score: ${avgReadiness}%
   - Upcoming exams (90 days): ${upcomingExams.length}
   - Key preparation gaps and priorities
   - Immediate action items

2. EXAM SCHEDULE & STATUS:
   - Upcoming exam breakdown by type and date
   - Workflow stage analysis
   - Preparation timeline adequacy
   - Critical scheduling conflicts or concerns

3. READINESS ASSESSMENT:
   - Average readiness: ${avgReadiness}%
   - Study progress: ${totalProgress}%
   - Knowledge gaps by exam type
   - Preparation adequacy for each scheduled exam
   - Areas requiring intensive focus

4. GRC PREPAREDNESS:
   - Critical risks: ${criticalRisks.length} (exam impact assessment)
   - Weak controls: ${weakControls.length} (remediation needs)
   - Non-compliance: ${nonCompliant.length} (regulatory exposure)
   - Overall GRC risk level: ${context.grc_readiness.grc_risk_level}
   - Exam vulnerability areas

5. STUDY RECOMMENDATIONS:
   - Prioritized study topics by exam type
   - Time allocation recommendations
   - Resource requirements
   - Mock exam preparation status

6. PRIORITY ACTIONS (Top 5):
   - Exam-specific preparation steps
   - Study plan adjustments
   - GRC remediation priorities
   - Timeline-critical actions
   - Deadline expectations

Focus on exam preparation and regulatory readiness. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            readiness_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            exam_schedule: {
              type: "object",
              properties: {
                summary: { type: "string" },
                upcoming_concerns: { type: "array", items: { type: "string" } }
              }
            },
            readiness_assessment: {
              type: "object",
              properties: {
                summary: { type: "string" },
                gaps: { type: "array", items: { type: "string" } }
              }
            },
            grc_preparedness: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            study_recommendations: { type: "string" },
            priority_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  urgency: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            }
          }
        }
      });
      setInsights(result);
    } catch (error) {
      console.error('Error generating exam insights:', error);
      setInsights({
        executive_summary: "Unable to generate exam insights at this time. Please try again.",
        readiness_posture: "Error",
        critical_alerts: ["AI service temporarily unavailable"],
        priority_actions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const postureColors = {
    'exam ready': 'bg-emerald-500/20 text-emerald-400',
    'on track': 'bg-blue-500/20 text-blue-400',
    'at risk': 'bg-amber-500/20 text-amber-400',
    critical: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-base text-white">Exam Readiness Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered exam readiness insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-semibold text-white">Exam Preparation Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    postureColors[insights.readiness_posture?.toLowerCase()] || postureColors['on track']
                  }`}>
                    {insights.readiness_posture}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Exam Alerts
                </p>
                <div className="space-y-1">
                  {insights.critical_alerts.map((alert, i) => (
                    <div key={i} className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      <p className="text-xs text-rose-300">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Exam Schedule */}
              {insights.exam_schedule && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-violet-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-violet-400" /> Schedule
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.exam_schedule.summary}</p>
                </div>
              )}

              {/* Readiness Assessment */}
              {insights.readiness_assessment && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" /> Readiness
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.readiness_assessment.summary}</p>
                </div>
              )}
            </div>

            {/* GRC Preparedness */}
            {insights.grc_preparedness && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-emerald-400" /> GRC Preparedness
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.grc_preparedness.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.grc_preparedness.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Preparation Actions
              </p>
              <div className="space-y-1">
                {insights.priority_actions?.slice(0, 5).map((item, i) => (
                  <div 
                    key={i} 
                    className="p-2 bg-[#151d2e] rounded-lg border border-[#2a3548] flex items-start gap-2 hover:bg-[#1e2a3d] transition-colors"
                  >
                    <Badge className={`text-[10px] flex-shrink-0 ${urgencyColors[item.urgency?.toLowerCase()] || urgencyColors.medium}`}>
                      {item.urgency}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white">{item.action}</p>
                      {item.timeline && <p className="text-[10px] text-violet-400 mt-0.5">{item.timeline}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}