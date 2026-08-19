import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, ArrowRight, Clock, Zap, Activity } from "lucide-react";
import WorkflowAutomationEngine from "./WorkflowAutomationEngine";

export default function PrivacyWorkflow() {
  const [activeTab, setActiveTab] = useState("workflows");
  const workflows = [
    {
      name: 'DSAR Processing',
      stages: [
        { name: 'Receipt & Verification', duration: '2 days', tasks: ['Log request', 'Verify identity', 'Assess scope'] },
        { name: 'Data Collection', duration: '10 days', tasks: ['Search systems', 'Compile data', 'Check exemptions'] },
        { name: 'Review & Redaction', duration: '5 days', tasks: ['Review completeness', 'Apply exemptions', 'Redact third-party data'] },
        { name: 'Response Delivery', duration: '3 days', tasks: ['Package response', 'Deliver to subject', 'Document process'] }
      ],
      totalDuration: '30 days (max)'
    },
    {
      name: 'Privacy Impact Assessment',
      stages: [
        { name: 'Scoping', duration: '3 days', tasks: ['Define project', 'Identify stakeholders', 'Set timeline'] },
        { name: 'Assessment', duration: '7 days', tasks: ['Map data flows', 'Identify risks', 'Assess necessity'] },
        { name: 'Consultation', duration: '5 days', tasks: ['Consult DPO', 'Seek expert input', 'Engage stakeholders'] },
        { name: 'Documentation', duration: '5 days', tasks: ['Document findings', 'Propose mitigations', 'Get approval'] }
      ],
      totalDuration: '20 days (typical)'
    },
    {
      name: 'Breach Response',
      stages: [
        { name: 'Detection & Containment', duration: 'Immediate', tasks: ['Identify breach', 'Contain damage', 'Preserve evidence'] },
        { name: 'Assessment', duration: '24 hours', tasks: ['Assess severity', 'Determine scope', 'Evaluate risk'] },
        { name: 'Notification', duration: '72 hours', tasks: ['Notify DPA', 'Notify affected', 'Internal reporting'] },
        { name: 'Remediation', duration: 'Ongoing', tasks: ['Fix vulnerabilities', 'Monitor', 'Prevent recurrence'] }
      ],
      totalDuration: 'Time-critical'
    }
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="workflows" className="data-[state=active]:bg-indigo-600">
          <Activity className="h-4 w-4 mr-2" />
          Workflows
        </TabsTrigger>
        <TabsTrigger value="automation" className="data-[state=active]:bg-indigo-600">
          <Zap className="h-4 w-4 mr-2" />
          Automation
        </TabsTrigger>
      </TabsList>

      <TabsContent value="workflows" className="space-y-6">
        {workflows.map((workflow, idx) => (
        <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              <Badge className="bg-indigo-500/20 text-indigo-400">
                <Clock className="h-3 w-3 mr-1" />
                {workflow.totalDuration}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflow.stages.map((stage, stageIdx) => (
                <div key={stageIdx}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stageIdx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {stageIdx === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </div>
                      {stageIdx < workflow.stages.length - 1 && (
                        <div className="w-0.5 h-16 bg-slate-600/30 my-1" />
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">{stage.name}</h4>
                        <span className="text-xs text-slate-500">{stage.duration}</span>
                      </div>
                      <div className="space-y-1">
                        {stage.tasks.map((task, taskIdx) => (
                          <div key={taskIdx} className="flex items-center gap-2 text-xs text-slate-400">
                            <ArrowRight className="h-3 w-3 text-indigo-400" />
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View Detailed Workflow
            </Button>
          </CardContent>
        </Card>
        ))}
      </TabsContent>

      <TabsContent value="automation">
        <WorkflowAutomationEngine />
      </TabsContent>
    </Tabs>
  );
}