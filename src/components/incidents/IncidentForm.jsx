import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, FileCheck, X } from "lucide-react";
import AutoEnrichmentButton from "@/components/enrichment/AutoEnrichmentButton";

const incidentTypes = [
  { value: "security_breach", label: "Security Breach" },
  { value: "data_leak", label: "Data Leak" },
  { value: "system_outage", label: "System Outage" },
  { value: "policy_violation", label: "Policy Violation" },
  { value: "fraud", label: "Fraud" },
  { value: "compliance_breach", label: "Compliance Breach" },
  { value: "operational_failure", label: "Operational Failure" },
  { value: "third_party", label: "Third Party Incident" },
  { value: "physical_security", label: "Physical Security" },
  { value: "other", label: "Other" }
];

const severities = [
  { value: "critical", label: "Critical", color: "bg-rose-500" },
  { value: "high", label: "High", color: "bg-amber-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "low", label: "Low", color: "bg-emerald-500" }
];

const statuses = [
  { value: "reported", label: "Reported" },
  { value: "triaging", label: "Triaging" },
  { value: "investigating", label: "Investigating" },
  { value: "contained", label: "Contained" },
  { value: "remediated", label: "Remediated" },
  { value: "closed", label: "Closed" }
];

const priorities = [
  { value: "p1", label: "P1 - Critical" },
  { value: "p2", label: "P2 - High" },
  { value: "p3", label: "P3 - Medium" },
  { value: "p4", label: "P4 - Low" }
];

export default function IncidentForm({ open, onOpenChange, incident, onSubmit, isSubmitting, risks = [], controls = [], compliance = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    incident_type: "",
    severity: "",
    status: "reported",
    priority: "",
    reported_by: "",
    reported_date: new Date().toISOString().slice(0, 16),
    occurred_date: "",
    detected_date: "",
    assigned_to: "",
    department: "",
    affected_systems: [],
    affected_data: "",
    root_cause: "",
    impact_assessment: "",
    containment_actions: "",
    remediation_actions: "",
    lessons_learned: "",
    linked_risks: [],
    linked_controls: [],
    linked_compliance: [],
    regulatory_reportable: false,
    regulatory_reported: false
  });
  const [systemInput, setSystemInput] = useState("");

  useEffect(() => {
    if (open) {
      if (incident) {
        setFormData({
          ...incident,
          reported_date: incident.reported_date?.slice(0, 16) || "",
          occurred_date: incident.occurred_date?.slice(0, 16) || "",
          detected_date: incident.detected_date?.slice(0, 16) || "",
          linked_risks: incident.linked_risks || [],
          linked_controls: incident.linked_controls || [],
          linked_compliance: incident.linked_compliance || [],
          affected_systems: incident.affected_systems || []
        });
      } else {
        setFormData({
          title: "",
          description: "",
          incident_type: "",
          severity: "",
          status: "reported",
          priority: "",
          reported_by: "",
          reported_date: new Date().toISOString().slice(0, 16),
          occurred_date: "",
          detected_date: "",
          assigned_to: "",
          department: "",
          affected_systems: [],
          affected_data: "",
          root_cause: "",
          impact_assessment: "",
          containment_actions: "",
          remediation_actions: "",
          lessons_learned: "",
          linked_risks: [],
          linked_controls: [],
          linked_compliance: [],
          regulatory_reportable: false,
          regulatory_reported: false
        });
      }
    }
  }, [open, incident]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSystem = () => {
    if (systemInput.trim() && !formData.affected_systems.includes(systemInput.trim())) {
      handleChange('affected_systems', [...formData.affected_systems, systemInput.trim()]);
      setSystemInput("");
    }
  };

  const removeSystem = (system) => {
    handleChange('affected_systems', formData.affected_systems.filter(s => s !== system));
  };

  const toggleLink = (field, id) => {
    const current = formData[field] || [];
    if (current.includes(id)) {
      handleChange(field, current.filter(i => i !== id));
    } else {
      handleChange(field, [...current, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              {incident ? "Edit Incident" : "Report New Incident"}
            </DialogTitle>
            {incident && (
              <AutoEnrichmentButton
                entityType="incident"
                entity={incident}
                relatedData={{ risks, controls, compliance }}
                onUpdate={(id, updates) => {
                  setFormData(prev => ({ ...prev, ...updates }));
                }}
              />
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="details" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Details</TabsTrigger>
              <TabsTrigger value="investigation" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Investigation</TabsTrigger>
              <TabsTrigger value="links" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Links</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh]">
              <TabsContent value="details" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Brief incident title" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Incident Type *</Label>
                    <Select value={formData.incident_type} onValueChange={(v) => handleChange("incident_type", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {incidentTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#2a3548]">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Severity *</Label>
                    <Select value={formData.severity} onValueChange={(v) => handleChange("severity", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select severity" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {severities.map(s => <SelectItem key={s.value} value={s.value} className="text-white hover:bg-[#2a3548]">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {statuses.map(s => <SelectItem key={s.value} value={s.value} className="text-white hover:bg-[#2a3548]">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(v) => handleChange("priority", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select priority" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {priorities.map(p => <SelectItem key={p.value} value={p.value} className="text-white hover:bg-[#2a3548]">{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Detailed description of the incident..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reported By</Label>
                    <Input value={formData.reported_by} onChange={(e) => handleChange("reported_by", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div>
                    <Label>Assigned To</Label>
                    <Input value={formData.assigned_to} onChange={(e) => handleChange("assigned_to", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Occurred Date</Label>
                    <Input type="datetime-local" value={formData.occurred_date} onChange={(e) => handleChange("occurred_date", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div>
                    <Label>Detected Date</Label>
                    <Input type="datetime-local" value={formData.detected_date} onChange={(e) => handleChange("detected_date", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div>
                    <Label>Reported Date</Label>
                    <Input type="datetime-local" value={formData.reported_date} onChange={(e) => handleChange("reported_date", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>

                <div>
                  <Label>Affected Systems</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={systemInput} onChange={(e) => setSystemInput(e.target.value)} className="bg-[#151d2e] border-[#2a3548]" placeholder="Add system" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSystem(); } }} />
                    <Button type="button" onClick={addSystem} variant="outline" className="border-[#2a3548]">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.affected_systems.map((sys, i) => (
                      <Badge key={i} className="bg-[#151d2e] text-slate-300 border-[#2a3548] gap-1">
                        {sys}
                        <X className="h-3 w-3 cursor-pointer hover:text-rose-400" onClick={() => removeSystem(sys)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.regulatory_reportable} onCheckedChange={(c) => handleChange("regulatory_reportable", c)} className="border-[#2a3548]" />
                    <Label className="text-sm">Regulatory Reportable</Label>
                  </div>
                  {formData.regulatory_reportable && (
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.regulatory_reported} onCheckedChange={(c) => handleChange("regulatory_reported", c)} className="border-[#2a3548]" />
                      <Label className="text-sm">Reported to Regulator</Label>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="investigation" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Impact Assessment</Label>
                  <Textarea value={formData.impact_assessment} onChange={(e) => handleChange("impact_assessment", e.target.value)} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Assess the impact of the incident..." />
                </div>
                <div>
                  <Label>Root Cause</Label>
                  <Textarea value={formData.root_cause} onChange={(e) => handleChange("root_cause", e.target.value)} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Root cause analysis..." />
                </div>
                <div>
                  <Label>Containment Actions</Label>
                  <Textarea value={formData.containment_actions} onChange={(e) => handleChange("containment_actions", e.target.value)} rows={2} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Actions taken to contain..." />
                </div>
                <div>
                  <Label>Remediation Actions</Label>
                  <Textarea value={formData.remediation_actions} onChange={(e) => handleChange("remediation_actions", e.target.value)} rows={2} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Actions taken to remediate..." />
                </div>
                <div>
                  <Label>Lessons Learned</Label>
                  <Textarea value={formData.lessons_learned} onChange={(e) => handleChange("lessons_learned", e.target.value)} rows={2} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Key learnings..." />
                </div>
              </TabsContent>

              <TabsContent value="links" className="px-6 space-y-4 mt-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-rose-400" />Link to Risks</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    {risks.length === 0 ? <p className="text-sm text-slate-500">No risks available</p> : risks.map(risk => (
                      <div key={risk.id} className="flex items-center gap-2">
                        <Checkbox checked={(formData.linked_risks || []).includes(risk.id)} onCheckedChange={() => toggleLink('linked_risks', risk.id)} className="border-[#2a3548]" />
                        <span className="text-sm text-slate-300">{risk.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-blue-400" />Link to Controls</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    {controls.length === 0 ? <p className="text-sm text-slate-500">No controls available</p> : controls.map(control => (
                      <div key={control.id} className="flex items-center gap-2">
                        <Checkbox checked={(formData.linked_controls || []).includes(control.id)} onCheckedChange={() => toggleLink('linked_controls', control.id)} className="border-[#2a3548]" />
                        <span className="text-sm text-slate-300">{control.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2"><FileCheck className="h-4 w-4 text-emerald-400" />Link to Compliance</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    {compliance.length === 0 ? <p className="text-sm text-slate-500">No compliance requirements available</p> : compliance.map(comp => (
                      <div key={comp.id} className="flex items-center gap-2">
                        <Checkbox checked={(formData.linked_compliance || []).includes(comp.id)} onCheckedChange={() => toggleLink('linked_compliance', comp.id)} className="border-[#2a3548]" />
                        <span className="text-sm text-slate-300">{comp.framework} - {comp.requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? "Saving..." : incident ? "Update Incident" : "Report Incident"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}