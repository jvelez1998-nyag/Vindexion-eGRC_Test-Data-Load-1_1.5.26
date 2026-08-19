import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, GripVertical, Settings, FileQuestion, Calculator, GitBranch, UserCheck, Calendar } from "lucide-react";
import { toast } from "sonner";

const assessmentTypes = [
  { value: "it", label: "IT Assessment" },
  { value: "operational", label: "Operational Assessment" },
  { value: "security", label: "Security Assessment" },
  { value: "financial", label: "Financial Assessment" },
  { value: "vendor", label: "Vendor Assessment" },
  { value: "compliance", label: "Compliance Assessment" }
];

const questionTypes = [
  { value: "text", label: "Text Input" },
  { value: "number", label: "Number" },
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "yes_no", label: "Yes/No" },
  { value: "rating", label: "Rating (1-5)" }
];

const workflowStages = ["draft", "in_progress", "review", "approved", "rejected", "completed"];

export default function AssessmentTemplateBuilder({ open, onOpenChange, template, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assessment_type: "",
    questionnaire: [],
    scoring_methodology: {
      calculation_method: "weighted_average",
      thresholds: { low: 25, medium: 50, high: 75, critical: 90 }
    },
    risk_criteria: {
      likelihood_scale: ["rare", "unlikely", "possible", "likely", "almost_certain"],
      impact_scale: ["negligible", "minor", "moderate", "major", "severe"]
    },
    workflow_config: {
      stages: workflowStages,
      auto_progress: false
    },
    approval_chain: [],
    schedule_config: {
      enabled: false,
      frequency: "annually",
      reminder_days: 7
    },
    is_active: true,
    owner: ""
  });

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "text",
    required: false,
    weight: 1,
    options: []
  });

  const [newApprover, setNewApprover] = useState("");

  useEffect(() => {
    if (open && template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        assessment_type: template.assessment_type || "",
        questionnaire: template.questionnaire || [],
        scoring_methodology: template.scoring_methodology || {
          calculation_method: "weighted_average",
          thresholds: { low: 25, medium: 50, high: 75, critical: 90 }
        },
        risk_criteria: template.risk_criteria || {
          likelihood_scale: ["rare", "unlikely", "possible", "likely", "almost_certain"],
          impact_scale: ["negligible", "minor", "moderate", "major", "severe"]
        },
        workflow_config: template.workflow_config || {
          stages: workflowStages,
          auto_progress: false
        },
        approval_chain: template.approval_chain || [],
        schedule_config: template.schedule_config || {
          enabled: false,
          frequency: "annually",
          reminder_days: 7
        },
        is_active: template.is_active !== false,
        owner: template.owner || ""
      });
    } else if (open) {
      setFormData({
        name: "",
        description: "",
        assessment_type: "",
        questionnaire: [],
        scoring_methodology: {
          calculation_method: "weighted_average",
          thresholds: { low: 25, medium: 50, high: 75, critical: 90 }
        },
        risk_criteria: {
          likelihood_scale: ["rare", "unlikely", "possible", "likely", "almost_certain"],
          impact_scale: ["negligible", "minor", "moderate", "major", "severe"]
        },
        workflow_config: {
          stages: workflowStages,
          auto_progress: false
        },
        approval_chain: [],
        schedule_config: {
          enabled: false,
          frequency: "annually",
          reminder_days: 7
        },
        is_active: true,
        owner: ""
      });
    }
  }, [open, template]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addQuestion = () => {
    if (!newQuestion.question) {
      toast.error("Question text is required");
      return;
    }
    setFormData(prev => ({
      ...prev,
      questionnaire: [...prev.questionnaire, { ...newQuestion, id: Date.now().toString() }]
    }));
    setNewQuestion({ question: "", type: "text", required: false, weight: 1, options: [] });
    toast.success("Question added");
  };

  const removeQuestion = (id) => {
    setFormData(prev => ({
      ...prev,
      questionnaire: prev.questionnaire.filter(q => q.id !== id)
    }));
  };

  const addApprover = () => {
    if (!newApprover || !newApprover.includes("@")) {
      toast.error("Valid email required");
      return;
    }
    setFormData(prev => ({
      ...prev,
      approval_chain: [...prev.approval_chain, newApprover]
    }));
    setNewApprover("");
  };

  const removeApprover = (idx) => {
    setFormData(prev => ({
      ...prev,
      approval_chain: prev.approval_chain.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400" />
            {template ? "Edit Assessment Template" : "Create Assessment Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="basic" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Basic</TabsTrigger>
              <TabsTrigger value="questionnaire" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Questionnaire</TabsTrigger>
              <TabsTrigger value="scoring" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Scoring</TabsTrigger>
              <TabsTrigger value="workflow" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Workflow</TabsTrigger>
              <TabsTrigger value="approval" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Approval</TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Schedule</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[55vh]">
              <TabsContent value="basic" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Template Name *</Label>
                  <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>

                <div>
                  <Label>Assessment Type *</Label>
                  <Select value={formData.assessment_type} onValueChange={(v) => handleChange("assessment_type", v)}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {assessmentTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#2a3548]">{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Owner</Label>
                  <Input type="email" value={formData.owner || ""} onChange={(e) => handleChange("owner", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="owner@company.com" />
                </div>
              </TabsContent>

              <TabsContent value="questionnaire" className="px-6 space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileQuestion className="h-4 w-4 text-indigo-400" />
                  <Label>Custom Questionnaire Builder</Label>
                </div>

                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <div className="space-y-3">
                    <Input value={newQuestion.question} onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})} placeholder="Enter question..." className="bg-[#0f1623] border-[#2a3548]" />
                    
                    <div className="grid grid-cols-3 gap-3">
                      <Select value={newQuestion.type} onValueChange={(v) => setNewQuestion({...newQuestion, type: v})}>
                        <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {questionTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#2a3548]">{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      
                      <Input type="number" value={newQuestion.weight} onChange={(e) => setNewQuestion({...newQuestion, weight: parseFloat(e.target.value)})} placeholder="Weight" className="bg-[#0f1623] border-[#2a3548]" />
                      
                      <Button type="button" onClick={addQuestion} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </Card>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {formData.questionnaire.map((q, idx) => (
                      <Card key={q.id} className="bg-[#151d2e] border-[#2a3548] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-slate-600 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm text-white">{idx + 1}. {q.question}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">{q.type}</Badge>
                                <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">Weight: {q.weight}</Badge>
                              </div>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="h-6 w-6 text-slate-400 hover:text-rose-400">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {formData.questionnaire.length === 0 && (
                      <p className="text-center text-slate-500 text-sm py-8">No questions added yet</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="scoring" className="px-6 space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-emerald-400" />
                  <Label>Scoring Methodology</Label>
                </div>

                <div>
                  <Label>Calculation Method</Label>
                  <Select value={formData.scoring_methodology.calculation_method} onValueChange={(v) => handleNestedChange("scoring_methodology", "calculation_method", v)}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="weighted_average" className="text-white hover:bg-[#2a3548]">Weighted Average</SelectItem>
                      <SelectItem value="sum" className="text-white hover:bg-[#2a3548]">Sum</SelectItem>
                      <SelectItem value="max" className="text-white hover:bg-[#2a3548]">Maximum Score</SelectItem>
                      <SelectItem value="custom" className="text-white hover:bg-[#2a3548]">Custom Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Risk Score Thresholds</Label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    <div>
                      <Label className="text-xs text-slate-500">Low (&lt;)</Label>
                      <Input type="number" value={formData.scoring_methodology.thresholds.low} onChange={(e) => handleNestedChange("scoring_methodology", "thresholds", {...formData.scoring_methodology.thresholds, low: parseInt(e.target.value)})} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Medium (&lt;)</Label>
                      <Input type="number" value={formData.scoring_methodology.thresholds.medium} onChange={(e) => handleNestedChange("scoring_methodology", "thresholds", {...formData.scoring_methodology.thresholds, medium: parseInt(e.target.value)})} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">High (&lt;)</Label>
                      <Input type="number" value={formData.scoring_methodology.thresholds.high} onChange={(e) => handleNestedChange("scoring_methodology", "thresholds", {...formData.scoring_methodology.thresholds, high: parseInt(e.target.value)})} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Critical (≥)</Label>
                      <Input type="number" value={formData.scoring_methodology.thresholds.critical} onChange={(e) => handleNestedChange("scoring_methodology", "thresholds", {...formData.scoring_methodology.thresholds, critical: parseInt(e.target.value)})} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Risk Criteria Customization</Label>
                  <div className="mt-2 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <p className="text-xs text-slate-500 mb-2">Likelihood Scale</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.risk_criteria.likelihood_scale.map((item, idx) => (
                        <Badge key={idx} className="bg-amber-500/10 text-amber-400 border-amber-500/20 capitalize">{item}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 mb-2">Impact Scale</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.risk_criteria.impact_scale.map((item, idx) => (
                        <Badge key={idx} className="bg-rose-500/10 text-rose-400 border-rose-500/20 capitalize">{item}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workflow" className="px-6 space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-violet-400" />
                  <Label>Workflow Configuration</Label>
                </div>

                <div>
                  <Label>Workflow Stages</Label>
                  <div className="mt-2 flex items-center gap-2">
                    {formData.workflow_config.stages.map((stage, idx) => (
                      <div key={idx} className="flex items-center">
                        <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 capitalize">{stage}</Badge>
                        {idx < formData.workflow_config.stages.length - 1 && <span className="mx-2 text-slate-600">→</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.workflow_config.auto_progress} onChange={(e) => handleNestedChange("workflow_config", "auto_progress", e.target.checked)} className="rounded border-[#2a3548]" />
                  <Label className="text-sm">Auto-progress to next stage on approval</Label>
                </div>
              </TabsContent>

              <TabsContent value="approval" className="px-6 space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <Label>Approval Chain Configuration</Label>
                </div>

                <div className="flex gap-2">
                  <Input type="email" value={newApprover} onChange={(e) => setNewApprover(e.target.value)} placeholder="approver@company.com" className="bg-[#151d2e] border-[#2a3548]" />
                  <Button type="button" onClick={addApprover} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {formData.approval_chain.map((email, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Level {idx + 1}</Badge>
                            <span className="text-sm text-white">{email}</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeApprover(idx)} className="h-6 w-6 text-slate-400 hover:text-rose-400">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {formData.approval_chain.length === 0 && (
                      <p className="text-center text-slate-500 text-sm py-8">No approvers added</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="schedule" className="px-6 space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <Label>Assessment Scheduling</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.schedule_config.enabled} onChange={(e) => handleNestedChange("schedule_config", "enabled", e.target.checked)} className="rounded border-[#2a3548]" />
                  <Label className="text-sm">Enable recurring assessments</Label>
                </div>

                {formData.schedule_config.enabled && (
                  <>
                    <div>
                      <Label>Frequency</Label>
                      <Select value={formData.schedule_config.frequency} onValueChange={(v) => handleNestedChange("schedule_config", "frequency", v)}>
                        <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          <SelectItem value="monthly" className="text-white hover:bg-[#2a3548]">Monthly</SelectItem>
                          <SelectItem value="quarterly" className="text-white hover:bg-[#2a3548]">Quarterly</SelectItem>
                          <SelectItem value="semi_annually" className="text-white hover:bg-[#2a3548]">Semi-Annually</SelectItem>
                          <SelectItem value="annually" className="text-white hover:bg-[#2a3548]">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Reminder (days before)</Label>
                      <Input type="number" value={formData.schedule_config.reminder_days} onChange={(e) => handleNestedChange("schedule_config", "reminder_days", parseInt(e.target.value))} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                    </div>
                  </>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">{isSubmitting ? "Saving..." : template ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}