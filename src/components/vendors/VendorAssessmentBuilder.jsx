import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Plus, Trash2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VendorAssessmentBuilder() {
  const [generating, setGenerating] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [config, setConfig] = useState({
    vendor_type: "technology",
    criticality: "medium",
    scope: ["security", "compliance", "financial"],
    question_count: 20
  });

  const vendorTypes = [
    { value: "technology", label: "Technology / SaaS" },
    { value: "cloud", label: "Cloud Services" },
    { value: "consulting", label: "Consulting" },
    { value: "data", label: "Data Processing" },
    { value: "infrastructure", label: "Infrastructure" }
  ];

  const scopeAreas = [
    "security", "compliance", "financial", "operational", 
    "data_protection", "business_continuity", "legal"
  ];

  const generateAssessment = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive vendor risk assessment questionnaire with the following parameters:
        
Vendor Type: ${config.vendor_type}
Criticality Level: ${config.criticality}
Assessment Scope: ${config.scope.join(", ")}
Number of Questions: ${config.question_count}

Create ${config.question_count} detailed assessment questions covering the specified scope areas. 
For each question, provide:
- The question text
- Question type (yes_no, multiple_choice, text, rating, file_upload)
- Risk category
- Criticality weight (1-5)
- Guidance for answering
- Potential red flags to watch for

Format questions to evaluate vendor capabilities, security posture, compliance status, and operational maturity.`,
        response_json_schema: {
          type: "object",
          properties: {
            assessment_title: { type: "string" },
            description: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  question: { type: "string" },
                  type: { type: "string" },
                  category: { type: "string" },
                  weight: { type: "number" },
                  guidance: { type: "string" },
                  red_flags: { type: "array", items: { type: "string" } },
                  options: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setAssessment(result);
      toast.success("Assessment generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate assessment");
    } finally {
      setGenerating(false);
    }
  };

  const toggleScope = (area) => {
    setConfig(prev => ({
      ...prev,
      scope: prev.scope.includes(area)
        ? prev.scope.filter(s => s !== area)
        : [...prev.scope, area]
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Powered Vendor Assessment Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">
            Generate custom vendor risk assessments tailored to your specific requirements
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white text-sm">Vendor Type</Label>
              <Select value={config.vendor_type} onValueChange={(v) => setConfig({...config, vendor_type: v})}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {vendorTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm">Criticality Level</Label>
              <Select value={config.criticality} onValueChange={(v) => setConfig({...config, criticality: v})}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="critical" className="text-white">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm mb-2 block">Assessment Scope</Label>
              <div className="flex flex-wrap gap-2">
                {scopeAreas.map(area => (
                  <Badge
                    key={area}
                    onClick={() => toggleScope(area)}
                    className={`cursor-pointer ${
                      config.scope.includes(area)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {area.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white text-sm">Number of Questions</Label>
              <Input
                type="number"
                value={config.question_count}
                onChange={(e) => setConfig({...config, question_count: parseInt(e.target.value)})}
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
                min="5"
                max="50"
              />
            </div>

            <Button
              onClick={generateAssessment}
              disabled={generating || config.scope.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Assessment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {!assessment ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Configure and generate to preview your assessment</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{assessment.assessment_title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{assessment.description}</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {assessment.questions?.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white font-medium">Q{q.id}. {q.question}</p>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {q.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{q.guidance}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-500/20 text-slate-400 text-xs">{q.type}</Badge>
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs">Weight: {q.weight}</Badge>
                      </div>
                    </div>
                  ))}
                  {assessment.questions?.length > 5 && (
                    <p className="text-xs text-slate-500 text-center">
                      +{assessment.questions.length - 5} more questions
                    </p>
                  )}
                </div>

                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Assessment Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}