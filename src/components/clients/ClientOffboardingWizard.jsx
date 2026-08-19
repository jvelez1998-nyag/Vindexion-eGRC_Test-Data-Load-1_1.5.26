import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserX, ArrowRight, ArrowLeft, Check, 
  Brain, Loader2, AlertTriangle, CheckCircle2,
  FileText, Archive, Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const OFFBOARDING_STEPS = [
  { id: 'reason', title: 'Offboarding Reason', icon: UserX },
  { id: 'checklist', title: 'Exit Checklist', icon: CheckCircle2 },
  { id: 'ai-guidance', title: 'AI Guidance', icon: Brain },
  { id: 'finalize', title: 'Finalize', icon: Archive }
];

const EXIT_CHECKLIST = [
  { id: 'data', label: 'Export all client data and documents', category: 'Data' },
  { id: 'audits', label: 'Complete pending audits or document handoff', category: 'Operations' },
  { id: 'findings', label: 'Close or transfer open findings', category: 'Operations' },
  { id: 'incidents', label: 'Resolve or document open incidents', category: 'Operations' },
  { id: 'contracts', label: 'Review and archive contracts', category: 'Legal' },
  { id: 'billing', label: 'Finalize billing and invoices', category: 'Finance' },
  { id: 'access', label: 'Revoke system access and credentials', category: 'Security' },
  { id: 'transition', label: 'Complete knowledge transfer documentation', category: 'Knowledge' },
  { id: 'feedback', label: 'Conduct exit interview/survey', category: 'Feedback' },
  { id: 'lessons', label: 'Document lessons learned', category: 'Knowledge' }
];

export default function ClientOffboardingWizard({ open, onOpenChange, client, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    offboarding_reason: "",
    reason_category: "business_decision",
    exit_notes: "",
    lessons_learned: ""
  });
  const [checklist, setChecklist] = useState({});
  const [aiGuidance, setAiGuidance] = useState(null);

  const reasonCategories = [
    { value: 'business_decision', label: 'Business Decision' },
    { value: 'contract_end', label: 'Contract Ended' },
    { value: 'performance', label: 'Performance Issues' },
    { value: 'compliance', label: 'Compliance Concerns' },
    { value: 'cost', label: 'Cost Reduction' },
    { value: 'consolidation', label: 'Vendor Consolidation' },
    { value: 'other', label: 'Other' }
  ];

  const generateAIGuidance = async () => {
    setLoading(true);
    try {
      const completedItems = Object.values(checklist).filter(Boolean).length;
      const totalItems = EXIT_CHECKLIST.length;

      const prompt = `As an expert in client relationship management, provide comprehensive offboarding guidance for client "${client.name}".

CLIENT PROFILE:
- Industry: ${client.industry}
- Type: ${client.client_type}
- Risk Level: ${client.risk_level}
- Compliance Score: ${client.compliance_score}
- Open Incidents: ${client.incident_count}
- Open Findings: ${client.finding_count}
- Critical Issues: ${client.critical_issues}

OFFBOARDING DETAILS:
- Reason: ${formData.offboarding_reason}
- Category: ${formData.reason_category}
- Checklist Completion: ${completedItems}/${totalItems} items

Provide comprehensive guidance:

1. **Offboarding Strategy**
   - Recommended approach for this specific situation
   - Key considerations based on reason category
   - Risk mitigation during transition
   - Communication strategy

2. **Critical Tasks**
   - High-priority items to complete before exit
   - Dependencies and sequencing
   - Potential blockers to watch for
   - Timeline recommendations

3. **Knowledge Preservation**
   - Critical information to document
   - Key contacts and relationships
   - Institutional knowledge capture
   - Lessons learned framework

4. **Risk Management**
   - Exit-related risks to mitigate
   - Data security considerations
   - Compliance obligations during offboarding
   - Contractual obligations

5. **Client Communication Guide**
   - How to communicate the offboarding
   - Messaging for different stakeholders
   - Maintaining professional relationship
   - Future engagement possibilities

6. **Checklist Validation**
   - Are all critical items covered?
   - Additional items to consider?
   - Priority ordering recommendations
   - Timeline for each item

7. **Post-Offboarding**
   - Archive management
   - Record retention requirements
   - Potential re-engagement scenarios
   - Relationship maintenance tips

8. **Lessons Learned Template**
   - What went well during engagement
   - What could have been improved
   - Red flags that appeared in retrospect
   - Best practices for future clients

Provide detailed, actionable guidance formatted as markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiGuidance(response);
      setCurrentStep(3);
      toast.success("AI guidance generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate guidance");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const offboardingData = {
      status: "churned",
      offboarding_date: new Date().toISOString().split('T')[0],
      offboarding_reason: formData.offboarding_reason,
      offboarding_checklist: checklist,
      lessons_learned: formData.lessons_learned,
      exit_notes: formData.exit_notes
    };
    onComplete?.(offboardingData);
  };

  const progress = ((currentStep + 1) / OFFBOARDING_STEPS.length) * 100;
  const checklistProgress = (Object.values(checklist).filter(Boolean).length / EXIT_CHECKLIST.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <UserX className="h-5 w-5 text-amber-400" />
            Client Offboarding Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {OFFBOARDING_STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${idx <= currentStep ? 'text-amber-400' : 'text-slate-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx < currentStep ? 'bg-amber-500 text-white' :
                    idx === currentStep ? 'bg-amber-500/20 border-2 border-amber-500' :
                    'bg-slate-700'
                  }`}>
                    {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                </div>
                {idx < OFFBOARDING_STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${idx < currentStep ? 'bg-amber-500' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="max-h-[calc(90vh-280px)]">
          {/* Step 1: Reason */}
          {currentStep === 0 && (
            <div className="space-y-4 pr-4">
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white text-center mb-2">
                    Offboarding: {client?.name}
                  </h3>
                  <p className="text-xs text-slate-400 text-center">
                    Please provide details about why this client is being offboarded
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label className="text-slate-300">Offboarding Reason Category</Label>
                <select
                  value={formData.reason_category}
                  onChange={(e) => setFormData({ ...formData, reason_category: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 rounded-md bg-[#151d2e] border border-[#2a3548] text-white"
                >
                  {reasonCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-slate-300">Detailed Reason</Label>
                <Textarea
                  value={formData.offboarding_reason}
                  onChange={(e) => setFormData({ ...formData, offboarding_reason: e.target.value })}
                  placeholder="Explain the circumstances and decision-making process..."
                  className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white h-32"
                />
              </div>

              <div>
                <Label className="text-slate-300">Exit Notes</Label>
                <Textarea
                  value={formData.exit_notes}
                  onChange={(e) => setFormData({ ...formData, exit_notes: e.target.value })}
                  placeholder="Final observations, outstanding items, or important context..."
                  className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white h-24"
                />
              </div>
            </div>
          )}

          {/* Step 2: Checklist */}
          {currentStep === 1 && (
            <div className="space-y-4 pr-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-400" />
                      <div>
                        <h3 className="text-sm font-semibold text-white">Exit Checklist</h3>
                        <p className="text-xs text-slate-400">Complete all required tasks</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {Object.values(checklist).filter(Boolean).length}/{EXIT_CHECKLIST.length}
                    </Badge>
                  </div>
                  <Progress value={checklistProgress} className="mt-3 h-2" />
                </CardContent>
              </Card>

              <div className="space-y-2">
                {EXIT_CHECKLIST.map(item => (
                  <Card key={item.id} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={checklist[item.id] || false}
                          onCheckedChange={(checked) => setChecklist({ ...checklist, [item.id]: checked })}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">{item.label}</div>
                          <Badge className="mt-1 text-[9px] bg-slate-500/20 text-slate-400">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                <CardContent className="p-4">
                  <Lightbulb className="h-5 w-5 text-violet-400 mb-2" />
                  <h4 className="text-sm font-semibold text-white mb-2">Pro Tips</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• Archive all documentation before revoking access</li>
                    <li>• Conduct exit interview within 48 hours of decision</li>
                    <li>• Maintain professional relationship for potential re-engagement</li>
                    <li>• Document all lessons learned while context is fresh</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: AI Guidance */}
          {currentStep === 2 && (
            <div className="space-y-4 pr-4">
              {!aiGuidance ? (
                <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                  <CardContent className="p-8 text-center">
                    <Brain className="h-16 w-16 text-violet-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">AI Offboarding Guidance</h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                      Get AI-powered recommendations for this specific offboarding scenario, 
                      including risk mitigation, communication strategy, and best practices.
                    </p>
                    <Button 
                      onClick={generateAIGuidance}
                      disabled={loading}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Guidance...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate AI Guidance
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <Brain className="h-4 w-4 text-violet-400" />
                      AI Offboarding Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="pr-4">
                        <ReactMarkdown 
                          className="prose prose-sm prose-invert max-w-none"
                          components={{
                            h1: ({children}) => <h1 className="text-lg font-bold text-white mb-3 mt-4 first:mt-0 border-b border-[#2a3548] pb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-semibold text-white mb-2 mt-3">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-medium text-white mb-2 mt-2">{children}</h3>,
                            p: ({children}) => <p className="text-slate-300 mb-2 text-sm leading-relaxed">{children}</p>,
                            ul: ({children}) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                            strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                          }}
                        >
                          {aiGuidance}
                        </ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Finalize */}
          {currentStep === 3 && (
            <div className="space-y-4 pr-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                <CardContent className="p-4">
                  <Archive className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white text-center mb-2">Ready to Offboard</h3>
                  <p className="text-sm text-slate-400 text-center">
                    Review checklist completion and finalize offboarding
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Client</div>
                      <div className="text-sm text-white font-semibold">{client?.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Reason</div>
                      <div className="text-sm text-white">{formData.reason_category.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Checklist Status</div>
                      <div className="flex items-center gap-2">
                        <Progress value={checklistProgress} className="flex-1 h-2" />
                        <span className="text-sm text-white font-semibold">
                          {Object.values(checklist).filter(Boolean).length}/{EXIT_CHECKLIST.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {checklistProgress < 100 && (
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Incomplete Checklist</h4>
                        <p className="text-xs text-slate-400">
                          Some items are not completed. Ensure all critical tasks are done before finalizing.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label className="text-slate-300">Lessons Learned</Label>
                <Textarea
                  value={formData.lessons_learned}
                  onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                  placeholder="Document key learnings from this client relationship..."
                  className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white h-32"
                />
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-[#2a3548]">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 0) onOpenChange(false);
              else if (currentStep === 2 && !aiGuidance) setCurrentStep(1);
              else setCurrentStep(currentStep - 1);
            }}
            disabled={loading}
            className="border-[#2a3548] text-slate-400 hover:bg-[#2a3548] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={() => {
              if (currentStep === 0) setCurrentStep(1);
              else if (currentStep === 1) setCurrentStep(2);
              else if (currentStep === 3) handleComplete();
            }}
            disabled={
              loading || 
              (currentStep === 0 && !formData.offboarding_reason) ||
              currentStep === 2
            }
            className="bg-amber-600 hover:bg-amber-700"
          >
            {currentStep === 3 ? (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Complete Offboarding
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}