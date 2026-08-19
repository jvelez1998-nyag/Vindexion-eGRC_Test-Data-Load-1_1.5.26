import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, Shield, Plus, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIControlSuggestionEngine({ risk, onControlsGenerated }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedControls, setSelectedControls] = useState([]);

  const generateControlSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `You are a GRC expert. Analyze this risk and suggest relevant controls:

RISK DETAILS:
Title: ${risk.title}
Category: ${risk.category}
Description: ${risk.description || 'Not provided'}
Likelihood: ${risk.likelihood}/5
Impact: ${risk.impact}/5
Risk Score: ${(risk.likelihood || 0) * (risk.impact || 0)}

TASK: Suggest 5-7 specific, actionable controls to mitigate this risk. For each control:
- Provide a clear name and detailed description
- Specify the control type (preventive, detective, corrective, or compensating)
- Rate the effectiveness (1-5)
- Estimate implementation complexity (low, medium, high)
- Suggest priority level based on risk score and control effectiveness

Consider industry best practices, regulatory requirements, and practical implementation.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  control_type: { type: "string" },
                  effectiveness: { type: "number" },
                  implementation_complexity: { type: "string" },
                  priority: { type: "string" },
                  rationale: { type: "string" }
                }
              }
            },
            analysis_summary: { type: "string" }
          }
        }
      });

      setSuggestions(response.controls || []);
      toast.success("Control suggestions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const toggleControl = (index) => {
    setSelectedControls(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const createSelectedControls = async () => {
    if (selectedControls.length === 0) {
      toast.warning("Select at least one control");
      return;
    }

    try {
      const controlsToCreate = selectedControls.map(idx => ({
        ...suggestions[idx],
        linked_risks: [risk.id],
        status: 'planned',
        owner: risk.owner
      }));

      await Promise.all(
        controlsToCreate.map(control => base44.entities.Control.create(control))
      );

      toast.success(`Created ${controlsToCreate.length} controls`);
      onControlsGenerated && onControlsGenerated(controlsToCreate);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create controls");
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-rose-500/10 text-rose-400';
      case 'high': return 'bg-orange-500/10 text-orange-400';
      case 'medium': return 'bg-amber-500/10 text-amber-400';
      case 'low': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          AI Control Recommendations
        </CardTitle>
        <p className="text-sm text-slate-400 mt-1">
          Get AI-powered control suggestions tailored to this risk
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 w-fit mx-auto mb-4">
              <Shield className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              Generate Control Suggestions
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              AI will analyze this risk and suggest relevant controls
            </p>
            <Button 
              onClick={generateControlSuggestions}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/10 text-indigo-400">
                  {suggestions.length} controls suggested
                </Badge>
                {selectedControls.length > 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-400">
                    {selectedControls.length} selected
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={generateControlSuggestions}
                  disabled={loading}
                  className="border-[#2a3548]"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
                {selectedControls.length > 0 && (
                  <Button 
                    size="sm"
                    onClick={createSelectedControls}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Controls
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {suggestions.map((control, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleControl(idx)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedControls.includes(idx)
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-[#2a3548] hover:border-[#3a4558] bg-[#151d2e]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <CheckCircle2 
                        className={`h-5 w-5 mt-0.5 ${
                          selectedControls.includes(idx) 
                            ? 'text-indigo-400' 
                            : 'text-slate-600'
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{control.name}</h4>
                        <p className="text-sm text-slate-400 mb-2">{control.description}</p>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(control.priority)}>
                      {control.priority}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-xs border-[#2a3548] text-slate-400">
                      {control.control_type}
                    </Badge>
                    <Badge className={getComplexityColor(control.implementation_complexity)}>
                      {control.implementation_complexity} complexity
                    </Badge>
                    <Badge className="bg-blue-500/10 text-blue-400">
                      {control.effectiveness}/5 effectiveness
                    </Badge>
                  </div>

                  {control.rationale && (
                    <div className="text-xs text-slate-500 bg-[#0f1623] rounded p-2 border border-[#2a3548]">
                      <strong className="text-slate-400">Why: </strong>
                      {control.rationale}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}