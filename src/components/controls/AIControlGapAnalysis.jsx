import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  FileText
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIControlGapAnalysis({ controls = [] }) {
  const [selectedFrameworks, setSelectedFrameworks] = useState(['mitre', 'nist', 'iso27001']);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const frameworks = [
    { id: 'mitre', name: 'MITRE ATT&CK', description: 'Adversarial tactics and techniques' },
    { id: 'nist', name: 'NIST CSF', description: 'Cybersecurity Framework' },
    { id: 'iso27001', name: 'ISO 27001', description: 'Information security management' },
    { id: 'cis', name: 'CIS Controls', description: 'Critical Security Controls' },
    { id: 'sox', name: 'SOX', description: 'Sarbanes-Oxley compliance' },
    { id: 'pci', name: 'PCI DSS', description: 'Payment card security' },
    { id: 'hipaa', name: 'HIPAA', description: 'Healthcare data protection' },
    { id: 'gdpr', name: 'GDPR', description: 'EU data privacy regulation' }
  ];

  const toggleFramework = (id) => {
    setSelectedFrameworks(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const performGapAnalysisMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);

      const controlsSummary = controls.map(c => ({
        name: c.name || c.control_id,
        category: c.category,
        type: c.control_type,
        status: c.implementation_status,
        effectiveness: c.effectiveness,
        description: c.description?.substring(0, 200)
      }));

      const selectedFrameworkNames = frameworks
        .filter(f => selectedFrameworks.includes(f.id))
        .map(f => f.name)
        .join(', ');

      const prompt = `You are an expert GRC analyst conducting a comprehensive control gap analysis.

CURRENT CONTROL LANDSCAPE:
Total Controls: ${controls.length}
${JSON.stringify(controlsSummary, null, 2)}

FRAMEWORKS FOR COMPARISON:
${selectedFrameworkNames}

TASK:
Perform a detailed gap analysis and provide:

## 1. EXECUTIVE SUMMARY
- Overall maturity assessment
- Key strengths
- Critical gaps identified
- Risk exposure from gaps

## 2. MISSING CONTROLS
Identify specific controls that should exist but are missing, organized by:
- **Critical Missing Controls** (high risk)
- **Important Missing Controls** (medium risk)
- **Recommended Missing Controls** (low risk)

For each missing control:
- Control name and ID (from relevant framework)
- Why it's needed
- What threats/risks it addresses
- Implementation priority (1-5)
- Estimated effort (hours/days)

## 3. UNDER-PERFORMING CONTROLS
List controls that exist but are ineffective or incomplete:
- Control name
- Current status/effectiveness
- What's missing or inadequate
- Improvement recommendations
- Priority

## 4. FRAMEWORK-SPECIFIC GAPS
Break down gaps by each selected framework:
${selectedFrameworkNames.split(', ').map(f => `
### ${f}
- Coverage percentage
- Key missing requirements
- Compliance risk
`).join('\n')}

## 5. MITRE ATT&CK COVERAGE ANALYSIS
- Which tactics/techniques are NOT covered
- Critical attack vectors exposed
- Recommended controls to address MITRE gaps

## 6. PRIORITIZED REMEDIATION ROADMAP
Provide a phased implementation plan:
- **Phase 1 (0-3 months)**: Critical gaps
- **Phase 2 (3-6 months)**: High priority gaps
- **Phase 3 (6-12 months)**: Strategic improvements

## 7. RESOURCE REQUIREMENTS
Estimate:
- Budget needed
- FTE hours required
- Technology/tools needed
- Training requirements

## 8. SPECIFIC RECOMMENDATIONS
For top 10 gaps, provide:
- Detailed implementation guidance
- Best practices
- Common pitfalls to avoid
- Success metrics

Be specific, actionable, and prioritize by risk. Use industry best practices and current threat intelligence.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      return response;
    },
    onSuccess: (data) => {
      setGapAnalysis(data);
      setLoading(false);
      toast.success("Gap analysis complete");
    },
    onError: () => {
      setLoading(false);
      toast.error("Analysis failed");
    }
  });

  const stats = {
    implemented: controls.filter(c => c.implementation_status === 'implemented').length,
    effective: controls.filter(c => c.effectiveness >= 80).length,
    underPerforming: controls.filter(c => c.effectiveness < 60 && c.effectiveness > 0).length,
    notImplemented: controls.filter(c => c.implementation_status === 'planned' || c.implementation_status === 'not_started').length
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            AI Control Gap Analysis
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Compare controls against industry frameworks and identify gaps
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current State */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Current Control State</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">Implemented</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.implemented}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Effective</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.effective}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-slate-400">Under-Performing</span>
                </div>
                <div className="text-2xl font-bold text-amber-400">{stats.underPerforming}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span className="text-xs text-slate-400">Not Implemented</span>
                </div>
                <div className="text-2xl font-bold text-rose-400">{stats.notImplemented}</div>
              </div>
            </div>
          </div>

          {/* Framework Selection */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Select Frameworks for Comparison</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {frameworks.map(framework => (
                <div
                  key={framework.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedFrameworks.includes(framework.id)
                      ? 'bg-indigo-500/10 border-indigo-500/50'
                      : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                  }`}
                  onClick={() => toggleFramework(framework.id)}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      checked={selectedFrameworks.includes(framework.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{framework.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{framework.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={() => performGapAnalysisMutation.mutate()}
            disabled={loading || selectedFrameworks.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Analyzing Control Gaps...</>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> Perform AI Gap Analysis</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {gapAnalysis && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Gap Analysis Results
              </CardTitle>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(gapAnalysis);
                  toast.success("Copied to clipboard");
                }}
                variant="outline"
                size="sm"
                className="border-[#2a3548]"
              >
                <FileText className="h-4 w-4 mr-2" />
                Copy Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3 mt-5 pb-2 border-b border-[#2a3548]">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-6 mb-3 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-6 mb-3 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    code: ({inline, children}) => inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-[#151d2e] text-indigo-400 text-sm">{children}</code>
                    ) : (
                      <code className="block px-3 py-2 rounded bg-[#151d2e] text-slate-300 text-sm my-2">{children}</code>
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-indigo-500 pl-4 my-3 text-slate-400 italic">
                        {children}
                      </blockquote>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto my-4">
                        <table className="w-full border-collapse">{children}</table>
                      </div>
                    ),
                    thead: ({children}) => <thead className="bg-[#151d2e]">{children}</thead>,
                    th: ({children}) => <th className="border border-[#2a3548] px-3 py-2 text-left text-white font-semibold">{children}</th>,
                    td: ({children}) => <td className="border border-[#2a3548] px-3 py-2 text-slate-300">{children}</td>,
                  }}
                >
                  {gapAnalysis}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}