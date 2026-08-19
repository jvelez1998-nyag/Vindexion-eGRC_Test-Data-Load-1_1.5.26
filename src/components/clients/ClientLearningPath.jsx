import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, CheckCircle2, Lock, PlayCircle, 
  Award, TrendingUp, Target, Zap 
} from "lucide-react";

const LEARNING_PATHS = [
  {
    id: 'beginner',
    title: 'Client Management Fundamentals',
    level: 'Beginner',
    duration: '4 weeks',
    modules: [
      { id: 1, name: 'Introduction to Client Risk Management', duration: '3 days', status: 'completed' },
      { id: 2, name: 'Client Onboarding Process', duration: '5 days', status: 'completed' },
      { id: 3, name: 'Basic Risk Assessment', duration: '1 week', status: 'in_progress' },
      { id: 4, name: 'Client Communication Essentials', duration: '3 days', status: 'locked' },
      { id: 5, name: 'Documentation & Reporting Basics', duration: '1 week', status: 'locked' }
    ],
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
  },
  {
    id: 'intermediate',
    title: 'Advanced Client Assessment',
    level: 'Intermediate',
    duration: '6 weeks',
    modules: [
      { id: 1, name: 'Compliance Framework Mapping', duration: '1 week', status: 'locked' },
      { id: 2, name: 'Control Environment Assessment', duration: '1 week', status: 'locked' },
      { id: 3, name: 'Security Posture Analysis', duration: '1 week', status: 'locked' },
      { id: 4, name: 'Risk Scoring Methodologies', duration: '1 week', status: 'locked' },
      { id: 5, name: 'Quarterly Business Reviews', duration: '1 week', status: 'locked' },
      { id: 6, name: 'Client Benchmarking', duration: '1 week', status: 'locked' }
    ],
    color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20'
  },
  {
    id: 'advanced',
    title: 'Strategic Client Advisory',
    level: 'Advanced',
    duration: '8 weeks',
    modules: [
      { id: 1, name: 'Enterprise Risk Strategy', duration: '2 weeks', status: 'locked' },
      { id: 2, name: 'AI-Driven Client Analytics', duration: '1 week', status: 'locked' },
      { id: 3, name: 'Crisis Management & Escalation', duration: '1 week', status: 'locked' },
      { id: 4, name: 'Portfolio Optimization', duration: '2 weeks', status: 'locked' },
      { id: 5, name: 'Executive Stakeholder Management', duration: '1 week', status: 'locked' },
      { id: 6, name: 'Value Realization & ROI', duration: '1 week', status: 'locked' }
    ],
    color: 'from-rose-500/10 to-orange-500/10 border-rose-500/20'
  }
];

export default function ClientLearningPath() {
  const [selectedPath, setSelectedPath] = useState('beginner');

  const path = LEARNING_PATHS.find(p => p.id === selectedPath);
  const completedModules = path?.modules.filter(m => m.status === 'completed').length || 0;
  const progressPercent = path ? (completedModules / path.modules.length) * 100 : 0;

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (status === 'in_progress') return <PlayCircle className="h-4 w-4 text-blue-400" />;
    return <Lock className="h-4 w-4 text-slate-600" />;
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-emerald-500/20 border-emerald-500/30';
    if (status === 'in_progress') return 'bg-blue-500/20 border-blue-500/30';
    return 'bg-slate-700/20 border-slate-700/30';
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Learning Paths</h3>
                <p className="text-xs text-slate-400">Structured training for client management mastery</p>
              </div>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {LEARNING_PATHS.length} Paths
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Path Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LEARNING_PATHS.map(lp => (
          <Card 
            key={lp.id}
            className={`cursor-pointer transition-all bg-gradient-to-br ${lp.color} ${
              selectedPath === lp.id ? 'ring-2 ring-indigo-500' : 'hover:scale-[1.02]'
            }`}
            onClick={() => setSelectedPath(lp.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-indigo-500/20 text-indigo-400 text-[9px]">{lp.level}</Badge>
                <Badge className="bg-slate-500/20 text-slate-400 text-[9px]">{lp.duration}</Badge>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{lp.title}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{lp.modules.length} modules</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Path Details */}
      {path && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                {path.title}
              </CardTitle>
              <Badge className="bg-indigo-500/20 text-indigo-400">
                {completedModules}/{path.modules.length} Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Overall Progress</span>
                <span className="text-xs text-white font-semibold">{progressPercent.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <ScrollArea className="h-[450px]">
              <div className="space-y-2 pr-4">
                {path.modules.map((module, idx) => (
                  <Card key={module.id} className={`bg-gradient-to-br ${getStatusColor(module.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(module.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="text-sm font-semibold text-white">
                                Module {module.id}: {module.name}
                              </h5>
                              <p className="text-xs text-slate-400 mt-1">{module.duration}</p>
                            </div>
                          </div>
                          {module.status !== 'locked' && (
                            <Button 
                              size="sm" 
                              className={`mt-2 h-7 text-xs ${
                                module.status === 'completed' 
                                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {module.status === 'completed' ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-3 w-3 mr-1" />
                                  Continue
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400">{completedModules}</div>
              <div className="text-xs text-slate-400 mt-1">Completed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">
                {LEARNING_PATHS.reduce((sum, p) => sum + p.modules.filter(m => m.status === 'in_progress').length, 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">In Progress</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">
                {progressPercent.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Path Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}