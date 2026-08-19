import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, CheckCircle2, Plus, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AIProcedureGenerator({ program, controls, risks, onProceduresGenerated }) {
  const [selectedControls, setSelectedControls] = useState([]);
  const [selectedRisks, setSelectedRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedProcedures, setGeneratedProcedures] = useState(null);

  const handleControlToggle = (controlId) => {
    setSelectedControls(prev =>
      prev.includes(controlId) ? prev.filter(id => id !== controlId) : [...prev, controlId]
    );
  };

  const handleRiskToggle = (riskId) => {
    setSelectedRisks(prev =>
      prev.includes(riskId) ? prev.filter(id => id !== riskId) : [...prev, riskId]
    );
  };

  const generateProcedures = async () => {
    if (selectedControls.length === 0 && selectedRisks.length === 0) {
      toast.error("Select at least one control or risk");
      return;
    }

    setLoading(true);
    try {
      const selectedControlsData = controls.filter(c => selectedControls.includes(c.id));
      const selectedRisksData = risks.filter(r => selectedRisks.includes(r.id));

      const prompt = `As an audit procedure expert, generate comprehensive audit procedures for a ${program.audit_type} audit program: "${program.name}".

PROGRAM CONTEXT:
Type: ${program.audit_type}
Description: ${program.description || 'Not provided'}
Objectives: ${program.objectives?.join(', ') || 'Not defined'}

SELECTED CONTROLS (${selectedControlsData.length}):
${selectedControlsData.map(c => `
- Control: ${c.name}
  Domain: ${c.domain}
  Type: ${c.category}
  Status: ${c.status}
  Effectiveness: ${c.effectiveness}/5
  Description: ${c.description || 'N/A'}
`).join('\n')}

SELECTED RISKS (${selectedRisksData.length}):
${selectedRisksData.map(r => `
- Risk: ${r.title}
  Category: ${r.category}
  Inherent Risk: ${r.inherent_likelihood}x${r.inherent_impact} = ${r.inherent_risk_score}
  Residual Risk: ${r.residual_likelihood}x${r.residual_impact} = ${r.residual_risk_score}
  Status: ${r.status}
  Description: ${r.description || 'N/A'}
`).join('\n')}

Generate detailed audit procedures that:
1. Test the effectiveness of selected controls
2. Evaluate the management of selected risks
3. Include specific testing steps, sample sizes, and evidence requirements
4. Map procedures to controls and risks
5. Define expected outcomes and criteria for success
6. Include both substantive and compliance testing where appropriate

Return structured JSON with comprehensive procedures.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            total_procedures: { type: "number" },
            estimated_hours: { type: "number" },
            procedures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  procedure_title: { type: "string" },
                  objective: { type: "string" },
                  linked_control_ids: { type: "array", items: { type: "string" } },
                  linked_risk_ids: { type: "array", items: { type: "string" } },
                  testing_steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step_number: { type: "number" },
                        description: { type: "string" },
                        evidence_required: { type: "string" }
                      }
                    }
                  },
                  sample_size: { type: "string" },
                  sampling_method: { type: "string" },
                  test_frequency: { type: "string" },
                  expected_outcome: { type: "string" },
                  success_criteria: { type: "string" },
                  risk_of_failure: { type: "string" },
                  estimated_hours: { type: "number" }
                }
              }
            }
          }
        }
      });

      setGeneratedProcedures(response);
      toast.success("AI procedures generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate procedures");
    } finally {
      setLoading(false);
    }
  };

  const addProceduresToProgram = () => {
    if (generatedProcedures && onProceduresGenerated) {
      onProceduresGenerated(generatedProcedures.procedures);
      setGeneratedProcedures(null);
      setSelectedControls([]);
      setSelectedRisks([]);
    }
  };

  if (generatedProcedures) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">Generated Procedures</h4>
          <div className="flex gap-2">
            <Button onClick={() => setGeneratedProcedures(null)} variant="outline" className="border-[#2a3548]">
              Generate New
            </Button>
            <Button onClick={addProceduresToProgram} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add to Program
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
          <p className="text-sm text-slate-300 mb-4">{generatedProcedures.summary}</p>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-slate-500">Total Procedures:</span>
              <span className="text-white font-semibold ml-2">{generatedProcedures.total_procedures}</span>
            </div>
            <div>
              <span className="text-slate-500">Est. Hours:</span>
              <span className="text-white font-semibold ml-2">{generatedProcedures.estimated_hours}</span>
            </div>
          </div>
        </Card>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            {generatedProcedures.procedures?.map((proc, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                <h5 className="font-semibold text-white mb-2">{proc.procedure_title}</h5>
                <p className="text-sm text-slate-400 mb-3">{proc.objective}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {proc.linked_control_ids?.length > 0 && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                      {proc.linked_control_ids.length} Control(s)
                    </Badge>
                  )}
                  {proc.linked_risk_ids?.length > 0 && (
                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                      {proc.linked_risk_ids.length} Risk(s)
                    </Badge>
                  )}
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    {proc.estimated_hours}h
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h6 className="text-xs font-semibold text-slate-500 mb-2">Testing Steps</h6>
                    <div className="space-y-2">
                      {proc.testing_steps?.map((step, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400">
                            {step.step_number}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-300">{step.description}</p>
                            <p className="text-xs text-slate-500 mt-1">Evidence: {step.evidence_required}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#2a3548]">
                    <div>
                      <h6 className="text-xs font-semibold text-slate-500 mb-1">Sample Size</h6>
                      <p className="text-sm text-slate-300">{proc.sample_size}</p>
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-slate-500 mb-1">Frequency</h6>
                      <p className="text-sm text-slate-300">{proc.test_frequency}</p>
                    </div>
                  </div>

                  <div>
                    <h6 className="text-xs font-semibold text-slate-500 mb-1">Success Criteria</h6>
                    <p className="text-sm text-slate-300">{proc.success_criteria}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Brain className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">AI Procedure Generator</h4>
            <p className="text-xs text-slate-400">Select controls and risks to generate audit procedures</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Select Controls ({selectedControls.length})</h5>
            <ScrollArea className="h-[300px] border border-[#2a3548] rounded-lg p-3">
              <div className="space-y-2">
                {controls.map(control => (
                  <div key={control.id} className="flex items-start gap-2 p-2 hover:bg-[#151d2e] rounded">
                    <Checkbox
                      id={`control-${control.id}`}
                      checked={selectedControls.includes(control.id)}
                      onCheckedChange={() => handleControlToggle(control.id)}
                    />
                    <Label htmlFor={`control-${control.id}`} className="flex-1 cursor-pointer">
                      <div className="text-sm text-white">{control.name}</div>
                      <div className="text-xs text-slate-500">{control.domain} • {control.category}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Select Risks ({selectedRisks.length})</h5>
            <ScrollArea className="h-[300px] border border-[#2a3548] rounded-lg p-3">
              <div className="space-y-2">
                {risks.map(risk => (
                  <div key={risk.id} className="flex items-start gap-2 p-2 hover:bg-[#151d2e] rounded">
                    <Checkbox
                      id={`risk-${risk.id}`}
                      checked={selectedRisks.includes(risk.id)}
                      onCheckedChange={() => handleRiskToggle(risk.id)}
                    />
                    <Label htmlFor={`risk-${risk.id}`} className="flex-1 cursor-pointer">
                      <div className="text-sm text-white">{risk.title}</div>
                      <div className="text-xs text-slate-500">
                        {risk.category} • Score: {risk.residual_risk_score || risk.inherent_risk_score}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-slate-400">
            {selectedControls.length + selectedRisks.length} item(s) selected
          </p>
          <Button
            onClick={generateProcedures}
            disabled={loading || (selectedControls.length === 0 && selectedRisks.length === 0)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Procedures
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}