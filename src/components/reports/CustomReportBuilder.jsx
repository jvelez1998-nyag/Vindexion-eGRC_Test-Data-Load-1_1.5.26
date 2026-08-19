import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function CustomReportBuilder() {
  const [config, setConfig] = useState({
    entity: "vendors",
    dateRange: "all",
    startDate: "",
    endDate: "",
    filters: {},
    columns: []
  });
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const entityOptions = [
    { value: "vendors", label: "Vendors", columns: ["vendor_name", "vendor_type", "criticality", "status", "security_score", "compliance_status"] },
    { value: "vendor-audits", label: "Vendor Audits", columns: ["audit_title", "audit_type", "status", "lead_auditor", "due_date", "progress_percentage"] },
    { value: "risks", label: "Risks", columns: ["title", "risk_category", "likelihood", "impact", "status", "owner"] },
    { value: "controls", label: "Controls", columns: ["name", "category", "domain", "status", "effectiveness", "owner"] },
    { value: "compliance", label: "Compliance", columns: ["requirement", "framework", "status", "owner", "due_date"] }
  ];

  const selectedEntity = entityOptions.find(e => e.value === config.entity);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const entityMap = {
        "vendors": "Vendor",
        "vendor-audits": "VendorAudit",
        "risks": "Risk",
        "controls": "Control",
        "compliance": "Compliance"
      };

      const entityName = entityMap[config.entity];
      let data = await base44.entities[entityName].list('-created_date');

      // Apply date filters
      if (config.dateRange !== "all" && config.startDate && config.endDate) {
        data = data.filter(item => {
          const itemDate = new Date(item.created_date);
          return itemDate >= new Date(config.startDate) && itemDate <= new Date(config.endDate);
        });
      }

      // Apply custom filters
      Object.keys(config.filters).forEach(key => {
        if (config.filters[key]) {
          data = data.filter(item => item[key] === config.filters[key]);
        }
      });

      setReportData(data);
      toast.success(`Generated report with ${data.length} records`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;

    const columns = config.columns.length > 0 ? config.columns : selectedEntity.columns;
    const headers = columns.join(",");
    const rows = reportData.map(item => 
      columns.map(col => `"${item[col] || ''}"`).join(",")
    ).join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.entity}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const columns = config.columns.length > 0 ? config.columns : selectedEntity.columns;

    doc.setFontSize(16);
    doc.text(`${selectedEntity.label} Report`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Records: ${reportData.length}`, 14, 34);

    let y = 45;
    const maxY = 280;

    reportData.slice(0, 50).forEach((item, index) => {
      if (y > maxY) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.text(`Record ${index + 1}`, 14, y);
      y += 6;

      doc.setFontSize(9);
      columns.forEach(col => {
        const value = item[col] ? String(item[col]).substring(0, 60) : 'N/A';
        doc.text(`${col}: ${value}`, 14, y);
        y += 5;
      });
      y += 3;
    });

    doc.save(`${config.entity}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF downloaded");
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
          {/* Entity Selection */}
          <div className="space-y-2">
            <Label>Select Entity</Label>
            <Select value={config.entity} onValueChange={(value) => setConfig({ ...config, entity: value, columns: [] })}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                {entityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={config.dateRange} onValueChange={(value) => setConfig({ ...config, dateRange: value })}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
                <SelectItem value="last_30">Last 30 Days</SelectItem>
                <SelectItem value="last_90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.dateRange === "custom" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>
          )}

          {/* Column Selection */}
          <div className="space-y-2">
            <Label>Select Columns</Label>
            <div className="grid grid-cols-2 gap-2">
              {selectedEntity?.columns.map(col => (
                <div key={col} className="flex items-center gap-2">
                  <Checkbox
                    checked={config.columns.includes(col)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setConfig({ ...config, columns: [...config.columns, col] });
                      } else {
                        setConfig({ ...config, columns: config.columns.filter(c => c !== col) });
                      }
                    }}
                  />
                  <Label className="text-sm text-white">{col.replace(/_/g, ' ')}</Label>
                </div>
              ))}
            </div>
            {config.columns.length === 0 && (
              <p className="text-xs text-slate-400">All columns will be included</p>
            )}
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateReport} 
            disabled={generating}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
            ) : (
              <><FileText className="h-4 w-4 mr-2" /> Generate Report</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Report Results ({reportData.length} records)</CardTitle>
              <div className="flex gap-2">
                <Button onClick={exportCSV} size="sm" variant="outline" className="border-[#2a3548]">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={exportPDF} size="sm" variant="outline" className="border-[#2a3548]">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {reportData.slice(0, 100).map((item, i) => (
                  <div key={i} className="bg-[#151d2e] p-3 rounded border border-[#2a3548]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {(config.columns.length > 0 ? config.columns : selectedEntity.columns).map(col => (
                        <div key={col}>
                          <span className="text-slate-400">{col}: </span>
                          <span className="text-white">{item[col] || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {reportData.length > 100 && (
                  <p className="text-sm text-slate-400 text-center">
                    Showing first 100 of {reportData.length} records. Export for full data.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}