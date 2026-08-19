import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Copy, FileText } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const entityPrompts = {
  risk: (data) => `Generate a comprehensive executive summary for this risk:

RISK DATA:
Title: ${data.title}
Category: ${data.category}
Status: ${data.status}
Likelihood: ${data.likelihood}/5
Impact: ${data.impact}/5
Risk Score: ${(data.likelihood || 0) * (data.impact || 0)}
Owner: ${data.owner || 'Not assigned'}
Description: ${data.description || 'N/A'}
Mitigation Plan: ${data.mitigation_plan || 'N/A'}

Provide:
1. Executive Summary (2-3 sentences)
2. Risk Assessment (analyze likelihood and impact)
3. Current Risk Posture
4. Key Concerns
5. Recommended Actions (prioritized)
6. Mitigation Timeline

Format in clear, professional markdown.`,

  control: (data) => `Generate a comprehensive executive summary for this control:

CONTROL DATA:
Name: ${data.name}
Domain: ${data.domain}
Category: ${data.category}
Status: ${data.status}
Effectiveness: ${data.effectiveness || 'N/A'}/5
Owner: ${data.owner || 'Not assigned'}
Review Frequency: ${data.review_frequency || 'N/A'}
Last Tested: ${data.last_tested_date || 'Never'}
Description: ${data.description || 'N/A'}
Procedures: ${data.control_procedures || 'N/A'}

Provide:
1. Executive Summary
2. Control Effectiveness Assessment
3. Strengths and Weaknesses
4. Testing Recommendations
5. Improvement Opportunities

Format in clear, professional markdown.`,

  incident: (data) => `Generate a comprehensive executive summary for this incident:

INCIDENT DATA:
Title: ${data.title}
Type: ${data.incident_type}
Severity: ${data.severity}
Status: ${data.status}
Priority: ${data.priority || 'N/A'}
Occurred: ${data.occurred_date || 'Unknown'}
Detected: ${data.detected_date || 'Unknown'}
Assigned To: ${data.assigned_to || 'Unassigned'}
Affected Systems: ${Array.isArray(data.affected_systems) ? data.affected_systems.join(', ') : 'N/A'}
Description: ${data.description || 'N/A'}
Root Cause: ${data.root_cause || 'Under investigation'}
Impact: ${data.impact_assessment || 'Being assessed'}

Provide:
1. Incident Overview
2. Impact Analysis
3. Root Cause Assessment
4. Current Response Status
5. Lessons Learned
6. Preventive Measures

Format in clear, professional markdown.`,

  compliance: (data) => `Generate a comprehensive executive summary for this compliance requirement:

COMPLIANCE DATA:
Framework: ${data.framework}
Requirement: ${data.requirement}
Requirement ID: ${data.requirement_id || 'N/A'}
Status: ${data.status}
Owner: ${data.owner || 'Not assigned'}
Due Date: ${data.due_date || 'Not set'}
Description: ${data.description || 'N/A'}

Provide:
1. Requirement Overview
2. Compliance Status Assessment
3. Implementation Progress
4. Gaps and Risks
5. Next Steps
6. Timeline and Milestones

Format in clear, professional markdown.`,

  finding: (data) => `Generate a comprehensive executive summary for this audit finding:

FINDING DATA:
Title: ${data.title}
Severity: ${data.severity}
Category: ${data.category}
Status: ${data.status}
Responsible Party: ${data.responsible_party || 'Not assigned'}
Target Date: ${data.target_date || 'Not set'}
Description: ${data.description || 'N/A'}
Criteria: ${data.criteria || 'N/A'}
Condition: ${data.condition || 'N/A'}
Cause: ${data.cause || 'N/A'}
Effect: ${data.effect || 'N/A'}
Recommendation: ${data.recommendation || 'N/A'}
Management Response: ${data.management_response || 'Pending'}

Provide:
1. Finding Overview
2. Root Cause Analysis
3. Business Impact
4. Risk Assessment
5. Remediation Plan Evaluation
6. Recommendations for Management

Format in clear, professional markdown.`
};

export default function EntitySummaryDialog({ open, onOpenChange, entity, entityType, contextData }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const generateSummary = async () => {
    if (!entity) return;
    
    setLoading(true);
    try {
      const promptGenerator = entityPrompts[entityType];
      if (!promptGenerator) {
        toast.error("Unsupported entity type");
        return;
      }

      const prompt = promptGenerator(entity);

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setSummary(response);
      toast.success("Summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied");
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setSummary("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            AI Executive Summary
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6">
          {!summary ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Generate an AI-powered executive summary for this {entityType}</p>
              <Button 
                onClick={generateSummary} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                {loading ? "Generating..." : "Generate Summary"}
              </Button>
            </div>
          ) : (
            <div className="pb-6">
              <div className="bg-[#151d2e] border border-[#2a3548] rounded-xl p-6">
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none text-slate-300"
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 text-slate-400 italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-6 pt-0 border-t border-[#2a3548] flex justify-between">
          <Button 
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300"
          >
            Close
          </Button>
          {summary && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={copySummary}
                className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                onClick={generateSummary}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}