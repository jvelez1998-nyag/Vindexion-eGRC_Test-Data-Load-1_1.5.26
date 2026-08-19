import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, CheckCircle2, Lock, PlayCircle, BookOpen, Target, Trophy, Clock } from "lucide-react";

export default function ControlLearningPath() {
  const [completedModules, setCompletedModules] = useState([]);

  const learningPath = [
    {
      level: "Foundation",
      color: "from-blue-500 to-cyan-500",
      modules: [
        {
          id: "intro",
          title: "Introduction to Internal Controls",
          duration: "30 min",
          topics: ["What are controls", "Why controls matter", "Control objectives", "Basic terminology"],
          prerequisites: []
        },
        {
          id: "types",
          title: "Control Categories & Types",
          duration: "45 min",
          topics: ["Preventive controls", "Detective controls", "Corrective controls", "Directive controls"],
          prerequisites: ["intro"]
        },
        {
          id: "coso",
          title: "COSO Framework Fundamentals",
          duration: "60 min",
          topics: ["5 components", "17 principles", "Control environment", "Risk assessment"],
          prerequisites: ["types"]
        }
      ]
    },
    {
      level: "Intermediate",
      color: "from-indigo-500 to-purple-500",
      modules: [
        {
          id: "design",
          title: "Control Design Principles",
          duration: "90 min",
          topics: ["Design methodology", "Control procedures", "Documentation standards", "Risk alignment"],
          prerequisites: ["coso"]
        },
        {
          id: "testing",
          title: "Control Testing Methodologies",
          duration: "120 min",
          topics: ["Test approaches", "Sampling", "Evidence evaluation", "Deficiency assessment"],
          prerequisites: ["design"]
        },
        {
          id: "frameworks",
          title: "Control Frameworks (COBIT, ISO, NIST)",
          duration: "150 min",
          topics: ["COBIT structure", "ISO 27001 controls", "NIST CSF", "Framework mapping"],
          prerequisites: ["testing"]
        }
      ]
    },
    {
      level: "Advanced",
      color: "from-violet-500 to-purple-500",
      modules: [
        {
          id: "sox",
          title: "SOX Compliance & ITGC",
          duration: "180 min",
          topics: ["Section 404", "ITGC requirements", "SOX testing", "Audit readiness"],
          prerequisites: ["frameworks"]
        },
        {
          id: "automation",
          title: "Control Automation & Continuous Monitoring",
          duration: "120 min",
          topics: ["Automation strategies", "Continuous monitoring", "Analytics", "AI/ML applications"],
          prerequisites: ["sox"]
        },
        {
          id: "optimization",
          title: "Control Optimization & Rationalization",
          duration: "90 min",
          topics: ["Control assessment", "Redundancy elimination", "Cost-benefit analysis", "Improvement strategies"],
          prerequisites: ["automation"]
        }
      ]
    },
    {
      level: "Expert",
      color: "from-rose-500 to-pink-500",
      modules: [
        {
          id: "advanced-testing",
          title: "Advanced Testing Techniques",
          duration: "120 min",
          topics: ["Statistical sampling", "Data analytics", "Predictive testing", "AI-assisted testing"],
          prerequisites: ["optimization"]
        },
        {
          id: "governance",
          title: "Control Governance & Strategy",
          duration: "150 min",
          topics: ["Three lines model", "GRC integration", "Board reporting", "Strategic alignment"],
          prerequisites: ["advanced-testing"]
        },
        {
          id: "emerging",
          title: "Emerging Trends & Future of Controls",
          duration: "90 min",
          topics: ["AI/ML controls", "Cloud controls", "DevSecOps", "Zero trust architecture"],
          prerequisites: ["governance"]
        }
      ]
    }
  ];

  const isModuleUnlocked = (module) => {
    if (module.prerequisites.length === 0) return true;
    return module.prerequisites.every(prereq => completedModules.includes(prereq));
  };

  const isModuleCompleted = (moduleId) => completedModules.includes(moduleId);

  const toggleModuleComplete = (moduleId) => {
    if (isModuleCompleted(moduleId)) {
      setCompletedModules(completedModules.filter(id => id !== moduleId));
    } else {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  const totalModules = learningPath.reduce((sum, level) => sum + level.modules.length, 0);
  const overallProgress = Math.round((completedModules.length / totalModules) * 100);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Sparkles className="h-7 w-7 text-indigo-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Control Management Learning Path
                <Badge className="bg-indigo-500/20 text-indigo-400 text-[10px]">STRUCTURED CURRICULUM</Badge>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Progress through beginner to expert level control management training
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-white font-semibold">{completedModules.length} / {totalModules} modules</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{overallProgress}% complete</span>
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="text-amber-400">Keep going!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="space-y-6 pr-4">
          {learningPath.map((level, levelIdx) => (
            <Card key={levelIdx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{levelIdx + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{level.level}</CardTitle>
                    <Badge className={`mt-1 bg-gradient-to-r ${level.color}/20 border-0 text-xs`}>
                      {level.modules.length} Modules
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {level.modules.map((module, moduleIdx) => {
                    const unlocked = isModuleUnlocked(module);
                    const completed = isModuleCompleted(module.id);
                    
                    return (
                      <Card 
                        key={moduleIdx}
                        className={`${
                          completed ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30' :
                          unlocked ? 'bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40' :
                          'bg-[#151d2e] border-[#2a3548] opacity-60'
                        } transition-all`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${
                                completed ? 'bg-emerald-500/20' :
                                unlocked ? 'bg-indigo-500/20' :
                                'bg-slate-500/20'
                              }`}>
                                {completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                ) : unlocked ? (
                                  <PlayCircle className="h-5 w-5 text-indigo-400" />
                                ) : (
                                  <Lock className="h-5 w-5 text-slate-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-semibold ${
                                  completed ? 'text-emerald-400' :
                                  unlocked ? 'text-white' :
                                  'text-slate-500'
                                }`}>
                                  {module.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{module.duration}</span>
                                </div>
                              </div>
                            </div>
                            {unlocked && (
                              <Button
                                size="sm"
                                variant={completed ? "outline" : "default"}
                                onClick={() => toggleModuleComplete(module.id)}
                                className={
                                  completed 
                                    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                    : "bg-gradient-to-r from-indigo-600 to-purple-600"
                                }
                              >
                                {completed ? "Completed" : "Start"}
                              </Button>
                            )}
                          </div>
                          
                          {unlocked && (
                            <>
                              <div className="mb-3">
                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                                  Topics Covered
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                  {module.topics.map((topic, tidx) => (
                                    <Badge key={tidx} className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {module.prerequisites.length > 0 && (
                                <div className="text-xs text-slate-500">
                                  <span className="font-semibold">Prerequisites:</span>{' '}
                                  {module.prerequisites.map((prereq, pidx) => {
                                    const prereqCompleted = isModuleCompleted(prereq);
                                    return (
                                      <span key={pidx} className={prereqCompleted ? 'text-emerald-400' : ''}>
                                        {prereq}{pidx < module.prerequisites.length - 1 ? ', ' : ''}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}

                          {!unlocked && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Complete prerequisites to unlock
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}