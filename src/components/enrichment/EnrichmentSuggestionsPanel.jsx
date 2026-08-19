import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, Brain, ExternalLink } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnrichmentSuggestionsPanel({ suggestions, onApply, onDismiss }) {
  const [applied, setApplied] = useState([]);

  if (!suggestions || suggestions.length === 0) return null;

  const activeSuggestions = suggestions.filter(s => !applied.includes(s.field));

  const handleApply = (suggestion) => {
    setApplied([...applied, suggestion.field]);
    if (onApply) onApply(suggestion);
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Data Enrichment Suggestions
          <Badge className="ml-auto bg-purple-500/20 text-purple-400">
            {activeSuggestions.length} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {activeSuggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="bg-[#151d2e] border-[#2a3548] hover:border-purple-500/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span className="font-semibold text-white text-sm">
                            {suggestion.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <Badge className={getConfidenceColor(suggestion.confidence)}>
                            {suggestion.confidence} confidence
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-300 mb-2 p-2 rounded bg-[#1a2332] border border-[#2a3548] font-mono">
                          {formatValue(suggestion.suggested_value)}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{suggestion.reasoning}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-indigo-500/20 text-indigo-400">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {suggestion.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleApply(suggestion)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#2a3548]"
                        onClick={() => onDismiss && onDismiss(suggestion)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}