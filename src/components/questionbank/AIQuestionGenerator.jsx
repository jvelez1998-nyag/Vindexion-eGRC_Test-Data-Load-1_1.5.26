import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const frameworks = [
  "SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", 
  "HIPAA", "NIST", "COBIT", "FFIEC", "DORA",
  "EU_AI_ACT", "CCPA", "NYDFS", "DSA"
];

export default function AIQuestionGenerator({ onQuestionsGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState({
    framework: "SOX",
    numQuestions: 10,
    difficulty: "intermediate",
    questionTypes: ["scenario", "definition", "technical", "conceptual"],
    focusArea: ""
  });

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const typesStr = config.questionTypes.length > 0 
        ? config.questionTypes.join(", ") 
        : "scenario-based, definition-based, technical, and conceptual";

      const prompt = `Generate ${config.numQuestions} high-quality exam questions for ${config.framework} compliance at ${config.difficulty} level.
${config.focusArea ? `Focus on: ${config.focusArea}` : ''}

Include a mix of question types: ${typesStr}

For each question provide:
1. Question text (clear, realistic, and relevant)
2. Four answer options (A, B, C, D)
3. Correct answer (letter)
4. Detailed explanation with regulatory citation
5. Regulation section reference
6. Related control IDs
7. Risk level if answered incorrectly
8. Question type
9. Control domain (if applicable)
10. Risk category (if applicable)
11. Relevant tags for searchability

Return as JSON array.`;

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
                  question_text: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  regulation_section: { type: "string" },
                  related_controls: { type: "array", items: { type: "string" } },
                  risk_level: { type: "string" },
                  question_type: { type: "string" },
                  control_domain: { type: "string" },
                  risk_category: { type: "string" },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Save questions to bank
      let savedCount = 0;
      for (const q of response.questions || []) {
        await base44.entities.QuestionBank.create({
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          framework: config.framework,
          difficulty: config.difficulty,
          question_type: q.question_type || "scenario",
          control_domain: q.control_domain,
          risk_category: q.risk_category,
          regulation_section: q.regulation_section,
          related_controls: q.related_controls || [],
          risk_level: q.risk_level || "medium",
          tags: q.tags || [],
          usage_count: 0,
          is_verified: false,
          status: "active"
        });
        savedCount++;
      }

      toast.success(`${savedCount} questions generated and added to bank!`);
      if (onQuestionsGenerated) onQuestionsGenerated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-violet-400" />
        AI Question Generator
      </h2>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Framework</Label>
            <Select value={config.framework} onValueChange={(value) => setConfig({ ...config, framework: value })}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {frameworks.map(fw => (
                  <SelectItem key={fw} value={fw} className="text-white">{fw}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Number of Questions</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={config.numQuestions}
              onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-slate-300 mb-2 block">Difficulty Level</Label>
          <Select value={config.difficulty} onValueChange={(value) => setConfig({ ...config, difficulty: value })}>
            <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
              <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
              <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-300 mb-2 block">Focus Area (optional)</Label>
          <Input
            value={config.focusArea}
            onChange={(e) => setConfig({ ...config, focusArea: e.target.value })}
            className="bg-[#151d2e] border-[#2a3548] text-white"
            placeholder="e.g., Access controls, Data encryption, Audit trails"
          />
        </div>

        <Button
          onClick={generateQuestions}
          disabled={generating}
          className="w-full bg-violet-600 hover:bg-violet-700"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Questions with AI
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}