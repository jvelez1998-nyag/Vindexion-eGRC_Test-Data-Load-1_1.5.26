import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Network, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AutomatedFrameworkMapper({ controls, compliance, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState(null);

  async function runAutomatedMapping() {
    setLoading(true);
    try {
      const prompt = `As a compliance automation expert, automatically map controls to compliance frameworks.

CONTROLS TO MAP (${controls.length} controls):
${controls.slice(0, 30).map(c => `- ${c.name} (${c.domain}, ${c.category}): ${c.description || 'N/A'}`).join('\n')}

FRAMEWORKS TO MAP:
- SOC 2 (Trust Services Criteria: CC1-CC9, A1, P1, C1, etc.)
- ISO 27001 (Annex A controls: A.5-A.18)
- NIST CSF (ID, PR, DE, RS, RC functions)
- PCI-DSS (Requirements 1-12)
- HIPAA (164.308, 164.310, 164.312, etc.)

MAP EACH CONTROL TO RELEVANT FRAMEWORKS:

For each control, identify:
1. All applicable framework requirements
2. Mapping confidence level (High/Medium/Low)
3. Coverage assessment (Full/Partial/Minimal)
4. Implementation guidance

Return 30-50 control mappings with detailed framework associations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            control_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  soc2_mappings: { type: "array", items: { type: "string" } },
                  iso27001_mappings: { type: "array", items: { type: "string" } },
                  nist_mappings: { type: "array", items: { type: "string" } },
                  pci_dss_mappings: { type: "array", items: { type: "string" } },
                  hipaa_mappings: { type: "array", items: { type: "string" } },
                  confidence: { type: "string" },
                  coverage: { type: "string" },
                  implementation_notes: { type: "string" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_mapped: { type: "number" },
                framework_coverage: {
                  type: "object",
                  properties: {
                    soc2: { type: "number" },
                    iso27001: { type: "number" },
                    nist: { type: "number" },
                    pci_dss: { type: "number" },
                    hipaa: { type: "number" }
                  }
                },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setMappings(result);
      toast.success("Automated mapping complete");
    } catch (error) {
      console.error(error);
      toast.error("Mapping failed");
    } finally {
      setLoading(false);
    }
  }

  async function applyMapping(controlMapping) {
    const control = controls.find(c => c.name === controlMapping.control_name);
    if (!control) return;

    try {
      const frameworkMappings = {
        SOC2: controlMapping.soc2_mappings || [],
        ISO27001: controlMapping.iso27001_mappings || [],
        NIST: controlMapping.nist_mappings || [],
        'PCI-DSS': controlMapping.pci_dss_mappings || [],
        HIPAA: controlMapping.hipaa_mappings || []
      };

      await base44.entities.Control.update(control.id, {
        framework_mappings: frameworkMappings
      });

      toast.success(`Mapping applied to ${control.name}`);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to apply mapping");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          {!mappings ? (
            <div className="text-center">
              <Network className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Framework Mapping</h3>
              <p className="text-sm text-slate-400 mb-4">
                Automatically map controls to SOC 2, ISO 27001, NIST CSF, PCI-DSS, and HIPAA frameworks using AI.
              </p>
              <Button onClick={runAutomatedMapping} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mapping Controls...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run Automated Mapping
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Mapping Results</h3>
                  <p className="text-sm text-slate-400">{mappings.summary.total_mapped} controls mapped</p>
                </div>
                <Button onClick={runAutomatedMapping} variant="outline" className="border-indigo-500/30 text-indigo-400">
                  <Brain className="h-4 w-4 mr-2" />
                  Re-map
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(mappings.summary.framework_coverage).map(([framework, count]) => (
                  <div key={framework} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <p className="text-xs text-slate-400 mb-1">{framework.toUpperCase()}</p>
                    <p className="text-xl font-bold text-indigo-400">{count}</p>
                  </div>
                ))}
              </div>

              {mappings.summary.recommendations && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-400 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {mappings.summary.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-slate-300">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {mappings && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm">Control Mappings ({mappings.control_mappings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {mappings.control_mappings.map((mapping, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex-1">{mapping.control_name}</h4>
                      <div className="flex gap-2">
                        <Badge className={`${
                          mapping.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' :
                          mapping.confidence === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        } text-xs`}>
                          {mapping.confidence}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{mapping.coverage}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {mapping.soc2_mappings?.length > 0 && (
                        <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                          <p className="text-xs font-medium text-purple-400 mb-1">SOC 2:</p>
                          <div className="flex flex-wrap gap-1">
                            {mapping.soc2_mappings.map((m, i) => (
                              <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">{m}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {mapping.iso27001_mappings?.length > 0 && (
                        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                          <p className="text-xs font-medium text-blue-400 mb-1">ISO 27001:</p>
                          <div className="flex flex-wrap gap-1">
                            {mapping.iso27001_mappings.map((m, i) => (
                              <Badge key={i} className="bg-blue-500/20 text-blue-300 text-xs">{m}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {mapping.nist_mappings?.length > 0 && (
                        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-xs font-medium text-emerald-400 mb-1">NIST CSF:</p>
                          <div className="flex flex-wrap gap-1">
                            {mapping.nist_mappings.map((m, i) => (
                              <Badge key={i} className="bg-emerald-500/20 text-emerald-300 text-xs">{m}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {mapping.pci_dss_mappings?.length > 0 && (
                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs font-medium text-amber-400 mb-1">PCI-DSS:</p>
                          <div className="flex flex-wrap gap-1">
                            {mapping.pci_dss_mappings.map((m, i) => (
                              <Badge key={i} className="bg-amber-500/20 text-amber-300 text-xs">{m}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {mapping.implementation_notes && (
                      <p className="text-xs text-slate-400 mb-3">{mapping.implementation_notes}</p>
                    )}

                    <Button 
                      size="sm"
                      onClick={() => applyMapping(mapping)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Apply Mapping
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}