import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Library, FileText, Download, Sparkles, Building2, FileCheck, Users, BarChart3, Shield, Search } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function ProfessionalTemplateLibrary({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generating, setGenerating] = useState(false);

  const templates = [
    {
      id: "board-report",
      name: "Board Report",
      icon: Users,
      color: "indigo",
      description: "Executive-level GRC overview for board meetings",
      sections: ["Executive Summary", "Key Risk Indicators", "Compliance Status", "Recent Incidents", "Strategic Recommendations"],
      useCase: "Quarterly board presentations"
    },
    {
      id: "regulatory-submission",
      name: "Regulatory Submission",
      icon: FileCheck,
      color: "emerald",
      description: "Formal compliance report for regulatory bodies",
      sections: ["Regulatory Overview", "Compliance Evidence", "Control Testing Results", "Audit Findings", "Remediation Plans"],
      useCase: "SOX, FFIEC, SEC submissions"
    },
    {
      id: "vendor-risk",
      name: "Vendor Risk Assessment",
      icon: Building2,
      color: "purple",
      description: "Comprehensive third-party risk evaluation",
      sections: ["Vendor Profile", "Risk Scoring", "Security Assessment", "Compliance Analysis", "Recommendations"],
      useCase: "Vendor due diligence and reviews"
    },
    {
      id: "incident-response",
      name: "Incident Response Report",
      icon: Shield,
      color: "rose",
      description: "Detailed incident analysis and response documentation",
      sections: ["Incident Overview", "Timeline", "Impact Assessment", "Root Cause Analysis", "Lessons Learned"],
      useCase: "Post-incident reporting"
    },
    {
      id: "risk-register",
      name: "Risk Register Summary",
      icon: BarChart3,
      color: "amber",
      description: "Consolidated view of organizational risks",
      sections: ["Risk Overview", "Heat Map", "Top Risks", "Mitigation Status", "Trends"],
      useCase: "Risk management meetings"
    },
    {
      id: "audit-report",
      name: "Audit Report",
      icon: FileText,
      color: "blue",
      description: "Comprehensive audit findings and recommendations",
      sections: ["Audit Scope", "Methodology", "Findings", "Management Response", "Action Plans"],
      useCase: "Internal and external audits"
    }
  ];

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = async (template) => {
    setGenerating(true);
    setSelectedTemplate(template);
    
    try {
      // Generate AI-powered report content
      const context = {
        risks: (data.risks || []).slice(0, 15),
        compliance: (data.compliance || []).slice(0, 15),
        controls: (data.controls || []).slice(0, 15),
        audits: (data.audits || []).slice(0, 10),
        incidents: (data.incidents || []).slice(0, 10),
        vendors: (data.vendors || []).slice(0, 10)
      };

      const prompt = `Generate a professional ${template.name} with the following sections: ${template.sections.join(', ')}.

DATA CONTEXT:
${JSON.stringify(context, null, 2)}

Create a comprehensive, executive-ready report with:
- Professional tone and formatting
- Data-driven insights
- Actionable recommendations
- Clear section headers

Format the response as structured content for each section.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            date: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  heading: { type: "string" },
                  content: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Generate PDF
      const doc = new jsPDF();
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.text(result.title || template.name, 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
      y += 15;

      // Sections
      result.sections?.forEach(section => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.text(section.heading, 14, y);
        y += 8;

        doc.setFontSize(10);
        const lines = doc.splitTextToSize(section.content, 180);
        lines.forEach(line => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 14, y);
          y += 6;
        });
        y += 8;
      });

      // Recommendations
      if (result.recommendations && result.recommendations.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.text("Recommendations", 14, y);
        y += 8;

        doc.setFontSize(10);
        result.recommendations.forEach((rec, i) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(`${i + 1}. ${rec}`, 14, y);
          y += 6;
        });
      }

      doc.save(`${template.id}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report generated and downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Library className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Professional Report Templates</CardTitle>
                <p className="text-sm text-slate-400 mt-0.5">Pre-built templates for common GRC reporting needs</p>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="bg-[#1a2332] border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                    <Icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">{template.name}</h3>
                    <p className="text-xs text-slate-400">{template.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">Sections Included:</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 3).map(section => (
                        <Badge key={section} variant="outline" className="text-[10px] border-[#2a3548]">
                          {section}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline" className="text-[10px] border-[#2a3548]">
                          +{template.sections.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">Use Case:</Label>
                    <p className="text-xs text-slate-400">{template.useCase}</p>
                  </div>
                </div>

                <Button
                  onClick={() => generateReport(template)}
                  disabled={generating && selectedTemplate?.id === template.id}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {generating && selectedTemplate?.id === template.id ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
            <p className="text-slate-400">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}