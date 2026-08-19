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
import { Shield, Upload, X, ArrowRight, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import AutoEnrichmentButton from "@/components/enrichment/AutoEnrichmentButton";

const categories = [
  { value: "operational", label: "Operational" },
  { value: "financial", label: "Financial" },
  { value: "strategic", label: "Strategic" },
  { value: "compliance", label: "Compliance" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "reputational", label: "Reputational" }
];

const statuses = [
  { value: "identified", label: "Identified" },
  { value: "assessing", label: "Assessing" },
  { value: "mitigating", label: "Mitigating" },
  { value: "monitoring", label: "Monitoring" },
  { value: "closed", label: "Closed" }
];

export default function RiskForm({ open, onOpenChange, risk, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    inherent_likelihood: null,
    inherent_impact: null,
    residual_likelihood: null,
    residual_impact: null,
    likelihood: null,
    impact: null,
    risk_appetite: "",
    status: "identified",
    owner: "",
    mitigation_plan: "",
    due_date: "",
    linked_controls: [],
    attachments: []
  });
  const [uploading, setUploading] = useState(false);

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  useEffect(() => {
    if (open) {
      if (risk) {
        setFormData({
          title: risk.title || "",
          description: risk.description || "",
          category: risk.category || "",
          inherent_likelihood: risk.inherent_likelihood || null,
          inherent_impact: risk.inherent_impact || null,
          residual_likelihood: risk.residual_likelihood || null,
          residual_impact: risk.residual_impact || null,
          likelihood: risk.likelihood || null,
          impact: risk.impact || null,
          risk_appetite: risk.risk_appetite || "",
          status: risk.status || "identified",
          owner: risk.owner || "",
          mitigation_plan: risk.mitigation_plan || "",
          due_date: risk.due_date || "",
          linked_controls: risk.linked_controls || [],
          attachments: risk.attachments || []
        });
      } else {
        setFormData({
          title: "",
          description: "",
          category: "",
          inherent_likelihood: null,
          inherent_impact: null,
          residual_likelihood: null,
          residual_impact: null,
          likelihood: null,
          impact: null,
          risk_appetite: "",
          status: "identified",
          owner: "",
          mitigation_plan: "",
          due_date: "",
          linked_controls: [],
          attachments: []
        });
      }
    }
  }, [open, risk]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleControl = (controlId) => {
    setFormData(prev => ({
      ...prev,
      linked_controls: prev.linked_controls.includes(controlId)
        ? prev.linked_controls.filter(id => id !== controlId)
        : [...prev.linked_controls, controlId]
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
        attachments: [...prev.attachments, ...uploadedUrls]
      }));
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (url) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a !== url)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inherentScore = (formData.inherent_likelihood || 0) * (formData.inherent_impact || 0);
  const residualScore = (formData.residual_likelihood || 0) * (formData.residual_impact || 0);

  const getScoreColor = (score) => {
    if (score >= 16) return 'text-rose-400';
    if (score >= 9) return 'text-amber-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              {risk ? "Edit Risk" : "Add Risk"}
            </DialogTitle>
            {risk && (
              <AutoEnrichmentButton
                entityType="risk"
                entity={risk}
                relatedData={{ controls, incidents: [], compliance: [] }}
                onUpdate={(id, updates) => {
                  setFormData(prev => ({ ...prev, ...updates }));
                  toast.success("Applied AI enrichment");
                }}
              />
            )}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="basic" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Basic Info</TabsTrigger>
              <TabsTrigger value="scoring" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Risk Scoring</TabsTrigger>
              <TabsTrigger value="controls" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Controls</TabsTrigger>
              <TabsTrigger value="attachments" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Attachments</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh]">
              <TabsContent value="basic" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required className="mt-1 bg-[#151d2e] border-[#2a3548]" />
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
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {statuses.map(s => <SelectItem key={s.value} value={s.value} className="text-white hover:bg-[#2a3548]">{s.label}</SelectItem>)}
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
                    <Label>Due Date</Label>
                    <Input type="date" value={formData.due_date || ""} onChange={(e) => handleChange("due_date", e.target.value)} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>

                <div>
                  <Label>Risk Appetite Alignment</Label>
                  <Select value={formData.risk_appetite} onValueChange={(v) => handleChange("risk_appetite", v)}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select alignment" /></SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="within" className="text-white hover:bg-[#2a3548]">Within Appetite</SelectItem>
                      <SelectItem value="near" className="text-white hover:bg-[#2a3548]">Near Appetite Threshold</SelectItem>
                      <SelectItem value="exceeds" className="text-white hover:bg-[#2a3548]">Exceeds Appetite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Mitigation Plan</Label>
                  <Textarea value={formData.mitigation_plan || ""} onChange={(e) => handleChange("mitigation_plan", e.target.value)} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
              </TabsContent>

              <TabsContent value="scoring" className="px-6 space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Inherent Risk (Before Controls)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Likelihood (1-5)</Label>
                      <Select value={formData.inherent_likelihood?.toString() || ""} onValueChange={(v) => handleChange("inherent_likelihood", parseInt(v))}>
                        <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Rare","Unlikely","Possible","Likely","Almost Certain"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Impact (1-5)</Label>
                      <Select value={formData.inherent_impact?.toString() || ""} onValueChange={(v) => handleChange("inherent_impact", parseInt(v))}>
                        <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Negligible","Minor","Moderate","Major","Severe"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {inherentScore > 0 && (
                    <div className="mt-3 p-2 rounded bg-[#0f1623] border border-[#2a3548] text-center">
                      <span className="text-xs text-slate-500">Inherent Score: </span>
                      <span className={`text-lg font-bold ${getScoreColor(inherentScore)}`}>{inherentScore}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-slate-600" />
                </div>

                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    Residual Risk (After Controls)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Likelihood (1-5)</Label>
                      <Select value={formData.residual_likelihood?.toString() || ""} onValueChange={(v) => handleChange("residual_likelihood", parseInt(v))}>
                        <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Rare","Unlikely","Possible","Likely","Almost Certain"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Impact (1-5)</Label>
                      <Select value={formData.residual_impact?.toString() || ""} onValueChange={(v) => handleChange("residual_impact", parseInt(v))}>
                        <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()} className="text-white hover:bg-[#2a3548]">{n} - {["Negligible","Minor","Moderate","Major","Severe"][n-1]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {residualScore > 0 && (
                    <div className="mt-3 p-2 rounded bg-[#0f1623] border border-[#2a3548] text-center">
                      <span className="text-xs text-slate-500">Residual Score: </span>
                      <span className={`text-lg font-bold ${getScoreColor(residualScore)}`}>{residualScore}</span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="controls" className="px-6 space-y-4 mt-4">
                <Label className="text-sm text-slate-300">Link to Controls</Label>
                <ScrollArea className="h-72 rounded-lg bg-[#151d2e] border border-[#2a3548] p-3">
                  {controls.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No controls available</p>
                  ) : (
                    <div className="space-y-2">
                      {controls.map(control => (
                        <div key={control.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#2a3548] transition-colors">
                          <Checkbox checked={formData.linked_controls.includes(control.id)} onCheckedChange={() => toggleControl(control.id)} className="border-[#2a3548]" />
                          <div className="flex-1">
                            <p className="text-sm text-white">{control.name}</p>
                            <p className="text-xs text-slate-500">{control.domain?.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {formData.linked_controls.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <Shield className="h-4 w-4" />
                    {formData.linked_controls.length} control(s) linked
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attachments" className="px-6 space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-slate-300">Upload Documents</Label>
                  <div className="mt-2 border-2 border-dashed border-[#2a3548] rounded-lg p-6 text-center hover:border-indigo-500/50 transition-colors">
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" disabled={uploading} />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">{uploading ? "Uploading..." : "Click to upload files"}</p>
                      <p className="text-xs text-slate-600 mt-1">Any file type supported</p>
                    </label>
                  </div>
                </div>

                {formData.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm text-slate-300">Attached Files ({formData.attachments.length})</Label>
                    <div className="mt-2 space-y-2">
                      {formData.attachments.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-400" />
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-indigo-400 transition-colors truncate">
                              {url.split('/').pop()?.substring(0, 40) || `Document ${idx + 1}`}
                            </a>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeAttachment(url)} className="h-6 w-6 text-slate-400 hover:text-rose-400">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">{isSubmitting ? "Saving..." : risk ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}