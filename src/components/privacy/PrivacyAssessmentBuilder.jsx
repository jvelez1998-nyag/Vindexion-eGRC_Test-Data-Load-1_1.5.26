import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Trash2, Brain, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function PrivacyAssessmentBuilder() {
  const [config, setConfig] = useState({
    name: '',
    regulation: 'GDPR',
    scope: [],
    riskAreas: [],
    questionCount: 20
  });
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);

  const regulations = ['GDPR', 'CCPA', 'CPRA', 'HIPAA', 'PIPEDA', 'LGPD', 'PDPA'];
  
  const scopes = [
    'Data Collection', 'Data Processing', 'Data Storage', 'Data Sharing', 
    'Data Subject Rights', 'Consent Management', 'Breach Response', 
    'Vendor Management', 'Cross-Border Transfers', 'Retention & Disposal'
  ];

  const riskAreas = [
    'Unauthorized Access', 'Data Breach', 'Non-Compliance', 'Privacy by Design Gaps',
    'Consent Violations', 'Third-Party Risks', 'Data Minimization Failures'
  ];

  const generateAssessment = async () => {
    if (!config.name || config.scope.length === 0) {
      toast.error("Please provide assessment name and select at least one scope");
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Generate a comprehensive privacy assessment questionnaire for ${config.regulation}.

ASSESSMENT CONFIG:
- Name: ${config.name}
- Regulation: ${config.regulation}
- Scope Areas: ${config.scope.join(', ')}
- Risk Focus: ${config.riskAreas.join(', ')}
- Number of Questions: ${config.questionCount}

Generate ${config.questionCount} assessment questions that:
1. Cover all selected scope areas proportionally
2. Test understanding of ${config.regulation} requirements
3. Include scenario-based questions
4. Assess current practices and controls
5. Identify compliance gaps

Each question should have:
- question text
- question_type: "yes_no" | "multiple_choice" | "text" | "rating"
- options (if applicable)
- compliance_requirement: which regulation article/section
- risk_level: "high" | "medium" | "low"
- scope_area: which scope this tests
- guidance: brief guidance on best practice
- evaluation_criteria: how to score the response

Return JSON with questions array.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  question: { type: "string" },
                  question_type: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  compliance_requirement: { type: "string" },
                  risk_level: { type: "string" },
                  scope_area: { type: "string" },
                  guidance: { type: "string" },
                  evaluation_criteria: { type: "object" }
                }
              }
            }
          }
        }
      });

      setQuestions(response.questions || []);
      toast.success(`Generated ${response.questions?.length || 0} questions`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate assessment");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI-Powered Assessment Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 mb-2 block">Assessment Name</Label>
              <Input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., GDPR Compliance Assessment 2025"
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <div>
              <Label className="text-slate-400 mb-2 block">Primary Regulation</Label>
              <Select value={config.regulation} onValueChange={(v) => setConfig({ ...config, regulation: v })}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {regulations.map(reg => (
                    <SelectItem key={reg} value={reg} className="text-white">{reg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Scope Areas (select multiple)</Label>
            <div className="grid md:grid-cols-3 gap-2 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] max-h-48 overflow-y-auto">
              {scopes.map(scope => (
                <div key={scope} className="flex items-center gap-2">
                  <Checkbox
                    id={scope}
                    checked={config.scope.includes(scope)}
                    onCheckedChange={(checked) => {
                      setConfig({
                        ...config,
                        scope: checked 
                          ? [...config.scope, scope]
                          : config.scope.filter(s => s !== scope)
                      });
                    }}
                  />
                  <Label htmlFor={scope} className="text-xs text-slate-300 cursor-pointer">
                    {scope}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Risk Focus Areas (optional)</Label>
            <div className="grid md:grid-cols-3 gap-2 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              {riskAreas.map(risk => (
                <div key={risk} className="flex items-center gap-2">
                  <Checkbox
                    id={risk}
                    checked={config.riskAreas.includes(risk)}
                    onCheckedChange={(checked) => {
                      setConfig({
                        ...config,
                        riskAreas: checked 
                          ? [...config.riskAreas, risk]
                          : config.riskAreas.filter(r => r !== risk)
                      });
                    }}
                  />
                  <Label htmlFor={risk} className="text-xs text-slate-300 cursor-pointer">
                    {risk}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Number of Questions</Label>
            <Input
              type="number"
              min="10"
              max="50"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
              className="bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>

          <Button
            onClick={generateAssessment}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Brain className="h-4 w-4 mr-2" />Generate Assessment</>}
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Generated Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">Q{idx + 1}.</span>
                      <Badge className={`text-xs ${
                        q.risk_level === 'high' ? 'bg-rose-500/20 text-rose-400' :
                        q.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {q.risk_level}
                      </Badge>
                      <Badge className="text-xs bg-purple-500/20 text-purple-400">{q.scope_area}</Badge>
                    </div>
                    <p className="text-sm text-slate-300">{q.question}</p>
                  </div>
                </div>
                {q.compliance_requirement && (
                  <div className="text-xs text-slate-500 mt-2">📋 {q.compliance_requirement}</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}