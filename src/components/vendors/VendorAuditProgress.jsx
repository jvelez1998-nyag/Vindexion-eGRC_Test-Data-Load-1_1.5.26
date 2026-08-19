import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ClipboardCheck, Clock, CheckCircle2 } from "lucide-react";

export default function VendorAuditProgress({ audit, tasks }) {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const statusColors = {
    planned: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    under_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{audit.audit_title}</CardTitle>
          <Badge className={statusColors[audit.status]}>
            {audit.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#151d2e] p-3 rounded border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Tasks</span>
            </div>
            <p className="text-xl font-bold text-white">{completedTasks}/{tasks.length}</p>
          </div>

          <div className="bg-[#151d2e] p-3 rounded border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-400">Due Date</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {audit.due_date ? format(new Date(audit.due_date), 'MMM d, yyyy') : 'Not set'}
            </p>
          </div>

          <div className="bg-[#151d2e] p-3 rounded border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Progress</span>
            </div>
            <p className="text-xl font-bold text-white">{progress}%</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Overall Progress</span>
            <span className="text-sm text-white">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {audit.scope && (
          <div>
            <p className="text-xs text-slate-400 mb-1">Audit Scope</p>
            <p className="text-sm text-white">{audit.scope}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}