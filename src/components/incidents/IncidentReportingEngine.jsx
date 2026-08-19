import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Circle, AlertTriangle, FileText, Zap, Shield, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const INCIDENT_STEPS = [
  { id: 'report', title: 'Report Incident', icon: AlertTriangle },
  { id: 'classify', title: 'Classify & Assess', icon: FileText },
  { id: 'impact', title: 'Impact Analysis', icon: Zap },
  { id: 'containment', title: 'Containment', icon: Shield },
  { id: 'response', title: 'Response Plan', icon: CheckCircle2 }
];

export default function IncidentReportingEngine({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [incidentData, setIncidentData] = useState({
    title: '',
    description: '',
    type: '',
    severity: '',
    incident_date: new Date().toISOString().split('T')[0],
    detected_by: '',
    affected_systems: [],
    affected_data: '',
    impact_description: '',
    containment_actions: '',
    response_plan: '',
    assigned_to: '',
    status: 'reported'
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [newSystem, setNewSystem] = useState('');

  const updateData = (field, value) => {
    setIncidentData(prev => ({ ...prev, [field]: value }));
  };

  const addAffectedSystem = () => {
    if (!newSystem.trim()) return;
    setIncidentData(prev => ({
      ...prev,
      affected_systems: [...(prev.affected_systems || []), newSystem]
    }));
    setNewSystem('');
  };

  const removeSystem = (index) => {
    setIncidentData(prev => ({
      ...prev,
      affected_systems: prev.affected_systems.filter((_, i) => i !== index)
    }));
  };

  const generateAIClassification = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are an incident response expert. Analyze this security incident:

Title: ${incidentData.title}
Description: ${incidentData.description}
Type: ${incidentData.type}
Affected Systems: ${incidentData.affected_systems?.join(', ')}

Provide:
1. Recommended severity (low/medium/high/critical) with justification
2. Impact assessment (data, financial, operational, reputational)
3. Immediate containment actions (array of 3-5 actions)
4. Recommended response plan
5. Potential root causes`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            severity: { type: "string" },
            severity_justification: { type: "string" },
            impact_assessment: {
              type: "object",
              properties: {
                data_impact: { type: "string" },
                financial_impact: { type: "string" },
                operational_impact: { type: "string" },
                reputational_impact: { type: "string" }
              }
            },
            containment_actions: { type: "array", items: { type: "string" } },
            response_plan: { type: "string" },
            root_causes: { type: "array", items: { type: "string" } }
          }
        }
      });

      const impactDesc = Object.entries(response.impact_assessment || {})
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
        .join('\n');

      setIncidentData(prev => ({
        ...prev,
        severity: response.severity,
        impact_description: impactDesc,
        containment_actions: response.containment_actions?.join('\n• ') || '',
        response_plan: response.response_plan,
        root_cause: response.root_causes?.join('; ') || '',
        notes: `Severity: ${response.severity_justification}`
      }));

      toast.success("AI classification applied");
    } catch (error) {
      toast.error("Failed to generate classification");
    } finally {
      setAiLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return incidentData.title && incidentData.description;
      case 1: return incidentData.type && incidentData.severity;
      case 2: return incidentData.impact_description;
      case 3: return incidentData.containment_actions;
      case 4: return incidentData.response_plan;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < INCIDENT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(incidentData);
    }
  };

  const progress = ((currentStep + 1) / INCIDENT_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Incident Reporting Progress</h3>
            <span className="text-sm text-slate-400">{currentStep + 1} of {INCIDENT_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {INCIDENT_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-rose-500/20 border border-rose-500/40' :
                      isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      'bg-[#151d2e] border border-[#2a3548]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${
                      isCurrent ? 'text-rose-400 font-medium' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < INCIDENT_STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-slate-600 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{INCIDENT_STEPS[currentStep].title}</CardTitle>
            {currentStep >= 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIClassification}
                disabled={aiLoading}
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Assist
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px] pr-4">
            {/* Step 0: Report */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Incident Title *</Label>
                  <Input
                    value={incidentData.title}
                    onChange={(e) => updateData('title', e.target.value)}
                    placeholder="e.g., Unauthorized Access Attempt"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Incident Description *</Label>
                  <Textarea
                    value={incidentData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Describe what happened, when it was detected, and initial observations..."
                    rows={6}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Incident Date *</Label>
                    <Input
                      value={incidentData.incident_date}
                      onChange={(e) => updateData('incident_date', e.target.value)}
                      type="date"
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Detected By</Label>
                    <Input
                      value={incidentData.detected_by}
                      onChange={(e) => updateData('detected_by', e.target.value)}
                      placeholder="Name or system"
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Classify */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Incident Type *</Label>
                  <Select value={incidentData.type} onValueChange={(v) => updateData('type', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="data_breach" className="text-white">Data Breach</SelectItem>
                      <SelectItem value="cyber_attack" className="text-white">Cyber Attack</SelectItem>
                      <SelectItem value="system_outage" className="text-white">System Outage</SelectItem>
                      <SelectItem value="policy_violation" className="text-white">Policy Violation</SelectItem>
                      <SelectItem value="physical_security" className="text-white">Physical Security</SelectItem>
                      <SelectItem value="fraud" className="text-white">Fraud</SelectItem>
                      <SelectItem value="other" className="text-white">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Severity Level *</Label>
                  <Select value={incidentData.severity} onValueChange={(v) => updateData('severity', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="low" className="text-white">Low - Minor impact</SelectItem>
                      <SelectItem value="medium" className="text-white">Medium - Moderate impact</SelectItem>
                      <SelectItem value="high" className="text-white">High - Significant impact</SelectItem>
                      <SelectItem value="critical" className="text-white">Critical - Severe impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Affected Systems</Label>
                  <div className="space-y-2">
                    {incidentData.affected_systems?.map((system, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                          {system}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeSystem(idx)}
                          className="h-6 w-6 text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSystem}
                      onChange={(e) => setNewSystem(e.target.value)}
                      placeholder="Add affected system..."
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addAffectedSystem();
                        }
                      }}
                    />
                    <Button onClick={addAffectedSystem} size="sm" className="bg-rose-600 hover:bg-rose-700">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Impact */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Impact Assessment *</Label>
                  <Textarea
                    value={incidentData.impact_description}
                    onChange={(e) => updateData('impact_description', e.target.value)}
                    placeholder="Describe the business impact (data loss, downtime, financial, reputational)..."
                    rows={6}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Affected Data/Assets</Label>
                  <Textarea
                    value={incidentData.affected_data}
                    onChange={(e) => updateData('affected_data', e.target.value)}
                    placeholder="What data or assets were affected?"
                    rows={3}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400 mb-2 font-medium">💡 Consider:</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Number of users/customers affected</li>
                    <li>• Volume and sensitivity of data compromised</li>
                    <li>• Financial losses (direct and indirect)</li>
                    <li>• Service disruption duration</li>
                    <li>• Regulatory reporting requirements</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Containment */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Containment Actions *</Label>
                  <Textarea
                    value={incidentData.containment_actions}
                    onChange={(e) => updateData('containment_actions', e.target.value)}
                    placeholder="Immediate actions taken or needed to contain the incident..."
                    rows={8}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">🛡️ Containment Checklist</h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Isolate affected systems from network</li>
                    <li>• Preserve evidence for investigation</li>
                    <li>• Disable compromised accounts</li>
                    <li>• Implement temporary security measures</li>
                    <li>• Notify relevant stakeholders</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Response Plan */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Response Plan *</Label>
                  <Textarea
                    value={incidentData.response_plan}
                    onChange={(e) => updateData('response_plan', e.target.value)}
                    placeholder="Detailed plan for investigation, remediation, and recovery..."
                    rows={8}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Incident Owner</Label>
                  <Input
                    value={incidentData.assigned_to}
                    onChange={(e) => updateData('assigned_to', e.target.value)}
                    placeholder="email@company.com"
                    type="email"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-rose-400 mb-2">📋 Incident Summary</h4>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div><strong className="text-white">Title:</strong> {incidentData.title}</div>
                    <div><strong className="text-white">Type:</strong> {incidentData.type?.replace(/_/g, ' ')}</div>
                    <div><strong className="text-white">Severity:</strong> {incidentData.severity}</div>
                    <div><strong className="text-white">Date:</strong> {incidentData.incident_date}</div>
                    {incidentData.affected_systems?.length > 0 && (
                      <div><strong className="text-white">Systems:</strong> {incidentData.affected_systems.join(', ')}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pb-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="border-[#2a3548] text-white hover:bg-[#2a3548]"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
        >
          {currentStep === INCIDENT_STEPS.length - 1 ? 'Complete & Save' : 'Next Step'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}