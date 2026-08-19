import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, AlertTriangle, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ControlWorkflowManager({ open, onOpenChange, control, workflowType }) {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['control-workflows', control?.id],
    queryFn: () => base44.entities.ControlWorkflow.filter({ control_id: control?.id }),
    enabled: !!control?.id
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlWorkflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-workflows'] });
      toast.success("Workflow initiated");
    }
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ControlWorkflow.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-workflows'] });
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data)
  });

  const handleApprove = async (workflow) => {
    const approvalEntry = {
      approver: workflow.current_approver,
      action: 'approved',
      comment,
      timestamp: new Date().toISOString()
    };

    const approvalHistory = [...(workflow.approval_history || []), approvalEntry];
    const currentIndex = workflow.approval_chain.indexOf(workflow.current_approver);
    const nextApprover = workflow.approval_chain[currentIndex + 1];

    await updateWorkflowMutation.mutateAsync({
      id: workflow.id,
      data: {
        ...workflow,
        status: nextApprover ? 'in_review' : 'approved',
        current_approver: nextApprover || null,
        approval_history: approvalHistory,
        completion_date: nextApprover ? null : new Date().toISOString()
      }
    });

    if (nextApprover) {
      await createNotificationMutation.mutateAsync({
        user_email: nextApprover,
        title: `Control Workflow Approval Required`,
        message: `Control "${control.name}" requires your approval for ${workflow.workflow_type}`,
        type: 'workflow_approval',
        priority: 'high'
      });
    }

    setComment("");
    toast.success(nextApprover ? "Approved - routed to next approver" : "Workflow approved");
  };

  const handleReject = async (workflow) => {
    const approvalEntry = {
      approver: workflow.current_approver,
      action: 'rejected',
      comment,
      timestamp: new Date().toISOString()
    };

    await updateWorkflowMutation.mutateAsync({
      id: workflow.id,
      data: {
        ...workflow,
        status: 'rejected',
        approval_history: [...(workflow.approval_history || []), approvalEntry],
        completion_date: new Date().toISOString()
      }
    });

    await createNotificationMutation.mutateAsync({
      user_email: workflow.initiated_by,
      title: `Control Workflow Rejected`,
      message: `Your workflow for control "${control.name}" was rejected. Reason: ${comment}`,
      type: 'workflow_rejection',
      priority: 'high'
    });

    setComment("");
    toast.success("Workflow rejected");
  };

  const activeWorkflow = workflows.find(w => ['pending', 'in_review'].includes(w.status));

  const statusColors = {
    pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>Control Workflow - {control?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {activeWorkflow ? (
            <Card className="bg-[#151d2e] border-[#2a3548] p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-white mb-1 capitalize">{activeWorkflow.workflow_type.replace(/_/g, ' ')}</h4>
                  <Badge className={statusColors[activeWorkflow.status]}>
                    {activeWorkflow.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  Initiated {new Date(activeWorkflow.created_date).toLocaleDateString()}
                </div>
              </div>

              {activeWorkflow.justification && (
                <div className="mb-4 p-3 bg-[#1a2332] rounded">
                  <div className="text-xs text-slate-500 mb-1">Justification</div>
                  <div className="text-sm text-slate-300">{activeWorkflow.justification}</div>
                </div>
              )}

              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Approval Chain</div>
                <div className="space-y-2">
                  {activeWorkflow.approval_chain?.map((approver, idx) => {
                    const approved = activeWorkflow.approval_history?.find(h => h.approver === approver && h.action === 'approved');
                    const rejected = activeWorkflow.approval_history?.find(h => h.approver === approver && h.action === 'rejected');
                    const isCurrent = approver === activeWorkflow.current_approver;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {approved ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : rejected ? (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        ) : isCurrent ? (
                          <Clock className="h-4 w-4 text-blue-400 animate-pulse" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                        )}
                        <span className={`text-sm ${isCurrent ? 'text-white font-medium' : 'text-slate-400'}`}>
                          {approver}
                        </span>
                        {approved && (
                          <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400">Approved</Badge>
                        )}
                        {rejected && (
                          <Badge className="text-[10px] bg-rose-500/10 text-rose-400">Rejected</Badge>
                        )}
                        {isCurrent && (
                          <Badge className="text-[10px] bg-blue-500/10 text-blue-400">Pending</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeWorkflow.approval_history?.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-2">History</div>
                  <ScrollArea className="h-32">
                    <div className="space-y-2 pr-3">
                      {activeWorkflow.approval_history.map((entry, idx) => (
                        <div key={idx} className="p-2 bg-[#1a2332] rounded text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 text-slate-500" />
                            <span className="text-white">{entry.approver}</span>
                            <Badge className={`text-[9px] ${entry.action === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {entry.action}
                            </Badge>
                          </div>
                          {entry.comment && (
                            <div className="text-slate-400 ml-5">{entry.comment}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {activeWorkflow.status === 'in_review' && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Comment</Label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add your comments..."
                      className="bg-[#1a2332] border-[#2a3548] text-white"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(activeWorkflow)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(activeWorkflow)}
                      variant="outline"
                      className="flex-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No active workflows for this control
            </div>
          )}

          {workflows.filter(w => w.status === 'approved' || w.status === 'rejected').length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-slate-400 mb-3">Past Workflows</h5>
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-3">
                  {workflows.filter(w => w.status === 'approved' || w.status === 'rejected').map(workflow => (
                    <Card key={workflow.id} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white capitalize">{workflow.workflow_type.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(workflow.completion_date).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={statusColors[workflow.status]}>
                          {workflow.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}