import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { WorkflowBadge, WorkflowActions } from "@/components/workflow/WorkflowActions";

const statusColors = {
  not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  implemented: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  non_compliant: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

const frameworkColors = {
  'SOC2': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'ISO27001': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'GDPR': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'HIPAA': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'PCI-DSS': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'NIST': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

export default function ComplianceTable({ items, onEdit, onDelete, onWorkflowAction, userRole = 'user' }) {
  return (
    <div className="rounded-xl border border-[#2a3548] bg-[#1a2332] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a3548] hover:bg-[#1a2332]">
            <TableHead className="text-slate-400 font-medium text-xs uppercase">Framework</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs uppercase">Requirement</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs uppercase">Status</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs uppercase">Owner</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs uppercase">Due Date</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs uppercase">Workflow</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id} className="border-[#2a3548] hover:bg-[#151d2e]">
              <TableCell>
                <Badge className={`text-[10px] border ${frameworkColors[item.framework] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {item.framework}
                </Badge>
                {item.requirement_id && (
                  <span className="block text-[10px] text-slate-500 mt-1">{item.requirement_id}</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-white font-medium line-clamp-2">{item.requirement}</span>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
                )}
              </TableCell>
              <TableCell>
                <Badge className={`text-[10px] border ${statusColors[item.status]}`}>
                  {item.status?.replace(/_/g, ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-400">
                {item.owner || '-'}
              </TableCell>
              <TableCell className="text-sm text-slate-400">
                {item.due_date ? format(new Date(item.due_date), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <WorkflowBadge status={item.workflow_status || 'draft'} />
                  {onWorkflowAction && (
                    <WorkflowActions 
                      item={item} 
                      onAction={(action, comment) => onWorkflowAction(item, action, comment)}
                      userRole={userRole}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                    <DropdownMenuItem onClick={() => onEdit(item)} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    {item.evidence_url && (
                      <DropdownMenuItem asChild className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
                        <a href={item.evidence_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Evidence
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}