import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Download, Loader2, CheckCircle2, 
  BarChart3, PieChart as PieChartIcon, TrendingUp, Mail 
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const REPORT_TYPES = [
  { id: 'executive', name: 'Executive Summary', icon: FileText, description: 'High-level overview for leadership' },
  { id: 'detailed', name: 'Detailed Assessment', icon: BarChart3, description: 'Comprehensive analysis report' },
  { id: 'comparison', name: 'Portfolio Comparison', icon: PieChartIcon, description: 'Benchmark against peers' },
  { id: 'trend', name: 'Trend Analysis', icon: TrendingUp, description: 'Historical performance trends' }
];

export default function ClientReportingEngine({ client, allClients = [] }) {
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('executive');
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    setGenerating(true);
    try {
      let prompt = '';
      
      if (reportType === 'executive') {
        prompt = `Generate an executive summary report for client "${client.name}".

CLIENT DATA:
${JSON.stringify({
  name: client.name,
  industry: client.industry,
  status: client.status,
  risk_score: client.risk_score,
  compliance_score: client.compliance_score,
  control_maturity: client.control_maturity,
  security_posture: client.security_posture,
  incident_count: client.incident_count,
  finding_count: client.finding_count,
  critical_issues: client.critical_issues
}, null, 2)}

Provide:
1. Executive Summary (2-3 paragraphs)
2. Key Metrics Overview
3. Critical Findings (if any)
4. Top 3 Recommendations
5. Overall Health Assessment

Format as professional markdown suitable for C-level executives.`;
      } else if (reportType === 'detailed') {
        prompt = `Generate a detailed assessment report for client "${client.name}".

Include comprehensive analysis of:
1. Risk Profile Analysis
2. Compliance Status
3. Control Environment
4. Security Posture
5. Incident History
6. Compliance Gaps
7. Detailed Recommendations
8. Action Plan

Format as detailed markdown with sections and subsections.`;
      } else if (reportType === 'comparison') {
        prompt = `Generate a portfolio comparison report for client "${client.name}".

Compare against ${allClients.length} total clients in portfolio.
Industry peers: ${allClients.filter(c => c.industry === client.industry).length}

Provide:
1. Industry Benchmarking
2. Peer Comparison
3. Best Practices Gap Analysis
4. Competitive Positioning
5. Areas of Excellence
6. Improvement Opportunities

Format as markdown with data-driven insights.`;
      } else {
        prompt = `Generate a trend analysis report for client "${client.name}".

Historical data: ${client.assessment_history?.length || 0} assessments

Provide:
1. Performance Trends
2. Improvement Areas
3. Declining Metrics
4. Predictive Analysis
5. Future Recommendations

Format as markdown with trend insights.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setReport(response);
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">AI Report Generator</h3>
                <p className="text-xs text-slate-400">Automated client reporting</p>
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {REPORT_TYPES.length} Templates
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 gap-3">
        {REPORT_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all ${
                reportType === type.id 
                  ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/40' 
                  : 'bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558]'
              }`}
              onClick={() => setReportType(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    reportType === type.id 
                      ? 'bg-blue-500/20 border border-blue-500/30' 
                      : 'bg-[#151d2e]'
                  }`}>
                    <Icon className={`h-4 w-4 ${reportType === type.id ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{type.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                  </div>
                  {reportType === type.id && (
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate Button */}
      <Button 
        onClick={generateReport}
        disabled={generating}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Generate {REPORT_TYPES.find(t => t.id === reportType)?.name}
          </>
        )}
      </Button>

      {/* Report Output */}
      {report && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Generated Report</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-[#2a3548] text-slate-400">
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" className="border-[#2a3548] text-slate-400">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="pr-4">
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none"
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-6 first:mt-0 border-b border-[#2a3548] pb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-5">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed text-sm">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1.5">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1.5">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    table: ({children}) => <table className="w-full border-collapse border border-[#2a3548] my-4">{children}</table>,
                    th: ({children}) => <th className="border border-[#2a3548] px-3 py-2 bg-[#151d2e] text-white text-left text-sm">{children}</th>,
                    td: ({children}) => <td className="border border-[#2a3548] px-3 py-2 text-slate-300 text-sm">{children}</td>,
                  }}
                >
                  {report}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}