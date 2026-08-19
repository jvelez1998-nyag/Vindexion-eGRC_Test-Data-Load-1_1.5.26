import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, AlertTriangle, TrendingUp, Shield, Target, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ProactiveSuggestions({ knowledgeData, userEmail }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail && knowledgeData.risks.length > 0) {
      generateSuggestions();
    }
  }, [userEmail, knowledgeData.risks.length]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const context = {
        risks: {
          total: knowledgeData.risks.length,
          critical: knowledgeData.risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length,
          without_mitigation: knowledgeData.risks.filter(r => !r.mitigation_plan).length,
          overdue: knowledgeData.risks.filter(r => r.due_date && new Date(r.due_date) < new Date()).length
        },
        incidents: {
          total: knowledgeData.incidents.length,
          open: knowledgeData.incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length,
          critical: knowledgeData.incidents.filter(i => i.severity === 'critical').length,
          unassigned: knowledgeData.incidents.filter(i => !i.assigned_to).length
        },
        controls: {
          total: knowledgeData.controls.length,
          effective: knowledgeData.controls.filter(c => c.status === 'effective').length,
          ineffective: knowledgeData.controls.filter(c => c.status === 'ineffective').length,
          needs_testing: knowledgeData.controls.filter(c => !c.last_tested_date || 
            (new Date() - new Date(c.last_tested_date)) / (1000 * 60 * 60 * 24) > 90).length
        },
        compliance: {
          total: knowledgeData.compliance.length,
          compliant: knowledgeData.compliance.filter(c => ['implemented', 'verified'].includes(c.status)).length,
          non_compliant: knowledgeData.compliance.filter(c => c.status === 'non_compliant').length,
          not_started: knowledgeData.compliance.filter(c => c.status === 'not_started').length
        },
        assessments: {
          total: knowledgeData.assessments.length,
          pending_review: knowledgeData.assessments.filter(a => a.lifecycle_status === 'pending_review').length
        },
        audits: {
          total: knowledgeData.audits.length,
          in_progress: knowledgeData.audits.filter(a => a.status === 'in_progress').length
        },
        vendors: {
          total: knowledgeData.vendors.length,
          critical: knowledgeData.vendors.filter(v => v.criticality === 'critical').length,
          high_risk: knowledgeData.vendors.filter(v => v.risk_score > 70).length
        }
      };

      const prompt = `As an AI GRC advisor, analyze the current state of the organization's GRC program and provide proactive, actionable insights based on patterns, gaps, and opportunities.

CURRENT STATE:
${JSON.stringify(context, null, 2)}

Provide intelligent suggestions in these categories:
1. URGENT ACTIONS - Critical items requiring immediate attention
2. OPTIMIZATION OPPORTUNITIES - Ways to improve efficiency and effectiveness
3. RISK INSIGHTS - Emerging patterns or concerns
4. COMPLIANCE GAPS - Areas needing attention
5. BEST PRACTICE RECOMMENDATIONS - Strategic improvements

For each suggestion:
- Be specific and actionable
- Include clear rationale
- Estimate priority and impact
- Suggest concrete next steps

Return JSON:
{
  "summary": "Overall assessment of GRC posture",
  "urgent_actions": [
    {
      "title": "action title",
      "description": "detailed description",
      "priority": "critical|high|medium",
      "module": "risks|incidents|controls|compliance",
      "impact": "expected impact",
      "next_steps": ["step 1", "step 2"]
    }
  ],
  "optimization_opportunities": [...same structure],
  "risk_insights": [...same structure],
  "compliance_gaps": [...same structure],
  "best_practices": [...same structure]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            urgent_actions: { type: "array" },
            optimization_opportunities: { type: "array" },
            risk_insights: { type: "array" },
            compliance_gaps: { type: "array" },
            best_practices: { type: "array" }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      urgent_actions: <AlertTriangle className="h-4 w-4" />,
      optimization_opportunities: <TrendingUp className="h-4 w-4" />,
      risk_insights: <Target className="h-4 w-4" />,
      compliance_gaps: <Shield className="h-4 w-4" />,
      best_practices: <Lightbulb className="h-4 w-4" />
    };
    return icons[category];
  };

  const getCategoryColor = (category) => {
    const colors = {
      urgent_actions: "from-rose-500/20 to-red-500/20 border-rose-500/30",
      optimization_opportunities: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
      risk_insights: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
      compliance_gaps: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      best_practices: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30"
    };
    return colors[category];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      medium: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-12 w-12 text-slate-600 mb-4" />
          <p className="text-slate-500 mb-4">No suggestions generated yet</p>
          <Button onClick={generateSuggestions} className="bg-indigo-600 hover:bg-indigo-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    { key: 'urgent_actions', title: 'Urgent Actions', items: suggestions.urgent_actions || [] },
    { key: 'optimization_opportunities', title: 'Optimization Opportunities', items: suggestions.optimization_opportunities || [] },
    { key: 'risk_insights', title: 'Risk Insights', items: suggestions.risk_insights || [] },
    { key: 'compliance_gaps', title: 'Compliance Gaps', items: suggestions.compliance_gaps || [] },
    { key: 'best_practices', title: 'Best Practice Recommendations', items: suggestions.best_practices || [] }
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed">{suggestions.summary}</p>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button onClick={generateSuggestions} variant="outline" size="sm" className="border-[#2a3548]">
          <Sparkles className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {/* Suggestion Categories */}
      {categories.map(category => (
        category.items.length > 0 && (
          <Card key={category.key} className={`bg-gradient-to-br ${getCategoryColor(category.key)} border`}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {getCategoryIcon(category.key)}
                {category.title}
                <Badge className="ml-auto bg-white/10">{category.items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.items.map((item, idx) => (
                <div key={idx} className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      {item.priority && (
                        <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                      )}
                      {item.module && (
                        <Badge variant="outline" className="text-xs border-[#2a3548]">
                          {item.module}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                  {item.impact && (
                    <p className="text-xs text-emerald-400 mb-3">
                      💡 Impact: {item.impact}
                    </p>
                  )}
                  {item.next_steps && item.next_steps.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Next Steps:</p>
                      <ul className="space-y-1">
                        {item.next_steps.map((step, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">→</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
}