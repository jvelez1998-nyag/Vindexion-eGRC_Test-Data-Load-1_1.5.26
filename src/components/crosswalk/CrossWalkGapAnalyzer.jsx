import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Sparkles, Loader2, AlertTriangle, CheckCircle2, FileText, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const FRAMEWORKS = [
  'SOX', 'SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA', 'NIST CSF', 
  'COBIT', 'GDPR', 'CCPA', 'DORA', 'EU AI Act', 'FFIEC'
];

export default function CrossWalkGapAnalyzer({ existingControls = [], existingCompliance = [] }) {
  const [sourceFramework, setSourceFramework] = useState('');
  const [targetFramework, setTargetFramework] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeGaps = async () => {
    if (!sourceFramework || !targetFramework) {
      toast.error("Please select both frameworks");
      return;
    }

    setLoading(true);
    try {
      const controlsContext = existingControls.slice(0, 10).map(c => 
        `${c.name} (${c.domain}) - ${c.description?.substring(0, 100)}`
      ).join('\n');

      const complianceContext = existingCompliance.slice(0, 10).map(c =>
        `${c.framework}: ${c.requirement} - ${c.status}`
      ).join('\n');

      const prompt = `You are a compliance gap analysis expert. Perform comprehensive gap analysis:

Source Framework: ${sourceFramework}
Target Framework: ${targetFramework}

Current Controls:
${controlsContext || 'No controls documented'}

Current Compliance Status:
${complianceContext || 'No compliance records'}

Analyze:
1. Coverage gaps (requirements in target not covered by source)
2. Control gaps (controls needed for target framework)
3. Documentation gaps (missing evidence or procedures)
4. Priority gaps (critical gaps to address first)
5. Remediation plan (actions to close gaps)
6. Resource requirements (estimated effort and timeline)

Provide detailed analysis in markdown format.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setAnalysis(response);
      toast.success("Gap analysis complete");
    } catch (error) {
      toast.error("Failed to analyze gaps");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-400" />
            Gap Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Current Framework (Source)</label>
              <Select value={sourceFramework} onValueChange={setSourceFramework}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select current framework" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {FRAMEWORKS.map(fw => (
                    <SelectItem key={fw} value={fw} className="text-white">{fw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Target Framework</label>
              <Select value={targetFramework} onValueChange={setTargetFramework}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select target framework" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {FRAMEWORKS.filter(fw => fw !== sourceFramework).map(fw => (
                    <SelectItem key={fw} value={fw} className="text-white">{fw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={analyzeGaps}
            disabled={!sourceFramework || !targetFramework || loading}
            className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Analyzing...' : 'Analyze Gaps'}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Gap Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="bg-[#151d2e] border border-[#2a3548] rounded-xl p-6">
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none text-slate-300"
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-violet-500 pl-4 my-4 text-slate-400 italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}