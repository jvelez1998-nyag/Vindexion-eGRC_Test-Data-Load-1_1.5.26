import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle, Clock, Target, TrendingUp, BookOpen, FileText, Brain } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

const studyModules = [
  {
    week: 1,
    title: "IT Security Fundamentals",
    topics: ["Network Security", "Access Controls", "Encryption", "Security Architecture"],
    hours: 12,
    resources: ["IT Handbook - Architecture", "NIST Frameworks", "Practice Questions"],
    completed: true
  },
  {
    week: 2,
    title: "Cybersecurity Assessment",
    topics: ["CAT Tool", "Inherent Risk Profile", "Maturity Levels", "Declarative Statements"],
    hours: 15,
    resources: ["CAT Guide", "Case Studies", "Assessment Worksheets"],
    completed: true
  },
  {
    week: 3,
    title: "BSA/AML Compliance",
    topics: ["CIP Requirements", "CDD", "Suspicious Activity Reporting", "OFAC"],
    hours: 14,
    resources: ["BSA/AML Handbook", "Red Flags Guide", "SAR Examples"],
    completed: false
  },
  {
    week: 4,
    title: "Third-Party Risk Management",
    topics: ["Due Diligence", "Contract Requirements", "Ongoing Monitoring", "Cloud Services"],
    hours: 10,
    resources: ["TPRM Guidance", "OCC Bulletin 2013-29", "Risk Assessment Tools"],
    completed: false
  },
  {
    week: 5,
    title: "Business Continuity Planning",
    topics: ["Disaster Recovery", "Crisis Management", "Testing Requirements", "Communication Plans"],
    hours: 8,
    resources: ["BCP Handbook", "Testing Templates", "Scenario Planning"],
    completed: false
  },
  {
    week: 6,
    title: "Consumer Compliance",
    topics: ["Fair Lending", "TILA/RESPA", "CRA", "UDAAP"],
    hours: 12,
    resources: ["Consumer Compliance Handbook", "Exam Procedures", "Case Law"],
    completed: false
  },
  {
    week: 7,
    title: "Information Security Program",
    topics: ["Risk Assessment", "Security Controls", "Incident Response", "Vendor Management"],
    hours: 10,
    resources: ["Security Program Guide", "Control Frameworks", "IR Playbooks"],
    completed: false
  },
  {
    week: 8,
    title: "Exam Day Preparation",
    topics: ["Mock Exams", "Documentation Review", "Interview Prep", "Final Review"],
    hours: 16,
    resources: ["Practice Exams", "Interview Guides", "Checklists"],
    completed: false
  }
];

const milestones = [
  { date: addDays(new Date(), 14), title: "Complete IT Security Module", completed: true },
  { date: addDays(new Date(), 28), title: "Cybersecurity CAT Proficiency", completed: true },
  { date: addDays(new Date(), 42), title: "BSA/AML Module Complete", completed: false },
  { date: addDays(new Date(), 56), title: "Mid-Point Assessment", completed: false },
  { date: addDays(new Date(), 70), title: "Mock Exam #1", completed: false },
  { date: addDays(new Date(), 84), title: "Final Review Complete", completed: false }
];

export default function FFIECStudyPlan({ examDate, onUpdateProgress }) {
  const [expandedWeek, setExpandedWeek] = useState(null);
  
  const completedModules = studyModules.filter(m => m.completed).length;
  const totalModules = studyModules.length;
  const progressPercent = (completedModules / totalModules) * 100;
  
  const totalHours = studyModules.reduce((sum, m) => sum + m.hours, 0);
  const completedHours = studyModules.filter(m => m.completed).reduce((sum, m) => sum + m.hours, 0);
  
  const daysUntilExam = examDate ? differenceInDays(new Date(examDate), new Date()) : null;

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-slate-400">Overall Progress</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{Math.round(progressPercent)}%</div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-slate-400">Modules Complete</span>
              </div>
              <div className="text-3xl font-bold text-white">{completedModules}/{totalModules}</div>
              <p className="text-xs text-slate-500 mt-1">{totalModules - completedModules} remaining</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-sm text-slate-400">Study Hours</span>
              </div>
              <div className="text-3xl font-bold text-white">{completedHours}/{totalHours}</div>
              <p className="text-xs text-slate-500 mt-1">{totalHours - completedHours}h remaining</p>
            </div>
            
            {daysUntilExam && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-violet-400" />
                  <span className="text-sm text-slate-400">Days Until Exam</span>
                </div>
                <div className="text-3xl font-bold text-white">{daysUntilExam}</div>
                <p className="text-xs text-slate-500 mt-1">{format(new Date(examDate), 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Study Modules */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                8-Week Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studyModules.map((module) => (
                <Card 
                  key={module.week} 
                  className={`bg-[#0f1623] border-[#2a3548] cursor-pointer transition-all ${
                    expandedWeek === module.week ? 'border-blue-500/40' : ''
                  }`}
                  onClick={() => setExpandedWeek(expandedWeek === module.week ? null : module.week)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        {module.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">Week {module.week}</Badge>
                            <h3 className="font-semibold text-white">{module.title}</h3>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{module.hours} study hours</p>
                          
                          {expandedWeek === module.week && (
                            <div className="space-y-3 mt-3">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Topics Covered:</p>
                                <div className="flex flex-wrap gap-1">
                                  {module.topics.map((topic, idx) => (
                                    <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Resources:</p>
                                <ul className="space-y-1">
                                  {module.resources.map((resource, idx) => (
                                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                                      <FileText className="h-3 w-3 text-slate-500" />
                                      {resource}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {!module.completed && (
                                <Button 
                                  size="sm" 
                                  className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateProgress?.(module.week);
                                  }}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={module.completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}>
                        {module.completed ? "Complete" : "Pending"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-violet-400" />
                Key Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  {milestone.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{milestone.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{format(milestone.date, 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-violet-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">AI Study Tips</h3>
                  <p className="text-xs text-slate-300">
                    Based on your progress, focus on BSA/AML this week. Practice SAR identification and OFAC screening procedures.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}