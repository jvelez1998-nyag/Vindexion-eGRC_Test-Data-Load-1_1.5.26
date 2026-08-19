import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Shield, Upload, X, AlertTriangle, FileText, History } from "lucide-react";
import { toast } from "sonner";
import AutoEnrichmentButton from "@/components/enrichment/AutoEnrichmentButton";

const categories = [
  { value: "preventive", label: "Preventive" },
  { value: "detective", label: "Detective" },
  { value: "corrective", label: "Corrective" },
  { value: "directive", label: "Directive" }
];

const domains = [
  { value: "access_control", label: "Access Control" },
  { value: "data_protection", label: "Data Protection" },
  { value: "network_security", label: "Network Security" },
  { value: "incident_response", label: "Incident Response" },
  { value: "business_continuity", label: "Business Continuity" },
  { value: "vendor_management", label: "Vendor Management" },
  { value: "physical_security", label: "Physical Security" },
  { value: "hr_security", label: "HR Security" }
];

const statuses = [
  { value: "planned", label: "Planned" },
  { value: "implemented", label: "Implemented" },
  { value: "effective", label: "Effective" },
  { value: "ineffective", label: "Ineffective" },
  { value: "retired", label: "Retired" }
];

const frequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annually", label: "Semi-Annually" },
  { value: "annually", label: "Annually" }
];

const regulations = [
  "SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", "HIPAA", "NIST", "COBIT", "FFIEC", "DORA", "CCPA", "COSO"
];

export default function ControlForm({ open, onOpenChange, control, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    control_objective: "",
    description: "",
    control_procedures: "",
    category: "",
    domain: "",
    status: "planned",
    effectiveness: null,
    owner: "",
    tester: "",
    implementation_date: "",
    review_frequency: "",
    last_tested_date: "",
    linked_risks: [],
    regulatory_mappings: [],
    framework_mappings: {
      COSO: [],
      COBIT: [],
      ISO27001: [],
      NIST: [],
      SOX: []
    },
    evidence_urls: []
  });
  const [uploading, setUploading] = useState(false);

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  useEffect(() => {
    if (open) {
      if (control) {
        setFormData({
          name: control.name || "",
          control_objective: control.control_objective || "",
          description: control.description || "",
          control_procedures: control.control_procedures || "",
          category: control.category || "",
          domain: control.domain || "",
          status: control.status || "planned",
          effectiveness: control.effectiveness || null,
          owner: control.owner || "",
          tester: control.tester || "",
          implementation_date: control.implementation_date || "",
          review_frequency: control.review_frequency || "",
          last_tested_date: control.last_tested_date || "",
          linked_risks: control.linked_risks || [],
          regulatory_mappings: control.regulatory_mappings || [],
          framework_mappings: control.framework_mappings || {
            COSO: [],
            COBIT: [],
            ISO27001: [],
            NIST: [],
            SOX: []
          },
          evidence_urls: control.evidence_urls || []
        });
      } else {
        setFormData({
          name: "",
          control_objective: "",
          description: "",
          control_procedures: "",
          category: "",
          domain: "",
          status: "planned",
          effectiveness: null,
          owner: "",
          tester: "",
          implementation_date: "",
          review_frequency: "",
          last_tested_date: "",
          linked_risks: [],
          regulatory_mappings: [],
          framework_mappings: {
            COSO: [],
            COBIT: [],
            ISO27001: [],
            NIST: [],
            SOX: []
          },
          evidence_urls: []
        });
      }
    }
  }, [open, control]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      // Track version history when updating
      if (control && field !== 'version_history') {
        const versionEntry = {
          date: new Date().toISOString(),
          field,
          old_value: control[field],
          new_value: value,
          updated_by: 'Current User'
        };
        return {
          ...prev,
          [field]: value,
          version_history: [...(prev.version_history || []), versionEntry]
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const toggleRisk = (riskId) => {
    setFormData(prev => ({
      ...prev,
      linked_risks: prev.linked_risks.includes(riskId)
        ? prev.linked_risks.filter(id => id !== riskId)
        : [...prev.linked_risks, riskId]
    }));
  };

  const toggleRegulation = (regulation) => {
    setFormData(prev => ({
      ...prev,
      regulatory_mappings: prev.regulatory_mappings.includes(regulation)
        ? prev.regulatory_mappings.filter(r => r !== regulation)
        : [...prev.regulatory_mappings, regulation]
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setFormData(prev => ({
        ...prev,
        evidence_urls: [...prev.evidence_urls, ...uploadedUrls]
      }));
      toast.success(`${files.length} evidence file(s) uploaded`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeEvidence = (url) => {
    setFormData(prev => ({
      ...prev,
      evidence_urls: prev.evidence_urls.filter(e => e !== url)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              {control ? "Edit Control" : "Add Control"}
            </DialogTitle>
            {control && (
              <AutoEnrichmentButton
                entityType="control"
                entity={control}
                relatedData={{ risks, controls: [], incidents: [] }}
                onUpdate={(id, updates) => {
                  setFormData(prev => ({ ...prev, ...updates }));
                }}
              />
            )}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="basic" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Basic Info</TabsTrigger>
              <TabsTrigger value="procedures" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Procedures</TabsTrigger>
              <TabsTrigger value="linkage" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Risk & Compliance</TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Evidence</TabsTrigger>
              {control?.version_history?.length > 0 && (
                <TabsTrigger value="history" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">History</TabsTrigger>
              )}
            </TabsList>

            <ScrollArea className="h-[50vh]">
              <TabsContent value="basic" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Control Name *</Label>
                  <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>

                <div>
                  <Label>Control Objective</Label>
                  <Textarea value={formData.control_objective || ""} onChange={(e) => handleChange("control_objective", e.target.value)} rows={2} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="State the objective this control aims to achieve..." />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {categories.map(c => <SelectItem key={c.value} value={c.value} className="text-white hover:bg-[#2a3548]">{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Domain *</Label>
                    <Select value={formData.domain} onValueChange={(v) => handleChange("domain", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {domains.map(d => <SelectItem key={d.value} value={d.value} className="text-white hover:bg-[#2a3548]">{d.label}</SelectItem>)}
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
                    <Label>Effectiveness (1-5)</Label>
                    <Select value={formData.effectiveness?.toString() || ""} onValueChange={(v) => handleChange("effectiveness", parseInt(v))}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Rate" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Very Low","Low","Medium","High","Very High"][n-1]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Owner</Label>
                    <Input type="email" value={formData.owner || ""} onChange={(e) => handleChange("owner", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="owner@company.com" />
                  </div>
                  <div>
                    <Label>Tester</Label>
                    <Input type="email" value={formData.tester || ""} onChange={(e) => handleChange("tester", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="tester@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Implementation Date</Label>
                    <Input type="date" value={formData.implementation_date || ""} onChange={(e) => handleChange("implementation_date", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div>
                    <Label>Review Frequency</Label>
                    <Select value={formData.review_frequency || ""} onValueChange={(v) => handleChange("review_frequency", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {frequencies.map(f => <SelectItem key={f.value} value={f.value} className="text-white hover:bg-[#2a3548]">{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Last Tested</Label>
                    <Input type="date" value={formData.last_tested_date || ""} onChange={(e) => handleChange("last_tested_date", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="procedures" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Control Procedures</Label>
                  <Textarea value={formData.control_procedures || ""} onChange={(e) => handleChange("control_procedures", e.target.value)} rows={12} className="mt-1 bg-[#151d2e] border-[#2a3548]" placeholder="Detailed step-by-step procedures for implementing and executing this control..." />
                </div>
              </TabsContent>

              <TabsContent value="linkage" className="px-6 space-y-4 mt-4">
                <div>
                  <Label className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-400" />Link to Risks</Label>
                  <ScrollArea className="h-48 mt-2 rounded-lg bg-[#151d2e] border border-[#2a3548] p-3">
                    {risks.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No risks available</p>
                    ) : (
                      <div className="space-y-2">
                        {risks.map(risk => (
                          <div key={risk.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#2a3548]">
                            <Checkbox checked={formData.linked_risks.includes(risk.id)} onCheckedChange={() => toggleRisk(risk.id)} className="border-[#2a3548]" />
                            <span className="text-sm text-white">{risk.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  {formData.linked_risks.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-rose-400">
                      <AlertTriangle className="h-4 w-4" />
                      {formData.linked_risks.length} risk(s) linked
                    </div>
                  )}
                </div>

                <div>
                  <Label>Regulatory Requirement Mapping</Label>
                  <div className="mt-2 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex flex-wrap gap-2">
                      {regulations.map(reg => (
                        <Badge key={reg} onClick={() => toggleRegulation(reg)} className={`cursor-pointer ${formData.regulatory_mappings.includes(reg) ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-[#0f1623] text-slate-400 border-[#2a3548]'}`}>
                          {reg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {formData.regulatory_mappings.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2">{formData.regulatory_mappings.length} regulation(s) mapped</p>
                  )}
                </div>

                <div>
                  <Label>Framework Mappings</Label>
                  <p className="text-xs text-slate-500 mb-3">Map this control to specific framework control IDs</p>
                  <div className="space-y-3">
                    {['COSO', 'COBIT', 'ISO27001', 'NIST', 'SOX'].map(framework => (
                      <div key={framework}>
                        <Label className="text-xs text-slate-400 mb-1 block">{framework}</Label>
                        <Input
                          value={(formData.framework_mappings?.[framework] || []).join(', ')}
                          onChange={(e) => {
                            const ids = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setFormData(prev => ({
                              ...prev,
                              framework_mappings: {
                                ...prev.framework_mappings,
                                [framework]: ids
                              }
                            }));
                          }}
                          className="bg-[#151d2e] border-[#2a3548] text-sm"
                          placeholder={`e.g., ${framework === 'COSO' ? 'CC1.1, CC1.2' : framework === 'COBIT' ? 'DSS05.01, APO13.01' : framework === 'ISO27001' ? 'A.9.1.1, A.9.2.1' : framework === 'NIST' ? 'AC-1, AC-2' : 'SOX-404, SOX-302'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Evidence Repository</Label>
                  <div className="mt-2 border-2 border-dashed border-[#2a3548] rounded-lg p-6 text-center hover:border-indigo-500/50 transition-colors">
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" id="evidence-upload" disabled={uploading} />
                    <label htmlFor="evidence-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">{uploading ? "Uploading..." : "Upload evidence files"}</p>
                      <p className="text-xs text-slate-600 mt-1">All file types supported</p>
                    </label>
                  </div>
                </div>

                {formData.evidence_urls.length > 0 && (
                  <div>
                    <Label>Uploaded Evidence ({formData.evidence_urls.length})</Label>
                    <div className="mt-2 space-y-2">
                      {formData.evidence_urls.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-400" />
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-indigo-400 truncate">
                              {url.split('/').pop()?.substring(0, 40) || `Evidence ${idx + 1}`}
                            </a>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeEvidence(url)} className="h-6 w-6 text-slate-400 hover:text-rose-400">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {control?.version_history?.length > 0 && (
                <TabsContent value="history" className="px-6 space-y-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="h-4 w-4 text-slate-400" />
                    <Label>Version History</Label>
                  </div>
                  <ScrollArea className="h-72">
                    <div className="space-y-2">
                      {control.version_history.slice().reverse().map((entry, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-indigo-400">{entry.field?.replace(/_/g, ' ')}</span>
                            <span className="text-xs text-slate-500">{new Date(entry.date).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            <span className="text-rose-400">- {entry.old_value || 'None'}</span>
                            <span className="mx-2">→</span>
                            <span className="text-emerald-400">+ {entry.new_value}</span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">by {entry.updated_by}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">{isSubmitting ? "Saving..." : control ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}