import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, FileBarChart, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ExamReportGenerator({ exam, tasks, priorities }) {
  const [reportType, setReportType] = useState('comprehensive');
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const daysUntilExam = exam?.exam_date ? Math.ceil((new Date(exam.exam_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

      const reportData = {
        exam_title: exam?.exam_title || 'Regulatory Exam',
        exam_type: exam?.exam_type || 'FFIEC',
        exam_date: exam?.exam_date,
        days_until: daysUntilExam,
        readiness_score: exam?.readiness_score || 0,
        workflow_stage: exam?.workflow_stage || 'preparation',
        total_tasks: tasks?.length || 0,
        completed_tasks: tasks?.filter(t => t.status === 'completed').length || 0,
        pending_tasks: tasks?.filter(t => t.status === 'pending').length || 0
      };

      const prompt = `Generate a comprehensive ${reportType} regulatory exam preparation report.

REPORT DATA:
${JSON.stringify(reportData, null, 2)}

PRIORITIES:
${JSON.stringify(priorities, null, 2)}

Create a detailed report in markdown format including:
1. Executive Summary
2. Exam Overview & Timeline
3. Readiness Assessment
4. Critical Action Items
5. Risk & Gap Analysis
6. Documentation Status
7. Team Readiness
8. Recommendations

Format with clear sections, tables where appropriate, and actionable insights.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });

      downloadMarkdownReport(response, `${exam?.exam_title || 'Exam'}_Report_${new Date().toISOString().split('T')[0]}.md`);
      
      toast.success("Report generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const downloadMarkdownReport = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-indigo-400" />
          Downloadable Exam Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-slate-400 mb-2 block">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="comprehensive" className="text-white">Comprehensive Readiness Report</SelectItem>
              <SelectItem value="executive" className="text-white">Executive Summary</SelectItem>
              <SelectItem value="action_plan" className="text-white">Action Plan & Timeline</SelectItem>
              <SelectItem value="gap_analysis" className="text-white">Gap Analysis Report</SelectItem>
              <SelectItem value="documentation" className="text-white">Documentation Checklist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={generateReport} disabled={generating} className="bg-indigo-600 hover:bg-indigo-700">
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Generate & Download
          </Button>
          <Button variant="outline" className="border-[#2a3548]">
            <FileText className="h-4 w-4 mr-2" />
            Preview Report
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-xs text-slate-400">
            Reports are AI-generated based on current readiness data, priorities, and exam context. Download as Markdown for easy editing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}