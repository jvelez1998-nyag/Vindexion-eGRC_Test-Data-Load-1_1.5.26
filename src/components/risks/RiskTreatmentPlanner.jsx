import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, CheckCircle2, Clock, Sparkles, Loader2, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function RiskTreatmentPlanner({ risks }) {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState({
    actions: [],
    timeline: '',
    resources_required: '',
    success_criteria: '',
    monitoring_approach: ''
  });
  const [newAction, setNewAction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const risksTreatment = risks.filter(r => 
    r.status !== 'closed' && 
    (r.likelihood || 0) * (r.impact || 0) >= 4
  );

  const generateTreatmentPlan = async (risk) => {
    setAiLoading(true);
    try {
      const prompt = `You are a risk treatment expert. Create a comprehensive treatment plan for this risk:

Title: ${risk.title}
Description: ${risk.description}
Category: ${risk.category}
Risk Score: ${(risk.likelihood || 0) * (risk.impact || 0)}
Current Status: ${risk.status}

Generate:
1. Specific mitigation actions (array of 3-5 actions)
2. Implementation timeline
3. Resources required
4. Success criteria
5. Monitoring approach`;

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
                  responsible: { type: "string" }
                }
              }
            },
            timeline: { type: "string" },
            resources_required: { type: "string" },
            success_criteria: { type: "string" },
            monitoring_approach: { type: "string" }
          }
        }
      });

      setTreatmentPlan(response);
      toast.success("Treatment plan generated");
    } catch (error) {
      toast.error("Failed to generate plan");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectRisk = (risk) => {
    setSelectedRisk(risk);
    setTreatmentPlan({
      actions: [],
      timeline: '',
      resources_required: '',
      success_criteria: '',
      monitoring_approach: ''
    });
  };

  const addAction = () => {
    if (!newAction.trim()) return;
    setTreatmentPlan(prev => ({
      ...prev,
      actions: [...(prev.actions || []), { action: newAction, priority: 'medium', responsible: '' }]
    }));
    setNewAction('');
  };

  const removeAction = (index) => {
    setTreatmentPlan(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Risk Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Select Risk to Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {risksTreatment.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No risks requiring treatment</p>
                </div>
              ) : (
                risksTreatment.map(risk => {
                  const score = (risk.likelihood || 0) * (risk.impact || 0);
                  const level = score >= 16 ? 'Critical' : score >= 9 ? 'High' : 'Medium';
                  const levelColor = score >= 16 ? 'bg-rose-500' : score >= 9 ? 'bg-amber-500' : 'bg-yellow-500';
                  
                  return (
                    <Card
                      key={risk.id}
                      onClick={() => handleSelectRisk(risk)}
                      className={`cursor-pointer transition-all ${
                        selectedRisk?.id === risk.id 
                          ? 'bg-indigo-500/10 border-indigo-500/40' 
                          : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-medium text-white line-clamp-2">{risk.title}</h4>
                          <Badge className={`${levelColor} text-white border-0 text-[10px]`}>{level}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 capitalize">
                            {risk.category}
                          </Badge>
                          <Badge className="text-[10px] bg-blue-500/10 text-blue-400">
                            Score: {score}
                          </Badge>
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

      {/* Treatment Plan Builder */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedRisk ? (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select a Risk</h3>
              <p className="text-slate-400">Choose a risk from the list to create a treatment plan</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{selectedRisk.title}</CardTitle>
                    <p className="text-sm text-slate-400">Treatment Plan Development</p>
                  </div>
                  <Button
                    onClick={() => generateTreatmentPlan(selectedRisk)}
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
                    {/* Actions */}
                    <div>
                      <Label className="text-white mb-3 block">Mitigation Actions</Label>
                      <div className="space-y-2 mb-3">
                        {treatmentPlan.actions?.map((action, idx) => (
                          <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm text-white mb-1">{action.action}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge className="text-[10px]">
                                      {action.priority} priority
                                    </Badge>
                                    {action.responsible && (
                                      <span className="text-xs text-slate-500">{action.responsible}</span>
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
                          placeholder="Add mitigation action..."
                          className="bg-[#151d2e] border-[#2a3548] text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addAction();
                            }
                          }}
                        />
                        <Button onClick={addAction} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                      <Label className="text-white">Implementation Timeline</Label>
                      <Textarea
                        value={treatmentPlan.timeline}
                        onChange={(e) => setTreatmentPlan(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="Describe the implementation timeline..."
                        rows={3}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>

                    {/* Resources */}
                    <div className="space-y-2">
                      <Label className="text-white">Resources Required</Label>
                      <Textarea
                        value={treatmentPlan.resources_required}
                        onChange={(e) => setTreatmentPlan(prev => ({ ...prev, resources_required: e.target.value }))}
                        placeholder="Budget, personnel, technology needed..."
                        rows={3}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>

                    {/* Success Criteria */}
                    <div className="space-y-2">
                      <Label className="text-white">Success Criteria</Label>
                      <Textarea
                        value={treatmentPlan.success_criteria}
                        onChange={(e) => setTreatmentPlan(prev => ({ ...prev, success_criteria: e.target.value }))}
                        placeholder="How will you measure success?"
                        rows={3}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>

                    {/* Monitoring */}
                    <div className="space-y-2">
                      <Label className="text-white">Monitoring Approach</Label>
                      <Textarea
                        value={treatmentPlan.monitoring_approach}
                        onChange={(e) => setTreatmentPlan(prev => ({ ...prev, monitoring_approach: e.target.value }))}
                        placeholder="How will you monitor effectiveness?"
                        rows={3}
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