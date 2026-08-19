import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, Sparkles, Loader2, Plus, Trash2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function IncidentResponsePlanner({ incidents }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [responsePlan, setResponsePlan] = useState({
    actions: [],
    lessons_learned: '',
    preventive_measures: '',
    follow_up_items: ''
  });
  const [newAction, setNewAction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const activeIncidents = incidents.filter(i => 
    i.status !== 'closed' && i.status !== 'resolved'
  ).sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });

  const generateResponsePlan = async (incident) => {
    setAiLoading(true);
    try {
      const prompt = `You are an incident response expert. Create a comprehensive response plan for this incident:

Title: ${incident.title}
Type: ${incident.type}
Severity: ${incident.severity}
Description: ${incident.description}
Impact: ${incident.impact_description}

Generate:
1. Detailed response actions (array of 5-8 actions with priorities)
2. Lessons learned
3. Preventive measures to avoid recurrence
4. Follow-up items for post-incident review`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            actions: { 
              type: "array", 
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            lessons_learned: { type: "string" },
            preventive_measures: { type: "string" },
            follow_up_items: { type: "string" }
          }
        }
      });

      setResponsePlan(response);
      toast.success("Response plan generated");
    } catch (error) {
      toast.error("Failed to generate plan");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
    setResponsePlan({
      actions: [],
      lessons_learned: '',
      preventive_measures: '',
      follow_up_items: ''
    });
  };

  const addAction = () => {
    if (!newAction.trim()) return;
    setResponsePlan(prev => ({
      ...prev,
      actions: [...(prev.actions || []), { action: newAction, priority: 'medium', timeline: 'immediate' }]
    }));
    setNewAction('');
  };

  const removeAction = (index) => {
    setResponsePlan(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Incident Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Active Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {activeIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No active incidents</p>
                </div>
              ) : (
                activeIncidents.map(incident => {
                  const severityColor = 
                    incident.severity === 'critical' ? 'bg-rose-500' :
                    incident.severity === 'high' ? 'bg-amber-500' :
                    incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500';
                  
                  return (
                    <Card
                      key={incident.id}
                      onClick={() => handleSelectIncident(incident)}
                      className={`cursor-pointer transition-all ${
                        selectedIncident?.id === incident.id 
                          ? 'bg-rose-500/10 border-rose-500/40' 
                          : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-medium text-white line-clamp-2">{incident.title}</h4>
                          <Badge className={`${severityColor} text-white border-0 text-[10px] capitalize`}>
                            {incident.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 capitalize">
                            {incident.type?.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(incident.incident_date || incident.created_date), 'MMM d')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Response Plan Builder */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedIncident ? (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select an Incident</h3>
              <p className="text-slate-400">Choose an incident from the list to create a response plan</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{selectedIncident.title}</CardTitle>
                    <p className="text-sm text-slate-400">Response Plan Development</p>
                  </div>
                  <Button
                    onClick={() => generateResponsePlan(selectedIncident)}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    AI Generate Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {/* Response Actions */}
                    <div>
                      <Label className="text-white mb-3 block">Response Actions</Label>
                      <div className="space-y-2 mb-3">
                        {responsePlan.actions?.map((action, idx) => (
                          <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm text-white mb-1">{action.action}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`text-[10px] ${
                                      action.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                                      action.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                      'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {action.priority}
                                    </Badge>
                                    {action.timeline && (
                                      <span className="text-xs text-slate-500">{action.timeline}</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeAction(idx)}
                                  className="h-6 w-6 text-rose-400 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newAction}
                          onChange={(e) => setNewAction(e.target.value)}
                          placeholder="Add response action..."
                          className="bg-[#151d2e] border-[#2a3548] text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addAction();
                            }
                          }}
                        />
                        <Button onClick={addAction} size="sm" className="bg-rose-600 hover:bg-rose-700">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Lessons Learned */}
                    <div className="space-y-2">
                      <Label className="text-white">Lessons Learned</Label>
                      <Textarea
                        value={responsePlan.lessons_learned}
                        onChange={(e) => setResponsePlan(prev => ({ ...prev, lessons_learned: e.target.value }))}
                        placeholder="What did we learn from this incident?"
                        rows={4}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>

                    {/* Preventive Measures */}
                    <div className="space-y-2">
                      <Label className="text-white">Preventive Measures</Label>
                      <Textarea
                        value={responsePlan.preventive_measures}
                        onChange={(e) => setResponsePlan(prev => ({ ...prev, preventive_measures: e.target.value }))}
                        placeholder="What measures should be implemented to prevent recurrence?"
                        rows={4}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>

                    {/* Follow-up Items */}
                    <div className="space-y-2">
                      <Label className="text-white">Post-Incident Review Items</Label>
                      <Textarea
                        value={responsePlan.follow_up_items}
                        onChange={(e) => setResponsePlan(prev => ({ ...prev, follow_up_items: e.target.value }))}
                        placeholder="Items to address in post-incident review..."
                        rows={4}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}