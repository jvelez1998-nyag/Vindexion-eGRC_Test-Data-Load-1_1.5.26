import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap, Shield, Users, Settings, Bell } from "lucide-react";

export default function AdminDeepDive() {
  const topics = [
    {
      title: 'Advanced Workflow Automation',
      icon: Zap,
      color: 'from-indigo-500/20 to-purple-500/20',
      iconColor: 'text-indigo-400',
      sections: ['Complex triggers', 'Multi-step workflows', 'Conditional logic', 'Error handling']
    },
    {
      title: 'Role & Permission Architecture',
      icon: Shield,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      sections: ['Permission hierarchies', 'Custom roles', 'Delegation patterns', 'Audit compliance']
    },
    {
      title: 'User Lifecycle Management',
      icon: Users,
      color: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-400',
      sections: ['Onboarding automation', 'Access provisioning', 'Offboarding workflows', 'User analytics']
    },
    {
      title: 'System Configuration Best Practices',
      icon: Settings,
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
      sections: ['Performance optimization', 'Backup strategies', 'Disaster recovery', 'Change management']
    },
    {
      title: 'Notification Strategy',
      icon: Bell,
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400',
      sections: ['Alert priorities', 'Distribution rules', 'Escalation paths', 'User preferences']
    }
  ];

  return (
    <div className="space-y-6">
      {topics.map((topic, idx) => {
        const Icon = topic.icon;
        return (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${topic.color}`}>
                  <Icon className={`h-5 w-5 ${topic.iconColor}`} />
                </div>
                {topic.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topic.sections.map((section, sectionIdx) => (
                  <div key={sectionIdx} className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                    <h4 className="font-semibold text-white text-sm mb-2">{section}</h4>
                    <p className="text-xs text-slate-400">Detailed technical exploration with real-world examples and implementation guidance</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}