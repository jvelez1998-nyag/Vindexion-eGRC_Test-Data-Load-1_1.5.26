import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Circle, Network, FileText, Brain, Shield, Target, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const MAPPING_STEPS = [
  { id: 'frameworks', title: 'Select Frameworks', icon: Network },
  { id: 'requirements', title: 'Source Requirements', icon: FileText },
  { id: 'mapping', title: 'AI Mapping', icon: Brain },
  { id: 'validation', title: 'Validate & Refine', icon: Shield },
  { id: 'gaps', title: 'Gap Analysis', icon: Target }
];

const FRAMEWORKS = [
  'SOX', 'SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA', 'NIST CSF', 
  'COBIT', 'GDPR', 'CCPA', 'DORA', 'EU AI Act', 'FFIEC'
];

export default function CrossWalkMappingEngine({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mappingData, setMappingData] = useState({
    source_framework: '',
    target_framework: '',
    source_requirements: '',
    mapping_rules: [],
    gaps: [],
    coverage_percentage: 0,
    status: 'draft'
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMappings, setAiMappings] = useState([]);

  const updateData = (field, value) => {
    setMappingData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIMappings = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are a compliance framework mapping expert. Create a cross-walk mapping:

Source Framework: ${mappingData.source_framework}
Target Framework: ${mappingData.target_framework}
Source Requirements: ${mappingData.source_requirements || 'All standard requirements'}

Generate:
1. Detailed mappings array - each with source_requirement, target_requirements (array), mapping_type (direct/partial/none), confidence_score (0-100), notes
2. Coverage percentage (0-100)
3. Gap analysis - array of gaps with description and severity
4. Recommendations for addressing gaps`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source_requirement: { type: "string" },
                  target_requirements: { type: "array", items: { type: "string" } },
                  mapping_type: { type: "string" },
                  confidence_score: { type: "number" },
                  notes: { type: "string" }
                }
              }
            },
            coverage_percentage: { type: "number" },
            gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiMappings(response.mappings || []);
      setMappingData(prev => ({
        ...prev,
        mapping_rules: response.mappings || [],
        coverage_percentage: response.coverage_percentage || 0,
        gaps: response.gaps || [],
        recommendations: response.recommendations
      }));
      toast.success("AI mapping generated");
    } catch (error) {
      toast.error("Failed to generate mapping");
    } finally {
      setAiLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return mappingData.source_framework && mappingData.target_framework;
      case 1: return true;
      case 2: return aiMappings.length > 0;
      case 3: return true;
      case 4: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < MAPPING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 1) {
        generateAIMappings();
      }
    } else {
      onComplete?.(mappingData);
    }
  };

  const progress = ((currentStep + 1) / MAPPING_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Mapping Progress</h3>
            <span className="text-sm text-slate-400">{currentStep + 1} of {MAPPING_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {MAPPING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-violet-500/20 border border-violet-500/40' :
                      isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      'bg-[#151d2e] border border-[#2a3548]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 text-violet-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${
                      isCurrent ? 'text-violet-400 font-medium' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < MAPPING_STEPS.length - 1 && (
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
          <CardTitle className="text-lg">{MAPPING_STEPS[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {/* Step 0: Select Frameworks */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Source Framework *</Label>
                  <Select value={mappingData.source_framework} onValueChange={(v) => updateData('source_framework', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select source framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {FRAMEWORKS.map(fw => (
                        <SelectItem key={fw} value={fw} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548] focus:text-white">{fw}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Target Framework *</Label>
                  <Select value={mappingData.target_framework} onValueChange={(v) => updateData('target_framework', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select target framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {FRAMEWORKS.filter(fw => fw !== mappingData.source_framework).map(fw => (
                        <SelectItem key={fw} value={fw} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548] focus:text-white">{fw}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-lg">
                  <p className="text-xs text-violet-400 mb-2 font-medium">ℹ️ Framework Mapping</p>
                  <p className="text-xs text-slate-400">
                    Cross-walk mapping helps identify how requirements from one framework align with another, ensuring comprehensive compliance coverage.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Requirements */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Source Requirements (Optional)</Label>
                  <Textarea
                    value={mappingData.source_requirements}
                    onChange={(e) => updateData('source_requirements', e.target.value)}
                    placeholder="Specify particular requirements to map, or leave blank for comprehensive mapping..."
                    rows={8}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400 mb-2 font-medium">💡 Tip</p>
                  <p className="text-xs text-slate-400">
                    Leave blank to map all standard {mappingData.source_framework} requirements to {mappingData.target_framework}, or specify particular requirements for focused mapping.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: AI Mapping */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {aiLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-violet-400 mx-auto mb-4" />
                    <p className="text-white font-medium">Generating framework mappings...</p>
                    <p className="text-slate-400 text-sm mt-2">Analyzing {mappingData.source_framework} → {mappingData.target_framework}</p>
                  </div>
                ) : aiMappings.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Generated Mappings</h4>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        {aiMappings.length} mappings
                      </Badge>
                    </div>
                    {aiMappings.slice(0, 10).map((mapping, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium mb-1">{mapping.source_requirement}</p>
                              <div className="text-xs text-slate-400">
                                Maps to: {mapping.target_requirements?.join(', ') || 'N/A'}
                              </div>
                            </div>
                            <Badge className={
                              mapping.mapping_type === 'direct' ? 'bg-emerald-500/20 text-emerald-400' :
                              mapping.mapping_type === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              {mapping.mapping_type}
                            </Badge>
                          </div>
                          {mapping.notes && (
                            <p className="text-xs text-slate-500 mt-2">{mapping.notes}</p>
                          )}
                          <div className="mt-2">
                            <Progress value={mapping.confidence_score || 0} className="h-1.5" />
                            <span className="text-xs text-slate-500 mt-1">Confidence: {mapping.confidence_score}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {aiMappings.length > 10 && (
                      <p className="text-xs text-slate-500 text-center">+ {aiMappings.length - 10} more mappings</p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 3: Validation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white">Coverage Analysis</h4>
                      <div className="text-2xl font-bold text-white">{mappingData.coverage_percentage}%</div>
                    </div>
                    <Progress value={mappingData.coverage_percentage} className="h-2" />
                  </CardContent>
                </Card>

                <div>
                  <Label className="text-white mb-2 block">Mapping Summary</Label>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Direct Mappings</span>
                        <span className="text-white font-medium">
                          {aiMappings.filter(m => m.mapping_type === 'direct').length}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Partial Mappings</span>
                        <span className="text-white font-medium">
                          {aiMappings.filter(m => m.mapping_type === 'partial').length}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">No Mapping</span>
                        <span className="text-white font-medium">
                          {aiMappings.filter(m => m.mapping_type === 'none').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Gaps */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-3">Identified Gaps</h4>
                  {mappingData.gaps?.length === 0 ? (
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                      <CardContent className="p-6 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-emerald-400 font-medium">No significant gaps identified</p>
                        <p className="text-slate-400 text-sm mt-1">Excellent framework alignment</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {mappingData.gaps.map((gap, idx) => {
                        const severityColor = 
                          gap.severity === 'critical' ? 'border-rose-500/40 bg-rose-500/5' :
                          gap.severity === 'high' ? 'border-amber-500/40 bg-amber-500/5' :
                          'border-blue-500/40 bg-blue-500/5';
                        
                        return (
                          <Card key={idx} className={`${severityColor}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm text-white flex-1">{gap.description}</p>
                                <Badge className={
                                  gap.severity === 'critical' ? 'bg-rose-500 text-white' :
                                  gap.severity === 'high' ? 'bg-amber-500 text-white' :
                                  'bg-blue-500 text-white'
                                }>
                                  {gap.severity}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {mappingData.recommendations?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {mappingData.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                          <Sparkles className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
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
          disabled={!canProceed() || (currentStep === 2 && aiLoading)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          {currentStep === MAPPING_STEPS.length - 1 ? 'Complete Mapping' : 'Next Step'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}