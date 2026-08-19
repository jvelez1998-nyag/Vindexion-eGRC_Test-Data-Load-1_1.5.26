import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, CheckCircle2, FileText, AlertCircle, Sparkles, MessageSquare, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AIVendorOnboardingAssistant({ vendor, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [vendorData, setVendorData] = useState({
    name: vendor?.name || "",
    vendor_category: vendor?.vendor_category || "",
    services_provided: vendor?.services_provided || "",
    data_access_level: vendor?.data_access_level || "none",
    tier: vendor?.tier || "",
    regulatory_requirements: vendor?.regulatory_requirements || []
  });
  const [aiGuidance, setAiGuidance] = useState(null);
  const [documentSuggestions, setDocumentSuggestions] = useState(null);
  const [taskPlan, setTaskPlan] = useState(null);

  const queryClient = useQueryClient();

  const steps = [
    { id: 'basic_info', title: 'Basic Information', icon: FileText },
    { id: 'ai_analysis', title: 'AI Analysis', icon: Brain },
    { id: 'documentation', title: 'Documentation', icon: Upload },
    { id: 'task_creation', title: 'Task Planning', icon: CheckCircle2 }
  ];

  const getAIGuidance = async () => {
    setAnalyzing(true);
    try {
      const prompt = `Provide onboarding guidance for vendor:
**VENDOR:** ${vendorData.name}
**CATEGORY:** ${vendorData.vendor_category}
**SERVICES:** ${vendorData.services_provided}
**DATA ACCESS:** ${vendorData.data_access_level}
**TIER:** ${vendorData.tier}

Analyze and provide:
1. **Risk Assessment** - Initial risk evaluation
2. **Onboarding Path** - Recommended approach (standard, enhanced, expedited)
3. **Key Considerations** - Important factors to address
4. **Compliance Requirements** - Applicable regulations
5. **Timeline Estimate** - Expected onboarding duration
6. **Next Steps** - Immediate actions needed`;

      const guidance = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_level: { type: "string" },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            onboarding_path: { type: "string" },
            path_rationale: { type: "string" },
            key_considerations: {
              type: "array",
              items: { type: "string" }
            },
            compliance_requirements: {
              type: "array",
              items: { type: "string" }
            },
            timeline_days: { type: "number" },
            next_steps: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiGuidance(guidance);

      // Also get document suggestions
      const docPrompt = `Based on vendor profile, suggest required documentation:
**VENDOR:** ${vendorData.name}
**CATEGORY:** ${vendorData.vendor_category}
**RISK LEVEL:** ${guidance.risk_level}
**DATA ACCESS:** ${vendorData.data_access_level}

Provide comprehensive documentation requirements organized by:
- Mandatory documents (must have)
- Recommended documents (should have)
- Optional documents (nice to have)

Include specific document types for security, compliance, legal, financial, and operational areas.`;

      const docs = await base44.integrations.Core.InvokeLLM({
        prompt: docPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            mandatory: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  document: { type: "string" },
                  category: { type: "string" },
                  purpose: { type: "string" }
                }
              }
            },
            recommended: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  document: { type: "string" },
                  category: { type: "string" },
                  purpose: { type: "string" }
                }
              }
            },
            optional: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  document: { type: "string" },
                  category: { type: "string" },
                  purpose: { type: "string" }
                }
              }
            }
          }
        }
      });

      setDocumentSuggestions(docs);

      // Generate task plan
      const taskPrompt = `Create detailed onboarding task plan:
**VENDOR:** ${vendorData.name}
**RISK LEVEL:** ${guidance.risk_level}
**ONBOARDING PATH:** ${guidance.onboarding_path}
**TIMELINE:** ${guidance.timeline_days} days

Generate 12-15 specific onboarding tasks covering all phases:
- Initial Setup (first week)
- Security & Compliance Review (weeks 2-3)
- Contract & Legal (weeks 2-4)
- Technical Integration (if applicable)
- Final Approval & Activation

Each task with priority, owner role, dependencies, and timeline.`;

      const tasks = await base44.integrations.Core.InvokeLLM({
        prompt: taskPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task_name: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string" },
                        owner_role: { type: "string" },
                        estimated_days: { type: "number" },
                        dependencies: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setTaskPlan(tasks);
      toast.success("AI analysis complete");
      setCurrentStep(1);
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const createVendorAndTasksMutation = useMutation({
    mutationFn: async () => {
      // Create or update vendor
      let vendorId = vendor?.id;
      if (!vendorId) {
        const newVendor = await base44.entities.Vendor.create({
          ...vendorData,
          status: 'onboarding',
          ai_risk_score: aiGuidance.risk_level === 'High' ? 75 : aiGuidance.risk_level === 'Medium' ? 50 : 25,
          onboarding_started_date: new Date().toISOString()
        });
        vendorId = newVendor.id;
      }

      // Create all onboarding tasks
      const allTasks = taskPlan.phases.flatMap(phase => 
        phase.tasks.map((task, idx) => ({
          vendor_id: vendorId,
          task_name: task.task_name,
          description: task.description,
          task_type: 'onboarding',
          priority: task.priority,
          status: 'pending',
          assigned_role: task.owner_role,
          due_date: new Date(Date.now() + task.estimated_days * 24 * 60 * 60 * 1000).toISOString(),
          phase: phase.phase
        }))
      );

      await base44.entities.VendorOnboardingTask.bulkCreate(allTasks);

      return vendorId;
    },
    onSuccess: (vendorId) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] });
      toast.success("Vendor onboarding initiated");
      if (onComplete) onComplete(vendorId);
    }
  });

  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'high': case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-indigo-400" />
              <div>
                <h3 className="font-semibold text-white">AI Onboarding Assistant</h3>
                <p className="text-xs text-slate-400">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {steps[currentStep].title}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Basic Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Vendor Name *</Label>
                <Input
                  value={vendorData.name}
                  onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                  placeholder="Enter vendor name"
                  className="bg-[#0f1623] border-[#2a3548]"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={vendorData.vendor_category} onValueChange={(v) => setVendorData({...vendorData, vendor_category: v})}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="cloud_services">Cloud Services</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="financial_services">Financial Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Services Provided *</Label>
              <Textarea
                value={vendorData.services_provided}
                onChange={(e) => setVendorData({...vendorData, services_provided: e.target.value})}
                placeholder="Describe services this vendor will provide..."
                className="bg-[#0f1623] border-[#2a3548]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data Access Level *</Label>
                <Select value={vendorData.data_access_level} onValueChange={(v) => setVendorData({...vendorData, data_access_level: v})}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="extensive">Extensive</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vendor Tier *</Label>
                <Select value={vendorData.tier} onValueChange={(v) => setVendorData({...vendorData, tier: v})}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="tier_1">Tier 1 (Critical)</SelectItem>
                    <SelectItem value="tier_2">Tier 2 (Important)</SelectItem>
                    <SelectItem value="tier_3">Tier 3 (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={getAIGuidance}
              disabled={analyzing || !vendorData.name || !vendorData.vendor_category}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {analyzing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing with AI...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Get AI Guidance</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && aiGuidance && (
        <div className="space-y-4">
          <Card className={`bg-gradient-to-br from-${aiGuidance.risk_level === 'High' ? 'rose' : 'amber'}-500/10 to-orange-500/10 border-${aiGuidance.risk_level === 'High' ? 'rose' : 'amber'}-500/30`}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                AI Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Risk Level:</span>
                <Badge className={getRiskColor(aiGuidance.risk_level)}>
                  {aiGuidance.risk_level}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Risk Factors:</p>
                <div className="space-y-1">
                  {aiGuidance.risk_factors?.map((factor, idx) => (
                    <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Recommended Onboarding Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Path:</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {aiGuidance.onboarding_path}
                </Badge>
              </div>
              <p className="text-sm text-slate-300">{aiGuidance.path_rationale}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Estimated Timeline:</span>
                <span className="text-white font-semibold">{aiGuidance.timeline_days} days</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => setCurrentStep(2)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Continue to Documentation
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && documentSuggestions && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                Required Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-white mb-2">Mandatory Documents</h5>
                <div className="space-y-2">
                  {documentSuggestions.mandatory?.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-[#151d2e] rounded border border-emerald-500/30">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm text-white">{doc.document}</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          {doc.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{doc.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-white mb-2">Recommended Documents</h5>
                <div className="space-y-2">
                  {documentSuggestions.recommended?.slice(0, 5).map((doc, idx) => (
                    <div key={idx} className="p-2 bg-[#151d2e] rounded">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm text-white">{doc.document}</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                          {doc.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{doc.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => setCurrentStep(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Continue to Task Planning
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && taskPlan && (
        <div className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Automated Task Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taskPlan.phases?.map((phase, idx) => (
                  <div key={idx}>
                    <h5 className="text-sm font-semibold text-white mb-2">{phase.phase} ({phase.tasks.length} tasks)</h5>
                    <div className="space-y-1">
                      {phase.tasks.slice(0, 3).map((task, taskIdx) => (
                        <div key={taskIdx} className="p-2 bg-[#151d2e] rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-white">{task.task_name}</span>
                            <Badge className={
                              task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                              'bg-blue-500/20 text-blue-400'
                            }>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {phase.tasks.length > 3 && (
                        <p className="text-xs text-slate-400 pl-2">+ {phase.tasks.length - 3} more tasks...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => createVendorAndTasksMutation.mutate()}
            disabled={createVendorAndTasksMutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {createVendorAndTasksMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Start Onboarding</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}