import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock } from "lucide-react";

export default function AdminHowTo() {
  const guides = [
    {
      title: 'How to Create a Multi-Step Automation Workflow',
      difficulty: 'Intermediate',
      time: '15 min',
      steps: [
        'Navigate to Workflow Automation panel',
        'Click "New Automation" and select trigger type',
        'Add sequential actions using the flow builder',
        'Configure conditional logic and branching',
        'Test the workflow with sample data',
        'Enable and monitor execution'
      ]
    },
    {
      title: 'How to Set Up Custom Roles with Granular Permissions',
      difficulty: 'Advanced',
      time: '20 min',
      steps: [
        'Access Role Management panel',
        'Create new role and define name/description',
        'Select permission categories to enable',
        'Configure entity-level access controls',
        'Set up approval workflows if needed',
        'Assign role to users and test access'
      ]
    },
    {
      title: 'How to Configure External System Integrations',
      difficulty: 'Intermediate',
      time: '25 min',
      steps: [
        'Open External Integrations panel',
        'Select integration type from catalog',
        'Enter API credentials and endpoints',
        'Configure data mapping and sync settings',
        'Test connection and data flow',
        'Set up monitoring and alerts'
      ]
    },
    {
      title: 'How to Optimize Notification Delivery',
      difficulty: 'Beginner',
      time: '10 min',
      steps: [
        'Go to Notification Settings panel',
        'Review notification categories and priorities',
        'Configure delivery channels (email, in-app)',
        'Set up user-specific preferences',
        'Define escalation rules',
        'Test notification delivery'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-400" />
            Step-by-Step Administrator Guides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guides.map((guide, idx) => (
              <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">{guide.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          guide.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                          guide.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }>
                          {guide.difficulty}
                        </Badge>
                        <Badge className="bg-slate-500/20 text-slate-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {guide.time}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {guide.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-teal-400">{stepIdx + 1}</span>
                        </div>
                        <p className="text-sm text-slate-300 pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}