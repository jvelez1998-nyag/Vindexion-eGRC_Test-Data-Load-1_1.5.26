import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Sparkles, Loader2, BookOpen, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIQuestionGenerator({ framework, onQuestionsGenerated }) {
  const [config, setConfig] = useState({
    numQuestions: 15,
    topics: [],
    customTopic: '',
    difficultyMix: 'balanced',
    includeScenarios: true,
    includeReferences: true
  });
  const [generating, setGenerating] = useState(false);

  const topicsByFramework = {
    FFIEC: ['Cybersecurity Controls', 'Vendor Management', 'Incident Response', 'Access Controls', 'Network Security', 'Data Protection', 'Business Continuity'],
    GDPR: ['Data Subject Rights', 'Lawful Basis', 'Data Transfers', 'Breach Notification', 'Privacy by Design', 'DPO Requirements', 'Consent Management'],
    NIST: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover', 'Risk Assessment', 'Access Control', 'Security Monitoring'],
    SOX: ['Internal Controls', 'Financial Reporting', 'SOD', 'IT General Controls', 'Entity-Level Controls', 'Management Assessment', 'Deficiency Reporting'],
    ISO27001: ['ISMS', 'Risk Assessment', 'Asset Management', 'Access Control', 'Cryptography', 'Physical Security', 'Operations Security'],
    PCI_DSS: ['Firewall Configuration', 'Cardholder Data', 'Encryption', 'Access Control', 'Monitoring', 'Security Testing', 'Policy Management'],
    HIPAA: ['PHI Protection', 'Access Controls', 'Breach Notification', 'Business Associates', 'Risk Analysis', 'Audit Controls', 'Workforce Security'],
    OCC: ['Safety & Soundness', 'Capital Adequacy', 'Asset Quality', 'Management', 'Earnings', 'Liquidity', 'Sensitivity to Market Risk'],
    SEC: ['Disclosure Requirements', 'Internal Controls', 'Audit Committee', 'Financial Statements', 'MD&A', 'Risk Factors', 'Related Party Transactions']
  };

  const availableTopics = topicsByFramework[framework] || topicsByFramework.FFIEC;

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const selectedTopics = config.topics.length > 0 ? config.topics : availableTopics.slice(0, 3);
      if (config.customTopic) selectedTopics.push(config.customTopic);

      const difficultyDistribution = {
        easy: { beginner: 70, intermediate: 20, advanced: 10 },
        balanced: { beginner: 33, intermediate: 34, advanced: 33 },
        challenging: { beginner: 10, intermediate: 30, advanced: 60 }
      }[config.difficultyMix];

      const prompt = `You are an expert ${framework} regulatory exam question writer. Generate ${config.numQuestions} high-quality exam questions.

REQUIREMENTS:
- Framework: ${framework}
- Topics to cover: ${selectedTopics.join(', ')}
- Difficulty distribution: ${difficultyDistribution.beginner}% beginner, ${difficultyDistribution.intermediate}% intermediate, ${difficultyDistribution.advanced}% advanced
- Include realistic scenarios: ${config.includeScenarios}
- Include regulatory references: ${config.includeReferences}

QUESTION TYPES TO INCLUDE:
- Fact-based questions (testing knowledge of requirements)
- Scenario-based questions (applying knowledge to situations)
- "What would you do" questions (decision-making)
- Control design questions (how to implement)
- Risk assessment questions (identifying and evaluating)

FOR EACH QUESTION PROVIDE:
1. Clear, realistic question (exam-style language)
2. Four answer options (A-D) with one correct answer
3. Detailed explanation (WHY the correct answer is right, WHY others are wrong)
4. Regulatory reference (specific section, article, or standard)
5. Category/topic area
6. Difficulty level
7. Learning objective (what this tests)
8. Common mistakes (what candidates often get wrong)
9. Related concepts (ties to other areas)

${config.includeScenarios ? 'Include at least 40% scenario-based questions with realistic situations.' : ''}
${config.includeReferences ? 'Reference specific regulatory sections, articles, or control families.' : ''}

CRITICAL: Questions must be:
- Realistic and relevant to actual ${framework} implementations
- Clear and unambiguous
- Appropriate for the difficulty level
- Based on current regulations and best practices

Return JSON array of questions.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
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
                  scenario: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  why_others_wrong: { type: "object" },
                  reference: { type: "string" },
                  category: { type: "string" },
                  difficulty: { type: "string" },
                  learning_objective: { type: "string" },
                  common_mistakes: { type: "array", items: { type: "string" } },
                  related_concepts: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      toast.success(`Generated ${response.questions?.length || 0} questions`);
      onQuestionsGenerated(response.questions || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-400" />
          AI Question Generator - {framework}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400 mb-2 block">Number of Questions</Label>
            <Input
              type="number"
              min="5"
              max="50"
              value={config.numQuestions}
              onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
              className="bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
          <div>
            <Label className="text-slate-400 mb-2 block">Difficulty Mix</Label>
            <Select value={config.difficultyMix} onValueChange={(v) => setConfig({ ...config, difficultyMix: v })}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="easy" className="text-white">Easy (70% beginner)</SelectItem>
                <SelectItem value="balanced" className="text-white">Balanced (33% each)</SelectItem>
                <SelectItem value="challenging" className="text-white">Challenging (60% advanced)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-slate-400 mb-2 block">Topics to Cover (select multiple)</Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
            {availableTopics.map(topic => (
              <div key={topic} className="flex items-center gap-2">
                <Checkbox
                  id={topic}
                  checked={config.topics.includes(topic)}
                  onCheckedChange={(checked) => {
                    setConfig({
                      ...config,
                      topics: checked 
                        ? [...config.topics, topic]
                        : config.topics.filter(t => t !== topic)
                    });
                  }}
                />
                <Label htmlFor={topic} className="text-xs text-slate-300 cursor-pointer">
                  {topic}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-slate-400 mb-2 block">Custom Topic (optional)</Label>
          <Input
            value={config.customTopic}
            onChange={(e) => setConfig({ ...config, customTopic: e.target.value })}
            placeholder="e.g., Cloud Security Controls, Third-Party Risk..."
            className="bg-[#0f1623] border-[#2a3548] text-white"
          />
        </div>

        <div className="flex items-center gap-4 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
          <div className="flex items-center gap-2">
            <Checkbox
              id="scenarios"
              checked={config.includeScenarios}
              onCheckedChange={(checked) => setConfig({ ...config, includeScenarios: checked })}
            />
            <Label htmlFor="scenarios" className="text-sm text-slate-300 cursor-pointer">
              Include scenario-based questions
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="references"
              checked={config.includeReferences}
              onCheckedChange={(checked) => setConfig({ ...config, includeReferences: checked })}
            />
            <Label htmlFor="references" className="text-sm text-slate-300 cursor-pointer">
              Include regulatory references
            </Label>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <div className="text-xs text-slate-400 mb-2">Generation Preview:</div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
              {Math.round(config.numQuestions * (difficultyDistribution.beginner / 100))} Beginner
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-400 text-xs">
              {Math.round(config.numQuestions * (difficultyDistribution.intermediate / 100))} Intermediate
            </Badge>
            <Badge className="bg-rose-500/20 text-rose-400 text-xs">
              {Math.round(config.numQuestions * (difficultyDistribution.advanced / 100))} Advanced
            </Badge>
            {config.topics.length > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                {config.topics.length} topics
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={generateQuestions}
          disabled={generating}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating {config.numQuestions} Questions...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />Generate AI Questions</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}