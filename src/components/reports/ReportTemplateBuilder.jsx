import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Plus, Trash2, GripVertical, AlertTriangle, 
  FileCheck, Shield, ClipboardCheck, BarChart3, PieChart, Table
} from "lucide-react";

const sectionTypes = [
  { id: 'risk_summary', label: 'Risk Summary', icon: AlertTriangle, color: 'rose' },
  { id: 'risk_table', label: 'Risk Table', icon: Table, color: 'rose' },
  { id: 'compliance_summary', label: 'Compliance Summary', icon: FileCheck, color: 'emerald' },
  { id: 'compliance_table', label: 'Compliance Table', icon: Table, color: 'emerald' },
  { id: 'controls_summary', label: 'Controls Summary', icon: Shield, color: 'blue' },
  { id: 'controls_table', label: 'Controls Table', icon: Table, color: 'blue' },
  { id: 'audit_summary', label: 'Audit Summary', icon: ClipboardCheck, color: 'violet' },
  { id: 'audit_table', label: 'Audit Table', icon: Table, color: 'violet' },
  { id: 'risk_chart', label: 'Risk Chart', icon: PieChart, color: 'rose' },
  { id: 'compliance_chart', label: 'Compliance Chart', icon: BarChart3, color: 'emerald' },
  { id: 'heat_map', label: 'Risk Heat Map', icon: BarChart3, color: 'amber' },
];

export default function ReportTemplateBuilder({ open, onOpenChange, template, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sections: [],
    filters: {},
    layout: 'single',
    status: 'active'
  });

  useEffect(() => {
    if (open) {
      if (template) {
        setFormData({
          name: template.name || '',
          description: template.description || '',
          sections: template.sections || [],
          filters: template.filters || {},
          layout: template.layout || 'single',
          status: template.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          sections: [],
          filters: {},
          layout: 'single',
          status: 'active'
        });
      }
    }
  }, [open, template]);

  const addSection = (sectionType) => {
    const section = sectionTypes.find(s => s.id === sectionType);
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, {
        id: `${sectionType}_${Date.now()}`,
        type: sectionType,
        label: section?.label || sectionType,
        showTitle: true,
        filters: {}
      }]
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? { ...s, ...updates } : s)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            {template ? 'Edit Report Template' : 'Create Report Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] px-6">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400">Template Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"
                    placeholder="e.g., Monthly GRC Summary"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 bg-[#151d2e] border-[#2a3548] text-white h-20"
                    placeholder="Describe what this report contains..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Layout</Label>
                    <Select value={formData.layout} onValueChange={(v) => setFormData({ ...formData, layout: v })}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="single" className="text-white hover:bg-[#2a3548]">Single Column</SelectItem>
                        <SelectItem value="two-column" className="text-white hover:bg-[#2a3548]">Two Column</SelectItem>
                        <SelectItem value="dashboard" className="text-white hover:bg-[#2a3548]">Dashboard Grid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
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
              </div>

              {/* Report Sections */}
              <div>
                <Label className="text-slate-400 mb-3 block">Report Sections</Label>
                
                {/* Add Section */}
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] mb-4">
                  <p className="text-xs text-slate-500 mb-3">Add sections to your report:</p>
                  <div className="flex flex-wrap gap-2">
                    {sectionTypes.map(section => (
                      <Button
                        key={section.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSection(section.id)}
                        className={`gap-1.5 border-${section.color}-500/30 text-${section.color}-400 hover:bg-${section.color}-500/10 bg-transparent`}
                      >
                        <section.icon className="h-3.5 w-3.5" />
                        {section.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Section List */}
                <div className="space-y-2">
                  {formData.sections.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No sections added yet. Click buttons above to add sections.
                    </p>
                  ) : (
                    formData.sections.map((section, index) => {
                      const sectionType = sectionTypes.find(s => s.id === section.type);
                      const Icon = sectionType?.icon || FileText;
                      return (
                        <div
                          key={section.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]"
                        >
                          <GripVertical className="h-4 w-4 text-slate-600 cursor-grab" />
                          <div className={`p-1.5 rounded bg-${sectionType?.color || 'slate'}-500/10`}>
                            <Icon className={`h-4 w-4 text-${sectionType?.color || 'slate'}-400`} />
                          </div>
                          <div className="flex-1">
                            <Input
                              value={section.label}
                              onChange={(e) => updateSection(index, { label: e.target.value })}
                              className="h-8 bg-transparent border-none text-white text-sm p-0 focus-visible:ring-0"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={section.showTitle}
                              onCheckedChange={(checked) => updateSection(index, { showTitle: checked })}
                              className="border-[#2a3548]"
                            />
                            <span className="text-xs text-slate-500">Title</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSection(index)}
                            className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}