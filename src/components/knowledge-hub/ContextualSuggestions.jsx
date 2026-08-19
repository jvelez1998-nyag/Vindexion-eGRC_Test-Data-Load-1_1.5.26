import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ExternalLink, BookOpen, TrendingUp } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ContextualSuggestions({ currentModule, currentData, onSuggestionClick }) {
  const [suggestions, setSuggestions] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (currentModule && currentData) {
      generateSuggestions();
    }
  }, [currentModule, currentData, location.pathname]);

  const generateSuggestions = async () => {
    try {
      const prompt = `Based on the user's current activity in the ${currentModule} module, suggest relevant GRC knowledge articles and resources.

**CURRENT CONTEXT:**
Module: ${currentModule}
${currentData ? `Data: ${JSON.stringify(currentData).slice(0, 500)}` : ''}

Provide 5 contextually relevant suggestions that would help the user in their current task.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  relevance: { type: "string" },
                  keywords: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Suggested for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suggestions.slice(0, 5).map((suggestion, idx) => (
            <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-3 hover:border-amber-500/30 cursor-pointer transition-all" onClick={() => onSuggestionClick?.(suggestion)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-white mb-1">{suggestion.title}</h5>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {suggestion.category}
                    </Badge>
                    <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {suggestion.relevance}
                    </Badge>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}