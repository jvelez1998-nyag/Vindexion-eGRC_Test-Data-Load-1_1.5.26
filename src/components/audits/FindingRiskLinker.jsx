import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link2, Plus, Loader2, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function FindingRiskLinker({ open, onOpenChange, finding }) {
  const [linkMode, setLinkMode] = useState("existing"); // existing or new
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const [newRiskData, setNewRiskData] = useState({
    title: finding?.title || "",
    description: finding?.description || "",
    category: "operational",
    likelihood: 3,
    impact: 3
  });

  const queryClient = useQueryClient();

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const updateFindingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AuditFinding.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-findings'] });
      toast.success("Finding linked to risk");
      onOpenChange(false);
    }
  });

  const createRiskMutation = useMutation({
    mutationFn: (data) => base44.entities.Risk.create(data),
    onSuccess: (newRisk) => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      // Link finding to new risk
      updateFindingMutation.mutate({
        id: finding.id,
        data: {
          ...finding,
          linked_risks: [...(finding.linked_risks || []), newRisk.data.id]
        }
      });
    }
  });

  const handleLinkExisting = () => {
    if (!selectedRiskId) {
      toast.error("Please select a risk");
      return;
    }

    const linkedRisks = finding.linked_risks || [];
    if (linkedRisks.includes(selectedRiskId)) {
      toast.error("Finding already linked to this risk");
      return;
    }

    updateFindingMutation.mutate({
      id: finding.id,
      data: {
        ...finding,
        linked_risks: [...linkedRisks, selectedRiskId]
      }
    });
  };

  const handleCreateNew = () => {
    if (!newRiskData.title) {
      toast.error("Please enter a risk title");
      return;
    }

    createRiskMutation.mutate({
      ...newRiskData,
      status: "identified",
      mitigation_plan: `Address audit finding: ${finding.title}`,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const linkedRisks = risks.filter(r => finding?.linked_risks?.includes(r.id));
  const unlinkedRisks = risks.filter(r => !finding?.linked_risks?.includes(r.id));

  const riskScore = newRiskData.likelihood * newRiskData.impact;
  const riskLevel = riskScore >= 16 ? "Critical" : riskScore >= 9 ? "High" : riskScore >= 4 ? "Medium" : "Low";
  const riskColor = riskScore >= 16 ? "text-rose-400" : riskScore >= 9 ? "text-orange-400" : riskScore >= 4 ? "text-amber-400" : "text-blue-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-indigo-400" />
            Link Finding to Risk
          </DialogTitle>
        </DialogHeader>

        {finding && (
          <div className="space-y-6">
            {/* Finding Summary */}
            <Card className="bg-[#151d2e] border-[#2a3548] p-4">
              <h4 className="font-semibold text-white mb-2">{finding.title}</h4>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${finding.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {finding.severity}
                </Badge>
                <Badge className="text-[10px] bg-slate-500/10 text-slate-400">{finding.category}</Badge>
              </div>
            </Card>

            {/* Current Links */}
            {linkedRisks.length > 0 && (
              <div>
                <Label className="text-slate-300 mb-2 block">Currently Linked Risks</Label>
                <div className="space-y-2">
                  {linkedRisks.map(risk => (
                    <Card key={risk.id} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-white text-sm">{risk.title}</h5>
                          <p className="text-xs text-slate-500">{risk.category}</p>
                        </div>
                        <Badge className="bg-rose-500/10 text-rose-400 text-[10px]">
                          Risk Score: {(risk.likelihood || 3) * (risk.impact || 3)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Link Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={linkMode === "existing" ? "default" : "outline"}
                onClick={() => setLinkMode("existing")}
                className={linkMode === "existing" ? "bg-indigo-600" : "border-[#2a3548]"}
              >
                Link to Existing Risk
              </Button>
              <Button
                variant={linkMode === "new" ? "default" : "outline"}
                onClick={() => setLinkMode("new")}
                className={linkMode === "new" ? "bg-indigo-600" : "border-[#2a3548]"}
              >
                Create New Risk
              </Button>
            </div>

            {linkMode === "existing" ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Select Risk</Label>
                  <Select value={selectedRiskId} onValueChange={setSelectedRiskId}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Choose a risk" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {unlinkedRisks.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No unlinked risks available</div>
                      ) : (
                        unlinkedRisks.map(risk => (
                          <SelectItem key={risk.id} value={risk.id} className="text-white hover:bg-[#2a3548]">
                            {risk.title} ({risk.category})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleLinkExisting}
                  disabled={!selectedRiskId || updateFindingMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {updateFindingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Link to Risk
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Risk Title</Label>
                  <Input
                    value={newRiskData.title}
                    onChange={(e) => setNewRiskData({ ...newRiskData, title: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    placeholder="Enter risk title"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Description</Label>
                  <Textarea
                    value={newRiskData.description}
                    onChange={(e) => setNewRiskData({ ...newRiskData, description: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    placeholder="Describe the risk"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Category</Label>
                  <Select value={newRiskData.category} onValueChange={(v) => setNewRiskData({ ...newRiskData, category: v })}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="operational" className="text-white">Operational</SelectItem>
                      <SelectItem value="financial" className="text-white">Financial</SelectItem>
                      <SelectItem value="strategic" className="text-white">Strategic</SelectItem>
                      <SelectItem value="compliance" className="text-white">Compliance</SelectItem>
                      <SelectItem value="cybersecurity" className="text-white">Cybersecurity</SelectItem>
                      <SelectItem value="reputational" className="text-white">Reputational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Likelihood (1-5)</Label>
                    <Select value={String(newRiskData.likelihood)} onValueChange={(v) => setNewRiskData({ ...newRiskData, likelihood: parseInt(v) })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {[1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={String(n)} className="text-white">{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Impact (1-5)</Label>
                    <Select value={String(newRiskData.impact)} onValueChange={(v) => setNewRiskData({ ...newRiskData, impact: parseInt(v) })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {[1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={String(n)} className="text-white">{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card className="bg-indigo-500/5 border-indigo-500/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-5 w-5 ${riskColor}`} />
                      <span className="text-sm text-slate-300">Risk Score:</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${riskColor}`}>{riskScore}</div>
                      <div className="text-xs text-slate-500">{riskLevel} Risk</div>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={handleCreateNew}
                  disabled={createRiskMutation.isPending || updateFindingMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {createRiskMutation.isPending || updateFindingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Risk...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Risk & Link
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}