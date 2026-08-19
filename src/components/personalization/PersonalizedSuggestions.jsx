import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Brain, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function PersonalizedSuggestions({ suggestions, onAction, onDismiss }) {
  const [dismissed, setDismissed] = useState([]);

  if (!suggestions || suggestions.length === 0) return null;

  const activeSuggestions = suggestions.filter(s => !dismissed.includes(s.title));

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'task': return <CheckCircle2 className="h-4 w-4" />;
      case 'insight': return <TrendingUp className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'from-rose-500/20 to-red-500/20 border-rose-500/30';
      case 'high': return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'medium': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
    }
  };

  const handleDismiss = (suggestion) => {
    setDismissed([...dismissed, suggestion.title]);
    if (onDismiss) onDismiss(suggestion);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-400" />
          AI Personalized Recommendations
          <Badge className="ml-auto bg-indigo-500/20 text-indigo-400">
            {activeSuggestions.length} for you
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <AnimatePresence>
            {activeSuggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`bg-gradient-to-r ${getPriorityColor(suggestion.priority)} border hover:shadow-lg transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        suggestion.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                        suggestion.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {getIcon(suggestion.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-white text-sm">{suggestion.title}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-white"
                            onClick={() => handleDismiss(suggestion)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{suggestion.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              suggestion.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                              suggestion.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {suggestion.priority}
                            </Badge>
                            {suggestion.entity_type && (
                              <Badge className="text-xs bg-slate-500/20 text-slate-400">
                                {suggestion.entity_type}
                              </Badge>
                            )}
                          </div>
                          {suggestion.action && onAction && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => onAction(suggestion)}
                            >
                              {suggestion.action}
                            </Button>
                          )}
                        </div>
                      </div>
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