import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Brain, Loader2, AlertTriangle, Target, Lightbulb, TrendingUp, Copy } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIIncidentAnalyzer({ open, onOpenChange, incident, onApplySuggestions }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeIncident = async () => {
    if (!incident) return;

    setAnalyzing(true);
    try {
      const prompt = `You are an expert GRC incident analyst. Analyze this incident comprehensively and provide actionable insights.

INCIDENT DETAILS:
Title: ${incident.title}
Type: ${incident.incident_type}
Severity: ${incident.severity}
Status: ${incident.status}
Priority: ${incident.priority || 'Not set'}
Description: ${incident.description || 'No description provided'}
Occurred: ${incident.occurred_date || 'Unknown'}
Detected: ${incident.detected_date || 'Unknown'}
Affected Systems: ${incident.affected_systems?.join(', ') || 'Not specified'}
Affected Data: ${incident.affected_data || 'Not specified'}
Root Cause: ${incident.root_cause || 'Under investigation'}
Impact Assessment: ${incident.impact_assessment || 'Pending'}
Containment Actions: ${incident.containment_actions || 'None taken'}
Remediation Actions: ${incident.remediation_actions || 'None taken'}
Regulatory Reportable: ${incident.regulatory_reportable ? 'Yes' : 'No'}

ANALYSIS REQUIREMENTS:

1. **Incident Categorization & Classification**
   - Validate the incident type and severity
   - Suggest any reclassification if needed
   - Identify primary and secondary categories

2. **Root Cause Analysis**
   - Analyze the root cause (if provided) and validate it
   - If not provided or incomplete, suggest likely root causes based on incident type and description
   - Identify contributing factors
   - Map to common incident patterns (human error, technical failure, security gap, process failure)

3. **Impact Analysis**
   - Assess business impact (financial, operational, reputational)
   - Identify affected stakeholders
   - Estimate recovery time and resources needed
   - Regulatory and compliance implications

4. **Remediation Plan**
   - Immediate actions (if not already contained)
   - Short-term remediation steps (1-2 weeks)
   - Long-term preventive measures (1-3 months)
   - Prioritize actions by urgency and impact

5. **Future Impact Prediction**
   - Likelihood of recurrence if not properly remediated
   - Potential escalation scenarios
   - Related vulnerabilities that could be exploited
   - Early warning indicators to monitor

6. **Lessons Learned & Prevention**
   - Key takeaways from this incident
   - Preventive controls to implement
   - Process improvements needed
   - Training or awareness needs

7. **Actionable Recommendations**
   - Specific, prioritized action items
   - Owner suggestions for each action
   - Timeline for each recommendation
   - Success metrics

Format your response in clear, structured markdown. Be specific, actionable, and professional. Use bullet points and numbered lists for clarity.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      // Parse suggestions for auto-apply
      const suggestedCategory = extractField(response, 'incident type', 'type');
      const suggestedSeverity = extractField(response, 'severity', 'severity');
      const suggestedRootCause = extractSection(response, 'root cause analysis');
      const suggestedRemediation = extractSection(response, 'remediation plan');

      setAnalysis({
        fullAnalysis: response,
        suggestions: {
          incident_type: suggestedCategory,
          severity: suggestedSeverity,
          root_cause: suggestedRootCause,
          remediation_actions: suggestedRemediation
        }
      });

      toast.success("Incident analyzed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze incident");
    } finally {
      setAnalyzing(false);
    }
  };

  const extractField = (text, fieldName, type) => {
    // Simple extraction logic - in production, use more sophisticated parsing
    const lines = text.toLowerCase().split('\n');
    for (const line of lines) {
      if (line.includes(fieldName)) {
        if (type === 'type') {
          if (line.includes('security breach') || line.includes('security_breach')) return 'security_breach';
          if (line.includes('data leak') || line.includes('data_leak')) return 'data_leak';
          if (line.includes('system outage') || line.includes('system_outage')) return 'system_outage';
          if (line.includes('policy violation') || line.includes('policy_violation')) return 'policy_violation';
          if (line.includes('compliance breach') || line.includes('compliance_breach')) return 'compliance_breach';
        }
        if (type === 'severity') {
          if (line.includes('critical')) return 'critical';
          if (line.includes('high')) return 'high';
          if (line.includes('medium')) return 'medium';
          if (line.includes('low')) return 'low';
        }
      }
    }
    return null;
  };

  const extractSection = (text, sectionName) => {
    const sections = text.split(/#+\s+/);
    const section = sections.find(s => s.toLowerCase().includes(sectionName));
    if (section) {
      const lines = section.split('\n').slice(1).filter(l => l.trim());
      return lines.join('\n').substring(0, 500); // Limit length
    }
    return null;
  };

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis.fullAnalysis);
      toast.success("Analysis copied to clipboard");
    }
  };

  const applySuggestions = () => {
    if (analysis?.suggestions && onApplySuggestions) {
      const validSuggestions = {};
      if (analysis.suggestions.incident_type) validSuggestions.incident_type = analysis.suggestions.incident_type;
      if (analysis.suggestions.severity) validSuggestions.severity = analysis.suggestions.severity;
      if (analysis.suggestions.root_cause) validSuggestions.root_cause = analysis.suggestions.root_cause;
      if (analysis.suggestions.remediation_actions) validSuggestions.remediation_actions = analysis.suggestions.remediation_actions;

      if (Object.keys(validSuggestions).length > 0) {
        onApplySuggestions(validSuggestions);
        toast.success("AI suggestions applied to incident");
        onOpenChange(false);
      }
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setAnalysis(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-4 border-b border-[#2a3548]">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Incident Analysis
          </DialogTitle>
          <p className="text-sm text-slate-400 mt-1">
            Automated categorization, root cause identification, and impact prediction
          </p>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6">
          {!analysis ? (
            <div className="text-center py-16">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 inline-block mb-6">
                <Brain className="h-16 w-16 text-purple-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                AI will analyze this incident to identify root causes, predict impact, and suggest remediation steps
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
                <Card className="bg-[#151d2e] border-[#2a3548] p-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 mb-2" />
                  <p className="text-xs text-slate-400">Categorization</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-3">
                  <Target className="h-5 w-5 text-amber-400 mb-2" />
                  <p className="text-xs text-slate-400">Root Cause</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-3">
                  <Lightbulb className="h-5 w-5 text-blue-400 mb-2" />
                  <p className="text-xs text-slate-400">Remediation</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-3">
                  <TrendingUp className="h-5 w-5 text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">Impact Prediction</p>
                </Card>
              </div>

              <Button 
                onClick={analyzeIncident} 
                disabled={analyzing}
                className="bg-purple-600 hover:bg-purple-700 gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="pb-6 space-y-6">
              {/* Quick Suggestions Card */}
              {analysis.suggestions && Object.values(analysis.suggestions).some(v => v) && (
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-400" />
                      AI Suggestions
                    </h3>
                    <Button 
                      onClick={applySuggestions} 
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 h-7 text-xs"
                    >
                      Apply to Incident
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {analysis.suggestions.incident_type && (
                      <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
                        <p className="text-[10px] text-slate-500 mb-1">Suggested Type</p>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                          {analysis.suggestions.incident_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    )}
                    {analysis.suggestions.severity && (
                      <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
                        <p className="text-[10px] text-slate-500 mb-1">Suggested Severity</p>
                        <Badge className={`text-xs ${
                          analysis.suggestions.severity === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          analysis.suggestions.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          analysis.suggestions.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {analysis.suggestions.severity}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Full Analysis */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Detailed Analysis</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="border-[#2a3548] hover:bg-[#2a3548] h-7 text-xs gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none text-slate-300"
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-6 first:mt-0 border-b border-[#2a3548] pb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-5">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed text-sm">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1.5">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1.5">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-purple-500 pl-4 my-4 text-slate-400 italic bg-purple-500/5 py-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    code: ({inline, children}) => inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-[#1a2332] text-purple-400 text-xs">{children}</code>
                    ) : (
                      <code className="block px-3 py-2 rounded bg-[#1a2332] text-slate-300 text-xs my-2">{children}</code>
                    ),
                  }}
                >
                  {analysis.fullAnalysis}
                </ReactMarkdown>
              </Card>
            </div>
          )}
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-[#2a3548] flex justify-between">
          <Button 
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300"
          >
            Close
          </Button>
          {analysis && (
            <Button 
              onClick={analyzeIncident}
              disabled={analyzing}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Re-analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Re-analyze
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}