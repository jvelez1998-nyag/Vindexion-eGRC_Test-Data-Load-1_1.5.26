import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Sparkles, Brain, CheckCircle2, AlertTriangle, Loader2, Shield, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AuditProgramBuilder({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    audit_type: "internal",
    framework: "",
    industry: "",
    description: "",
    objectives: [],
    scope: "",
    procedures: [],
    testing_worksheets: [],
    sampling_criteria: {},
    estimated_hours: 0,
    is_template: true
  });
  const [newObjective, setNewObjective] = useState("");
  const [newProcedure, setNewProcedure] = useState({ title: "", description: "", estimated_hours: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [useAI, setUseAI] = useState(false);

  const queryClient = useQueryClient();

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list(),
    enabled: open
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list(),
    enabled: open
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditProgram.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-programs'] });
      onOpenChange(false);
      toast.success("Program created");
    }
  });

  const addObjective = () => {
    if (newObjective) {
      setFormData(prev => ({ ...prev, objectives: [...prev.objectives, newObjective] }));
      setNewObjective("");
    }
  };

  const addProcedure = () => {
    if (newProcedure.title) {
      setFormData(prev => ({ ...prev, procedures: [...prev.procedures, { ...newProcedure, id: Date.now().toString() }] }));
      setNewProcedure({ title: "", description: "", estimated_hours: 0 });
    }
  };

  const generateAIProgram = async () => {
    if (!formData.audit_type || !formData.framework) {
      toast.error("Please select audit type and framework");
      return;
    }

    setIsGenerating(true);
    try {
      // Analyze relevant risks
      const relevantRisks = risks.filter(r => {
        const riskScore = (r.likelihood || 0) * (r.impact || 0);
        return riskScore >= 15; // High and critical risks
      });

      // Analyze relevant controls
      const relevantControls = controls.filter(c => {
        if (formData.framework === "SOX") return c.framework_mappings?.SOX?.length > 0;
        if (formData.framework === "NIST") return c.framework_mappings?.NIST?.length > 0;
        if (formData.framework === "COSO") return c.framework_mappings?.COSO?.length > 0;
        if (formData.framework === "ISO27001") return c.framework_mappings?.ISO27001?.length > 0;
        return true;
      });

      const prompt = `Generate a comprehensive audit program for the following specifications:

AUDIT DETAILS:
- Audit Type: ${formData.audit_type}
- Framework: ${formData.framework}
- Industry: ${formData.industry || "General"}
- Scope: ${formData.scope || "Standard audit scope"}

RISK CONTEXT (${relevantRisks.length} high/critical risks identified):
${relevantRisks.slice(0, 10).map(r => `- ${r.title} (Likelihood: ${r.likelihood}, Impact: ${r.impact}, Category: ${r.category})`).join('\n')}

CONTROL CONTEXT (${relevantControls.length} relevant controls):
${relevantControls.slice(0, 10).map(c => `- ${c.name} (Domain: ${c.domain}, Status: ${c.status})`).join('\n')}

Generate a detailed audit program that includes:
1. Program name and description
2. 5-8 specific audit objectives aligned with the framework
3. Detailed audit procedures (8-15) with:
   - Procedure title
   - Step-by-step description
   - Estimated hours
   - Testing approach
   - Required documentation
4. Testing worksheets (3-5) with sample fields
5. Sampling criteria recommendations
6. Total estimated hours

Consider:
- Framework-specific requirements (${formData.framework})
- Industry best practices for ${formData.industry || "general industries"}
- Identified risks (focus on high-severity areas)
- Existing control environment
- Documentation standards

Return as JSON:
{
  "name": "string",
  "description": "string",
  "objectives": ["objective1", "objective2", ...],
  "procedures": [
    {
      "title": "string",
      "description": "detailed step-by-step description",
      "estimated_hours": number,
      "testing_approach": "string",
      "documentation_required": "string",
      "linked_controls": ["control_id1", "control_id2"],
      "risk_areas": ["risk_area1", "risk_area2"]
    }
  ],
  "testing_worksheets": [
    {
      "name": "string",
      "purpose": "string",
      "fields": ["field1", "field2", ...]
    }
  ],
  "sampling_criteria": {
    "approach": "string",
    "sample_size": "string",
    "selection_method": "string"
  },
  "estimated_hours": number,
  "key_risks_addressed": ["risk1", "risk2", ...],
  "framework_alignment": "explanation"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            objectives: { type: "array", items: { type: "string" } },
            procedures: { type: "array" },
            testing_worksheets: { type: "array" },
            sampling_criteria: { type: "object" },
            estimated_hours: { type: "number" },
            key_risks_addressed: { type: "array" },
            framework_alignment: { type: "string" }
          }
        }
      });

      setAiSuggestions(response);
      setUseAI(true);
      toast.success("AI program generated successfully");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate audit program");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAISuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        name: aiSuggestions.name || prev.name,
        description: aiSuggestions.description || prev.description,
        objectives: aiSuggestions.objectives || prev.objectives,
        procedures: (aiSuggestions.procedures || []).map((proc, idx) => ({
          ...proc,
          id: Date.now().toString() + idx
        })),
        testing_worksheets: aiSuggestions.testing_worksheets || prev.testing_worksheets,
        sampling_criteria: aiSuggestions.sampling_criteria || prev.sampling_criteria,
        estimated_hours: aiSuggestions.estimated_hours || prev.estimated_hours
      }));
      setStep(2);
      toast.success("AI suggestions applied");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  useEffect(() => {
    if (!open) {
      setStep(1);
      setFormData({
        name: "",
        audit_type: "internal",
        framework: "",
        industry: "",
        description: "",
        objectives: [],
        scope: "",
        procedures: [],
        testing_worksheets: [],
        sampling_criteria: {},
        estimated_hours: 0,
        is_template: true
      });
      setAiSuggestions(null);
      setUseAI(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-400" />
            AI-Powered Audit Program Builder
            <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">INTELLIGENT</Badge>
          </DialogTitle>
          <p className="text-sm text-slate-400">Step {step} of 2: {step === 1 ? 'Configuration & AI Generation' : 'Review & Customize'}</p>
        </DialogHeader>

        <Tabs value={step === 1 ? "config" : "review"} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-[#151d2e]">
            <TabsTrigger value="config" disabled={step !== 1}>
              <Shield className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="review" disabled={step !== 2}>
              <FileText className="h-4 w-4 mr-2" />
              Review Program
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Configuration & AI Generation */}
          <TabsContent value="config" className="space-y-4 mt-4">
            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Audit Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Audit Type *</Label>
                    <Select value={formData.audit_type} onValueChange={(v) => setFormData({...formData, audit_type: v})}>
                      <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="internal" className="text-white">Internal Audit</SelectItem>
                        <SelectItem value="external" className="text-white">External Audit</SelectItem>
                        <SelectItem value="regulatory" className="text-white">Regulatory Audit</SelectItem>
                        <SelectItem value="it" className="text-white">IT Audit</SelectItem>
                        <SelectItem value="financial" className="text-white">Financial Audit</SelectItem>
                        <SelectItem value="operational" className="text-white">Operational Audit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Framework *</Label>
                    <Select value={formData.framework} onValueChange={(v) => setFormData({...formData, framework: v})}>
                      <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="COSO" className="text-white">COSO</SelectItem>
                        <SelectItem value="NIST" className="text-white">NIST CSF</SelectItem>
                        <SelectItem value="SOX" className="text-white">SOX (Sarbanes-Oxley)</SelectItem>
                        <SelectItem value="ISO27001" className="text-white">ISO 27001</SelectItem>
                        <SelectItem value="COBIT" className="text-white">COBIT</SelectItem>
                        <SelectItem value="SOC2" className="text-white">SOC 2</SelectItem>
                        <SelectItem value="FFIEC" className="text-white">FFIEC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Industry</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData({...formData, industry: v})}>
                      <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="financial_services" className="text-white">Financial Services</SelectItem>
                        <SelectItem value="healthcare" className="text-white">Healthcare</SelectItem>
                        <SelectItem value="technology" className="text-white">Technology</SelectItem>
                        <SelectItem value="manufacturing" className="text-white">Manufacturing</SelectItem>
                        <SelectItem value="retail" className="text-white">Retail</SelectItem>
                        <SelectItem value="energy" className="text-white">Energy</SelectItem>
                        <SelectItem value="government" className="text-white">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Program Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="Auto-generated by AI" 
                      className="mt-1 bg-[#0f1623] border-[#2a3548]" 
                    />
                  </div>
                </div>

                <div>
                  <Label>Scope</Label>
                  <Textarea 
                    value={formData.scope} 
                    onChange={(e) => setFormData({...formData, scope: e.target.value})} 
                    rows={2} 
                    placeholder="Describe audit scope..."
                    className="mt-1 bg-[#0f1623] border-[#2a3548]" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Risk Context */}
            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1">Risk Context Available</h4>
                    <p className="text-xs text-slate-400 mb-2">
                      {risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 15).length} high/critical risks identified in Risk Management module
                    </p>
                    <p className="text-xs text-slate-500">
                      AI will analyze these risks to suggest relevant audit procedures and controls
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Generation */}
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet-400" />
                    <h4 className="text-sm font-semibold text-white">AI Program Generation</h4>
                  </div>
                  <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">POWERED BY AI</Badge>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Generate a comprehensive audit program with objectives, procedures, testing worksheets, and documentation requirements based on your configuration and identified risks.
                </p>
                <Button 
                  onClick={generateAIProgram}
                  disabled={isGenerating || !formData.audit_type || !formData.framework}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  type="button"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating AI Program...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* AI Results */}
            {aiSuggestions && (
              <Card className="bg-[#151d2e] border-emerald-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      AI Program Generated
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-400">Ready</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{aiSuggestions.name}</h4>
                    <p className="text-xs text-slate-400">{aiSuggestions.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Objectives</div>
                      <div className="text-lg font-bold text-white">{aiSuggestions.objectives?.length || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Procedures</div>
                      <div className="text-lg font-bold text-white">{aiSuggestions.procedures?.length || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Est. Hours</div>
                      <div className="text-lg font-bold text-white">{aiSuggestions.estimated_hours || 0}h</div>
                    </div>
                  </div>

                  {aiSuggestions.key_risks_addressed && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <div className="text-xs font-semibold text-rose-400 mb-2">Key Risks Addressed:</div>
                      <div className="flex flex-wrap gap-1">
                        {aiSuggestions.key_risks_addressed.slice(0, 5).map((risk, i) => (
                          <Badge key={i} className="bg-rose-500/20 text-rose-400 text-[10px]">{risk}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={applyAISuggestions}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    type="button"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Apply & Review Program
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Step 2: Review & Customize */}
          <TabsContent value="review" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Program Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Program Name *</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                      className="mt-1 bg-[#0f1623] border-[#2a3548]" 
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      rows={2} 
                      className="mt-1 bg-[#0f1623] border-[#2a3548]" 
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Objectives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      value={newObjective} 
                      onChange={(e) => setNewObjective(e.target.value)} 
                      placeholder="Add objective" 
                      className="bg-[#0f1623] border-[#2a3548]" 
                    />
                    <Button type="button" onClick={addObjective} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#0f1623] border border-[#2a3548] rounded-lg">
                        <span className="text-sm text-white">{obj}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setFormData({...formData, objectives: formData.objectives.filter((_, idx) => idx !== i)})} 
                          className="h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Audit Procedures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Card className="bg-[#0f1623] border-[#2a3548] p-3">
                    <Input 
                      value={newProcedure.title} 
                      onChange={(e) => setNewProcedure({...newProcedure, title: e.target.value})} 
                      placeholder="Procedure title" 
                      className="mb-2 bg-[#151d2e] border-[#2a3548]" 
                    />
                    <Textarea 
                      value={newProcedure.description} 
                      onChange={(e) => setNewProcedure({...newProcedure, description: e.target.value})} 
                      placeholder="Description" 
                      rows={2} 
                      className="mb-2 bg-[#151d2e] border-[#2a3548]" 
                    />
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={newProcedure.estimated_hours} 
                        onChange={(e) => setNewProcedure({...newProcedure, estimated_hours: parseFloat(e.target.value)})} 
                        placeholder="Hours" 
                        className="bg-[#151d2e] border-[#2a3548]" 
                      />
                      <Button type="button" onClick={addProcedure} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                  
                  <div className="space-y-2">
                    {formData.procedures.map((proc, i) => (
                      <Card key={proc.id} className="bg-[#0f1623] border-[#2a3548] p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white mb-1">{proc.title}</p>
                            <p className="text-xs text-slate-400 mb-2">{proc.description}</p>
                            {proc.testing_approach && (
                              <Badge className="text-[10px] bg-blue-500/10 text-blue-400 mr-2">
                                {proc.testing_approach}
                              </Badge>
                            )}
                            {proc.documentation_required && (
                              <Badge className="text-[10px] bg-violet-500/10 text-violet-400">
                                Docs: {proc.documentation_required}
                              </Badge>
                            )}
                            <p className="text-xs text-slate-500 mt-2">{proc.estimated_hours}h</p>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setFormData({...formData, procedures: formData.procedures.filter((_, idx) => idx !== i)})} 
                            className="h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {formData.testing_worksheets?.length > 0 && (
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base">Testing Worksheets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {formData.testing_worksheets.map((ws, i) => (
                      <div key={i} className="p-3 bg-[#0f1623] border border-[#2a3548] rounded-lg">
                        <h4 className="text-sm font-semibold text-white mb-1">{ws.name}</h4>
                        <p className="text-xs text-slate-400 mb-2">{ws.purpose}</p>
                        {ws.fields && (
                          <div className="flex flex-wrap gap-1">
                            {ws.fields.map((field, j) => (
                              <Badge key={j} className="text-[10px] bg-indigo-500/10 text-indigo-400">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-[#2a3548]">
                  Back
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Create Program
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}