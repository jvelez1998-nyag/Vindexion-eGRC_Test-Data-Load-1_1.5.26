import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AIControlSuggestions({ framework, controls }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const mappedControls = controls.filter(c => c.framework_mappings?.[framework]?.length > 0);
      
      const prompt = `You are a compliance framework expert. Analyze the current control landscape and suggest additional controls needed for ${framework} compliance.

CURRENT CONTROLS:
${mappedControls.map(c => `- ${c.name} (${c.domain}, ${c.status})`).join('\n')}

Total mapped controls: ${mappedControls.length}

Provide:
1. Missing critical controls for ${framework}
2. Control enhancement recommendations
3. Priority level for each suggestion
4. Implementation guidance

Format as JSON with structured suggestions.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            missing_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  requirement: { type: "string" },
                  priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  domain: { type: "string" },
                  implementation_guidance: { type: "string" },
                  estimated_effort: { type: "string" }
                }
              }
            },
            enhancements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  current_state: { type: "string" },
                  recommended_improvement: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setSuggestions(response);
      toast.success("AI suggestions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  };

  return (
    <div className="space-y-6">
      {!suggestions ? (
        <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <Brain className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Control Suggestions</h3>
            <p className="text-slate-400 max-w-2xl mx-auto mb-6">
              Get intelligent recommendations for missing controls and enhancements based on {framework} requirements and industry best practices.
            </p>
            <Button
              onClick={generateSuggestions}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card className="bg-gradient-to-r from-[#1a2332] to-[#151d2e] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                AI Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">{suggestions.summary}</p>
              <Button
                onClick={generateSuggestions}
                disabled={loading}
                size="sm"
                variant="outline"
                className="mt-4 border-[#2a3548]"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </CardContent>
          </Card>

          {/* Missing Controls */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-400" />
                Missing Critical Controls ({suggestions.missing_controls.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 pr-4">
                  {suggestions.missing_controls.map((control, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg mb-1">{control.name}</h4>
                          <p className="text-sm text-slate-400 mb-2">{control.description}</p>
                          <Badge className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {control.requirement}
                          </Badge>
                        </div>
                        <Badge className={`ml-4 ${priorityColors[control.priority]}`}>
                          {control.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-[#1a2332] rounded-lg p-3">
                          <p className="text-xs text-purple-400 font-medium mb-1">Implementation Guidance:</p>
                          <p className="text-sm text-slate-300">{control.implementation_guidance}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-slate-400">Domain: <span className="text-white">{control.domain}</span></span>
                            <span className="text-slate-400">Effort: <span className="text-white">{control.estimated_effort}</span></span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Enhancements */}
          {suggestions.enhancements.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Recommended Enhancements ({suggestions.enhancements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {suggestions.enhancements.map((enhancement, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">{enhancement.control_name}</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-slate-500">Current: </span>
                                <span className="text-slate-400">{enhancement.current_state}</span>
                              </div>
                              <div>
                                <span className="text-purple-400">Recommended: </span>
                                <span className="text-slate-300">{enhancement.recommended_improvement}</span>
                              </div>
                              <div className="bg-emerald-500/5 rounded p-2 mt-2">
                                <span className="text-emerald-400 text-xs font-medium">Benefit: </span>
                                <span className="text-slate-300 text-xs">{enhancement.benefit}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}