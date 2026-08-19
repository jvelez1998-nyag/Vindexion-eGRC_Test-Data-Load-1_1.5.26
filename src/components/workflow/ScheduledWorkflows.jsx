import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Zap, Activity } from "lucide-react";
import { format } from "date-fns";

export default function ScheduledWorkflows({ rules, onToggleRule }) {
  const scheduledRules = rules.filter(r => r.last_executed || r.is_enabled);

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Workflow Execution Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            All workflows run automatically based on their trigger conditions. View execution history and manage active workflows.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {scheduledRules.map(rule => (
          <Card key={rule.id} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{rule.name}</h3>
                    <Badge className={`${rule.is_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'} border-0`}>
                      {rule.is_enabled ? <Activity className="h-3 w-3 mr-1" /> : null}
                      {rule.is_enabled ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{rule.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Clock className="h-3 w-3" />
                        Last Executed
                      </div>
                      <div className="text-sm text-white">
                        {rule.last_executed ? format(new Date(rule.last_executed), 'MMM d, yyyy h:mm a') : 'Never'}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Zap className="h-3 w-3" />
                        Total Executions
                      </div>
                      <div className="text-sm text-white">
                        {rule.execution_count || 0} times
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Switch
                    checked={rule.is_enabled}
                    onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduledRules.length === 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No scheduled workflows</h3>
            <p className="text-slate-400">Create workflows to see their execution schedule</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}