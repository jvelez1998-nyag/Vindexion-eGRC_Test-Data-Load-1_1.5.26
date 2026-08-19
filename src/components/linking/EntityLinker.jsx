import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link2, Sparkles, Loader2, CheckCircle2, ExternalLink, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function EntityLinker({ 
  open, 
  onOpenChange, 
  sourceEntity, 
  sourceType, 
  onLinksUpdated 
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({
    risks: [],
    controls: [],
    compliance: [],
    questions: [],
    frameworks: []
  });
  const [selectedLinks, setSelectedLinks] = useState({
    risks: sourceEntity?.linked_risks || [],
    controls: sourceEntity?.linked_controls || [],
    compliance: sourceEntity?.linked_compliance || [],
    questions: sourceEntity?.linked_questions || [],
    frameworks: sourceEntity?.linked_frameworks || []
  });

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const [risks, controls, compliance, questions] = await Promise.all([
        base44.entities.Risk.list(),
        base44.entities.Control.list(),
        base44.entities.Compliance.list(),
        base44.entities.QuestionBank.list()
      ]);

      const entityDescription = JSON.stringify(sourceEntity).substring(0, 1000);

      const prompt = `Analyze this ${sourceType} entity and suggest relevant links:

Entity: ${entityDescription}

Available entities:
- ${risks.length} Risks
- ${controls.length} Controls  
- ${compliance.length} Compliance Requirements
- ${questions.length} Questions

Suggest the most relevant 5 entities of each type that should be linked. Return entity IDs and relevance scores.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  relevance_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  relevance_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            compliance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  requirement: { type: "string" },
                  relevance_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  question: { type: "string" },
                  relevance_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
      toast.success("Suggestions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const toggleLink = (category, id) => {
    setSelectedLinks(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter(i => i !== id)
        : [...prev[category], id]
    }));
  };

  const saveLinks = () => {
    onLinksUpdated?.(selectedLinks);
    onOpenChange(false);
    toast.success("Links updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Link2 className="h-5 w-5 text-indigo-400" />
            Entity Linking
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <Button
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {loading ? "Analyzing..." : "Generate AI Suggestions"}
          </Button>
        </div>

        <Tabs defaultValue="risks" className="px-6">
          <TabsList className="bg-[#151d2e] border border-[#2a3548]">
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="risks" className="space-y-2">
              {suggestions.risks?.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Generate suggestions to see relevant risks
                </div>
              ) : (
                suggestions.risks?.map((item, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all ${
                      selectedLinks.risks.includes(item.id)
                        ? 'bg-indigo-500/20 border-indigo-500/40'
                        : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                    }`}
                    onClick={() => toggleLink('risks', item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                          <p className="text-xs text-slate-400">{item.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-500/20 text-indigo-400">
                            {Math.round(item.relevance_score * 100)}%
                          </Badge>
                          {selectedLinks.risks.includes(item.id) && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="controls" className="space-y-2">
              {suggestions.controls?.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Generate suggestions to see relevant controls
                </div>
              ) : (
                suggestions.controls?.map((item, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all ${
                      selectedLinks.controls.includes(item.id)
                        ? 'bg-blue-500/20 border-blue-500/40'
                        : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                    }`}
                    onClick={() => toggleLink('controls', item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white mb-1">{item.name}</h4>
                          <p className="text-xs text-slate-400">{item.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {Math.round(item.relevance_score * 100)}%
                          </Badge>
                          {selectedLinks.controls.includes(item.id) && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-2">
              {suggestions.compliance?.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Generate suggestions to see relevant compliance requirements
                </div>
              ) : (
                suggestions.compliance?.map((item, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all ${
                      selectedLinks.compliance.includes(item.id)
                        ? 'bg-emerald-500/20 border-emerald-500/40'
                        : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                    }`}
                    onClick={() => toggleLink('compliance', item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white mb-1">{item.requirement}</h4>
                          <p className="text-xs text-slate-400">{item.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            {Math.round(item.relevance_score * 100)}%
                          </Badge>
                          {selectedLinks.compliance.includes(item.id) && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-2">
              {suggestions.questions?.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Generate suggestions to see relevant exam questions
                </div>
              ) : (
                suggestions.questions?.map((item, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all ${
                      selectedLinks.questions.includes(item.id)
                        ? 'bg-purple-500/20 border-purple-500/40'
                        : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                    }`}
                    onClick={() => toggleLink('questions', item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">{item.question}</h4>
                          <p className="text-xs text-slate-400">{item.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-500/20 text-purple-400">
                            {Math.round(item.relevance_score * 100)}%
                          </Badge>
                          {selectedLinks.questions.includes(item.id) && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-6 pt-0 border-t border-[#2a3548] flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Badge className="bg-indigo-500/20 text-indigo-400 text-sm py-2 px-3">
              {Object.values(selectedLinks).flat().length} links selected
            </Badge>
            <Button onClick={saveLinks} className="bg-indigo-600 hover:bg-indigo-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Links
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}