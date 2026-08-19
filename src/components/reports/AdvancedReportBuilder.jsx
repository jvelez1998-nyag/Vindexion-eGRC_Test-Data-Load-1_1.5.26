import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Plus, 
  X,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Save,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const dataSourceOptions = [
  { value: "risks", label: "Risks", icon: "🎯" },
  { value: "risk_assessments", label: "Risk Assessments", icon: "📊" },
  { value: "controls", label: "Controls", icon: "🛡️" },
  { value: "audits", label: "Audits", icon: "✅" },
  { value: "findings", label: "Audit Findings", icon: "⚠️" },
  { value: "compliance", label: "Compliance", icon: "📋" },
  { value: "incidents", label: "Incidents", icon: "🚨" },
  { value: "guidance", label: "Guidance", icon: "📚" }
];

const metricOptions = {
  risks: ["count", "avg_likelihood", "avg_impact", "high_risk_count", "by_category"],
  risk_assessments: ["count", "avg_inherent", "avg_residual", "by_type", "lifecycle_status"],
  controls: ["count", "effectiveness_avg", "by_domain", "by_status", "ineffective_count"],
  audits: ["count", "completed", "in_progress", "by_type", "findings_total"],
  findings: ["count", "by_severity", "by_status", "critical_count", "open_count"],
  compliance: ["count", "compliant_count", "non_compliant", "by_framework", "by_status"],
  incidents: ["count", "by_severity", "by_type", "open_count", "avg_resolution_time"],
  guidance: ["count", "by_framework", "by_category"]
};

export default function AdvancedReportBuilder({ onReportGenerated }) {
  const [reportConfig, setReportConfig] = useState({
    name: "",
    description: "",
    dataSources: [],
    filters: {},
    metrics: [],
    groupBy: "",
    dateRange: "all",
    customDateStart: "",
    customDateEnd: "",
    schedule: null
  });
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const addDataSource = (source) => {
    if (!reportConfig.dataSources.includes(source)) {
      setReportConfig({
        ...reportConfig,
        dataSources: [...reportConfig.dataSources, source]
      });
    }
  };

  const removeDataSource = (source) => {
    setReportConfig({
      ...reportConfig,
      dataSources: reportConfig.dataSources.filter(s => s !== source),
      metrics: reportConfig.metrics.filter(m => !m.startsWith(source))
    });
  };

  const addMetric = (source, metric) => {
    const metricKey = `${source}.${metric}`;
    if (!reportConfig.metrics.includes(metricKey)) {
      setReportConfig({
        ...reportConfig,
        metrics: [...reportConfig.metrics, metricKey]
      });
    }
  };

  const removeMetric = (metricKey) => {
    setReportConfig({
      ...reportConfig,
      metrics: reportConfig.metrics.filter(m => m !== metricKey)
    });
  };

  const addFilter = (source, field, operator, value) => {
    setReportConfig({
      ...reportConfig,
      filters: {
        ...reportConfig.filters,
        [source]: [...(reportConfig.filters[source] || []), { field, operator, value }]
      }
    });
  };

  const generateReport = async () => {
    if (!reportConfig.name || reportConfig.dataSources.length === 0) {
      toast.error("Please provide a report name and select at least one data source");
      return;
    }

    setGenerating(true);
    try {
      // Fetch data from selected sources
      const dataPromises = reportConfig.dataSources.map(async (source) => {
        let data;
        switch (source) {
          case "risks":
            data = await base44.entities.Risk.list();
            break;
          case "risk_assessments":
            data = await base44.entities.RiskAssessment.list();
            break;
          case "controls":
            data = await base44.entities.Control.list();
            break;
          case "audits":
            data = await base44.entities.Audit.list();
            break;
          case "findings":
            data = await base44.entities.AuditFinding.list();
            break;
          case "compliance":
            data = await base44.entities.Compliance.list();
            break;
          case "incidents":
            data = await base44.entities.Incident.list();
            break;
          case "guidance":
            data = await base44.entities.Guidance.list();
            break;
          default:
            data = [];
        }

        // Apply filters
        if (reportConfig.filters[source]) {
          reportConfig.filters[source].forEach(filter => {
            data = data.filter(item => {
              const value = item[filter.field];
              switch (filter.operator) {
                case "equals": return value === filter.value;
                case "not_equals": return value !== filter.value;
                case "contains": return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                case "greater_than": return Number(value) > Number(filter.value);
                case "less_than": return Number(value) < Number(filter.value);
                default: return true;
              }
            });
          });
        }

        // Apply date range
        if (reportConfig.dateRange !== "all" && data.length > 0) {
          const now = new Date();
          const filterDate = new Date();
          
          switch (reportConfig.dateRange) {
            case "7days":
              filterDate.setDate(now.getDate() - 7);
              break;
            case "30days":
              filterDate.setDate(now.getDate() - 30);
              break;
            case "90days":
              filterDate.setDate(now.getDate() - 90);
              break;
            case "1year":
              filterDate.setFullYear(now.getFullYear() - 1);
              break;
            case "custom":
              if (reportConfig.customDateStart) {
                data = data.filter(item => new Date(item.created_date) >= new Date(reportConfig.customDateStart));
              }
              if (reportConfig.customDateEnd) {
                data = data.filter(item => new Date(item.created_date) <= new Date(reportConfig.customDateEnd));
              }
              return { source, data };
          }

          data = data.filter(item => new Date(item.created_date) >= filterDate);
        }

        return { source, data };
      });

      const results = await Promise.all(dataPromises);
      
      // Calculate metrics
      const calculatedMetrics = {};
      results.forEach(({ source, data }) => {
        reportConfig.metrics
          .filter(m => m.startsWith(source))
          .forEach(metricKey => {
            const metric = metricKey.split('.')[1];
            calculatedMetrics[metricKey] = calculateMetric(data, metric, source);
          });
      });

      const report = {
        ...reportConfig,
        data: results,
        metrics: calculatedMetrics,
        generatedAt: new Date().toISOString()
      };

      setReportData(report);
      if (onReportGenerated) onReportGenerated(report);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const calculateMetric = (data, metric, source) => {
    switch (metric) {
      case "count":
        return data.length;
      case "avg_likelihood":
        return (data.reduce((sum, r) => sum + (r.residual_likelihood || r.likelihood || 0), 0) / data.length).toFixed(2);
      case "avg_impact":
        return (data.reduce((sum, r) => sum + (r.residual_impact || r.impact || 0), 0) / data.length).toFixed(2);
      case "high_risk_count":
        return data.filter(r => ((r.residual_likelihood || r.likelihood || 0) * (r.residual_impact || r.impact || 0)) >= 9).length;
      case "by_category":
        return data.reduce((acc, item) => {
          const cat = item.category || item.risk_category || "Unknown";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});
      case "effectiveness_avg":
        return (data.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / data.length).toFixed(2);
      case "by_domain":
        return data.reduce((acc, item) => {
          acc[item.domain || "Unknown"] = (acc[item.domain || "Unknown"] || 0) + 1;
          return acc;
        }, {});
      case "by_status":
        return data.reduce((acc, item) => {
          acc[item.status || "Unknown"] = (acc[item.status || "Unknown"] || 0) + 1;
          return acc;
        }, {});
      case "by_severity":
        return data.reduce((acc, item) => {
          acc[item.severity || "Unknown"] = (acc[item.severity || "Unknown"] || 0) + 1;
          return acc;
        }, {});
      case "by_type":
        return data.reduce((acc, item) => {
          const type = item.type || item.incident_type || item.assessment_type || "Unknown";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
      case "by_framework":
        return data.reduce((acc, item) => {
          acc[item.framework || "Unknown"] = (acc[item.framework || "Unknown"] || 0) + 1;
          return acc;
        }, {});
      case "compliant_count":
        return data.filter(c => c.status === "compliant").length;
      case "non_compliant":
        return data.filter(c => c.status === "non_compliant").length;
      case "critical_count":
        return data.filter(i => i.severity === "critical").length;
      case "open_count":
        return data.filter(i => i.status === "open" || i.status === "reported" || i.status === "investigating").length;
      case "ineffective_count":
        return data.filter(c => c.status === "ineffective").length;
      case "completed":
        return data.filter(a => a.status === "completed").length;
      case "in_progress":
        return data.filter(a => a.status === "in_progress").length;
      case "findings_total":
        return data.reduce((sum, a) => sum + (a.findings_count || 0), 0);
      default:
        return 0;
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${reportConfig.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report exported as PDF");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF");
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = [];
    reportData.data.forEach(({ source, data }) => {
      data.forEach(item => {
        csvData.push({
          Source: source,
          ...item
        });
      });
    });

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportConfig.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Report exported as CSV");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Report Name *</Label>
              <Input
                value={reportConfig.name}
                onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                placeholder="Monthly Risk Report"
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <div>
              <Label className="text-white">Date Range</Label>
              <Select value={reportConfig.dateRange} onValueChange={(value) => setReportConfig({ ...reportConfig, dateRange: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all" className="text-white">All Time</SelectItem>
                  <SelectItem value="7days" className="text-white">Last 7 Days</SelectItem>
                  <SelectItem value="30days" className="text-white">Last 30 Days</SelectItem>
                  <SelectItem value="90days" className="text-white">Last 90 Days</SelectItem>
                  <SelectItem value="1year" className="text-white">Last Year</SelectItem>
                  <SelectItem value="custom" className="text-white">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportConfig.dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Start Date</Label>
                <Input
                  type="date"
                  value={reportConfig.customDateStart}
                  onChange={(e) => setReportConfig({ ...reportConfig, customDateStart: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div>
                <Label className="text-white">End Date</Label>
                <Input
                  type="date"
                  value={reportConfig.customDateEnd}
                  onChange={(e) => setReportConfig({ ...reportConfig, customDateEnd: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-white">Description</Label>
            <Input
              value={reportConfig.description}
              onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
              placeholder="Executive summary of risk landscape"
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          {/* Data Sources */}
          <div>
            <Label className="text-white mb-3 block">Data Sources *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dataSourceOptions.map(option => (
                <Button
                  key={option.value}
                  variant={reportConfig.dataSources.includes(option.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (reportConfig.dataSources.includes(option.value)) {
                      removeDataSource(option.value);
                    } else {
                      addDataSource(option.value);
                    }
                  }}
                  className={reportConfig.dataSources.includes(option.value) ? "bg-indigo-600" : "border-[#2a3548]"}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          {reportConfig.dataSources.length > 0 && (
            <div>
              <Label className="text-white mb-3 block">Metrics</Label>
              <ScrollArea className="h-48 rounded-lg border border-[#2a3548] p-3">
                <div className="space-y-4">
                  {reportConfig.dataSources.map(source => (
                    <div key={source}>
                      <div className="text-xs font-medium text-slate-400 mb-2">
                        {dataSourceOptions.find(d => d.value === source)?.label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {metricOptions[source]?.map(metric => (
                          <Badge
                            key={metric}
                            className={`cursor-pointer ${reportConfig.metrics.includes(`${source}.${metric}`) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
                            onClick={() => {
                              if (reportConfig.metrics.includes(`${source}.${metric}`)) {
                                removeMetric(`${source}.${metric}`);
                              } else {
                                addMetric(source, metric);
                              }
                            }}
                          >
                            {metric.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={generateReport} disabled={generating} className="bg-indigo-600 hover:bg-indigo-700">
              {generating ? "Generating..." : "Generate Report"}
            </Button>
            {reportData && (
              <>
                <Button onClick={exportToPDF} variant="outline" className="border-blue-500/30 text-blue-400">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={exportToCSV} variant="outline" className="border-emerald-500/30 text-emerald-400">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && (
        <Card id="report-content" className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle>{reportData.name}</CardTitle>
            <p className="text-sm text-slate-400">{reportData.description}</p>
            <p className="text-xs text-slate-500">Generated: {new Date(reportData.generatedAt).toLocaleString()}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Metrics Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(reportData.metrics).map(([key, value]) => (
                    <Card key={key} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-4">
                        <div className="text-xs text-slate-400 mb-1">{key.split('.')[1].replace(/_/g, ' ')}</div>
                        <div className="text-2xl font-bold text-white">
                          {typeof value === 'object' ? Object.keys(value).length : value}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Data Tables */}
              {reportData.data.map(({ source, data }) => (
                <div key={source}>
                  <h3 className="text-lg font-semibold text-white mb-3 capitalize">
                    {source.replace(/_/g, ' ')} ({data.length})
                  </h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {data.slice(0, 10).map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-sm font-medium text-white">{item.title || item.name || item.requirement || 'Item'}</div>
                          {item.status && <Badge className="mt-1 text-xs">{item.status}</Badge>}
                        </div>
                      ))}
                      {data.length > 10 && (
                        <p className="text-xs text-slate-500 text-center py-2">
                          ... and {data.length - 10} more items
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}