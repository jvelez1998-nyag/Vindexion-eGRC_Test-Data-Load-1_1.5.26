import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Calendar, RefreshCw, CheckCircle2, Wrench } from "lucide-react";
import { format } from "date-fns";
import { WorkflowBadge, WorkflowActions } from "@/components/workflow/WorkflowActions";

const categoryColors = {
  preventive: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  detective: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  corrective: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  directive: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
};

const domainColors = {
  access_control: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  data_protection: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  network_security: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  incident_response: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  business_continuity: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  vendor_management: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  physical_security: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  hr_security: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
};

const statusColors = {
  planned: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  implemented: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  effective: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ineffective: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  retired: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

export default function ControlCard({ control, onEdit, onDelete, onWorkflowAction, onPlanRemediation, userRole = 'user' }) {
  return (
    <Card className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg mb-1">{control.name}</h3>
          {control.description && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">{control.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`text-[10px] border capitalize ${categoryColors[control.category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {control.category}
            </Badge>
            <Badge className={`text-[10px] border ${domainColors[control.domain] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {control.domain?.replace(/_/g, ' ')}
            </Badge>
            <Badge className={`text-[10px] border ${statusColors[control.status]}`}>
              {control.status}
            </Badge>
            {control.workflow_status && <WorkflowBadge status={control.workflow_status} />}
          </div>

          {control.framework_mappings && Object.entries(control.framework_mappings).some(([_, ids]) => ids?.length > 0) && (
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">Framework Mappings:</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(control.framework_mappings).map(([framework, ids]) => 
                  ids?.length > 0 && (
                    <Badge key={framework} className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                      {framework}: {ids.length}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}

          {control.effectiveness && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-500">Effectiveness:</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className={`w-5 h-1.5 rounded-full ${n <= control.effectiveness ? 'bg-emerald-500' : 'bg-[#2a3548]'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-400">{control.effectiveness}/5</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {control.owner && <span>{control.owner}</span>}
            {control.review_frequency && (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" />
                {control.review_frequency?.replace(/_/g, ' ')}
              </span>
            )}
            {control.last_tested_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Last tested: {format(new Date(control.last_tested_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onWorkflowAction && (
            <WorkflowActions 
              item={control} 
              onAction={(action, comment) => onWorkflowAction(control, action, comment)}
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
            <DropdownMenuItem onClick={() => onEdit(control)} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            {onPlanRemediation && (control.status === 'ineffective' || (control.effectiveness && control.effectiveness < 3)) && (
              <DropdownMenuItem onClick={() => onPlanRemediation(control)} className="text-orange-400 hover:bg-orange-500/10 focus:bg-orange-500/10">
                <Wrench className="h-4 w-4 mr-2" /> Plan Remediation
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(control)} className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}