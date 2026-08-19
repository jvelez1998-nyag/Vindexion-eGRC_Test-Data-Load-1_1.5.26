import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GitBranch, Clock, User, FileText, Plus, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function ProgramVersionControl({ program, open, onOpenChange }) {
  const [changeNotes, setChangeNotes] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(null);
  const queryClient = useQueryClient();

  const createVersionMutation = useMutation({
    mutationFn: async (notes) => {
      const versionEntry = {
        version: program.version + 1,
        timestamp: new Date().toISOString(),
        user: (await base44.auth.me()).email,
        changes: notes,
        snapshot: {
          procedures: program.procedures,
          objectives: program.objectives,
          scope: program.scope,
          estimated_hours: program.estimated_hours
        }
      };

      const updatedHistory = [...(program.version_history || []), versionEntry];

      return base44.entities.AuditProgram.update(program.id, {
        version: program.version + 1,
        version_history: updatedHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-programs'] });
      toast.success("New version created");
      setChangeNotes("");
    }
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (version) => {
      return base44.entities.AuditProgram.update(program.id, {
        ...version.snapshot,
        version: program.version + 1,
        version_history: [
          ...(program.version_history || []),
          {
            version: program.version + 1,
            timestamp: new Date().toISOString(),
            user: (await base44.auth.me()).email,
            changes: `Restored from version ${version.version}`,
            snapshot: version.snapshot
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-programs'] });
      toast.success("Version restored");
      setSelectedVersion(null);
    }
  });

  const handleCreateVersion = () => {
    if (!changeNotes.trim()) {
      toast.error("Please describe the changes");
      return;
    }
    createVersionMutation.mutate(changeNotes);
  };

  const handleRestoreVersion = (version) => {
    if (confirm(`Restore version ${version.version}? This will create a new version with the restored data.`)) {
      restoreVersionMutation.mutate(version);
    }
  };

  const versions = program.version_history || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-indigo-400" />
            Version Control: {program.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white mb-1">Current Version</h4>
                <p className="text-sm text-slate-400">Version {program.version}</p>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {versions.length} Previous Version(s)
              </Badge>
            </div>
          </Card>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-white">Create New Version</h5>
            <div className="space-y-2">
              <Label htmlFor="changes" className="text-sm text-slate-400">
                Describe Changes
              </Label>
              <Textarea
                id="changes"
                placeholder="What changed in this version?"
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                className="bg-[#151d2e] border-[#2a3548] text-white h-20"
              />
            </div>
            <Button
              onClick={handleCreateVersion}
              disabled={createVersionMutation.isPending || !changeNotes.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Save as Version {program.version + 1}
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h5 className="text-sm font-semibold text-white mb-3">Version History</h5>
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {versions.length === 0 ? (
                  <Card className="bg-[#151d2e] border-[#2a3548] p-8 text-center">
                    <GitBranch className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No version history yet</p>
                    <p className="text-slate-500 text-xs mt-1">Create your first version above</p>
                  </Card>
                ) : (
                  [...versions].reverse().map((version, idx) => (
                    <Card
                      key={idx}
                      className={`bg-[#151d2e] border-[#2a3548] p-4 cursor-pointer transition-all ${
                        selectedVersion?.version === version.version ? 'border-indigo-500/50 bg-indigo-500/5' : 'hover:border-[#3a4558]'
                      }`}
                      onClick={() => setSelectedVersion(selectedVersion?.version === version.version ? null : version)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-xs">
                            v{version.version}
                          </Badge>
                          {idx === 0 && (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                        {selectedVersion?.version === version.version && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreVersion(version);
                            }}
                            variant="outline"
                            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                            disabled={restoreVersionMutation.isPending}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>

                      <p className="text-sm text-slate-300 mb-3">{version.changes}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {moment(version.timestamp).format('MMM D, YYYY h:mm A')}
                        </div>
                      </div>

                      {selectedVersion?.version === version.version && version.snapshot && (
                        <div className="mt-4 pt-4 border-t border-[#2a3548] space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-500">Procedures:</span>
                              <span className="text-white ml-2">{version.snapshot.procedures?.length || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Est. Hours:</span>
                              <span className="text-white ml-2">{version.snapshot.estimated_hours || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Objectives:</span>
                              <span className="text-white ml-2">{version.snapshot.objectives?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}