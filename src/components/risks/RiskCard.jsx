import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { WorkflowBadge, WorkflowActions } from "@/components/workflow/WorkflowActions";

const categoryColors = {
  operational: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  financial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  strategic: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  compliance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cybersecurity: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  reputational: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
};

const statusColors = {
  identified: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  assessing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mitigating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  monitoring: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

export default function RiskCard({ risk, onEdit, onDelete, onWorkflowAction, userRole = 'user' }) {
  const score = (risk.likelihood || 0) * (risk.impact || 0);
  
  const getScoreStyle = () => {
    if (score >= 16) return { bg: 'bg-rose-500', text: 'Critical' };
    if (score >= 9) return { bg: 'bg-amber-500', text: 'High' };
    if (score >= 4) return { bg: 'bg-yellow-500', text: 'Medium' };
    return { bg: 'bg-emerald-500', text: 'Low' };
  };

  const scoreStyle = getScoreStyle();

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all overflow-hidden">
      <div className="flex">
        <div className={`w-1 ${scoreStyle.bg}`} />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-white text-lg truncate">{risk.title}</h3>
              </div>
              {risk.description && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{risk.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`text-[10px] border capitalize ${categoryColors[risk.category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {risk.category}
                </Badge>
                <Badge className={`text-[10px] border ${statusColors[risk.status]}`}>
                  {risk.status?.replace(/_/g, ' ')}
                </Badge>
                {risk.workflow_status && <WorkflowBadge status={risk.workflow_status} />}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#151d2e] border border-[#2a3548]">
                  <span className={`w-2 h-2 rounded-full ${scoreStyle.bg}`} />
                  <span className="text-[10px] text-slate-400">
                    Risk Score: <span className="font-semibold text-white">{score}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                {risk.owner && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {risk.owner}
                  </span>
                )}
                {risk.due_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(risk.due_date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="text-center px-3 py-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="text-[10px] text-slate-500 uppercase mb-1">L × I</div>
                <div className="text-lg font-bold text-white">{risk.likelihood} × {risk.impact}</div>
              </div>
              {onWorkflowAction && (
                <WorkflowActions 
                  item={risk} 
                  onAction={(action, comment) => onWorkflowAction(risk, action, comment)}
                  userRole={userRole}
                />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                  <DropdownMenuItem onClick={() => onEdit(risk)} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(risk)} className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}