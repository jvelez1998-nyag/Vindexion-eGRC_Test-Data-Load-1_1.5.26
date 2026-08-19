import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Link2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AutoLinkSuggester({ entity, entityType, onLinkAccepted }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    if (entity && !loading && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [entity]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `Analyze this ${entityType} and suggest 3 most relevant entities to link:

Entity: ${JSON.stringify(entity).substring(0, 500)}

Suggest specific IDs and explain why each link is relevant. Be concise.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entity_type: { type: "string" },
                  entity_id: { type: "string" },
                  entity_name: { type: "string" },
                  reason: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (suggestion) => {
    onLinkAccepted?.(suggestion);
    setDismissed(prev => [...prev, suggestion.entity_id]);
    toast.success("Link added");
  };

  const handleDismiss = (id) => {
    setDismissed(prev => [...prev, id]);
  };

  const visibleSuggestions = suggestions.filter(s => !dismissed.includes(s.entity_id));

  if (visibleSuggestions.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-medium text-white">AI Suggestions</span>
        </div>
        <div className="space-y-2">
          {visibleSuggestions.map((suggestion, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
              <Link2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white font-medium">{suggestion.entity_name}</span>
                  <Badge className="bg-indigo-500/20 text-indigo-400 text-[10px]">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400">{suggestion.reason}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAccept(suggestion)}
                  className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                >
                  Link
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(suggestion.entity_id)}
                  className="h-7 w-7 p-0 text-slate-500 hover:text-slate-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}