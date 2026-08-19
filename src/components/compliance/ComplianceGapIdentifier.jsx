import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Brain, Loader2, Target, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ComplianceGapIdentifier({ compliance, controls }) {
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const frameworks = [...new Set(compliance.map(c => c.framework))];

  const analyzeGaps = async () => {
    setLoading(true);
    try {
      const filteredCompliance = selectedFramework === "all" 
        ? compliance 
        : compliance.filter(c => c.framework === selectedFramework);

      const notStarted = filteredCompliance.filter(c => c.status === 'not_started');
      const nonCompliant = filteredCompliance.filter(c => c.status === 'non_compliant');
      const inProgress = filteredCompliance.filter(c => c.status === 'in_progress');

      const prompt = `Analyze compliance gaps and provide actionable recommendations:

FRAMEWORK: ${selectedFramework === 'all' ? 'All Frameworks' : selectedFramework}

COMPLIANCE STATUS:
- Total Requirements: ${filteredCompliance.length}
- Not Started: ${notStarted.length}
- Non-Compliant: ${nonCompliant.length}
- In Progress: ${inProgress.length}
- Available Controls: ${controls.length}

GAP DETAILS:
${notStarted.slice(0, 5).map(c => `- ${c.requirement} (${c.framework})`).join('\n')}

Provide:
1. **Critical Gaps**: Top 3 most urgent compliance gaps
2. **Impact Assessment**: Business and regulatory impact
3. **Root Causes**: Why these gaps exist
4. **Recommended Actions**: Specific steps to close gaps (prioritized)
5. **Timeline**: Realistic implementation timeline
6. **Resource Requirements**: Team, budget, tools needed

Format in clear markdown with actionable bullet points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAnalysis(response);
      toast.success("Gap analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze gaps");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Compliance Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="flex-1 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Frameworks</SelectItem>
                {frameworks.map(fw => (
                  <SelectItem key={fw} value={fw} className="text-white hover:bg-[#2a3548]">
                    {fw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={analyzeGaps} 
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analyze Gaps
            </Button>
          </div>

          {!analysis && !loading && (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No analysis yet</p>
              <p className="text-sm text-slate-500">Select a framework and click Analyze Gaps</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-indigo-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing compliance gaps...</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-6">
              <ReactMarkdown 
                className="prose prose-sm prose-invert max-w-none"
                components={{
                  h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h3>,
                  p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="text-slate-300">{children}</li>,
                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-amber-500 pl-4 my-4 text-slate-400 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}