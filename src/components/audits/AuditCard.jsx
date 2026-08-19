import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Calendar, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const typeColors = {
  internal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  external: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  regulatory: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

const statusColors = {
  planned: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  follow_up: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

export default function AuditCard({ audit, onEdit, onDelete }) {
  return (
    <Card className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg mb-1">{audit.title}</h3>
          {audit.scope && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">{audit.scope}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`text-[10px] border capitalize ${typeColors[audit.type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {audit.type}
            </Badge>
            <Badge className={`text-[10px] border ${statusColors[audit.status]}`}>
              {audit.status?.replace(/_/g, ' ')}
            </Badge>
            {audit.findings_count > 0 && (
              <Badge className="text-[10px] border bg-amber-500/10 text-amber-400 border-amber-500/20">
                {audit.findings_count} findings
              </Badge>
            )}
            {audit.critical_findings > 0 && (
              <Badge className="text-[10px] border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5" />
                {audit.critical_findings} critical
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {audit.auditor && <span>{audit.auditor}</span>}
            {audit.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {format(new Date(audit.start_date), 'MMM d, yyyy')}
                {audit.end_date && ` - ${format(new Date(audit.end_date), 'MMM d, yyyy')}`}
              </span>
            )}
          </div>

          {audit.report_url && (
            <a 
              href={audit.report_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View Report
            </a>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
            <DropdownMenuItem onClick={() => onEdit(audit)} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(audit)} className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}