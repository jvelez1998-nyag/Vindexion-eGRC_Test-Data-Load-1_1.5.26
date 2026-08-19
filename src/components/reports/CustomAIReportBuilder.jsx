import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Download, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function CustomAIReportBuilder({ data }) {
  const [config, setConfig] = useState({
    report_title: '',
    objectives: '',
    start_date: '',
    end_date: '',
    include_risks: true,
    include_compliance: true,
    include_controls: true,
    include_incidents: true,
    include_audits: false,
    include_vendors: false,
    focus_areas: [],
    custom_requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');

  const focusAreaOptions = [
    'Executive Summary',
    'Risk Analysis',
    'Compliance Status',
    'Control Effectiveness',
    'Incident Analysis',
    'Trend Analysis',
    'Gap Analysis',
    'Recommendations',
    'Action Items',
    'KPIs & Metrics'
  ];

  const generateCustomReport = async () => {
    if (!config.report_title) {
      toast.error('Please provide a report title');
      return;
    }

    setLoading(true);
    try {
      // Filter data by date range if specified
      const filterByDate = (items, dateField) => {
        if (!config.start_date && !config.end_date) return items;
        return items.filter(item => {
          const itemDate = new Date(item[dateField]);
          const start = config.start_date ? new Date(config.start_date) : null;
          const end = config.end_date ? new Date(config.end_date) : null;
          if (start && itemDate < start) return false;
          if (end && itemDate > end) return false;
          return true;
        });
      };

      const reportData = {
        risks: config.include_risks ? filterByDate(data.risks, 'created_date') : [],
        compliance: config.include_compliance ? filterByDate(data.compliance, 'created_date') : [],
        controls: config.include_controls ? data.controls : [],
        incidents: config.include_incidents ? filterByDate(data.incidents, 'occurred_date') : [],
        audits: config.include_audits ? filterByDate(data.audits, 'start_date') : [],
        vendors: config.include_vendors ? data.vendors : []
      };

      const dataContext = JSON.stringify({
        risks_count: reportData.risks.length,
        risks_sample: reportData.risks.slice(0, 20),
        compliance_count: reportData.compliance.length,
        compliance_sample: reportData.compliance.slice(0, 20),
        controls_count: reportData.controls.length,
        controls_sample: reportData.controls.slice(0, 20),
        incidents_count: reportData.incidents.length,
        incidents_sample: reportData.incidents.slice(0, 15),
        audits_count: reportData.audits.length,
        vendors_count: reportData.vendors.length
      }, null, 2);

      const prompt = `Generate a comprehensive custom GRC report with the following specifications:

REPORT CONFIGURATION:
Title: ${config.report_title}
Objectives: ${config.objectives || 'Comprehensive GRC analysis and assessment'}
Date Range: ${config.start_date || 'Beginning'} to ${config.end_date || 'Present'}

DATA SCOPE:
${config.include_risks ? '✓ Risks' : ''}
${config.include_compliance ? '✓ Compliance' : ''}
${config.include_controls ? '✓ Controls' : ''}
${config.include_incidents ? '✓ Incidents' : ''}
${config.include_audits ? '✓ Audits' : ''}
${config.include_vendors ? '✓ Vendors' : ''}

FOCUS AREAS: ${config.focus_areas.join(', ') || 'All areas'}

CUSTOM REQUIREMENTS:
${config.custom_requirements || 'Standard comprehensive analysis'}

DATA CONTEXT:
${dataContext}

REPORT REQUIREMENTS:

Create a professional, executive-ready report that includes:

1. **Executive Summary** (if selected)
   - Key findings and insights
   - Critical metrics and trends
   - Strategic recommendations

2. **Detailed Analysis Sections** (based on selected data types)
   - For each data type, provide:
     * Current state assessment
     * Key metrics and statistics
     * Trend analysis
     * Notable patterns or anomalies
     * Strengths and weaknesses

3. **Risk Analysis** (if risks included)
   - Risk landscape overview
   - Critical and high-priority risks
   - Risk distribution and trends
   - Mitigation status

4. **Compliance Status** (if compliance included)
   - Overall compliance posture
   - Framework-by-framework assessment
   - Gaps and remediation needs
   - Timeline and priorities

5. **Control Effectiveness** (if controls included)
   - Control environment assessment
   - Effectiveness metrics
   - Testing results and gaps
   - Improvement recommendations

6. **Incident Analysis** (if incidents included)
   - Incident trends and patterns
   - Root cause analysis
   - Response effectiveness
   - Lessons learned

7. **Gap Analysis** (if selected)
   - Identified gaps and deficiencies
   - Impact assessment
   - Remediation priorities

8. **Recommendations & Action Items**
   - Prioritized recommendations
   - Specific action items
   - Timelines and ownership
   - Success metrics

9. **KPIs & Metrics Dashboard** (if selected)
   - Key performance indicators
   - Trend visualizations (describe)
   - Benchmarks and targets

Use professional formatting with:
- Clear section headers (use ## and ###)
- Bullet points for lists
- Tables for comparative data
- Bold text for emphasis
- Data-driven insights with specific numbers

Make the report comprehensive, actionable, and presentation-ready.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedReport(response);
      toast.success('Custom report generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generatedReport);
    toast.success('Report copied to clipboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base text-white">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-400">Report Title *</Label>
            <Input
              value={config.report_title}
              onChange={(e) => setConfig({...config, report_title: e.target.value})}
              placeholder="e.g., Q4 2024 GRC Assessment"
              className="mt-1.5 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>

          <div>
            <Label className="text-slate-400">Report Objectives</Label>
            <Textarea
              value={config.objectives}
              onChange={(e) => setConfig({...config, objectives: e.target.value})}
              placeholder="What should this report accomplish?"
              className="mt-1.5 bg-[#0f1623] border-[#2a3548] text-white h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-400">Start Date</Label>
              <Input
                type="date"
                value={config.start_date}
                onChange={(e) => setConfig({...config, start_date: e.target.value})}
                className="mt-1.5 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <div>
              <Label className="text-slate-400">End Date</Label>
              <Input
                type="date"
                value={config.end_date}
                onChange={(e) => setConfig({...config, end_date: e.target.value})}
                className="mt-1.5 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Include Data Types</Label>
            <div className="space-y-2">
              {[
                { key: 'include_risks', label: 'Risks', count: data.risks.length },
                { key: 'include_compliance', label: 'Compliance', count: data.compliance.length },
                { key: 'include_controls', label: 'Controls', count: data.controls.length },
                { key: 'include_incidents', label: 'Incidents', count: data.incidents.length },
                { key: 'include_audits', label: 'Audits', count: data.audits.length },
                { key: 'include_vendors', label: 'Vendors', count: data.vendors.length }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-2 bg-[#0f1623] rounded">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={config[item.key]}
                      onCheckedChange={(checked) => setConfig({...config, [item.key]: checked})}
                    />
                    <Label className="text-slate-300 text-sm">{item.label}</Label>
                  </div>
                  <Badge className="bg-slate-500/20 text-slate-400">{item.count}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Focus Areas</Label>
            <div className="space-y-1.5">
              {focusAreaOptions.map(area => (
                <div key={area} className="flex items-center gap-2 p-1.5 bg-[#0f1623] rounded">
                  <Checkbox
                    checked={config.focus_areas.includes(area)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setConfig({...config, focus_areas: [...config.focus_areas, area]});
                      } else {
                        setConfig({...config, focus_areas: config.focus_areas.filter(a => a !== area)});
                      }
                    }}
                  />
                  <Label className="text-slate-300 text-xs">{area}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-400">Custom Requirements</Label>
            <Textarea
              value={config.custom_requirements}
              onChange={(e) => setConfig({...config, custom_requirements: e.target.value})}
              placeholder="Any specific requirements or focus areas for this report..."
              className="mt-1.5 bg-[#0f1623] border-[#2a3548] text-white h-24"
            />
          </div>

          <Button
            onClick={generateCustomReport}
            disabled={loading || !config.report_title}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            {loading ? 'Generating...' : 'Generate Custom Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Generated Report
            </CardTitle>
            {generatedReport && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyReport} className="border-[#2a3548]">
                  <Copy className="h-3 w-3 mr-2" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" className="border-[#2a3548]">
                  <Download className="h-3 w-3 mr-2" />
                  Export PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[800px]">
            {!generatedReport ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Brain className="h-20 w-20 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Custom AI Report Builder</h3>
                <p className="text-slate-400 max-w-md">
                  Configure your report parameters on the left and click "Generate Custom Report" 
                  to create a tailored, AI-analyzed report based on your specific requirements.
                </p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-[#2a3548]">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mb-3 mt-8 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-medium text-white mb-2 mt-6">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-300">{children}</li>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    table: ({ children }) => <table className="w-full my-4 border-collapse">{children}</table>,
                    thead: ({ children }) => <thead className="bg-[#0f1623]">{children}</thead>,
                    th: ({ children }) => <th className="border border-[#2a3548] p-3 text-left text-white font-semibold">{children}</th>,
                    td: ({ children }) => <td className="border border-[#2a3548] p-3 text-slate-300">{children}</td>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 text-slate-400 italic bg-indigo-500/5 py-2">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, children }) => inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-[#0f1623] text-indigo-400 text-sm">{children}</code>
                    ) : (
                      <code className="block p-4 rounded-lg bg-[#0f1623] text-slate-300 text-sm overflow-x-auto my-3">{children}</code>
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