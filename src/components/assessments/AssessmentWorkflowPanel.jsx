import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Send, CheckCircle2, XCircle, RotateCcw, Clock, 
  MessageSquare, User, History, FileText, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

const workflowStates = {
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Send },
  in_review: { label: 'In Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  pending_review: { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: XCircle },
  changes_requested: { label: 'Changes Requested', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: RotateCcw },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  monitoring: { label: 'Monitoring', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: Clock },
  closed: { label: 'Closed', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: CheckCircle2 }
};

export default function AssessmentWorkflowPanel({ 
  open, 
  onOpenChange, 
  assessment, 
  onWorkflowAction,
  userRole = 'admin'
}) {
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  if (!assessment) return null;

  const currentStatus = assessment.workflow_status || assessment.lifecycle_status;
  if (!currentStatus) return null;
  
  const history = assessment.workflow_history || [];
  const comments = assessment.workflow_comments || [];

  const canSubmit = currentStatus === 'changes_requested' || currentStatus === 'rejected';
  const canReview = (currentStatus === 'submitted' || currentStatus === 'pending_review') && userRole === 'admin';
  const canApprove = (currentStatus === 'in_review' || currentStatus === 'pending_review') && userRole === 'admin';

  const handleAction = async (action) => {
    setActionLoading(action);
    await onWorkflowAction(assessment, action, comment);
    setComment('');
    setActionLoading(null);
  };

  const inherentScore = (assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0);
  const residualScore = (assessment.residual_likelihood || 0) * (assessment.residual_impact || 0);

  const getRiskLevel = (score) => {
    if (score >= 16) return { label: 'Critical', color: 'text-rose-400' };
    if (score >= 9) return { label: 'High', color: 'text-amber-400' };
    if (score >= 4) return { label: 'Medium', color: 'text-yellow-400' };
    return { label: 'Low', color: 'text-emerald-400' };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-[#1a2332] border-[#2a3548] text-white p-0">
        <SheetHeader className="p-6 pb-4 border-b border-[#2a3548]">
          <SheetTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Assessment Workflow
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Assessment Summary */}
            <div className="p-4 rounded-xl bg-[#151d2e] border border-[#2a3548]">
              <h3 className="font-medium text-white mb-2">{assessment.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-3">{assessment.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={`text-[10px] border ${workflowStates[currentStatus]?.color || 'bg-slate-500/10 text-slate-400'}`}>
                  {workflowStates[currentStatus]?.label || currentStatus}
                </Badge>
                <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">
                  {assessment.risk_category}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                  <p className="text-slate-500 mb-1">Inherent Risk</p>
                  <p className={`font-semibold ${getRiskLevel(inherentScore).color}`}>
                    {inherentScore || '-'} ({getRiskLevel(inherentScore).label})
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                  <p className="text-slate-500 mb-1">Residual Risk</p>
                  <p className={`font-semibold ${getRiskLevel(residualScore).color}`}>
                    {residualScore || '-'} ({getRiskLevel(residualScore).label})
                  </p>
                </div>
              </div>

              {assessment.owner && (
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                  <User className="h-3 w-3" />
                  Owner: {assessment.owner}
                </div>
              )}
            </div>

            {/* Workflow Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Send className="h-4 w-4" />
                Workflow Actions
              </h4>

              <div className="space-y-2">
                {canSubmit && (
                  <Button
                    onClick={() => handleAction('submit')}
                    disabled={actionLoading}
                    className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    Submit for Review
                  </Button>
                )}

                {canReview && currentStatus !== 'in_review' && (
                  <Button
                    onClick={() => handleAction('start_review')}
                    disabled={actionLoading}
                    className="w-full justify-start gap-2 bg-amber-600 hover:bg-amber-700"
                  >
                    <Clock className="h-4 w-4" />
                    Start Review
                  </Button>
                )}

                {canApprove && (
                  <>
                    <Button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Assessment
                    </Button>
                    <Button
                      onClick={() => handleAction('request_changes')}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full justify-start gap-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Request Changes
                    </Button>
                    <Button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full justify-start gap-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Assessment
                    </Button>
                  </>
                )}


              </div>

              {/* Comment Input */}
              <div className="pt-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment with your action..."
                  className="bg-[#151d2e] border-[#2a3548] text-white h-20"
                />
              </div>
            </div>

            <Separator className="bg-[#2a3548]" />

            {/* Workflow History */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <History className="h-4 w-4" />
                Workflow History
              </h4>

              {history.length === 0 ? (
                <p className="text-sm text-slate-500">No workflow history yet</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, idx) => {
                    const state = workflowStates[entry.to_status];
                    if (!state) return null;
                    const Icon = state.icon;
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className={`p-1.5 rounded-lg ${state.color} h-fit`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-white font-medium">{entry.action_by || 'User'}</span>
                            <span className="text-xs text-slate-500">{entry.action?.replace(/_/g, ' ')}</span>
                            <Badge className={`text-[9px] ${state.color}`}>{state.label}</Badge>
                          </div>
                          {entry.comment && (
                            <p className="text-xs text-slate-400 mt-1 italic">"{entry.comment}"</p>
                          )}
                          <p className="text-[10px] text-slate-600 mt-1">
                            {entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a') : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Version Info */}
            <div className="p-4 rounded-xl bg-[#151d2e] border border-[#2a3548]">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Version Info</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Created:</span>
                  <p className="text-slate-300">{assessment.created_date ? format(new Date(assessment.created_date), 'MMM d, yyyy') : '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Last Updated:</span>
                  <p className="text-slate-300">{assessment.updated_date ? format(new Date(assessment.updated_date), 'MMM d, yyyy') : '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Version:</span>
                  <p className="text-slate-300">{assessment.version || 1}</p>
                </div>
                <div>
                  <span className="text-slate-500">Review Date:</span>
                  <p className="text-slate-300">{assessment.review_date ? format(new Date(assessment.review_date), 'MMM d, yyyy') : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}