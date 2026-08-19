import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Plus, Save, Trash2, GripVertical, Eye, 
  BarChart3, PieChart, Table, FileText, Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function AdvancedTemplateBuilder({ data, onTemplateSelect }) {
  const [template, setTemplate] = useState({
    name: "",
    description: "",
    sections: []
  });
  const [editMode, setEditMode] = useState(true);

  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: (templateData) => base44.entities.ReportTemplate.create(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
      toast.success("Template saved successfully");
    }
  });

  const sectionTypes = [
    { id: 'header', name: 'Header Section', icon: FileText },
    { id: 'summary', name: 'Executive Summary', icon: FileText },
    { id: 'metrics', name: 'Key Metrics', icon: BarChart3 },
    { id: 'chart', name: 'Data Visualization', icon: PieChart },
    { id: 'table', name: 'Data Table', icon: Table },
    { id: 'text', name: 'Text Block', icon: FileText }
  ];

  const addSection = (type) => {
    const newSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: `New ${sectionTypes.find(s => s.id === type)?.name}`,
      config: getDefaultConfig(type)
    };
    setTemplate({ ...template, sections: [...template.sections, newSection] });
  };

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'header':
        return { title: '', subtitle: '', logoUrl: '' };
      case 'summary':
        return { content: '' };
      case 'metrics':
        return { metrics: ['risks', 'controls', 'compliance', 'audits'] };
      case 'chart':
        return { chartType: 'bar', dataSource: 'risks', groupBy: 'status' };
      case 'table':
        return { dataSource: 'risks', columns: ['title', 'status', 'owner'] };
      case 'text':
        return { content: '' };
      default:
        return {};
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(template.sections);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTemplate({ ...template, sections: items });
  };

  const removeSection = (id) => {
    setTemplate({ 
      ...template, 
      sections: template.sections.filter(s => s.id !== id) 
    });
  };

  const updateSection = (id, updates) => {
    setTemplate({
      ...template,
      sections: template.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const saveTemplate = () => {
    if (!template.name) {
      toast.error("Please enter template name");
      return;
    }
    saveTemplateMutation.mutate(template);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template Config */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Template Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-slate-400 mb-2">Template Name</Label>
            <Input
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="e.g., Executive Dashboard"
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Description</Label>
            <Textarea
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              placeholder="Template description..."
              className="bg-[#151d2e] border-[#2a3548] text-white min-h-[80px]"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-3 block">Add Sections</Label>
            <div className="grid grid-cols-2 gap-2">
              {sectionTypes.map(type => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    onClick={() => addSection(type.id)}
                    variant="outline"
                    className="border-[#2a3548] hover:bg-indigo-500/10 hover:border-indigo-500/30 h-auto py-3"
                  >
                    <div className="text-center">
                      <Icon className="h-5 w-5 mx-auto mb-1 text-indigo-400" />
                      <div className="text-xs text-slate-300">{type.name}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2a3548] space-y-2">
            <Button 
              onClick={saveTemplate}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={saveTemplateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button 
              onClick={() => setEditMode(!editMode)}
              variant="outline"
              className="w-full border-[#2a3548]"
            >
              <Eye className="h-4 w-4 mr-2" />
              {editMode ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Builder */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Template Layout</CardTitle>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {template.sections.length} sections
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {template.sections.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No sections added yet</p>
              <p className="text-sm text-slate-500">Add sections from the left panel to build your template</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {template.sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-[#151d2e] border-[#2a3548]"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div {...provided.dragHandleProps} className="mt-1">
                                  <GripVertical className="h-5 w-5 text-slate-600 cursor-move" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-3">
                                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                                      {sectionTypes.find(s => s.id === section.type)?.name}
                                    </Badge>
                                    <Button
                                      onClick={() => removeSection(section.id)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <Input
                                    value={section.title}
                                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                    placeholder="Section title"
                                    className="bg-[#0f1623] border-[#2a3548] text-white mb-3"
                                  />

                                  {section.type === 'chart' && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <Select
                                        value={section.config.chartType}
                                        onValueChange={(val) => updateSection(section.id, { 
                                          config: { ...section.config, chartType: val } 
                                        })}
                                      >
                                        <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                                          <SelectItem value="bar">Bar Chart</SelectItem>
                                          <SelectItem value="pie">Pie Chart</SelectItem>
                                          <SelectItem value="line">Line Chart</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={section.config.dataSource}
                                        onValueChange={(val) => updateSection(section.id, { 
                                          config: { ...section.config, dataSource: val } 
                                        })}
                                      >
                                        <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                                          <SelectItem value="risks">Risks</SelectItem>
                                          <SelectItem value="controls">Controls</SelectItem>
                                          <SelectItem value="compliance">Compliance</SelectItem>
                                          <SelectItem value="audits">Audits</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  {(section.type === 'text' || section.type === 'summary') && (
                                    <Textarea
                                      value={section.config.content}
                                      onChange={(e) => updateSection(section.id, { 
                                        config: { ...section.config, content: e.target.value } 
                                      })}
                                      placeholder="Enter content..."
                                      className="bg-[#0f1623] border-[#2a3548] text-white min-h-[80px]"
                                    />
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}