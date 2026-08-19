import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2, Target } from "lucide-react";
import { toast } from "sonner";

export default function AIPerformanceScorecard({ vendor }) {
  const [generating, setGenerating] = useState(false);
  const [scorecard, setScorecard] = useState(null);

  const { data: metrics = [] } = useQuery({
    queryKey: ['vendor-performance', vendor.id],
    queryFn: () => base44.entities.VendorPerformanceMetric.filter({ vendor_id: vendor.id }, '-metric_date')
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['vendor-kpis', vendor.id],
    queryFn: () => base44.entities.VendorKPI.filter({ vendor_id: vendor.id })
  });

  const { data: slas = [] } = useQuery({
    queryKey: ['vendor-slas', vendor.id],
    queryFn: () => base44.entities.VendorSLA.filter({ vendor_id: vendor.id })
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews', vendor.id],
    queryFn: () => base44.entities.VendorReview.filter({ vendor_id: vendor.id }, '-review_date')
  });

  const generateScorecard = async () => {
    setGenerating(true);
    try {
      const prompt = `You are a vendor performance analyst. Generate a comprehensive performance scorecard for the following vendor:

VENDOR: ${vendor.vendor_name}
TYPE: ${vendor.vendor_type}
CRITICALITY: ${vendor.criticality}

PERFORMANCE METRICS (${metrics.length} total):
${metrics.slice(0, 10).map(m => `- ${m.metric_type}: ${m.metric_value}${m.unit} (Target: ${m.target_value}${m.unit}) - ${m.meets_sla ? '✓' : '✗'}`).join('\n')}

KPIs DEFINED (${kpis.length} total):
${kpis.map(k => `- ${k.kpi_name}: Target ${k.target_value}${k.unit} (Weight: ${k.weight})`).join('\n')}

SLAs DEFINED (${slas.length} total):
${slas.map(s => `- ${s.sla_name}: ${s.target_value}${s.unit} (Breaches: ${s.breach_count || 0})`).join('\n')}

RECENT REVIEWS (${reviews.length} total):
${reviews.slice(0, 3).map(r => `- ${r.overall_rating}/5 stars - Recommendation: ${r.recommendation}`).join('\n')}

Generate a detailed performance scorecard with:
1. Overall Performance Score (0-100)
2. Category Breakdown (with scores for each category)
3. Trend Analysis (improving, stable, declining)
4. Key Strengths (top 3)
5. Critical Issues (if any)
6. Action Items (specific recommendations)
7. Executive Summary (2-3 sentences)

Return as JSON:
{
  "overall_score": number,
  "grade": "A" | "B" | "C" | "D" | "F",
  "trend": "improving" | "stable" | "declining",
  "category_scores": {
    "performance": number,
    "quality": number,
    "reliability": number,
    "value": number,
    "communication": number
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "issues": ["issue1", "issue2"],
  "action_items": ["action1", "action2"],
  "executive_summary": "string",
  "kpi_compliance_rate": number,
  "sla_compliance_rate": number,
  "recommendation": "continue" | "improve" | "review"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            grade: { type: "string" },
            trend: { type: "string" },
            category_scores: { type: "object" },
            strengths: { type: "array", items: { type: "string" } },
            issues: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } },
            executive_summary: { type: "string" },
            kpi_compliance_rate: { type: "number" },
            sla_compliance_rate: { type: "number" },
            recommendation: { type: "string" }
          }
        }
      });

      setScorecard(response);
      toast.success("Performance scorecard generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate scorecard");
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getGradeBadge = (grade) => {
    const colors = {
      'A': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'B': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'C': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'D': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'F': 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };
    return colors[grade] || colors['C'];
  };

  return (
    <Card className="bg-[#151d2e] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Performance Scorecard
          </CardTitle>
          <Button 
            onClick={generateScorecard} 
            disabled={generating}
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!scorecard && !generating && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-4">
              Generate an AI-powered performance scorecard with insights and recommendations
            </p>
          </div>
        )}

        {generating && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-purple-400 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-slate-400">Analyzing performance data...</p>
          </div>
        )}

        {scorecard && (
          <div className="space-y-4">
            {/* Overall Score */}
            <Card className="bg-[#1a2332] border-[#2a3548] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Overall Performance Score</div>
                  <div className={`text-4xl font-bold ${getScoreColor(scorecard.overall_score)}`}>
                    {scorecard.overall_score}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`text-2xl px-4 py-2 ${getGradeBadge(scorecard.grade)}`}>
                    {scorecard.grade}
                  </Badge>
                  <div className="flex items-center gap-1 mt-2 justify-end">
                    {scorecard.trend === 'improving' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : scorecard.trend === 'declining' ? (
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Target className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="text-xs text-slate-400 capitalize">{scorecard.trend}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300">{scorecard.executive_summary}</p>
            </Card>

            {/* Category Scores */}
            <Card className="bg-[#1a2332] border-[#2a3548] p-4">
              <h4 className="font-medium text-white mb-3">Category Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(scorecard.category_scores).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 capitalize">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-[#151d2e] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreColor(score).replace('text-', 'bg-')}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`font-semibold w-8 ${getScoreColor(score)}`}>{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Compliance Rates */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-[#1a2332] border-[#2a3548] p-3">
                <div className="text-xs text-slate-400 mb-1">KPI Compliance</div>
                <div className="text-2xl font-bold text-emerald-400">{scorecard.kpi_compliance_rate}%</div>
              </Card>
              <Card className="bg-[#1a2332] border-[#2a3548] p-3">
                <div className="text-xs text-slate-400 mb-1">SLA Compliance</div>
                <div className="text-2xl font-bold text-blue-400">{scorecard.sla_compliance_rate}%</div>
              </Card>
            </div>

            {/* Strengths */}
            {scorecard.strengths.length > 0 && (
              <Card className="bg-[#1a2332] border-[#2a3548] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h4 className="font-medium text-white">Key Strengths</h4>
                </div>
                <ul className="space-y-1">
                  {scorecard.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Issues */}
            {scorecard.issues.length > 0 && (
              <Card className="bg-rose-500/10 border-rose-500/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <h4 className="font-medium text-rose-400">Critical Issues</h4>
                </div>
                <ul className="space-y-1">
                  {scorecard.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Action Items */}
            {scorecard.action_items.length > 0 && (
              <Card className="bg-[#1a2332] border-[#2a3548] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-indigo-400" />
                  <h4 className="font-medium text-white">Recommended Actions</h4>
                </div>
                <ul className="space-y-1">
                  {scorecard.action_items.map((action, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Recommendation */}
            <Card className={`p-4 ${
              scorecard.recommendation === 'continue' ? 'bg-emerald-500/10 border-emerald-500/30' :
              scorecard.recommendation === 'improve' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="font-medium text-white mb-1">Overall Recommendation</div>
              <p className={`text-sm capitalize ${
                scorecard.recommendation === 'continue' ? 'text-emerald-400' :
                scorecard.recommendation === 'improve' ? 'text-amber-400' :
                'text-orange-400'
              }`}>
                {scorecard.recommendation === 'continue' ? '✓ Continue partnership - performing well' :
                 scorecard.recommendation === 'improve' ? '⚠ Continue with improvements needed' :
                 '⚡ Requires immediate review and action plan'}
              </p>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}