import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Plus, Trash2, AlertTriangle, Shield, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function RiskScenarioBuilder({ onScenarioCreated }) {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState({
    name: '',
    description: '',
    threat_actor: '',
    attack_vector: '',
    vulnerabilities: [],
    impact_areas: [],
    likelihood_factors: []
  });
  const [loading, setLoading] = useState(false);

  const generateScenario = async () => {
    if (!currentScenario.name) {
      toast.error("Please provide a scenario name");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate a detailed risk scenario for: ${currentScenario.name}

${currentScenario.description ? `Context: ${currentScenario.description}` : ''}

Provide:
1. Threat actors (who might exploit this)
2. Attack vectors (how they might exploit)
3. Vulnerabilities (what weaknesses exist)
4. Impact areas (business consequences)
5. Likelihood factors (what makes it more/less likely)
6. Mitigation strategies`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            threat_actor: { type: "string" },
            attack_vector: { type: "string" },
            vulnerabilities: { type: "array", items: { type: "string" } },
            impact_areas: { type: "array", items: { type: "string" } },
            likelihood_factors: { type: "array", items: { type: "string" } },
            mitigation_strategies: { type: "array", items: { type: "string" } }
          }
        }
      });

      setCurrentScenario(prev => ({
        ...prev,
        ...response
      }));

      toast.success("Scenario generated successfully");
    } catch (error) {
      toast.error("Failed to generate scenario");
    } finally {
      setLoading(false);
    }
  };

  const saveScenario = () => {
    if (!currentScenario.name) {
      toast.error("Scenario name is required");
      return;
    }

    setScenarios([...scenarios, { ...currentScenario, id: Date.now() }]);
    
    // Reset for next scenario
    setCurrentScenario({
      name: '',
      description: '',
      threat_actor: '',
      attack_vector: '',
      vulnerabilities: [],
      impact_areas: [],
      likelihood_factors: []
    });

    toast.success("Scenario saved");
  };

  const deleteScenario = (id) => {
    setScenarios(scenarios.filter(s => s.id !== id));
    toast.success("Scenario deleted");
  };

  const addToArray = (field, value) => {
    if (!value.trim()) return;
    setCurrentScenario(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
  };

  const removeFromArray = (field, index) => {
    setCurrentScenario(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Risk Scenario Builder</CardTitle>
            <Button
              onClick={generateScenario}
              disabled={loading || !currentScenario.name}
              variant="outline"
              className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              AI Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="define" className="space-y-4">
            <TabsList className="bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="define">Define Scenario</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="saved">Saved ({scenarios.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="define" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Scenario Name</Label>
                <Input
                  value={currentScenario.name}
                  onChange={(e) => setCurrentScenario(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ransomware Attack on Production Systems"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={currentScenario.description}
                  onChange={(e) => setCurrentScenario(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the scenario context..."
                  rows={4}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Threat Actor */}
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <h4 className="text-sm font-medium text-white">Threat Actor</h4>
                    </div>
                    <Textarea
                      value={currentScenario.threat_actor}
                      onChange={(e) => setCurrentScenario(prev => ({ ...prev, threat_actor: e.target.value }))}
                      placeholder="Who might exploit this risk?"
                      rows={2}
                      className="bg-[#1a2332] border-[#2a3548] text-white"
                    />
                  </div>

                  {/* Attack Vector */}
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-amber-400" />
                      <h4 className="text-sm font-medium text-white">Attack Vector</h4>
                    </div>
                    <Textarea
                      value={currentScenario.attack_vector}
                      onChange={(e) => setCurrentScenario(prev => ({ ...prev, attack_vector: e.target.value }))}
                      placeholder="How might they exploit it?"
                      rows={2}
                      className="bg-[#1a2332] border-[#2a3548] text-white"
                    />
                  </div>

                  {/* Vulnerabilities */}
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <h4 className="text-sm font-medium text-white">Vulnerabilities</h4>
                    </div>
                    <div className="space-y-2">
                      {currentScenario.vulnerabilities?.map((vuln, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline" className="flex-1 justify-start text-white">
                            {vuln}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromArray('vulnerabilities', idx)}
                            className="h-6 w-6 text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add vulnerability..."
                          className="bg-[#1a2332] border-[#2a3548] text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addToArray('vulnerabilities', e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Impact Areas */}
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <h4 className="text-sm font-medium text-white mb-3">Impact Areas</h4>
                    <div className="space-y-2">
                      {currentScenario.impact_areas?.map((impact, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline" className="flex-1 justify-start text-white">
                            {impact}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromArray('impact_areas', idx)}
                            className="h-6 w-6 text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Input
                        placeholder="Add impact area..."
                        className="bg-[#1a2332] border-[#2a3548] text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addToArray('impact_areas', e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Likelihood Factors */}
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <h4 className="text-sm font-medium text-white mb-3">Likelihood Factors</h4>
                    <div className="space-y-2">
                      {currentScenario.likelihood_factors?.map((factor, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline" className="flex-1 justify-start text-white">
                            {factor}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromArray('likelihood_factors', idx)}
                            className="h-6 w-6 text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Input
                        placeholder="Add likelihood factor..."
                        className="bg-[#1a2332] border-[#2a3548] text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addToArray('likelihood_factors', e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <Button onClick={saveScenario} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Save Scenario
              </Button>
            </TabsContent>

            <TabsContent value="saved">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {scenarios.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No saved scenarios yet</p>
                    </div>
                  ) : (
                    scenarios.map(scenario => (
                      <Card key={scenario.id} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-white">{scenario.name}</h4>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteScenario(scenario.id)}
                              className="h-6 w-6 text-rose-400 hover:bg-rose-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          {scenario.description && (
                            <p className="text-xs text-slate-400 mb-3">{scenario.description}</p>
                          )}
                          <div className="space-y-2 text-xs">
                            {scenario.threat_actor && (
                              <div>
                                <span className="text-slate-500">Threat: </span>
                                <span className="text-slate-300">{scenario.threat_actor}</span>
                              </div>
                            )}
                            {scenario.vulnerabilities?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {scenario.vulnerabilities.map((v, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px]">{v}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}