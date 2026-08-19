import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Send, CheckCircle2, XCircle, RotateCcw, Clock, 
  ChevronDown, MessageSquare, User, History
} from "lucide-react";
import { format } from "date-fns";

const workflowStates = {
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Send },
  in_review: { label: 'In Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: XCircle },
  changes_requested: { label: 'Changes Requested', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: RotateCcw }
};

function WorkflowButton({ currentStatus, disabled }) {
  const state = workflowStates[currentStatus];
  if (!state) return null;
  const Icon = state.icon;
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      disabled={disabled}
      className={`border-[#2a3548] hover:bg-[#2a3548] gap-2 ${state.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {state.label}
      <ChevronDown className="h-3 w-3 opacity-60" />
    </Button>
  );
}

export function WorkflowBadge({ status }) {
  const state = workflowStates[status];
  if (!state) return null;
  const Icon = state.icon;
  
  return (
    <Badge className={`text-[10px] border ${state.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {state.label}
    </Badge>
  );
}

export function WorkflowActions({ 
  item, 
  onAction, 
  userRole = 'user',
  disabled = false 
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');

  const currentStatus = item.workflow_status;
  if (!currentStatus) return null;
  const canSubmit = currentStatus === 'changes_requested' || currentStatus === 'rejected';
  const canReview = (currentStatus === 'submitted' || currentStatus === 'in_review') && userRole === 'admin';
  const canApprove = currentStatus === 'in_review' && userRole === 'admin';

  const handleAction = (action) => {
    if (action === 'approve' || action === 'reject' || action === 'request_changes') {
      setActionType(action);
      setDialogOpen(true);
    } else {
      onAction(action, '');
    }
  };

  const confirmAction = () => {
    onAction(actionType, comment);
    setDialogOpen(false);
    setComment('');
    setActionType(null);
  };

  const getNextStatus = (action) => {
    const transitions = {
      submit: 'submitted',
      start_review: 'in_review',
      approve: 'approved',
      reject: 'rejected',
      request_changes: 'changes_requested'
    };
    return transitions[action];
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <WorkflowButton currentStatus={currentStatus} disabled={disabled} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548] w-48">
          {canSubmit && (
            <DropdownMenuItem 
              onClick={() => handleAction('submit')}
              className="text-white hover:bg-[#2a3548] gap-2"
            >
              <Send className="h-4 w-4 text-blue-400" />
              Submit for Review
            </DropdownMenuItem>
          )}
          
          {currentStatus === 'submitted' && userRole === 'admin' && (
            <DropdownMenuItem 
              onClick={() => handleAction('start_review')}
              className="text-white hover:bg-[#2a3548] gap-2"
            >
              <Clock className="h-4 w-4 text-amber-400" />
              Start Review
            </DropdownMenuItem>
          )}
          
          {canApprove && (
            <>
              <DropdownMenuItem 
                onClick={() => handleAction('approve')}
                className="text-white hover:bg-[#2a3548] gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAction('request_changes')}
                className="text-white hover:bg-[#2a3548] gap-2"
              >
                <RotateCcw className="h-4 w-4 text-orange-400" />
                Request Changes
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAction('reject')}
                className="text-white hover:bg-[#2a3548] gap-2"
              >
                <XCircle className="h-4 w-4 text-rose-400" />
                Reject
              </DropdownMenuItem>
            </>
          )}
          

        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {actionType === 'reject' && <XCircle className="h-5 w-5 text-rose-400" />}
              {actionType === 'request_changes' && <RotateCcw className="h-5 w-5 text-orange-400" />}
              {actionType === 'approve' && 'Approve Item'}
              {actionType === 'reject' && 'Reject Item'}
              {actionType === 'request_changes' && 'Request Changes'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={actionType === 'approve' ? 'Add approval notes (optional)...' : 'Add comments explaining your decision...'}
              className="bg-[#151d2e] border-[#2a3548] text-white h-24"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              className={
                actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                'bg-orange-600 hover:bg-orange-700'
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function WorkflowHistory({ history = [] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#2a3548]">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
        <History className="h-3 w-3" /> Workflow History
      </p>
      <div className="space-y-2">
        {history.slice(0, 5).map((entry, idx) => {
          const state = workflowStates[entry.to_status];
          if (!state) return null;
          return (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className={`p-1 rounded ${state.color}`}>
                {state.icon && <state.icon className="h-3 w-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300">
                  <span className="text-white font-medium">{entry.action_by || 'User'}</span>
                  {' '}{entry.action}{' '}
                  <span className="text-slate-500">→ {state.label}</span>
                </p>
                {entry.comment && (
                  <p className="text-slate-500 mt-0.5 italic">"{entry.comment}"</p>
                )}
                <p className="text-slate-600 mt-0.5">
                  {entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a') : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}