import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, FileText, Download, Copy, Loader2, Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIReportingEngine({ data }) {
  const [reportType, setReportType] = useState('executive');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [loading, setLoading] = useState(false);

  const reportTemplates = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for C-suite and board',
      prompt: 'Create a comprehensive executive summary report'
    },
    {
      id: 'risk-analysis',
      name: 'Risk Analysis Report',
      description: 'In-depth risk assessment and trends',
      prompt: 'Provide detailed risk analysis with recommendations'
    },
    {
      id: 'compliance-status',
      name: 'Compliance Status Report',
      description: 'Framework compliance and gap analysis',
      prompt: 'Generate compliance status report with gap analysis'
    },
    {
      id: 'control-assessment',
      name: 'Control Assessment Report',
      description: 'Control effectiveness and testing results',
      prompt: 'Assess control effectiveness with testing outcomes'
    },
    {
      id: 'audit-summary',
      name: 'Audit Summary Report',
      description: 'Audit findings and remediation tracking',
      prompt: 'Summarize audit findings with remediation status'
    },
    {
      id: 'vendor-risk',
      name: 'Vendor Risk Report',
      description: 'Third-party risk assessment',
      prompt: 'Analyze vendor risk landscape and recommendations'
    },
    {
      id: 'incident-analysis',
      name: 'Incident Analysis Report',
      description: 'Security incident trends and root causes',
      prompt: 'Analyze security incidents and trends'
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Define your own report requirements',
      prompt: ''
    }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const template = reportTemplates.find(t => t.id === reportType);
      const prompt = reportType === 'custom' ? customPrompt : template.prompt;

      const contextData = JSON.stringify({
        risks: data.risks.slice(0, 50),
        compliance: data.compliance.slice(0, 50),
        controls: data.controls.slice(0, 50),
        audits: data.audits.slice(0, 20),
        incidents: data.incidents.slice(0, 20),
        vendors: data.vendors.slice(0, 30)
      }, null, 2);

      const fullPrompt = `You are an expert GRC analyst. Generate a professional ${template?.name || 'report'}.

${prompt}

**Context Data:**
${contextData}

**Instructions:**
- Provide a well-structured, professional report
- Include key findings, trends, and actionable recommendations
- Use markdown formatting for better readability
- Include executive summary, detailed analysis, and next steps
- Highlight critical issues and positive trends
- Be specific with data points and percentages`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: false
      });

      setGeneratedReport(response);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReport);
    toast.success('Report copied to clipboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-400" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {reportTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id} className="text-white">
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reportType === 'custom' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Custom Requirements</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you want in your report..."
                className="bg-[#151d2e] border-[#2a3548] text-white min-h-[120px]"
              />
            </div>
          )}

          <div className="space-y-2 pt-4">
            <h4 className="text-sm font-medium text-white">Data Sources</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Risks</span>
                <Badge className="bg-rose-500/10 text-rose-400">{data.risks.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Compliance</span>
                <Badge className="bg-emerald-500/10 text-emerald-400">{data.compliance.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Controls</span>
                <Badge className="bg-blue-500/10 text-blue-400">{data.controls.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Audits</span>
                <Badge className="bg-purple-500/10 text-purple-400">{data.audits.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Incidents</span>
                <Badge className="bg-amber-500/10 text-amber-400">{data.incidents.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Vendors</span>
                <Badge className="bg-cyan-500/10 text-cyan-400">{data.vendors.length}</Badge>
              </div>
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={loading || (reportType === 'custom' && !customPrompt)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Generated Report
            </CardTitle>
            {generatedReport && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-[#2a3548]">
                  <Copy className="h-3 w-3 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="border-[#2a3548]">
                  <Download className="h-3 w-3 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px]">
            {!generatedReport ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Brain className="h-16 w-16 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Reporting</h3>
                <p className="text-slate-400 max-w-md">
                  Select a report type and click generate to create a comprehensive, 
                  AI-analyzed report based on your GRC data.
                </p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-300">{children}</li>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 text-slate-400 italic">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, children }) => inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-[#151d2e] text-indigo-400 text-sm">{children}</code>
                    ) : (
                      <code className="block p-4 rounded-lg bg-[#151d2e] text-slate-300 text-sm overflow-x-auto my-3">{children}</code>
                    )
                  }}
                >
                  {generatedReport}
                </ReactMarkdown>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}