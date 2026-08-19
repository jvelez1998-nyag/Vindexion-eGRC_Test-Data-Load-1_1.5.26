import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LinkedEntitiesPanel from "@/components/linking/LinkedEntitiesPanel";
import EntityLinker from "@/components/linking/EntityLinker";
import { Link2, Sparkles, Loader2, RefreshCw, Wand2, Tag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const frameworks = [
  "SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", 
  "HIPAA", "NIST", "COBIT", "FFIEC", "DORA",
  "EU_AI_ACT", "CCPA", "NYDFS", "DSA"
];

export default function QuestionForm({ question, onSubmit, onCancel }) {
  const [linkerOpen, setLinkerOpen] = useState(false);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [formData, setFormData] = useState({
    question_text: "",
    options: ["A) ", "B) ", "C) ", "D) "],
    correct_answer: "A",
    explanation: "",
    framework: "SOX",
    difficulty: "intermediate",
    question_type: "scenario",
    control_domain: "",
    risk_category: "",
    regulation_section: "",
    related_controls: [],
    linked_compliance: [],
    linked_controls: [],
    linked_risks: [],
    risk_level: "medium",
    tags: [],
    is_verified: false,
    status: "active"
  });

  const [tagInput, setTagInput] = useState("");
  const [controlInput, setControlInput] = useState("");

  useEffect(() => {
    if (question) {
      setFormData({
        ...question,
        related_controls: question.related_controls || [],
        linked_compliance: question.linked_compliance || [],
        linked_controls: question.linked_controls || [],
        linked_risks: question.linked_risks || [],
        tags: question.tags || []
      });
    }
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addControl = () => {
    if (controlInput.trim() && !formData.related_controls.includes(controlInput.trim())) {
      setFormData({ ...formData, related_controls: [...formData.related_controls, controlInput.trim()] });
      setControlInput("");
    }
  };

  const removeControl = (ctrl) => {
    setFormData({ ...formData, related_controls: formData.related_controls.filter(c => c !== ctrl) });
  };

  const refineWithAI = async (action) => {
    setAiRefining(true);
    try {
      let prompt = "";
      
      if (action === "rephrase") {
        prompt = `Rephrase this ${formData.framework} exam question for better clarity and precision:

Question: ${formData.question_text}
Options: ${formData.options.join(', ')}
Correct Answer: ${formData.correct_answer}
Explanation: ${formData.explanation}

Provide a rephrased version that is clearer, more precise, and professionally worded while maintaining the same difficulty level and testing the same concept.

Return JSON:
{
  "question_text": "rephrased question",
  "explanation": "updated explanation if needed"
}`;
      } else if (action === "difficulty") {
        const targetDifficulty = formData.difficulty === "beginner" ? "intermediate" : 
                                 formData.difficulty === "intermediate" ? "advanced" : "beginner";
        prompt = `Adjust this question to ${targetDifficulty} difficulty level:

Current (${formData.difficulty}): ${formData.question_text}
Options: ${formData.options.join(', ')}

Create a ${targetDifficulty} version that tests the same concept but at the appropriate complexity level. Adjust the scenario, options, and explanation accordingly.

Return JSON:
{
  "question_text": "adjusted question",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "explanation": "updated explanation",
  "difficulty": "${targetDifficulty}"
}`;
      } else if (action === "alternatives") {
        prompt = `Generate 3 alternative answer options for this question, keeping the same correct answer concept:

Question: ${formData.question_text}
Current Options: ${formData.options.join(', ')}
Correct Answer: ${formData.correct_answer}

Provide 3 different sets of answer options that test the same knowledge with different wording or scenarios.

Return JSON:
{
  "option_sets": [
    ["A) ...", "B) ...", "C) ...", "D) ..."],
    ["A) ...", "B) ...", "C) ...", "D) ..."],
    ["A) ...", "B) ...", "C) ...", "D) ..."]
  ]
}`;
      } else if (action === "tags") {
        prompt = `Analyze this question and suggest relevant tags and applicable frameworks:

Question: ${formData.question_text}
Current Framework: ${formData.framework}
Current Tags: ${formData.tags.join(', ') || 'none'}

Suggest:
1. 5-8 relevant tags (e.g., access-control, encryption, audit-trail)
2. All applicable regulatory frameworks
3. Control domains this question relates to

Return JSON:
{
  "suggested_tags": ["tag1", "tag2", ...],
  "applicable_frameworks": ["SOX", "ISO27001", ...],
  "control_domains": ["domain1", "domain2", ...]
}`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: action === "rephrase" ? {
            question_text: { type: "string" },
            explanation: { type: "string" }
          } : action === "difficulty" ? {
            question_text: { type: "string" },
            options: { type: "array" },
            explanation: { type: "string" },
            difficulty: { type: "string" }
          } : action === "alternatives" ? {
            option_sets: { type: "array" }
          } : {
            suggested_tags: { type: "array" },
            applicable_frameworks: { type: "array" },
            control_domains: { type: "array" }
          }
        }
      });

      setAiSuggestions({ action, data: response });
      setShowAiPanel(true);
      toast.success("AI suggestions generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI suggestions");
    } finally {
      setAiRefining(false);
    }
  };

  const applySuggestion = (suggestion) => {
    if (aiSuggestions.action === "rephrase") {
      setFormData(prev => ({
        ...prev,
        question_text: suggestion.question_text,
        explanation: suggestion.explanation
      }));
    } else if (aiSuggestions.action === "difficulty") {
      setFormData(prev => ({
        ...prev,
        question_text: suggestion.question_text,
        options: suggestion.options,
        explanation: suggestion.explanation,
        difficulty: suggestion.difficulty
      }));
    } else if (aiSuggestions.action === "alternatives") {
      setFormData(prev => ({
        ...prev,
        options: suggestion
      }));
    } else if (aiSuggestions.action === "tags") {
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...suggestion.suggested_tags])]
      }));
    }
    toast.success("Suggestion applied!");
    setShowAiPanel(false);
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>{question ? "Edit Question" : "Add Question"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* AI Refinement Panel */}
            {question && (
              <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-violet-400" />
                      <h4 className="text-sm font-semibold text-white">AI Question Refinement</h4>
                    </div>
                    <Badge className="bg-violet-500/20 text-violet-300 text-[10px]">Beta</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refineWithAI("rephrase")}
                      disabled={aiRefining}
                      className="border-violet-500/30 hover:bg-violet-500/10 text-violet-300"
                    >
                      {aiRefining ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                      Rephrase
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refineWithAI("difficulty")}
                      disabled={aiRefining}
                      className="border-violet-500/30 hover:bg-violet-500/10 text-violet-300"
                    >
                      {aiRefining ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Adjust Difficulty
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refineWithAI("alternatives")}
                      disabled={aiRefining}
                      className="border-violet-500/30 hover:bg-violet-500/10 text-violet-300"
                    >
                      {aiRefining ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <BookOpen className="h-3 w-3 mr-1" />}
                      Alt. Options
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refineWithAI("tags")}
                      disabled={aiRefining}
                      className="border-violet-500/30 hover:bg-violet-500/10 text-violet-300"
                    >
                      {aiRefining ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Tag className="h-3 w-3 mr-1" />}
                      Suggest Tags
                    </Button>
                  </div>

                  {showAiPanel && aiSuggestions && (
                    <div className="mt-3 p-3 bg-[#1a2332] rounded-lg border border-violet-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-semibold text-violet-300">AI Suggestions</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAiPanel(false)}
                          className="h-6 text-slate-400 hover:text-white"
                        >
                          ×
                        </Button>
                      </div>
                      
                      {aiSuggestions.action === "rephrase" && (
                        <div className="space-y-2">
                          <div className="text-xs text-slate-300 bg-[#151d2e] p-2 rounded">
                            <strong className="text-violet-300">Rephrased:</strong>
                            <p className="mt-1">{aiSuggestions.data.question_text}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => applySuggestion(aiSuggestions.data)}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                          >
                            Apply
                          </Button>
                        </div>
                      )}

                      {aiSuggestions.action === "difficulty" && (
                        <div className="space-y-2">
                          <Badge className="bg-violet-500/20 text-violet-300 mb-2">
                            New Difficulty: {aiSuggestions.data.difficulty}
                          </Badge>
                          <div className="text-xs text-slate-300 bg-[#151d2e] p-2 rounded">
                            <p>{aiSuggestions.data.question_text}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => applySuggestion(aiSuggestions.data)}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                          >
                            Apply
                          </Button>
                        </div>
                      )}

                      {aiSuggestions.action === "alternatives" && (
                        <div className="space-y-2">
                          {aiSuggestions.data.option_sets.map((options, idx) => (
                            <div key={idx} className="p-2 bg-[#151d2e] rounded">
                              <div className="text-[10px] text-violet-400 mb-1">Option Set {idx + 1}</div>
                              {options.map((opt, i) => (
                                <div key={i} className="text-xs text-slate-300">{opt}</div>
                              ))}
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => applySuggestion(options)}
                                className="w-full mt-2 h-7 bg-violet-600 hover:bg-violet-700"
                              >
                                Use This Set
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiSuggestions.action === "tags" && (
                        <div className="space-y-2">
                          <div>
                            <div className="text-[10px] text-violet-400 mb-1">Suggested Tags</div>
                            <div className="flex flex-wrap gap-1">
                              {aiSuggestions.data.suggested_tags.map((tag, idx) => (
                                <Badge key={idx} className="bg-violet-500/20 text-violet-300 text-[10px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {aiSuggestions.data.applicable_frameworks && (
                            <div>
                              <div className="text-[10px] text-violet-400 mb-1">Applicable Frameworks</div>
                              <div className="flex flex-wrap gap-1">
                                {aiSuggestions.data.applicable_frameworks.map((fw, idx) => (
                                  <Badge key={idx} className="bg-blue-500/20 text-blue-300 text-[10px]">
                                    {fw}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => applySuggestion(aiSuggestions.data)}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                          >
                            Add Tags
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div>
              <Label>Question Text *</Label>
              <Textarea
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <Label>Answer Options *</Label>
              <div className="space-y-2">
                {formData.options.map((option, idx) => (
                  <Input
                    key={idx}
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    required
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Correct Answer *</Label>
              <Select value={formData.correct_answer} onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="A" className="text-white">A</SelectItem>
                  <SelectItem value="B" className="text-white">B</SelectItem>
                  <SelectItem value="C" className="text-white">C</SelectItem>
                  <SelectItem value="D" className="text-white">D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Explanation *</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Framework *</Label>
                <Select value={formData.framework} onValueChange={(value) => setFormData({ ...formData, framework: value })}>
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
                <Label>Difficulty *</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Question Type</Label>
                <Select value={formData.question_type} onValueChange={(value) => setFormData({ ...formData, question_type: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="scenario" className="text-white">Scenario</SelectItem>
                    <SelectItem value="definition" className="text-white">Definition</SelectItem>
                    <SelectItem value="technical" className="text-white">Technical</SelectItem>
                    <SelectItem value="conceptual" className="text-white">Conceptual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Risk Level</Label>
                <Select value={formData.risk_level} onValueChange={(value) => setFormData({ ...formData, risk_level: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
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
            </div>

            <div>
              <Label>Regulation Section</Label>
              <Input
                value={formData.regulation_section}
                onChange={(e) => setFormData({ ...formData, regulation_section: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                placeholder="e.g., SOX 404, ISO 27001 A.9"
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" onClick={addTag} variant="outline" className="border-[#2a3548]">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
              />
              <Label htmlFor="verified" className="text-sm cursor-pointer">Mark as verified</Label>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-white">🔗 Link to Platform Entities</Label>
                <Badge className="bg-indigo-500/10 text-indigo-400 text-[10px]">
                  {(formData.linked_compliance?.length || 0) + (formData.linked_controls?.length || 0) + (formData.linked_risks?.length || 0)} linked
                </Badge>
              </div>
              
              <p className="text-xs text-slate-400">
                Connect this question to specific compliance requirements and risks in your platform
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => setLinkerOpen(true)}
                className="w-full border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Manage Entity Links
              </Button>

              {((formData.linked_compliance?.length || 0) + (formData.linked_controls?.length || 0) + (formData.linked_risks?.length || 0)) > 0 && (
                <LinkedEntitiesPanel
                  links={{
                    compliance: formData.linked_compliance,
                    controls: formData.linked_controls,
                    risks: formData.linked_risks
                  }}
                />
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {question ? "Update" : "Add"} Question
              </Button>
              <Button type="button" onClick={onCancel} variant="outline" className="border-[#2a3548]">
                Cancel
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>

      <EntityLinker
        open={linkerOpen}
        onOpenChange={setLinkerOpen}
        sourceEntity={formData}
        sourceType="question"
        onLinksUpdated={(links) => {
          setFormData(prev => ({
            ...prev,
            linked_compliance: links.compliance || [],
            linked_controls: links.controls || [],
            linked_risks: links.risks || []
          }));
        }}
      />
    </Dialog>
  );
}