import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workflow, Play, Zap, Clock } from "lucide-react";

export default function VendorWorkflowEngine() {
  const workflows = [
    {
      name: "Vendor Onboarding",
      trigger: "New vendor added",
      steps: ["Initial assessment", "Document collection", "Security review", "Contract negotiation", "Approval"],
      status: "active",
      executions: 24
    },
    {
      name: "Annual Review",
      trigger: "Anniversary date",
      steps: ["Performance review", "Risk reassessment", "Update documentation", "Renewal decision"],
      status: "active",
      executions: 12
    },
    {
      name: "Incident Response",
      trigger: "Vendor incident reported",
      steps: ["Impact assessment", "Notify stakeholders", "Remediation plan", "Follow-up review"],
      status: "active",
      executions: 3
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Vendor Workflow Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">
            Automated workflows for vendor lifecycle management
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {workflows.map((workflow, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base text-white">{workflow.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">{workflow.status}</Badge>
                    <span className="text-xs text-slate-500">{workflow.executions} executions</span>
                  </div>
                </div>
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Trigger</p>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  {workflow.trigger}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Workflow Steps</p>
                <div className="space-y-2">
                  {workflow.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400">
                        {stepIdx + 1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <Play className="h-3 w-3 mr-2" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="border-[#2a3548]">
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}