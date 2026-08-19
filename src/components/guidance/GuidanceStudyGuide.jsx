import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Brain, Target, CheckCircle2, Play, Clock, Award, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function GuidanceStudyGuide() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);

  const learningPaths = [
    {
      id: "sox",
      title: "SOX Compliance Mastery",
      level: "Intermediate",
      duration: "6 weeks",
      modules: 12,
      color: "from-blue-500 to-cyan-500",
      framework: "SOX",
      topics: [
        "SOX Overview and History",
        "Section 302: Certification of Financial Reports",
        "Section 404: Internal Controls Assessment",
        "Section 409: Real-time Disclosure Requirements",
        "ITGC (IT General Controls) for SOX",
        "SOX Documentation Requirements",
        "Testing and Evidence Collection",
        "Deficiency Management",
        "External Auditor Coordination",
        "Continuous Compliance Monitoring",
        "SOX Automation Strategies",
        "Common SOX Pitfalls and Solutions"
      ]
    },
    {
      id: "gdpr",
      title: "GDPR Privacy Compliance",
      level: "Advanced",
      duration: "5 weeks",
      modules: 10,
      color: "from-emerald-500 to-teal-500",
      framework: "GDPR",
      topics: [
        "GDPR Principles and Scope",
        "Lawful Basis for Processing",
        "Data Subject Rights (DSR)",
        "Privacy by Design and Default",
        "Data Protection Impact Assessments (DPIA)",
        "Data Breach Notification Requirements",
        "International Data Transfers",
        "DPO Role and Responsibilities",
        "Vendor and Processor Management",
        "GDPR Enforcement and Penalties"
      ]
    },
    {
      id: "iso27001",
      title: "ISO 27001 Implementation",
      level: "Advanced",
      duration: "8 weeks",
      modules: 14,
      color: "from-purple-500 to-pink-500",
      framework: "ISO27001",
      topics: [
        "ISMS Framework Overview",
        "Context of the Organization",
        "Leadership and Commitment",
        "Risk Assessment Process",
        "Risk Treatment Planning",
        "Annex A Controls Deep Dive",
        "Access Control (A.9)",
        "Cryptography (A.10)",
        "Operations Security (A.12)",
        "Communications Security (A.13)",
        "Incident Management (A.16)",
        "Compliance Requirements (A.18)",
        "Internal Audit Preparation",
        "Certification Readiness"
      ]
    },
    {
      id: "soc2",
      title: "SOC 2 Audit Preparation",
      level: "Intermediate",
      duration: "4 weeks",
      modules: 8,
      color: "from-indigo-500 to-violet-500",
      framework: "SOC2",
      topics: [
        "Trust Services Criteria Overview",
        "Security (CC) Common Criteria",
        "Availability Criteria",
        "Processing Integrity",
        "Confidentiality Requirements",
        "Privacy Criteria",
        "Type I vs Type II Reports",
        "Audit Readiness and Evidence"
      ]
    }
  ];

  const deepDives = [
    {
      title: "Understanding Control Frameworks",
      framework: "All",
      description: "Comprehensive comparison of major control frameworks and when to use each",
      duration: "90 min",
      topics: ["Framework Selection", "Control Mapping", "Integration Strategies", "Maturity Models"]
    },
    {
      title: "Privacy Impact Assessments",
      framework: "GDPR",
      description: "Step-by-step guide to conducting effective PIAs and DPIAs",
      duration: "120 min",
      topics: ["Necessity Testing", "Impact Analysis", "Mitigation Measures", "Documentation Requirements"]
    },
    {
      title: "SOX 404 Control Testing",
      framework: "SOX",
      description: "Advanced techniques for designing and executing SOX control tests",
      duration: "90 min",
      topics: ["Test Design", "Sample Selection", "Evidence Collection", "Exception Management"]
    },
    {
      title: "Incident Response Playbooks",
      framework: "ISO27001",
      description: "Building effective incident response procedures",
      duration: "75 min",
      topics: ["Incident Classification", "Response Teams", "Communication Plans", "Post-Incident Reviews"]
    },
    {
      title: "Access Control Best Practices",
      framework: "All",
      description: "Implementing robust access control across frameworks",
      duration: "60 min",
      topics: ["Role-Based Access", "Privileged Access", "Access Reviews", "Segregation of Duties"]
    },
    {
      title: "Third-Party Due Diligence",
      framework: "SOC2",
      description: "Vendor assessment and ongoing monitoring",
      duration: "90 min",
      topics: ["Due Diligence Questionnaires", "Security Assessments", "Contract Clauses", "Monitoring Programs"]
    }
  ];

  const simulations = [
    {
      title: "SOX Deficiency Response Simulation",
      framework: "SOX",
      difficulty: "Advanced",
      duration: "45 min",
      scenario: "Critical control deficiency identified 2 weeks before audit",
      objectives: ["Root Cause Analysis", "Remediation Planning", "Auditor Communication"]
    },
    {
      title: "GDPR Data Breach Response",
      framework: "GDPR",
      difficulty: "Intermediate",
      duration: "60 min",
      scenario: "Personal data breach affecting 10,000 customers",
      objectives: ["72-Hour Notification", "Impact Assessment", "Regulatory Reporting"]
    },
    {
      title: "ISO 27001 Internal Audit",
      framework: "ISO27001",
      difficulty: "Advanced",
      duration: "90 min",
      scenario: "Conducting your first internal ISMS audit",
      objectives: ["Audit Planning", "Evidence Review", "Finding Documentation", "CAP Development"]
    },
    {
      title: "SOC 2 Type II Readiness",
      framework: "SOC2",
      difficulty: "Intermediate",
      duration: "60 min",
      scenario: "6 months to SOC 2 Type II audit",
      objectives: ["Gap Analysis", "Control Implementation", "Evidence Collection", "Audit Coordination"]
    }
  ];

  const frameworkColors = {
    SOX: "bg-blue-500/10 text-blue-400",
    GDPR: "bg-emerald-500/10 text-emerald-400",
    ISO27001: "bg-purple-500/10 text-purple-400",
    SOC2: "bg-indigo-500/10 text-indigo-400",
    All: "bg-slate-500/10 text-slate-400"
  };

  const toggleModule = (moduleIdx) => {
    if (completedModules.includes(moduleIdx)) {
      setCompletedModules(completedModules.filter(m => m !== moduleIdx));
    } else {
      setCompletedModules([...completedModules, moduleIdx]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Learning Paths Overview */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Compliance Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {learningPaths.map((path) => {
              const progress = selectedPath?.id === path.id ? (completedModules.length / path.modules) * 100 : 0;
              
              return (
                <Card
                  key={path.id}
                  className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40 cursor-pointer transition-all"
                  onClick={() => setSelectedPath(path)}
                >
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${path.color}/20 w-fit mb-4`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{path.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={frameworkColors[path.framework]}>{path.framework}</Badge>
                      <Badge className="bg-indigo-500/20 text-indigo-400">{path.level}</Badge>
                      <Badge className="bg-slate-500/20 text-slate-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {path.duration}
                      </Badge>
                    </div>
                    {progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">Progress</span>
                          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Play className="h-4 w-4 mr-2" />
                      {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Path Details */}
      {selectedPath && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedPath.title} - Course Modules
              </CardTitle>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                {completedModules.length}/{selectedPath.modules} completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {selectedPath.topics.map((topic, idx) => {
                  const isCompleted = completedModules.includes(idx);
                  
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                        isCompleted 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40'
                      }`}
                      onClick={() => toggleModule(idx)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <span className="text-sm font-semibold text-indigo-400">{idx + 1}</span>
                          )}
                        </div>
                        <span className={`text-sm ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                          {topic}
                        </span>
                      </div>
                      {!isCompleted && (
                        <Button size="sm" variant="outline" className="border-[#2a3548]">
                          Start
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Deep Dives */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Deep Dive Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {deepDives.map((dive, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white mb-2">{dive.title}</h3>
                      <p className="text-sm text-slate-400 mb-3">{dive.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={frameworkColors[dive.framework]}>
                          {dive.framework}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {dive.duration}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Topics Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {dive.topics.map((topic, i) => (
                        <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Deep Dive
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulations */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-400" />
            Compliance Simulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {simulations.map((sim, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={frameworkColors[sim.framework]}>{sim.framework}</Badge>
                        <Badge className={
                          sim.difficulty === 'Advanced' 
                            ? 'bg-rose-500/20 text-rose-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }>
                          {sim.difficulty}
                        </Badge>
                        <Badge className="bg-slate-500/20 text-slate-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {sim.duration}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">{sim.title}</h3>
                      <p className="text-sm text-slate-400 mb-3 italic">"{sim.scenario}"</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Learning Objectives:</p>
                    <div className="space-y-1">
                      {sim.objectives.map((obj, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          {obj}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700">
                    <Play className="h-4 w-4 mr-2" />
                    Launch Simulation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}