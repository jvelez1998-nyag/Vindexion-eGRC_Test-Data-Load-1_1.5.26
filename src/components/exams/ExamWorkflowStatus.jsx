import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GitBranch, CheckCircle2, Circle, Clock } from "lucide-react";

export default function ExamWorkflowStatus({ exam, onUpdateStage }) {
  const workflowStages = [
    { id: 'preparation', name: 'Preparation', icon: Circle, weight: 20 },
    { id: 'documentation', name: 'Documentation Review', icon: Circle, weight: 25 },
    { id: 'testing', name: 'Control Testing', icon: Circle, weight: 25 },
    { id: 'final_review', name: 'Final Review', icon: Circle, weight: 20 },
    { id: 'exam_ready', name: 'Exam Ready', icon: Circle, weight: 10 }
  ];

  const currentStageIndex = workflowStages.findIndex(s => s.id === exam?.workflow_stage) || 0;
  const overallProgress = workflowStages
    .slice(0, currentStageIndex + 1)
    .reduce((sum, stage) => sum + stage.weight, 0);

  const getStageStatus = (index) => {
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'active';
    return 'upcoming';
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'active': return 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-400" />
          Exam Workflow Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Overall Progress</span>
            <span className="text-sm font-bold text-white">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="space-y-3">
          {workflowStages.map((stage, idx) => {
            const status = getStageStatus(idx);
            const Icon = status === 'completed' ? CheckCircle2 : status === 'active' ? Clock : Circle;
            
            return (
              <div key={stage.id} className="relative">
                {idx < workflowStages.length - 1 && (
                  <div className={`absolute left-[13px] top-8 bottom-0 w-0.5 ${
                    status === 'completed' ? 'bg-emerald-500/30' : 'bg-slate-600/30'
                  }`} />
                )}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStageColor(status)}`}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{stage.name}</div>
                    <div className="text-xs text-slate-400">{stage.weight}% of total workflow</div>
                  </div>
                  {status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateStage && onUpdateStage(exam.id, workflowStages[idx + 1]?.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 h-7 text-xs"
                    >
                      Complete Stage
                    </Button>
                  )}
                  {status === 'completed' && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Done</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}