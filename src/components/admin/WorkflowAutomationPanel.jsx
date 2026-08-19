import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workflow, Plus, Play, Pause, Settings, Zap } from "lucide-react";
import DraggableList from "@/components/generic/DraggableList";

export default function WorkflowAutomationPanel() {
  const { data: automationRules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.AutomationRule.list()
  });

  const [rules, setRules] = useState(automationRules);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-indigo-400" />
              Workflow Automation Rules
            </CardTitle>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              New Automation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DraggableList
            items={rules}
            onReorder={setRules}
            keyExtractor={(item) => item.id}
            renderItem={(rule) => (
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20">
                        <Zap className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{rule.name || 'Automation Rule'}</h4>
                        <p className="text-xs text-slate-400">{rule.trigger_type || 'Event-based trigger'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Rules</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {automationRules.filter(r => r.enabled).length}
                </p>
              </div>
              <Play className="h-5 w-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Paused Rules</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {automationRules.filter(r => !r.enabled).length}
                </p>
              </div>
              <Pause className="h-5 w-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Executions</p>
                <p className="text-2xl font-bold text-white mt-1">1,247</p>
              </div>
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}