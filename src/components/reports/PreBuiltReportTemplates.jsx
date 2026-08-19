import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Loader2, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function PreBuiltReportTemplates() {
  const [generating, setGenerating] = useState(null);
  const [reportData, setReportData] = useState(null);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-created_date')
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-created_date')
  });

  const templates = [
    {
      id: "vendor_risk",
      name: "Vendor Risk Overview",
      description: "Comprehensive overview of all vendor risks with criticality and security scores",
      icon: AlertTriangle,
      color: "rose"
    },
    {
      id: "compliance_status",
      name: "Compliance Status Summary",
      description: "Current compliance status across all frameworks and requirements",
      icon: Shield,
      color: "emerald"
    },
    {
      id: "control_gaps",
      name: "Open Control Gaps",
      description: "Controls that are not effective or need attention",
      icon: TrendingUp,
      color: "amber"
    }
  ];

  const generateVendorRiskReport = () => {
    const data = vendors.map(v => ({
      name: v.vendor_name,
      type: v.vendor_type,
      criticality: v.criticality,
      security_score: v.security_score || 'Not Assessed',
      compliance_status: v.compliance_status || 'Not Set',
      risk_tier: v.risk_tier,
      status: v.status,
      next_review: v.next_review_date || 'Not Set'
    }));

    const summary = {
      total: vendors.length,
      critical: vendors.filter(v => v.criticality === 'critical').length,
      high: vendors.filter(v => v.criticality === 'high').length,
      avg_score: Math.round(vendors.reduce((sum, v) => sum + (v.security_score || 0), 0) / vendors.length) || 0
    };

    return { data, summary, title: "Vendor Risk Overview Report" };
  };

  const generateComplianceReport = () => {
    const data = compliance.map(c => ({
      requirement: c.requirement,
      framework: c.framework,
      status: c.status,
      owner: c.owner || 'Unassigned',
      due_date: c.due_date || 'Not Set',
      evidence: c.evidence_urls?.length || 0
    }));

    const summary = {
      total: compliance.length,
      compliant: compliance.filter(c => ['implemented', 'verified'].includes(c.status)).length,
      in_progress: compliance.filter(c => c.status === 'in_progress').length,
      not_started: compliance.filter(c => c.status === 'not_started').length
    };

    return { data, summary, title: "Compliance Status Summary Report" };
  };

  const generateControlGapsReport = () => {
    const gaps = controls.filter(c => 
      c.status === 'ineffective' || 
      c.status === 'planned' ||
      (c.effectiveness && c.effectiveness <= 2)
    );

    const data = gaps.map(c => ({
      name: c.name,
      domain: c.domain,
      status: c.status,
      effectiveness: c.effectiveness || 'Not Rated',
      owner: c.owner || 'Unassigned',
      last_tested: c.last_tested_date || 'Never'
    }));

    const summary = {
      total_gaps: gaps.length,
      planned: gaps.filter(c => c.status === 'planned').length,
      ineffective: gaps.filter(c => c.status === 'ineffective').length,
      coverage: Math.round(((controls.length - gaps.length) / controls.length) * 100) || 0
    };

    return { data, summary, title: "Open Control Gaps Report" };
  };

  const generateReport = (templateId) => {
    setGenerating(templateId);
    
    try {
      let result;
      switch (templateId) {
        case "vendor_risk":
          result = generateVendorRiskReport();
          break;
        case "compliance_status":
          result = generateComplianceReport();
          break;
        case "control_gaps":
          result = generateControlGapsReport();
          break;
        default:
          return;
      }

      setReportData(result);
      toast.success("Report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;

    const headers = Object.keys(reportData.data[0]).join(",");
    const rows = reportData.data.map(item => 
      Object.values(item).map(v => `"${v}"`).join(",")
    ).join("\n");

    const csv = `${reportData.title}\nGenerated: ${new Date().toLocaleString()}\n\nSummary:\n${Object.entries(reportData.summary).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportData.title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(reportData.title, 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    
    // Summary
    doc.setFontSize(12);
    doc.text("Summary", 14, 40);
    doc.setFontSize(10);
    let y = 48;
    Object.entries(reportData.summary).forEach(([key, value]) => {
      doc.text(`${key.replace(/_/g, ' ')}: ${value}`, 14, y);
      y += 6;
    });

    // Data
    y += 8;
    doc.setFontSize(12);
    doc.text("Details", 14, y);
    y += 8;

    doc.setFontSize(9);
    reportData.data.slice(0, 30).forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(`Record ${index + 1}:`, 14, y);
      y += 5;
      
      Object.entries(item).forEach(([key, value]) => {
        const text = `${key}: ${String(value).substring(0, 50)}`;
        doc.text(text, 14, y);
        y += 5;
      });
      y += 2;
    });

    doc.save(`${reportData.title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {templates.map(template => {
          const Icon = template.icon;
          const colorClasses = {
            rose: "from-rose-500/10 to-red-500/10 border-rose-500/30",
            emerald: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30",
            amber: "from-amber-500/10 to-orange-500/10 border-amber-500/30"
          };

          return (
            <Card key={template.id} className={`bg-gradient-to-br ${colorClasses[template.color]} border`}>
              <CardContent className="p-6">
                <Icon className={`h-8 w-8 mb-4 text-${template.color}-400`} />
                <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{template.description}</p>
                <Button 
                  onClick={() => generateReport(template.id)}
                  disabled={generating === template.id}
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {generating === template.id ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
                  ) : (
                    <><FileText className="h-4 w-4 mr-2" /> Generate</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Preview */}
      {reportData && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{reportData.title}</CardTitle>
              <div className="flex gap-2">
                <Button onClick={exportCSV} size="sm" variant="outline" className="border-[#2a3548]">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={exportPDF} size="sm" variant="outline" className="border-[#2a3548]">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.summary).map(([key, value]) => (
                <div key={key} className="bg-[#151d2e] p-4 rounded border border-[#2a3548]">
                  <p className="text-xs text-slate-400 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-2xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Data Preview */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Data Preview (First 50 records)</h4>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {reportData.data.slice(0, 50).map((item, i) => (
                    <div key={i} className="bg-[#151d2e] p-3 rounded border border-[#2a3548]">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {Object.entries(item).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-slate-400">{key}: </span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}