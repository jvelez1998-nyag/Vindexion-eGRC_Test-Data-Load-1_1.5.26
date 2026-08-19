import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function AdminStudyGuide() {
  const modules = [
    { title: 'Platform Administration Fundamentals', lessons: 8, duration: '2 hours', topics: ['User management basics', 'Role-based access control', 'System configuration'] },
    { title: 'Workflow Automation Mastery', lessons: 12, duration: '3 hours', topics: ['Automation triggers', 'Action builders', 'Advanced workflows'] },
    { title: 'Integration Management', lessons: 6, duration: '1.5 hours', topics: ['API connections', 'Data synchronization', 'Troubleshooting'] },
    { title: 'Security & Compliance', lessons: 10, duration: '2.5 hours', topics: ['Access controls', 'Audit trails', 'Compliance frameworks'] }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-400" />
            Administrator Training Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, idx) => (
              <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">{module.title}</h3>
                      <p className="text-sm text-slate-400">{module.lessons} lessons • {module.duration}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    {module.topics.map((topic, topicIdx) => (
                      <div key={topicIdx} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {topic}
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