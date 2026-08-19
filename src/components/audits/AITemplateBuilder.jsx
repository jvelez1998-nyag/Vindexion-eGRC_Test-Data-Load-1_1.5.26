import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Sparkles, Save, FileText, Target, Clock } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_CATEGORIES = [
  "Financial Audit",
  "IT Audit",
  "Operational Audit",
  "Compliance Audit",
  "Security Audit",
  "Risk Assessment",
  "Internal Control Review",
  "Vendor Audit",
  "SOX Compliance",
  "ISO Certification"
];

export default function AITemplateBuilder({ open, onOpenChange }) {
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("");
  const [auditType, setAuditType] = useState("");
  const [description, setDescription] = useState("");
  const [customRequirements, setCustomRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditProgram.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-programs'] });
      toast.success("Template saved successfully");
      if (onOpenChange) onOpenChange(false);
      resetForm();
    }
  });

  const generateTemplate = async () => {
    if (!templateName || !auditType || !category) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const prompt = `As an audit program expert, generate a comprehensive audit program template.

TEMPLATE REQUIREMENTS:
Name: ${templateName}
Category: ${category}
Audit Type: ${auditType}
Description: ${description || 'Not provided'}
Custom Requirements: ${customRequirements || 'None'}

Generate a complete, professional audit program template that includes:

1. Clear, measurable audit objectives (3-5 objectives)
2. Well-defined scope statement
3. Comprehensive audit procedures (8-12 procedures) covering:
   - Risk assessment procedures
   - Control testing procedures
   - Substantive testing procedures
   - Compliance verification procedures
   - Reporting procedures
4. Testing worksheets for key procedures
5. Sampling criteria and methodology
6. Realistic time estimates

Make the template:
- Industry best-practice compliant
- Adaptable for different organizations
- Detailed enough to be actionable
- Comprehensive but not overwhelming

Return structured JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            objectives: {
              type: "array",
              items: { type: "string" }
            },
            scope: { type: "string" },
            procedures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  steps: { type: "array", items: { type: "string" } },
                  expected_evidence: { type: "string" },
                  estimated_hours: { type: "number" }
                }
              }
            },
            testing_worksheets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  purpose: { type: "string" },
                  columns: { type: "array", items: { type: "string" } }
                }
              }
            },
            sampling_criteria: {
              type: "object",
              properties: {
                methodology: { type: "string" },
                sample_sizes: { type: "object" },
                selection_criteria: { type: "string" }
              }
            },
            estimated_hours: { type: "number" },
            key_deliverables: { type: "array", items: { type: "string" } },
            best_practices: { type: "array", items: { type: "string" } }
          }
        }
      });

      setGeneratedTemplate(response);
      toast.success("Template generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate template");
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = () => {
    if (!generatedTemplate) return;

    saveTemplateMutation.mutate({
      name: templateName,
      audit_type: auditType,
      description: generatedTemplate.executive_summary,
      template_category: category,
      objectives: generatedTemplate.objectives,
      scope: generatedTemplate.scope,
      procedures: generatedTemplate.procedures,
      testing_worksheets: generatedTemplate.testing_worksheets,
      sampling_criteria: generatedTemplate.sampling_criteria,
      estimated_hours: generatedTemplate.estimated_hours,
      status: 'template',
      is_template: true,
      ai_generated: true
    });
  };

  const resetForm = () => {
    setTemplateName("");
    setCategory("");
    setAuditType("");
    setDescription("");
    setCustomRequirements("");
    setGeneratedTemplate(null);
  };

  if (generatedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Generated Template</h3>
          <div className="flex gap-2">
            <Button onClick={resetForm} variant="outline" className="border-[#2a3548]">
              Create New
            </Button>
            <Button onClick={saveTemplate} disabled={saveTemplateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {category}
            </Badge>
            <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
              {auditType}
            </Badge>
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">{templateName}</h4>
          <p className="text-sm text-slate-300">{generatedTemplate.executive_summary}</p>
        </Card>

        <ScrollArea className="h-[500px]">
          <div className="space-y-6 pr-4">
            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                Objectives
              </h5>
              <ul className="space-y-2">
                {generatedTemplate.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-indigo-400 font-bold">{i + 1}.</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <h5 className="font-semibold text-white mb-3">Scope</h5>
              <p className="text-sm text-slate-300">{generatedTemplate.scope}</p>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Procedures ({generatedTemplate.procedures?.length})
                </h5>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {generatedTemplate.estimated_hours}h Total
                </Badge>
              </div>
              <div className="space-y-4">
                {generatedTemplate.procedures?.map((proc, i) => (
                  <div key={i} className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-2">
                      <h6 className="font-medium text-white">{proc.title}</h6>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                        {proc.estimated_hours}h
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{proc.description}</p>
                    <div className="space-y-2">
                      {proc.steps?.map((step, j) => (
                        <div key={j} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-indigo-400">•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    {proc.expected_evidence && (
                      <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-[#2a3548]">
                        Evidence: {proc.expected_evidence}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <h5 className="font-semibold text-white mb-3">Best Practices</h5>
              <ul className="space-y-2">
                {generatedTemplate.best_practices?.map((practice, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {practice}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Brain className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">AI Template Builder</h4>
            <p className="text-xs text-slate-400">Create professional audit program templates with AI</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="templateName" className="text-sm text-slate-400">Template Name *</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., SOX IT Controls Audit"
              className="bg-[#151d2e] border-[#2a3548] text-white mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-sm text-slate-400">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-white hover:bg-[#2a3548]">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="auditType" className="text-sm text-slate-400">Audit Type *</Label>
              <Select value={auditType} onValueChange={setAuditType}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="internal" className="text-white hover:bg-[#2a3548]">Internal</SelectItem>
                  <SelectItem value="external" className="text-white hover:bg-[#2a3548]">External</SelectItem>
                  <SelectItem value="regulatory" className="text-white hover:bg-[#2a3548]">Regulatory</SelectItem>
                  <SelectItem value="it" className="text-white hover:bg-[#2a3548]">IT</SelectItem>
                  <SelectItem value="financial" className="text-white hover:bg-[#2a3548]">Financial</SelectItem>
                  <SelectItem value="operational" className="text-white hover:bg-[#2a3548]">Operational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm text-slate-400">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose and scope of this template..."
              className="bg-[#151d2e] border-[#2a3548] text-white h-20 mt-1"
            />
          </div>

          <div>
            <Label htmlFor="requirements" className="text-sm text-slate-400">Custom Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              placeholder="Any specific requirements, frameworks, or focus areas for this template..."
              className="bg-[#151d2e] border-[#2a3548] text-white h-20 mt-1"
            />
          </div>

          <Button
            onClick={generateTemplate}
            disabled={loading || !templateName || !auditType || !category}
            className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Template...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Template with AI
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}