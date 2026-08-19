import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const frameworks = [
  'SOX', 'SOC2', 'ISO27001', 'GDPR', 'PCI-DSS', 'HIPAA', 'NIST', 
  'COBIT', 'FFIEC', 'DORA', 'EU AI Act', 'CCPA', 'COSO', 'Basel III', 'Other'
];

const categories = [
  'access_control', 'data_protection', 'risk_management', 'incident_response',
  'business_continuity', 'vendor_management', 'audit_assurance', 'governance',
  'privacy', 'security_operations', 'compliance_monitoring', 'change_management',
  'asset_management', 'hr_security'
];

export default function GuidanceForm({ open, onOpenChange, guidance, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    framework: '',
    category: '',
    reference_id: '',
    description: '',
    requirements: '',
    implementation_tips: '',
    evidence_examples: '',
    related_controls: [],
    tags: [],
    status: 'active'
  });
  const [tagInput, setTagInput] = useState('');
  const [controlInput, setControlInput] = useState('');

  useEffect(() => {
    if (open) {
      if (guidance) {
        setFormData({
          title: guidance.title || '',
          framework: guidance.framework || '',
          category: guidance.category || '',
          reference_id: guidance.reference_id || '',
          description: guidance.description || '',
          requirements: guidance.requirements || '',
          implementation_tips: guidance.implementation_tips || '',
          evidence_examples: guidance.evidence_examples || '',
          related_controls: guidance.related_controls || [],
          tags: guidance.tags || [],
          status: guidance.status || 'active'
        });
      } else {
        setFormData({
          title: '',
          framework: '',
          category: '',
          reference_id: '',
          description: '',
          requirements: '',
          implementation_tips: '',
          evidence_examples: '',
          related_controls: [],
          tags: [],
          status: 'active'
        });
      }
      setTagInput('');
      setControlInput('');
    }
  }, [open, guidance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addControl = () => {
    if (controlInput.trim() && !formData.related_controls.includes(controlInput.trim())) {
      setFormData({ ...formData, related_controls: [...formData.related_controls, controlInput.trim()] });
      setControlInput('');
    }
  };

  const removeControl = (control) => {
    setFormData({ ...formData, related_controls: formData.related_controls.filter(c => c !== control) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{guidance ? 'Edit Guidance' : 'Add Guidance'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <div className="px-6">
              <TabsList className="w-full bg-[#151d2e] border border-[#2a3548]">
                <TabsTrigger value="basic" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Basic Info</TabsTrigger>
                <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Details</TabsTrigger>
                <TabsTrigger value="metadata" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Metadata</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[400px] px-6 mt-4">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div>
                  <Label className="text-slate-400">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Framework *</Label>
                    <Select value={formData.framework} onValueChange={(v) => setFormData({ ...formData, framework: v })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {frameworks.map(fw => (
                          <SelectItem key={fw} value={fw} className="text-white hover:bg-[#2a3548]">{fw}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400">Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="text-white hover:bg-[#2a3548] capitalize">
                            {cat.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Reference ID</Label>
                    <Input
                      value={formData.reference_id}
                      onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white mt-1"
                      placeholder="e.g., SOX 404, ISO A.9.1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="active" className="text-white hover:bg-[#2a3548]">Active</SelectItem>
                        <SelectItem value="draft" className="text-white hover:bg-[#2a3548]">Draft</SelectItem>
                        <SelectItem value="archived" className="text-white hover:bg-[#2a3548]">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-400">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white mt-1 h-24"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-0">
                <div>
                  <Label className="text-slate-400">Key Requirements</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white mt-1 h-28"
                    placeholder="List the key requirements for this guidance..."
                  />
                </div>

                <div>
                  <Label className="text-slate-400">Implementation Tips</Label>
                  <Textarea
                    value={formData.implementation_tips}
                    onChange={(e) => setFormData({ ...formData, implementation_tips: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white mt-1 h-28"
                    placeholder="Practical tips for implementing this guidance..."
                  />
                </div>

                <div>
                  <Label className="text-slate-400">Evidence Examples</Label>
                  <Textarea
                    value={formData.evidence_examples}
                    onChange={(e) => setFormData({ ...formData, evidence_examples: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white mt-1 h-28"
                    placeholder="Examples of evidence to demonstrate compliance..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4 mt-0">
                <div>
                  <Label className="text-slate-400">Related Controls</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={controlInput}
                      onChange={(e) => setControlInput(e.target.value)}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                      placeholder="Control ID"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addControl(); } }}
                    />
                    <Button type="button" onClick={addControl} variant="outline" className="border-[#2a3548] hover:bg-[#2a3548]">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.related_controls.map((control, i) => (
                      <Badge key={i} className="bg-[#151d2e] text-white border border-[#2a3548] gap-1">
                        {control}
                        <X className="h-3 w-3 cursor-pointer hover:text-rose-400" onClick={() => removeControl(control)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-400">Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                      placeholder="Add a tag"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="border-[#2a3548] hover:bg-[#2a3548]">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.tags.map((tag, i) => (
                      <Badge key={i} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer hover:text-rose-400" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {guidance ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}