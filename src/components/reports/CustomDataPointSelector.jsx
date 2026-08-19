import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileBarChart, Download, Loader2, Plus, X, FileText, Filter } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function CustomDataPointSelector({ data }) {
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedFields, setSelectedFields] = useState({});
  const [reportConfig, setReportConfig] = useState({
    title: "",
    format: "pdf",
    includeCharts: true,
    dateRange: "all"
  });
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const modules = [
    { 
      id: "risks", 
      label: "Risk Management", 
      icon: "🎯",
      fields: ["title", "category", "status", "likelihood", "impact", "residual_risk_score", "owner", "mitigation_plan"],
      color: "rose"
    },
    { 
      id: "compliance", 
      label: "Compliance", 
      icon: "✓",
      fields: ["framework", "requirement", "status", "owner", "due_date", "evidence_url"],
      color: "blue"
    },
    { 
      id: "controls", 
      label: "Controls", 
      icon: "🛡️",
      fields: ["name", "category", "domain", "status", "effectiveness", "owner", "last_tested_date"],
      color: "emerald"
    },
    { 
      id: "audits", 
      label: "Audits", 
      icon: "📋",
      fields: ["title", "type", "status", "auditor", "start_date", "end_date", "findings_count"],
      color: "amber"
    },
    { 
      id: "incidents", 
      label: "Incidents", 
      icon: "⚠️",
      fields: ["title", "incident_type", "severity", "status", "reported_date", "assigned_to"],
      color: "orange"
    },
    { 
      id: "vendors", 
      label: "Vendors", 
      icon: "🏢",
      fields: ["name", "vendor_category", "tier", "risk_rating", "contract_expiration", "status"],
      color: "purple"
    }
  ];

  const toggleModule = (moduleId) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleId));
      const newFields = { ...selectedFields };
      delete newFields[moduleId];
      setSelectedFields(newFields);
    } else {
      setSelectedModules([...selectedModules, moduleId]);
      const module = modules.find(m => m.id === moduleId);
      setSelectedFields({ ...selectedFields, [moduleId]: module.fields.slice(0, 4) });
    }
  };

  const toggleField = (moduleId, field) => {
    const current = selectedFields[moduleId] || [];
    if (current.includes(field)) {
      setSelectedFields({
        ...selectedFields,
        [moduleId]: current.filter(f => f !== field)
      });
    } else {
      setSelectedFields({
        ...selectedFields,
        [moduleId]: [...current, field]
      });
    }
  };

  const generateReport = async () => {
    if (selectedModules.length === 0) {
      toast.error("Please select at least one module");
      return;
    }

    setGenerating(true);
    try {
      const reportContent = {};
      
      selectedModules.forEach(moduleId => {
        const moduleData = data[moduleId] || [];
        const fields = selectedFields[moduleId] || [];
        reportContent[moduleId] = moduleData.map(item => {
          const filtered = {};
          fields.forEach(field => {
            filtered[field] = item[field];
          });
          return filtered;
        });
      });

      setReportData(reportContent);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text(reportConfig.title || "Custom GRC Report", 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 15;

    // Content
    selectedModules.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId);
      const moduleData = reportData[moduleId] || [];

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text(`${module.icon} ${module.label}`, 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.text(`Total Records: ${moduleData.length}`, 14, y);
      y += 10;

      moduleData.slice(0, 20).forEach((item, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(10);
        doc.text(`${idx + 1}.`, 14, y);
        y += 6;

        const fields = selectedFields[moduleId] || [];
        fields.forEach(field => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          const value = item[field] ? String(item[field]).substring(0, 70) : 'N/A';
          doc.setFontSize(8);
          doc.text(`  ${field}: ${value}`, 14, y);
          y += 5;
        });
        y += 3;
      });

      y += 10;
    });

    doc.save(`${reportConfig.title.replace(/\s+/g, '_') || 'custom_report'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF downloaded");
  };

  const exportCSV = () => {
    if (!reportData) return;

    let csv = "";
    
    selectedModules.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId);
      const moduleData = reportData[moduleId] || [];
      const fields = selectedFields[moduleId] || [];

      csv += `\n\n${module.label}\n`;
      csv += fields.join(",") + "\n";

      moduleData.forEach(item => {
        csv += fields.map(field => `"${item[field] || ''}"`).join(",") + "\n";
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportConfig.title.replace(/\s+/g, '_') || 'custom_report'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("CSV downloaded");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Report Title</Label>
              <Input
                value={reportConfig.title}
                onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                placeholder="Enter report title..."
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={reportConfig.format} onValueChange={(v) => setReportConfig({ ...reportConfig, format: v })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={reportConfig.includeCharts}
                onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeCharts: checked })}
              />
              <Label className="text-sm">Include Visualizations</Label>
            </div>

            <Button 
              onClick={generateReport} 
              disabled={generating || selectedModules.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><FileBarChart className="h-4 w-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </CardContent>
        </Card>

        {reportData && (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={exportPDF} variant="outline" className="w-full border-[#2a3548]">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={exportCSV} variant="outline" className="w-full border-[#2a3548]">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Module & Field Selection */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-400" />
              Select Modules & Data Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {modules.map(module => {
                  const borderColor = selectedModules.includes(module.id) ? 'border-2 border-indigo-500/30' : 'border-[#2a3548]';
                  return (
                  <Card key={module.id} className={`bg-[#151d2e] ${borderColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedModules.includes(module.id)}
                            onCheckedChange={() => toggleModule(module.id)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{module.icon}</span>
                              <Label className="text-base font-semibold text-white">{module.label}</Label>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {(data[module.id] || []).length} records available
                            </p>
                          </div>
                        </div>
                        {selectedModules.includes(module.id) && (
                          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                            {(selectedFields[module.id] || []).length} fields selected
                          </Badge>
                        )}
                      </div>

                      {selectedModules.includes(module.id) && (
                        <div className="ml-8 mt-3 pt-3 border-t border-[#2a3548]">
                          <Label className="text-sm text-slate-400 mb-2 block">Select Fields:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {module.fields.map(field => (
                              <div key={field} className="flex items-center gap-2">
                                <Checkbox
                                  checked={(selectedFields[module.id] || []).includes(field)}
                                  onCheckedChange={() => toggleField(module.id, field)}
                                />
                                <Label className="text-xs text-slate-300 capitalize">
                                  {field.replace(/_/g, ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}