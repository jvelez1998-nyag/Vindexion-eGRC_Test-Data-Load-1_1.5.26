import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const assessmentTypes = [
  { value: "it", label: "IT Risk" },
  { value: "operational", label: "Operational Risk" },
  { value: "security", label: "Security Risk" },
  { value: "financial", label: "Financial Risk" }
];

const riskCategories = [
  { value: "strategic", label: "Strategic" },
  { value: "operational", label: "Operational" },
  { value: "financial", label: "Financial" },
  { value: "compliance", label: "Compliance" },
  { value: "technology", label: "Technology" },
  { value: "cyber", label: "Cyber" },
  { value: "third_party", label: "Third Party" },
  { value: "reputational", label: "Reputational" }
];

const lifecycleStatuses = [
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "monitoring", label: "Monitoring" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" }
];

const treatments = [
  { value: "accept", label: "Accept" },
  { value: "mitigate", label: "Mitigate" },
  { value: "transfer", label: "Transfer" },
  { value: "avoid", label: "Avoid" }
];

const regulations = ["SOX", "GDPR", "PCI-DSS", "HIPAA", "SOC2", "ISO27001", "NIST", "CCPA", "GLBA", "FERPA", "FFIEC", "DORA", "EU AI Act"];

export default function AssessmentForm({ open, onOpenChange, assessment, onSubmit, isSubmitting, riskLibrary = [], controlLibrary }) {
  const [formData, setFormData] = useState({
    title: "",
    assessment_type: "",
    risk_category: "",
    risk_subcategory: "",
    description: "",
    business_process: "",
    asset_affected: "",
    inherent_likelihood: null,
    inherent_impact: null,
    control_effectiveness: null,
    residual_likelihood: null,
    residual_impact: null,
    risk_treatment: "",
    lifecycle_status: "draft",
    linked_controls: [],
    regulatory_mappings: [],
    owner: "",
    reviewer: "",
    review_date: "",
    next_review_date: "",
    notes: ""
  });

  useEffect(() => {
    if (assessment) {
      setFormData(assessment);
    } else {
      setFormData({
        title: "",
        assessment_type: "",
        risk_category: "",
        risk_subcategory: "",
        description: "",
        business_process: "",
        asset_affected: "",
        inherent_likelihood: null,
        inherent_impact: null,
        control_effectiveness: null,
        residual_likelihood: null,
        residual_impact: null,
        risk_treatment: "",
        lifecycle_status: "draft",
        linked_controls: [],
        regulatory_mappings: [],
        owner: "",
        reviewer: "",
        review_date: "",
        next_review_date: "",
        notes: ""
      });
    }
  }, [assessment, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleControl = (controlId) => {
    const current = formData.linked_controls || [];
    if (current.includes(controlId)) {
      handleChange('linked_controls', current.filter(id => id !== controlId));
    } else {
      handleChange('linked_controls', [...current, controlId]);
    }
  };

  const toggleRegulation = (reg) => {
    const current = formData.regulatory_mappings || [];
    if (current.includes(reg)) {
      handleChange('regulatory_mappings', current.filter(r => r !== reg));
    } else {
      handleChange('regulatory_mappings', [...current, reg]);
    }
  };

  const applyRiskFromLibrary = (riskId) => {
    const risk = riskLibrary.find(r => r.id === riskId);
    if (risk) {
      setFormData(prev => ({
        ...prev,
        title: prev.title || risk.name,
        description: prev.description || risk.description,
        risk_category: risk.category || prev.risk_category,
        risk_subcategory: risk.subcategory || prev.risk_subcategory,
        assessment_type: risk.risk_type || prev.assessment_type,
        regulatory_mappings: risk.regulatory_relevance || prev.regulatory_mappings,
        linked_controls: risk.suggested_controls || prev.linked_controls,
        linked_risk_library: riskId
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inherentScore = (formData.inherent_likelihood || 0) * (formData.inherent_impact || 0);
  const residualScore = (formData.residual_likelihood || 0) * (formData.residual_impact || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{assessment ? "Edit Assessment" : "New Risk Assessment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="basic" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Basic Info</TabsTrigger>
              <TabsTrigger value="scoring" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Risk Scoring</TabsTrigger>
              <TabsTrigger value="controls" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Controls</TabsTrigger>
              <TabsTrigger value="mappings" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Mappings</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh]">
              <TabsContent value="basic" className="px-6 space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required className="bg-[#151d2e] border-[#2a3548]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assessment Type *</Label>
                    <Select value={formData.assessment_type} onValueChange={(v) => handleChange("assessment_type", v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {assessmentTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#2a3548]">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Category *</Label>
                    <Select value={formData.risk_category} onValueChange={(v) => handleChange("risk_category", v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {riskCategories.map(c => <SelectItem key={c.value} value={c.value} className="text-white hover:bg-[#2a3548]">{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} rows={3} className="bg-[#151d2e] border-[#2a3548]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Process</Label>
                    <Input value={formData.business_process || ""} onChange={(e) => handleChange("business_process", e.target.value)} className="bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Affected</Label>
                    <Input value={formData.asset_affected || ""} onChange={(e) => handleChange("asset_affected", e.target.value)} className="bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lifecycle Status</Label>
                    <Select value={formData.lifecycle_status} onValueChange={(v) => handleChange("lifecycle_status", v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {lifecycleStatuses.map(s => <SelectItem key={s.value} value={s.value} className="text-white hover:bg-[#2a3548]">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Treatment</Label>
                    <Select value={formData.risk_treatment || ""} onValueChange={(v) => handleChange("risk_treatment", v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {treatments.map(t => <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#2a3548]">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scoring" className="px-6 space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <h4 className="text-sm font-medium text-indigo-400 mb-3">Link from Risk Library</h4>
                  <Select value={formData.linked_risk_library || ""} onValueChange={applyRiskFromLibrary}>
                    <SelectTrigger className="bg-[#1a2332] border-[#2a3548]"><SelectValue placeholder="Select a risk from library to auto-fill..." /></SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548] max-h-60">
                      {riskLibrary.length === 0 ? (
                        <div className="p-3 text-sm text-slate-500">No risks in library</div>
                      ) : (
                        riskLibrary.map(risk => (
                          <SelectItem key={risk.id} value={risk.id} className="text-white hover:bg-[#2a3548]">
                            <span className="font-medium">{risk.risk_id}</span> - {risk.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">Selecting a risk will auto-fill category, controls, and regulatory mappings</p>
                </div>

                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h4 className="text-sm font-medium text-white mb-4">Inherent Risk (Before Controls)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Likelihood (1-5)</Label>
                      <Select value={formData.inherent_likelihood?.toString() || ""} onValueChange={(v) => handleChange("inherent_likelihood", parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Rare","Unlikely","Possible","Likely","Almost Certain"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Impact (1-5)</Label>
                      <Select value={formData.inherent_impact?.toString() || ""} onValueChange={(v) => handleChange("inherent_impact", parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Negligible","Minor","Moderate","Major","Severe"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-slate-400">Inherent Score: </span>
                    <span className="font-bold text-white">{inherentScore || '-'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Control Effectiveness (1-5)</Label>
                  <Select value={formData.control_effectiveness?.toString() || ""} onValueChange={(v) => handleChange("control_effectiveness", parseInt(v))}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Very Low","Low","Moderate","High","Very High"][n-1]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h4 className="text-sm font-medium text-white mb-4">Residual Risk (After Controls)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Likelihood (1-5)</Label>
                      <Select value={formData.residual_likelihood?.toString() || ""} onValueChange={(v) => handleChange("residual_likelihood", parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Rare","Unlikely","Possible","Likely","Almost Certain"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Impact (1-5)</Label>
                      <Select value={formData.residual_impact?.toString() || ""} onValueChange={(v) => handleChange("residual_impact", parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Negligible","Minor","Moderate","Major","Severe"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-slate-400">Residual Score: </span>
                    <span className="font-bold text-white">{residualScore || '-'}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="controls" className="px-6 space-y-4 mt-4">
                <Label>Link Controls from Library</Label>
                {controlLibrary.length === 0 ? (
                  <p className="text-sm text-slate-500">No controls in library. Add controls to the Control Library first.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {controlLibrary.map(control => (
                      <div key={control.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-[#3a4558]">
                        <Checkbox 
                          checked={(formData.linked_controls || []).includes(control.id)}
                          onCheckedChange={() => toggleControl(control.id)}
                          className="border-[#2a3548]"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-white">{control.control_id} - {control.name}</p>
                          <p className="text-xs text-slate-500">{control.control_type} | {control.domain?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mappings" className="px-6 space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Regulatory Mappings</Label>
                  <div className="flex flex-wrap gap-2">
                    {regulations.map(reg => (
                      <Badge 
                        key={reg}
                        variant="outline"
                        className={`cursor-pointer transition-colors ${
                          (formData.regulatory_mappings || []).includes(reg) 
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' 
                            : 'bg-[#151d2e] text-slate-400 border-[#2a3548] hover:border-[#3a4558]'
                        }`}
                        onClick={() => toggleRegulation(reg)}
                      >
                        {reg}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Owner</Label>
                    <Input value={formData.owner || ""} onChange={(e) => handleChange("owner", e.target.value)} type="email" className="bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reviewer</Label>
                    <Input value={formData.reviewer || ""} onChange={(e) => handleChange("reviewer", e.target.value)} type="email" className="bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Review Date</Label>
                    <Input value={formData.review_date || ""} onChange={(e) => handleChange("review_date", e.target.value)} type="date" className="bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Review Date</Label>
                    <Input value={formData.next_review_date || ""} onChange={(e) => handleChange("next_review_date", e.target.value)} type="date" className="bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.notes || ""} onChange={(e) => handleChange("notes", e.target.value)} rows={3} className="bg-[#151d2e] border-[#2a3548]" />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-[#2a3548] text-white hover:bg-[#2a3548]">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? "Saving..." : assessment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}