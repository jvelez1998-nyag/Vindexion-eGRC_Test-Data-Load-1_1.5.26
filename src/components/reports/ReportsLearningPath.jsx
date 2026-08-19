import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, CheckCircle2, Lock, Play, FileText, 
  Award, Target, TrendingUp, Brain, Sparkles
} from "lucide-react";

const LEARNING_MODULES = [
  {
    id: 1,
    title: "Introduction to GRC Reporting",
    description: "Understand the fundamentals of governance, risk, and compliance reporting",
    duration: "15 min",
    level: "Beginner",
    status: "completed",
    topics: ["Report Types", "Audiences", "Best Practices", "Standards"],
    lessons: 4
  },
  {
    id: 2,
    title: "Executive Dashboard Design",
    description: "Learn to create impactful executive-level dashboards and reports",
    duration: "20 min",
    level: "Intermediate",
    status: "in_progress",
    progress: 60,
    topics: ["Data Visualization", "KPIs", "Storytelling", "Design Principles"],
    lessons: 5
  },
  {
    id: 3,
    title: "Risk Reporting Essentials",
    description: "Master risk register reports, heat maps, and risk analytics",
    duration: "25 min",
    level: "Intermediate",
    status: "available",
    topics: ["Risk Metrics", "Heat Maps", "Trends", "Board Reports"],
    lessons: 6
  },
  {
    id: 4,
    title: "Compliance Reporting Framework",
    description: "Navigate regulatory reporting requirements and frameworks",
    duration: "30 min",
    level: "Intermediate",
    status: "available",
    topics: ["SOX", "SOC2", "ISO 27001", "Evidence Management"],
    lessons: 7
  },
  {
    id: 5,
    title: "Advanced Analytics & AI",
    description: "Leverage AI and advanced analytics for predictive insights",
    duration: "35 min",
    level: "Advanced",
    status: "locked",
    topics: ["Predictive Analytics", "AI Reports", "Automation", "Insights"],
    lessons: 8
  },
  {
    id: 6,
    title: "Board & Audit Committee Reports",
    description: "Prepare comprehensive reports for board and audit committees",
    duration: "40 min",
    level: "Advanced",
    status: "locked",
    topics: ["Board Packs", "Materiality", "Governance", "Stakeholders"],
    lessons: 9
  }
];

const BEST_PRACTICES = [
  {
    title: "Know Your Audience",
    description: "Tailor reports to stakeholder needs - executives want summaries, auditors want details",
    icon: Target
  },
  {
    title: "Visual Storytelling",
    description: "Use charts, heat maps, and visualizations to convey complex data effectively",
    icon: TrendingUp
  },
  {
    title: "Actionable Insights",
    description: "Always include recommendations and next steps, not just data presentation",
    icon: Brain
  },
  {
    title: "Consistency is Key",
    description: "Use consistent metrics, formats, and schedules for better comparability",
    icon: CheckCircle2
  }
];

const QUICK_TIPS = [
  "Use executive summaries for busy stakeholders",
  "Include trend analysis, not just point-in-time data",
  "Highlight exceptions and outliers prominently",
  "Automate recurring reports to save time",
  "Always cite data sources and dates",
  "Use color coding for risk levels consistently",
  "Include a glossary for technical terms",
  "Test reports with a sample audience first"
];

export default function ReportsLearningPath() {
  const [selectedModule, setSelectedModule] = useState(null);

  const completedCount = LEARNING_MODULES.filter(m => m.status === "completed").length;
  const totalModules = LEARNING_MODULES.length;
  const overallProgress = (completedCount / totalModules) * 100;

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Intermediate": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Advanced": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <BookOpen className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Reporting Learning Path</CardTitle>
                <p className="text-slate-400 text-sm mt-1">Master GRC reporting from basics to advanced techniques</p>
              </div>
            </div>
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-lg px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              {completedCount}/{totalModules}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-white font-semibold">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="practices">Best Practices</TabsTrigger>
          <TabsTrigger value="tips">Quick Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          {LEARNING_MODULES.map((module) => {
            const isLocked = module.status === "locked";
            const isCompleted = module.status === "completed";
            const inProgress = module.status === "in_progress";

            return (
              <Card 
                key={module.id} 
                className={`bg-[#1a2332] border-[#2a3548] transition-all ${!isLocked && 'hover:border-[#3a4558] cursor-pointer'} ${isLocked && 'opacity-60'}`}
                onClick={() => !isLocked && setSelectedModule(module)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`p-3 rounded-xl ${
                      isCompleted ? 'bg-emerald-500/20 border-emerald-500/30' :
                      inProgress ? 'bg-blue-500/20 border-blue-500/30' :
                      isLocked ? 'bg-slate-500/20 border-slate-500/30' :
                      'bg-violet-500/20 border-violet-500/30'
                    } border`}>
                      {isCompleted ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> :
                       inProgress ? <Play className="h-6 w-6 text-blue-400" /> :
                       isLocked ? <Lock className="h-6 w-6 text-slate-400" /> :
                       <BookOpen className="h-6 w-6 text-violet-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                          <p className="text-slate-400 text-sm mt-1">{module.description}</p>
                        </div>
                        <Badge className={getLevelColor(module.level)}>{module.level}</Badge>
                      </div>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-2 mt-3 mb-3">
                        {module.topics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-[#2a3548] text-slate-400">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-6 text-xs text-slate-500">
                        <span>{module.duration}</span>
                        <span>{module.lessons} lessons</span>
                        {inProgress && <span className="text-blue-400">{module.progress}% complete</span>}
                        {isCompleted && <span className="text-emerald-400">Completed ✓</span>}
                      </div>

                      {/* Progress Bar for In-Progress */}
                      {inProgress && (
                        <Progress value={module.progress} className="h-1.5 mt-3" />
                      )}

                      {/* Action Button */}
                      {!isLocked && (
                        <Button 
                          className="mt-4"
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                        >
                          {isCompleted ? "Review" : inProgress ? "Continue" : "Start Learning"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BEST_PRACTICES.map((practice, idx) => {
              const Icon = practice.icon;
              return (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 h-fit">
                        <Icon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">{practice.title}</h3>
                        <p className="text-slate-400 text-sm">{practice.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Quick Reporting Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_TIPS.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}