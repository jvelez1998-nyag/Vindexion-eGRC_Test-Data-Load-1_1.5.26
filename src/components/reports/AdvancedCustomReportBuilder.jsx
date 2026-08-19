import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Download, Loader2, Filter, Plus, X, 
  BarChart3, PieChart, Table, Brain, Sparkles, Eye
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function AdvancedCustomReportBuilder({ data }) {
  const [config, setConfig] = useState({
    title: "",
    modules: [],
    filters: {},
    groupBy: "",
    visualization: "table",
    dateRange: "all",
    startDate: "",
    endDate: ""
  });
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);

  const moduleOptions = [
    { 
      id: 'risks', 
      label: 'Risks', 
      entity: 'Risk',
      fields: ['title', 'category', 'status', 'likelihood', 'impact', 'residual_risk_score', 'owner', 'risk_treatment_strategy'],
      filterFields: ['category', 'status', 'owner'],
      groupByOptions: ['category', 'status', 'owner', 'risk_treatment_strategy']
    },
    { 
      id: 'controls', 
      label: 'Controls', 
      entity: 'Control',
      fields: ['name', 'category', 'domain', 'status', 'effectiveness', 'owner', 'review_frequency'],
      filterFields: ['category', 'domain', 'status', 'owner'],
      groupByOptions: ['category', 'domain', 'status', 'owner']
    },
    { 
      id: 'compliance', 
      label: 'Compliance', 
      entity: 'Compliance',
      fields: ['requirement', 'framework', 'status', 'owner', 'due_date'],
      filterFields: ['framework', 'status', 'owner'],
      groupByOptions: ['framework', 'status', 'owner']
    },
    { 
      id: 'audits', 
      label: 'Audits', 
      entity: 'Audit',
      fields: ['title', 'type', 'status', 'auditor', 'start_date', 'end_date', 'findings_count'],
      filterFields: ['type', 'status', 'auditor'],
      groupByOptions: ['type', 'status', 'auditor']
    },
    { 
      id: 'incidents', 
      label: 'Incidents', 
      entity: 'Incident',
      fields: ['title', 'incident_type', 'severity', 'status', 'priority', 'assigned_to', 'occurred_date'],
      filterFields: ['incident_type', 'severity', 'status', 'priority'],
      groupByOptions: ['incident_type', 'severity', 'status', 'priority']
    },
    { 
      id: 'findings', 
      label: 'Audit Findings', 
      entity: 'AuditFinding',
      fields: ['title', 'severity', 'category', 'status', 'responsible_party', 'target_date'],
      filterFields: ['severity', 'category', 'status'],
      groupByOptions: ['severity', 'category', 'status', 'responsible_party']
    },
    { 
      id: 'vendors', 
      label: 'Vendors', 
      entity: 'Vendor',
      fields: ['vendor_name', 'vendor_type', 'criticality', 'status', 'security_score', 'compliance_status'],
      filterFields: ['vendor_type', 'criticality', 'status'],
      groupByOptions: ['vendor_type', 'criticality', 'status']
    }
  ];

  const selectedModules = moduleOptions.filter(m => config.modules.includes(m.id));

  const generateReport = async () => {
    setGenerating(true);
    try {
      let combinedData = [];
      
      for (const moduleId of config.modules) {
        const module = moduleOptions.find(m => m.id === moduleId);
        let moduleData = data[moduleId] || [];

        // Apply date filters
        if (config.dateRange !== 'all' && config.startDate && config.endDate) {
          moduleData = moduleData.filter(item => {
            const itemDate = new Date(item.created_date || item.start_date || item.occurred_date);
            return itemDate >= new Date(config.startDate) && itemDate <= new Date(config.endDate);
          });
        }

        // Apply module-specific filters
        if (config.filters[moduleId]) {
          Object.entries(config.filters[moduleId]).forEach(([field, value]) => {
            if (value && value !== 'all') {
              moduleData = moduleData.filter(item => item[field] === value);
            }
          });
        }

        // Add module identifier to each record
        moduleData = moduleData.map(item => ({ ...item, _module: moduleId }));
        combinedData = [...combinedData, ...moduleData];
      }

      setReportData(combinedData);
      toast.success(`Generated report with ${combinedData.length} records`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const generateAISummary = async () => {
    if (!reportData || reportData.length === 0) {
      toast.error("Generate a report first");
      return;
    }

    setLoadingAI(true);
    try {
      const summary = reportData.reduce((acc, item) => {
        const module = item._module;
        if (!acc[module]) acc[module] = [];
        acc[module].push(item);
        return acc;
      }, {});

      const prompt = `As a GRC executive analyst, create a comprehensive executive summary for this custom report.

REPORT CONFIGURATION:
Title: ${config.title || 'Custom GRC Report'}
Modules: ${config.modules.join(', ')}
Date Range: ${config.dateRange}
Total Records: ${reportData.length}

DATA SUMMARY:
${Object.entries(summary).map(([module, items]) => `
${module.toUpperCase()}: ${items.length} records
Sample Data: ${JSON.stringify(items.slice(0, 3), null, 2)}
`).join('\n')}

Provide a structured executive summary with:
1. **Overview**: High-level summary of findings
2. **Key Metrics**: Important numbers and percentages
3. **Critical Findings**: Top issues requiring attention
4. **Positive Trends**: Areas of strength
5. **Strategic Recommendations**: 3-5 actionable recommendations
6. **Risk Assessment**: Overall risk posture assessment

Use professional language suitable for C-suite executives.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiSummary(result);
      toast.success("Executive summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI summary");
    } finally {
      setLoadingAI(false);
    }
  };

  const getAggregatedData = () => {
    if (!reportData || !config.groupBy) return [];

    const grouped = reportData.reduce((acc, item) => {
      const key = item[config.groupBy] || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, items]) => ({
      name,
      count: items.length,
      items
    }));
  };

  const handleDrillDown = (dataPoint) => {
    setDrillDownData(dataPoint);
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const allFields = new Set();
    reportData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== '_module') allFields.add(key);
      });
    });

    const headers = ['Module', ...Array.from(allFields)];
    const rows = reportData.map(item => 
      [item._module, ...Array.from(allFields).map(field => item[field] || '')].map(v => `"${v}"`).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    a.click();
    toast.success("Report exported");
  };

  const chartColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-400" />
            Custom Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Title */}
          <div>
            <Label className="text-sm text-slate-400 mb-2">Report Title</Label>
            <Input 
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Enter report title..."
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          {/* Module Selection */}
          <div>
            <Label className="text-sm text-slate-400 mb-3">Data Modules</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moduleOptions.map(module => (
                <div 
                  key={module.id}
                  onClick={() => {
                    const isSelected = config.modules.includes(module.id);
                    setConfig({
                      ...config,
                      modules: isSelected 
                        ? config.modules.filter(m => m !== module.id)
                        : [...config.modules, module.id]
                    });
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    config.modules.includes(module.id)
                      ? 'bg-indigo-500/20 border-indigo-500/40'
                      : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                  }`}
                >
                  <div className="text-sm font-medium text-white mb-1">{module.label}</div>
                  <div className="text-xs text-slate-400">{(data[module.id] || []).length} records</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-slate-400 mb-2">Date Range</Label>
              <Select value={config.dateRange} onValueChange={(value) => setConfig({ ...config, dateRange: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all" className="text-white">All Time</SelectItem>
                  <SelectItem value="last_7" className="text-white">Last 7 Days</SelectItem>
                  <SelectItem value="last_30" className="text-white">Last 30 Days</SelectItem>
                  <SelectItem value="last_90" className="text-white">Last 90 Days</SelectItem>
                  <SelectItem value="custom" className="text-white">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.dateRange === 'custom' && (
              <>
                <div>
                  <Label className="text-sm text-slate-400 mb-2">Start Date</Label>
                  <Input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-400 mb-2">End Date</Label>
                  <Input
                    type="date"
                    value={config.endDate}
                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </>
            )}
          </div>

          {/* Module-specific Filters */}
          {selectedModules.length > 0 && (
            <div>
              <Label className="text-sm text-slate-400 mb-3">Advanced Filters</Label>
              <div className="space-y-4">
                {selectedModules.map(module => (
                  <Card key={module.id} className="bg-[#151d2e] border-[#2a3548] p-4">
                    <h4 className="text-sm font-medium text-white mb-3">{module.label} Filters</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {module.filterFields.map(field => {
                        const values = [...new Set((data[module.id] || []).map(item => item[field]).filter(Boolean))];
                        return (
                          <div key={field}>
                            <Label className="text-xs text-slate-500 mb-1">{field.replace(/_/g, ' ')}</Label>
                            <Select 
                              value={config.filters[module.id]?.[field] || 'all'}
                              onValueChange={(value) => setConfig({
                                ...config,
                                filters: {
                                  ...config.filters,
                                  [module.id]: {
                                    ...config.filters[module.id],
                                    [field]: value
                                  }
                                }
                              })}
                            >
                              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-9 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                                <SelectItem value="all" className="text-white">All</SelectItem>
                                {values.map(val => (
                                  <SelectItem key={val} value={val} className="text-white capitalize">
                                    {val}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Visualization & Grouping */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-400 mb-2">Visualization</Label>
              <Select value={config.visualization} onValueChange={(value) => setConfig({ ...config, visualization: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="table" className="text-white">Table View</SelectItem>
                  <SelectItem value="chart" className="text-white">Bar Chart</SelectItem>
                  <SelectItem value="pie" className="text-white">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.visualization !== 'table' && selectedModules.length === 1 && (
              <div>
                <Label className="text-sm text-slate-400 mb-2">Group By</Label>
                <Select value={config.groupBy} onValueChange={(value) => setConfig({ ...config, groupBy: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {selectedModules[0]?.groupByOptions.map(option => (
                      <SelectItem key={option} value={option} className="text-white capitalize">
                        {option.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={generateReport}
              disabled={generating || config.modules.length === 0}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Output */}
      {reportData && (
        <Tabs defaultValue="data" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-[#1a2332] border border-[#2a3548]">
              <TabsTrigger value="data">
                <Table className="h-4 w-4 mr-2" />
                Data ({reportData.length})
              </TabsTrigger>
              <TabsTrigger value="visualization">
                <BarChart3 className="h-4 w-4 mr-2" />
                Visualization
              </TabsTrigger>
              <TabsTrigger value="ai-summary">
                <Brain className="h-4 w-4 mr-2" />
                AI Summary
              </TabsTrigger>
            </TabsList>
            <Button onClick={exportToCSV} variant="outline" className="border-[#2a3548] text-slate-400">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <TabsContent value="data">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">
                  {config.title || 'Custom Report'} - Data View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {reportData.map((item, idx) => (
                      <Card 
                        key={idx}
                        className="bg-[#151d2e] border-[#2a3548] p-4 hover:border-indigo-500/40 transition-all cursor-pointer"
                        onClick={() => handleDrillDown(item)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] capitalize">
                                {item._module}
                              </Badge>
                              {item.status && (
                                <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px]">
                                  {item.status}
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-sm font-medium text-white mb-1">
                              {item.title || item.name || item.requirement || item.vendor_name || 'Record ' + (idx + 1)}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {Object.entries(item).filter(([key]) => !key.startsWith('_') && !['id', 'created_date', 'updated_date', 'created_by'].includes(key)).slice(0, 4).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-slate-500">{key}: </span>
                                  <span className="text-slate-300">{value || 'N/A'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Eye className="h-4 w-4 text-slate-600" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Interactive Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                {config.visualization === 'table' ? (
                  <p className="text-sm text-slate-400 text-center py-12">Switch to Chart or Pie visualization in configuration</p>
                ) : config.groupBy ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={400}>
                      {config.visualization === 'chart' ? (
                        <BarChart data={getAggregatedData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }}
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#6366f1" 
                            radius={[4, 4, 0, 0]}
                            onClick={(data) => handleDrillDown(data)}
                            cursor="pointer"
                          />
                        </BarChart>
                      ) : (
                        <RechartsPie>
                          <Pie
                            data={getAggregatedData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, count }) => `${name}: ${count}`}
                            outerRadius={150}
                            dataKey="count"
                            onClick={(data) => handleDrillDown(data)}
                            cursor="pointer"
                          >
                            {getAggregatedData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                        </RechartsPie>
                      )}
                    </ResponsiveContainer>

                    {/* Drill-down Panel */}
                    {drillDownData && (
                      <Card className="bg-[#151d2e] border-indigo-500/30">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">
                              Drill-Down: {drillDownData.name} ({drillDownData.items?.length || drillDownData.count} items)
                            </CardTitle>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDrillDownData(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64">
                            <div className="space-y-2">
                              {(drillDownData.items || [drillDownData]).map((item, idx) => (
                                <div key={idx} className="p-3 rounded bg-[#0f1623] border border-[#2a3548]">
                                  <div className="text-sm text-white font-medium mb-1">
                                    {item.title || item.name || item.requirement || 'Record ' + (idx + 1)}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                    {Object.entries(item).filter(([key]) => !key.startsWith('_')).slice(0, 4).map(([key, value]) => (
                                      <div key={key}>
                                        <span className="text-slate-500">{key}: </span>
                                        {value}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">Select a field to group by in configuration</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-summary">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    AI Executive Summary
                  </CardTitle>
                  <Button 
                    onClick={generateAISummary}
                    disabled={loadingAI || !reportData}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loadingAI ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Generate Summary</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {!aiSummary ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Brain className="h-16 w-16 text-slate-600 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
                      <p className="text-sm text-slate-400 max-w-md">
                        Generate an executive summary with key insights, trends, and strategic recommendations based on your report data.
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
                          )
                        }}
                      >
                        {aiSummary}
                      </ReactMarkdown>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}