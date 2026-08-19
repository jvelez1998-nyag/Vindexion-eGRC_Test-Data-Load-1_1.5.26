import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, CheckCircle2, Circle, PlayCircle, Trophy, 
  Brain, Target, Sparkles, ChevronRight, Clock, Award
} from "lucide-react";
import { toast } from "sonner";

export default function ExamStudyGuide() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);

  const learningPaths = [
    {
      id: 'ffiec',
      title: 'FFIEC Exam Preparation',
      examType: 'FFIEC',
      duration: '6-8 weeks',
      level: 'Advanced',
      modules: [
        { id: 'ffiec-1', title: 'IT Governance & Risk Management', duration: '1 week', topics: ['IT governance frameworks', 'Risk assessment methodologies', 'Third-party risk management', 'Board oversight'] },
        { id: 'ffiec-2', title: 'Cybersecurity Controls', duration: '1 week', topics: ['Access controls', 'Network security', 'Encryption standards', 'Incident response'] },
        { id: 'ffiec-3', title: 'Audit & Compliance', duration: '1 week', topics: ['Audit planning', 'Testing procedures', 'Evidence gathering', 'Reporting standards'] },
        { id: 'ffiec-4', title: 'Business Continuity & Resilience', duration: '1 week', topics: ['BCP/DR planning', 'Testing requirements', 'Recovery objectives', 'Crisis management'] },
        { id: 'ffiec-5', title: 'Vendor Management', duration: '1 week', topics: ['Due diligence', 'Ongoing monitoring', 'Contract management', 'Fourth-party risk'] },
        { id: 'ffiec-6', title: 'Exam Simulation & Practice', duration: '2 weeks', topics: ['Mock exams', 'Case studies', 'Documentation review', 'Interview preparation'] }
      ],
      description: 'Comprehensive preparation for FFIEC regulatory examinations',
      certification: 'FFIEC Readiness Certificate'
    },
    {
      id: 'sox',
      title: 'SOX Compliance Mastery',
      examType: 'SOX',
      duration: '4-6 weeks',
      level: 'Intermediate',
      modules: [
        { id: 'sox-1', title: 'SOX Framework Overview', duration: '3 days', topics: ['SOX 302 & 404', 'COSO framework', 'PCAOB standards', 'Scoping'] },
        { id: 'sox-2', title: 'Internal Controls Design', duration: '1 week', topics: ['Control design principles', 'Entity-level controls', 'Process-level controls', 'IT general controls'] },
        { id: 'sox-3', title: 'Testing & Documentation', duration: '1 week', topics: ['Test of design', 'Test of effectiveness', 'Sampling methodologies', 'Documentation requirements'] },
        { id: 'sox-4', title: 'Deficiency Assessment', duration: '1 week', topics: ['Identifying deficiencies', 'Material weakness vs significant deficiency', 'Remediation planning', 'Management assertions'] },
        { id: 'sox-5', title: 'SOX Compliance Automation', duration: '1 week', topics: ['Automated controls', 'Continuous monitoring', 'Data analytics', 'GRC platforms'] }
      ],
      description: 'Master SOX compliance and internal controls over financial reporting',
      certification: 'SOX Compliance Specialist'
    },
    {
      id: 'iso27001',
      title: 'ISO 27001 Lead Auditor',
      examType: 'ISO27001',
      duration: '5 weeks',
      level: 'Advanced',
      modules: [
        { id: 'iso-1', title: 'ISMS Fundamentals', duration: '1 week', topics: ['ISO 27001 structure', 'Risk-based approach', 'ISMS scope', 'Leadership requirements'] },
        { id: 'iso-2', title: 'Annex A Controls', duration: '1 week', topics: ['114 controls overview', 'Control selection', 'Statement of Applicability', 'Implementation guidance'] },
        { id: 'iso-3', title: 'Audit Planning & Execution', duration: '1 week', topics: ['Audit planning', 'Evidence collection', 'Non-conformity assessment', 'Audit reporting'] },
        { id: 'iso-4', title: 'Risk Assessment & Treatment', duration: '1 week', topics: ['Risk identification', 'Risk analysis', 'Risk evaluation', 'Treatment options'] },
        { id: 'iso-5', title: 'Certification Process', duration: '1 week', topics: ['Stage 1 audit', 'Stage 2 audit', 'Surveillance audits', 'Recertification'] }
      ],
      description: 'Complete ISO 27001 lead auditor certification preparation',
      certification: 'ISO 27001 Lead Auditor'
    },
    {
      id: 'gdpr',
      title: 'GDPR Compliance Professional',
      examType: 'GDPR',
      duration: '4 weeks',
      level: 'Intermediate',
      modules: [
        { id: 'gdpr-1', title: 'GDPR Principles & Scope', duration: '1 week', topics: ['Lawfulness', 'Data minimization', 'Territorial scope', 'Personal data definition'] },
        { id: 'gdpr-2', title: 'Rights & Obligations', duration: '1 week', topics: ['Individual rights', 'Controller obligations', 'Processor requirements', 'DPO role'] },
        { id: 'gdpr-3', title: 'Privacy by Design & DPIA', duration: '1 week', topics: ['Privacy by design', 'Data protection impact assessment', 'Risk assessment', 'Safeguards'] },
        { id: 'gdpr-4', title: 'Breach Management & Enforcement', duration: '1 week', topics: ['Breach notification', 'Supervisory authorities', 'Enforcement actions', 'Penalties'] }
      ],
      description: 'Become a certified GDPR compliance professional',
      certification: 'GDPR Practitioner Certificate'
    }
  ];

  const toggleModule = (moduleId) => {
    setCompletedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
    toast.success("Progress updated");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Exam Study Guide</h2>
            <p className="text-slate-400 text-sm mt-1">
              Structured learning paths for regulatory certification success
            </p>
          </div>
        </div>
      </Card>

      {!selectedPath ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.map(path => {
            const progress = (completedModules.filter(m => path.modules.some(mod => mod.id === m)).length / path.modules.length) * 100;
            
            return (
              <Card 
                key={path.id}
                className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer group"
                onClick={() => setSelectedPath(path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[10px] mb-2">
                        {path.level}
                      </Badge>
                      <CardTitle className="text-lg text-white group-hover:text-indigo-400 transition-colors">
                        {path.title}
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-2">{path.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {path.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {path.modules.length} modules
                    </div>
                  </div>
                  
                  {progress > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-indigo-400 font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {path.certification}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Path Header */}
          <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                    {selectedPath.level}
                  </Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    {selectedPath.examType}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedPath.title}</h2>
                <p className="text-slate-400 text-sm">{selectedPath.description}</p>
              </div>
              <Button onClick={() => setSelectedPath(null)} variant="outline" className="border-[#2a3548]">
                ← Back to Paths
              </Button>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Overall Progress</span>
                <span className="text-indigo-400 font-semibold">
                  {completedModules.filter(m => selectedPath.modules.some(mod => mod.id === m)).length} / {selectedPath.modules.length} modules
                </span>
              </div>
              <Progress 
                value={(completedModules.filter(m => selectedPath.modules.some(mod => mod.id === m)).length / selectedPath.modules.length) * 100} 
                className="h-3"
              />
            </div>
          </Card>

          {/* Modules */}
          <div className="space-y-3">
            {selectedPath.modules.map((module, idx) => {
              const isCompleted = completedModules.includes(module.id);
              
              return (
                <Card 
                  key={module.id}
                  className={`bg-[#1a2332] border-[#2a3548] transition-all ${
                    isCompleted ? 'border-emerald-500/40' : 'hover:border-indigo-500/40'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        isCompleted 
                          ? 'bg-emerald-500/20 border-emerald-500/30' 
                          : 'bg-indigo-500/20 border-indigo-500/30'
                      } border`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <Circle className="h-6 w-6 text-indigo-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px]">
                            Module {idx + 1}
                          </Badge>
                          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
                            {module.duration}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
                        
                        <div className="mb-4">
                          <div className="text-xs text-slate-500 mb-2">Topics Covered:</div>
                          <div className="flex flex-wrap gap-2">
                            {module.topics.map((topic, tidx) => (
                              <Badge key={tidx} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => toggleModule(module.id)}
                          className={isCompleted 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : "bg-indigo-600 hover:bg-indigo-700"
                          }
                        >
                          {isCompleted ? (
                            <><CheckCircle2 className="h-4 w-4 mr-2" /> Completed</>
                          ) : (
                            <><PlayCircle className="h-4 w-4 mr-2" /> Start Module</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Completion Badge */}
          {completedModules.filter(m => selectedPath.modules.some(mod => mod.id === m)).length === selectedPath.modules.length && (
            <Card className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30 p-6 text-center">
              <Trophy className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Path Completed!</h3>
              <p className="text-slate-300 mb-4">
                Congratulations! You've completed the {selectedPath.title} learning path.
              </p>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-base px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                {selectedPath.certification}
              </Badge>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}