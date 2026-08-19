import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Target, ClipboardList, Clock, User, GitBranch, Sparkles, Plus } from "lucide-react";
import ProgramVersionControl from "./ProgramVersionControl";
import AIProcedureGenerator from "./AIProcedureGenerator";
import { toast } from "sonner";

export default function AuditProgramDetail({ open, onOpenChange, program, controls = [], risks = [] }) {
  const [versionControlOpen, setVersionControlOpen] = useState(false);
  const [procedureGenOpen, setProcedureGenOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateProgramMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AuditProgram.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-programs'] });
      toast.success("Program updated");
    }
  });

  const handleAddProcedures = (newProcedures) => {
    const updatedProcedures = [...(program.procedures || []), ...newProcedures];
    const totalHours = updatedProcedures.reduce((sum, p) => sum + (p.estimated_hours || 0), 0);

    updateProgramMutation.mutate({
      id: program.id,
      data: {
        procedures: updatedProcedures,
        estimated_hours: totalHours,
        ai_generated: true
      }
    });

    setProcedureGenOpen(false);
  };

  if (!program) return null;

  const typeColors = {
    internal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    external: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    regulatory: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    it: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    financial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    operational: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
          <DialogHeader className="p-6 pb-4 border-b border-[#2a3548]">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl mb-2">{program.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] border ${typeColors[program.audit_type]}`}>
                    {program.audit_type}
                  </Badge>
                  {program.is_template && (
                    <Badge className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                      Template
                    </Badge>
                  )}
                  {program.ai_generated && (
                    <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                      AI Generated
                    </Badge>
                  )}
                  <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                    {program.status}
                  </Badge>
                  {program.version && (
                    <Badge className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                      v{program.version}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVersionControlOpen(true)}
                  className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                >
                  <GitBranch className="h-3 w-3 mr-1" />
                  Versions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProcedureGenOpen(true)}
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Procedures
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              {program.estimated_hours && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{program.estimated_hours}h total</span>
                </div>
              )}
              {program.owner && (
                <div className="flex items-center gap-1 text-slate-500">
                  <User className="h-3 w-3" />
                  {program.owner}
                </div>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1">
            <TabsList className="mx-6 mt-4 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="objectives" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                <Target className="h-4 w-4 mr-2" />
                Objectives
              </TabsTrigger>
              <TabsTrigger value="procedures" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                <ClipboardList className="h-4 w-4 mr-2" />
                Procedures
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[55vh]">
              <TabsContent value="overview" className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Objectives</p>
                          <p className="text-3xl font-bold text-white mt-1">{program.objectives?.length || 0}</p>
                        </div>
                        <Target className="h-8 w-8 text-indigo-400" />
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Procedures</p>
                          <p className="text-3xl font-bold text-white mt-1">{program.procedures?.length || 0}</p>
                        </div>
                        <ClipboardList className="h-8 w-8 text-emerald-400" />
                      </div>
                    </div>
                  </Card>
                </div>

                {program.description && (
                  <Card className="bg-gradient-to-br from-slate-500/5 to-slate-500/10 border-slate-500/20 p-4">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      Description
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{program.description}</p>
                  </Card>
                )}

                {program.scope && (
                  <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/10 border-blue-500/20 p-4">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      Scope
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{program.scope}</p>
                  </Card>
                )}

                {program.sampling_criteria && (
                  <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/10 border-purple-500/20 p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-purple-400" />
                      Sampling Criteria
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {program.sampling_criteria.population_size && (
                        <div className="bg-[#0f1623] rounded-lg p-3 border border-[#2a3548]">
                          <span className="text-slate-500 text-xs">Population Size</span>
                          <p className="text-white font-bold text-xl mt-1">{program.sampling_criteria.population_size}</p>
                        </div>
                      )}
                      {program.sampling_criteria.sample_size && (
                        <div className="bg-[#0f1623] rounded-lg p-3 border border-[#2a3548]">
                          <span className="text-slate-500 text-xs">Sample Size</span>
                          <p className="text-white font-bold text-xl mt-1">{program.sampling_criteria.sample_size}</p>
                        </div>
                      )}
                      {program.sampling_criteria.sampling_method && (
                        <div className="bg-[#0f1623] rounded-lg p-3 border border-[#2a3548]">
                          <span className="text-slate-500 text-xs">Method</span>
                          <p className="text-white font-medium text-sm mt-1 capitalize">{program.sampling_criteria.sampling_method.replace(/_/g, ' ')}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="objectives" className="px-6 py-4 space-y-3">
                {program.objectives?.length > 0 ? (
                  program.objectives.map((obj, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <p className="text-white text-sm leading-relaxed">{obj}</p>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8 text-sm">No objectives defined</p>
                )}
              </TabsContent>

              <TabsContent value="procedures" className="px-6 py-4 space-y-3">
                {program.procedures?.length > 0 ? (
                  program.procedures.map((proc, idx) => (
                    <Card key={proc.id || idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{proc.title || proc.procedure_title}</h4>
                        {proc.estimated_hours && (
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                            {proc.estimated_hours}h
                          </Badge>
                        )}
                      </div>
                      {(proc.description || proc.objective) && (
                        <p className="text-slate-400 text-sm leading-relaxed mb-3">{proc.description || proc.objective}</p>
                      )}
                      {proc.testing_steps && (
                        <div className="space-y-2 mt-3 pt-3 border-t border-[#2a3548]">
                          <h6 className="text-xs font-semibold text-slate-500">Steps</h6>
                          {proc.testing_steps.map((step, i) => (
                            <div key={i} className="flex gap-2 text-sm text-slate-300">
                              <span className="text-indigo-400">{i + 1}.</span>
                              <span>{step.description || step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm mb-4">No procedures defined</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProcedureGenOpen(true)}
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate with AI
                    </Button>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ProgramVersionControl
        program={program}
        open={versionControlOpen}
        onOpenChange={setVersionControlOpen}
      />

      <Dialog open={procedureGenOpen} onOpenChange={setProcedureGenOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Generate Audit Procedures
            </DialogTitle>
          </DialogHeader>
          <AIProcedureGenerator
            program={program}
            controls={controls}
            risks={risks}
            onProceduresGenerated={handleAddProcedures}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}