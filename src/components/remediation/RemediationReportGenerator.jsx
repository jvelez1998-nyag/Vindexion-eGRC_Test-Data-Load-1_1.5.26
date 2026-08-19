import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Download, Copy, Brain } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function RemediationReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ['remediation-tasks'],
    queryFn: () => base44.entities.RemediationTask.list()
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list()
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
      const blockedTasks = tasks.filter(t => t.status === 'blocked');
      const overdueTasks = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < new Date();
      });

      const tasksByPriority = {
        critical: tasks.filter(t => t.priority === 'critical'),
        high: tasks.filter(t => t.priority === 'high'),
        medium: tasks.filter(t => t.priority === 'medium'),
        low: tasks.filter(t => t.priority === 'low')
      };

      const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_effort_hours || 0), 0);
      const totalActualHours = completedTasks.reduce((sum, t) => sum + (t.actual_effort_hours || 0), 0);
      const avgEffectiveness = completedTasks.filter(t => t.effectiveness_rating).length
        ? completedTasks.reduce((sum, t) => sum + (t.effectiveness_rating || 0), 0) / completedTasks.filter(t => t.effectiveness_rating).length
        : 0;

      const prompt = `As an expert GRC analyst, generate a comprehensive remediation effectiveness report based on this data:

OVERALL STATISTICS:
- Total Remediation Tasks: ${tasks.length}
- Completed: ${completedTasks.length} (${tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%)
- In Progress: ${inProgressTasks.length}
- Blocked: ${blockedTasks.length}
- Overdue: ${overdueTasks.length}

PRIORITY BREAKDOWN:
- Critical: ${tasksByPriority.critical.length} tasks
- High: ${tasksByPriority.high.length} tasks
- Medium: ${tasksByPriority.medium.length} tasks
- Low: ${tasksByPriority.low.length} tasks

EFFORT ANALYSIS:
- Total Estimated Hours: ${totalEstimatedHours}
- Total Actual Hours (completed tasks): ${totalActualHours}
- Variance: ${totalEstimatedHours - totalActualHours} hours
- Average Effectiveness Rating: ${avgEffectiveness.toFixed(1)}/5

TOP COMPLETED TASKS:
${completedTasks.slice(0, 5).map(t => `- ${t.title} (Priority: ${t.priority}, Hours: ${t.actual_effort_hours || 'N/A'})`).join('\n')}

BLOCKED/OVERDUE TASKS:
${[...blockedTasks, ...overdueTasks].slice(0, 5).map(t => `- ${t.title} (Status: ${t.status}, Priority: ${t.priority})`).join('\n')}

RELATED FINDINGS:
- Total Findings: ${findings.length}
- Critical: ${findings.filter(f => f.severity === 'critical').length}
- Open: ${findings.filter(f => f.status === 'open').length}

Generate a detailed report covering:
1. Executive Summary
2. Remediation Progress Overview
3. Effectiveness Analysis
4. Task Completion Trends
5. Resource Utilization
6. High-Priority Items Status
7. Blockers and Challenges
8. ROI and Impact Assessment
9. Recommendations for Improvement
10. Next Steps and Action Items

Use professional business language with specific data points and metrics.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setReport(result);
      toast.success("Report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report);
    toast.success("Report copied to clipboard");
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remediation-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-base text-white">Remediation Effectiveness Report</CardTitle>
          </div>
          <Button
            onClick={generateReport}
            disabled={loading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            {report ? 'Regenerate' : 'Generate Report'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!report && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Generate an AI-powered effectiveness report</p>
            <p className="text-xs text-slate-500">Analyzes remediation progress, effectiveness, and ROI</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Analyzing remediation data...</p>
          </div>
        )}

        {report && (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={copyReport}
                size="sm"
                variant="outline"
                className="border-[#2a3548] hover:bg-[#2a3548]"
              >
                <Copy className="h-3 w-3 mr-2" />
                Copy
              </Button>
              <Button
                onClick={downloadReport}
                size="sm"
                variant="outline"
                className="border-[#2a3548] hover:bg-[#2a3548]"
              >
                <Download className="h-3 w-3 mr-2" />
                Download
              </Button>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="prose prose-sm prose-invert max-w-none p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-white mb-3 mt-6 first:mt-0 pb-2 border-b border-[#2a3548]">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 text-slate-400 italic">
                        {children}
                      </blockquote>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto my-4">
                        <table className="w-full border-collapse border border-[#2a3548]">{children}</table>
                      </div>
                    ),
                    th: ({children}) => (
                      <th className="border border-[#2a3548] px-4 py-2 bg-[#1a2332] text-white text-left font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="border border-[#2a3548] px-4 py-2 text-slate-300">{children}</td>
                    ),
                  }}
                >
                  {report}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}