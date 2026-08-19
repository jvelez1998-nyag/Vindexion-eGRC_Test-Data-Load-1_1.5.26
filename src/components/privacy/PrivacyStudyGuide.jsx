import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, TrendingUp, CheckCircle2, Clock } from "lucide-react";

export default function PrivacyStudyGuide() {
  const [activeModule, setActiveModule] = useState(null);

  const learningPaths = [
    {
      id: 'fundamentals',
      title: 'Privacy Fundamentals',
      level: 'Beginner',
      duration: '8 hours',
      modules: 12,
      topics: ['Privacy Principles', 'Data Classification', 'Consent Management', 'Privacy Notices', 'Data Mapping', 'Accountability'],
      description: 'Core concepts and principles of data privacy'
    },
    {
      id: 'gdpr_specialist',
      title: 'GDPR Specialist',
      level: 'Intermediate',
      duration: '16 hours',
      modules: 18,
      topics: ['GDPR Principles', 'Legal Basis', 'Data Subject Rights', 'DPIA', 'Privacy by Design', 'Cross-Border Transfers', 'DPO Role'],
      description: 'Comprehensive GDPR implementation and compliance'
    },
    {
      id: 'dpo_mastery',
      title: 'DPO Mastery',
      level: 'Advanced',
      duration: '24 hours',
      modules: 24,
      topics: ['Strategic Privacy', 'Risk Assessment', 'Breach Management', 'Vendor Oversight', 'Training Programs', 'Audit & Monitoring'],
      description: 'Advanced privacy officer responsibilities and leadership'
    }
  ];

  const deepDives = [
    {
      title: 'Data Subject Access Requests (DSARs)',
      duration: '90 min',
      topics: ['Request verification', 'Data collection', 'Response timelines', 'Exemptions', 'Complex scenarios'],
      description: 'Master the end-to-end DSAR process'
    },
    {
      title: 'Privacy Impact Assessments (PIAs/DPIAs)',
      duration: '120 min',
      topics: ['When required', 'Methodology', 'Risk identification', 'Mitigation strategies', 'Documentation'],
      description: 'Conduct comprehensive privacy impact assessments'
    },
    {
      title: 'International Data Transfers',
      duration: '90 min',
      topics: ['Transfer mechanisms', 'Adequacy decisions', 'SCCs', 'BCRs', 'Derogations', 'Post-Schrems II'],
      description: 'Navigate complex cross-border data transfer requirements'
    },
    {
      title: 'Breach Notification & Response',
      duration: '75 min',
      topics: ['Detection', '72-hour rule', 'Risk assessment', 'Notification requirements', 'Remediation'],
      description: 'Effective breach response and notification procedures'
    }
  ];

  const studyPlan = {
    week1: ['Privacy Principles', 'Data Classification', 'Legal Frameworks'],
    week2: ['Consent Management', 'Privacy Notices', 'Data Subject Rights'],
    week3: ['Security Measures', 'Breach Response', 'Vendor Management'],
    week4: ['DPIA Practice', 'International Transfers', 'Mock Assessments']
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="paths" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="deepdive">Deep Dives</TabsTrigger>
          <TabsTrigger value="plan">Study Plan</TabsTrigger>
          <TabsTrigger value="tips">Quick Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-4">
          {learningPaths.map(path => (
            <Card key={path.id} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base mb-2">{path.title}</CardTitle>
                    <p className="text-sm text-slate-400">{path.description}</p>
                  </div>
                  <Badge className={`${
                    path.level === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                    path.level === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {path.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-[#0f1623]">
                    <Clock className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">{path.duration}</div>
                    <div className="text-xs text-slate-500">Duration</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#0f1623]">
                    <BookOpen className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">{path.modules}</div>
                    <div className="text-xs text-slate-500">Modules</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#0f1623]">
                    <Target className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">{path.topics.length}</div>
                    <div className="text-xs text-slate-500">Topics</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-2">Key Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    {path.topics.map((topic, i) => (
                      <Badge key={i} className="text-xs bg-indigo-500/20 text-indigo-400">{topic}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>

                <Button className="w-full bg-indigo-600">Start Learning Path</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="deepdive" className="grid md:grid-cols-2 gap-4">
          {deepDives.map((dive, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">{dive.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {dive.duration}
                </div>
                <p className="text-xs text-slate-300">{dive.description}</p>
                <div>
                  <div className="text-xs text-slate-500 mb-2">Covers:</div>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {dive.topics.map((topic, i) => (
                      <li key={i}>• {topic}</li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Start Deep Dive
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="plan">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">4-Week Study Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(studyPlan).map(([week, topics]) => (
                <div key={week} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <h4 className="text-sm font-semibold text-white mb-3 capitalize">{week.replace('week', 'Week ')}</h4>
                  <div className="space-y-2">
                    {topics.map((topic, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-slate-600" />
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'GDPR in 5 Points', tips: ['Lawful basis required', 'Transparency is key', 'Data minimization', 'Subject rights', 'Security measures'] },
              { title: 'DSAR Response Checklist', tips: ['Verify identity', 'Search all systems', 'Check exemptions', 'Respond within 30 days', 'Document process'] },
              { title: 'Consent Best Practices', tips: ['Clear and specific', 'Freely given', 'Easy to withdraw', 'Separate from T&Cs', 'Record keeping'] },
              { title: 'Breach Response Steps', tips: ['Contain breach', 'Assess severity', 'Notify DPA (72h)', 'Notify individuals', 'Document everything'] }
            ].map((section, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-300 space-y-2">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}