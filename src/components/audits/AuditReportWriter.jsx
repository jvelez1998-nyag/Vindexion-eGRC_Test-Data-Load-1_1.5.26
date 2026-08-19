import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Brain, Loader2, Download, Save } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AuditReportWriter({ audit }) {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState({
    executive_summary: "",
    scope: "",
    methodology: "",
    findings: "",
    recommendations: "",
    conclusion: "",
    appendices: ""
  });

  const generateAIReport = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a comprehensive audit report for the following audit:

Title: ${audit.title}
Type: ${audit.type}
Scope: ${audit.scope}
Status: ${audit.status}
Auditor: ${audit.auditor}
Start Date: ${audit.start_date}
End Date: ${audit.end_date}
Findings Count: ${audit.findings_count}
Critical Findings: ${audit.critical_findings}

Create a professional audit report with the following sections:

1. **Executive Summary**: Brief overview of audit purpose, scope, and key findings
2. **Audit Scope and Objectives**: Detailed scope and what the audit aimed to achieve
3. **Methodology**: How the audit was conducted
4. **Findings**: Detailed findings categorized by severity
5. **Recommendations**: Actionable recommendations for each finding
6. **Conclusion**: Overall assessment and next steps
7. **Appendices**: Supporting information and references

Format the report professionally with proper structure and tone for executive stakeholders.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      // Parse the response into sections
      const sections = response.split(/\n(?=\*\*[A-Z])/);
      setReport({
        executive_summary: sections[0] || "",
        scope: sections[1] || "",
        methodology: sections[2] || "",
        findings: sections[3] || "",
        recommendations: sections[4] || "",
        conclusion: sections[5] || "",
        appendices: sections[6] || ""
      });

      toast.success("Report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const saveReport = async () => {
    try {
      const fullReport = Object.values(report).join('\n\n');
      await base44.entities.Audit.update(audit.id, {
        notes: `${audit.notes || ''}\n\n=== AUDIT REPORT ===\n${fullReport}`
      });
      toast.success("Report saved to audit");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save report");
    }
  };

  const exportReport = () => {
    const fullReport = Object.values(report).join('\n\n');
    const blob = new Blob([fullReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audit.title?.replace(/[^a-z0-9]/gi, '_')}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-400" />
          Audit Report
        </h3>
        <div className="flex gap-2">
          <Button onClick={generateAIReport} disabled={generating} size="sm" className="bg-violet-600 hover:bg-violet-700">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                AI Generate
              </>
            )}
          </Button>
          {Object.values(report).some(v => v) && (
            <>
              <Button onClick={saveReport} size="sm" variant="outline" className="border-[#2a3548]">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={exportReport} size="sm" variant="outline" className="border-[#2a3548]">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <Tabs defaultValue="executive" className="w-full">
          <TabsList className="w-full justify-start border-b border-[#2a3548] bg-transparent rounded-none p-0">
            <TabsTrigger value="executive" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none">
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="scope" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none">
              Scope
            </TabsTrigger>
            <TabsTrigger value="methodology" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none">
              Methodology
            </TabsTrigger>
            <TabsTrigger value="findings" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none">
              Findings
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="conclusion" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none">
              Conclusion
            </TabsTrigger>
          </TabsList>

          {Object.entries({
            executive: 'executive_summary',
            scope: 'scope',
            methodology: 'methodology',
            findings: 'findings',
            recommendations: 'recommendations',
            conclusion: 'conclusion'
          }).map(([key, field]) => (
            <TabsContent key={key} value={key} className="p-6">
              <Textarea
                value={report[field]}
                onChange={(e) => setReport({...report, [field]: e.target.value})}
                placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                rows={12}
                className="bg-[#151d2e] border-[#2a3548] text-white font-mono text-sm mb-4"
              />
              {report[field] && (
                <div className="mt-4 p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <h4 className="text-xs font-semibold text-slate-500 mb-3">Preview:</h4>
                  <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-slate-300">
                    {report[field]}
                  </ReactMarkdown>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}