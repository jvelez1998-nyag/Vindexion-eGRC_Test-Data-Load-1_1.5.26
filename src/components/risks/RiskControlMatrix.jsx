import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, Link, AlertTriangle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function RiskControlMatrix({ risks, controls, onUpdate }) {
  const [selectedRisk, setSelectedRisk] = useState(null);

  const linkControl = async (riskId, controlId) => {
    try {
      const risk = risks.find(r => r.id === riskId);
      const linkedControls = risk.linked_controls || [];
      
      if (!linkedControls.includes(controlId)) {
        await base44.entities.Risk.update(riskId, {
          linked_controls: [...linkedControls, controlId]
        });
        toast.success("Control linked to risk");
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error("Failed to link control");
    }
  };

  const unlinkControl = async (riskId, controlId) => {
    try {
      const risk = risks.find(r => r.id === riskId);
      const linkedControls = (risk.linked_controls || []).filter(id => id !== controlId);
      
      await base44.entities.Risk.update(riskId, {
        linked_controls: linkedControls
      });
      toast.success("Control unlinked");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to unlink control");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Risk List */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Risk Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {risks.map(risk => {
                const linkedCount = risk.linked_controls?.length || 0;
                const riskScore = (risk.residual_likelihood || 0) * (risk.residual_impact || 0);
                return (
                  <div
                    key={risk.id}
                    onClick={() => setSelectedRisk(risk)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRisk?.id === risk.id
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-[#0f1623] border-[#2a3548] hover:border-indigo-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white flex-1">{risk.title}</h4>
                      <Badge className={`${
                        riskScore >= 16 ? 'bg-red-500/20 text-red-400' :
                        riskScore >= 9 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {riskScore}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {risk.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Link className="h-3 w-3" />
                        {linkedCount} control(s)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Control Mapping */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-400" />
            {selectedRisk ? `Controls for: ${selectedRisk.title}` : 'Select a risk'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedRisk ? (
            <div className="text-center py-16">
              <Network className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-sm text-slate-400">Select a risk to view and manage controls</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {controls.map(control => {
                  const isLinked = selectedRisk.linked_controls?.includes(control.id);
                  return (
                    <div
                      key={control.id}
                      className={`p-3 rounded-lg border ${
                        isLinked
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-[#0f1623] border-[#2a3548]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{control.name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{control.domain}</Badge>
                            <Badge variant="outline" className="text-xs">{control.category}</Badge>
                            {control.effectiveness && (
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                {control.effectiveness}/5
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => isLinked ? unlinkControl(selectedRisk.id, control.id) : linkControl(selectedRisk.id, control.id)}
                          className={isLinked ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                        >
                          {isLinked ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Linked
                            </>
                          ) : (
                            <>
                              <Link className="h-3 w-3 mr-1" />
                              Link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}