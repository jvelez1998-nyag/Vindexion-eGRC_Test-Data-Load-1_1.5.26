import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, FileQuestion, Copy, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { toast } from "sonner";
import AssessmentTemplateBuilder from "@/components/assessments/AssessmentTemplateBuilder";
import BackButton from "@/components/navigation/BackButton";

export default function AssessmentConfiguration() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['assessment-templates'],
    queryFn: () => base44.entities.AssessmentTemplate.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AssessmentTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      setFormOpen(false);
      setEditingTemplate(null);
      toast.success("Template created");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AssessmentTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      setFormOpen(false);
      setEditingTemplate(null);
      toast.success("Template updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AssessmentTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      toast.success("Template deleted");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.AssessmentTemplate.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      toast.success("Status updated");
    }
  });

  const handleSubmit = (data) => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormOpen(true);
  };

  const handleDelete = (template) => {
    if (confirm(`Delete template "${template.name}"?`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const handleDuplicate = (template) => {
    const { id, created_date, updated_date, usage_count, ...rest } = template;
    createMutation.mutate({ ...rest, name: `${rest.name} (Copy)` });
  };

  const handleToggleActive = (template) => {
    toggleActiveMutation.mutate({ id: template.id, is_active: !template.is_active });
  };

  const filteredTemplates = templates.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.assessment_type?.toLowerCase().includes(search.toLowerCase())
  );

  const typeColors = {
    it: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    operational: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    security: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    financial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    vendor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    compliance: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  };

  return (
    <div className="p-6 bg-[#0f1623] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/Dashboard" />
        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-400" />
              Assessment Configuration
            </h1>
            <p className="text-slate-400 text-sm mt-1">Create and manage assessment templates, questionnaires, and workflows</p>
          </div>
          <Button onClick={() => { setEditingTemplate(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" /> Create Template
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="pl-10 bg-[#1a2332] border-[#2a3548] text-white" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <FileQuestion className="h-4 w-4" />
            {filteredTemplates.length} template{filteredTemplates.length !== 1 && 's'}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-[#1a2332] border-[#2a3548] p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
            <FileQuestion className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">{search ? "No templates found" : "No assessment templates yet"}</p>
            {!search && (
              <Button onClick={() => setFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Create First Template
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="bg-[#1a2332] border-[#2a3548] p-5 hover:border-[#3a4558] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg mb-1 truncate">{template.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2">{template.description || "No description"}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleToggleActive(template)} className="h-8 w-8 flex-shrink-0">
                    {template.is_active ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5 text-slate-600" />}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={`text-[10px] border ${typeColors[template.assessment_type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {template.assessment_type?.replace(/_/g, ' ')}
                  </Badge>
                  {template.is_active ? (
                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</Badge>
                  ) : (
                    <Badge className="text-[10px] bg-slate-500/10 text-slate-500 border-slate-500/20">Inactive</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="text-center p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                    <div className="text-slate-500">Questions</div>
                    <div className="text-white font-semibold">{template.questionnaire?.length || 0}</div>
                  </div>
                  <div className="text-center p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                    <div className="text-slate-500">Approvers</div>
                    <div className="text-white font-semibold">{template.approval_chain?.length || 0}</div>
                  </div>
                  <div className="text-center p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                    <div className="text-slate-500">Used</div>
                    <div className="text-white font-semibold">{template.usage_count || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template)} className="flex-1 border-[#2a3548] bg-[#151d2e] hover:bg-[#0f1623] text-white">
                    <Settings className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(template)} className="border-[#2a3548] hover:bg-[#2a3548]">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(template)} className="border-[#2a3548] hover:bg-rose-500/20 text-rose-400">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AssessmentTemplateBuilder
          open={formOpen}
          onOpenChange={setFormOpen}
          template={editingTemplate}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}