import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, AlertTriangle, CheckCircle2, Brain } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ExamScheduleDialog from "./ExamScheduleDialog";

export default function ExamScheduleManager() {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const queryClient = useQueryClient();

  const { data: exams = [] } = useQuery({
    queryKey: ['regulatory-exams'],
    queryFn: () => base44.entities.RegulatoryExam.list('-exam_date')
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RegulatoryExam.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] });
      toast.success("Exam updated");
      setScheduleDialogOpen(false);
      setEditingExam(null);
    }
  });

  const createExamMutation = useMutation({
    mutationFn: (data) => base44.entities.RegulatoryExam.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] });
      toast.success("Exam scheduled");
      setScheduleDialogOpen(false);
    }
  });

  const upcomingExams = exams.filter(e => {
    if (!e.exam_date) return false;
    const examDate = new Date(e.exam_date);
    return examDate >= new Date() && e.status !== 'completed';
  });

  const getDaysUntil = (dateStr) => {
    const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getReadinessColor = (readiness) => {
    if (readiness >= 80) return 'text-emerald-400';
    if (readiness >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              Exam Schedule & Countdown
            </CardTitle>
            <Button onClick={() => { setEditingExam(null); setScheduleDialogOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Exam
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No upcoming exams scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map(exam => {
                const daysUntil = getDaysUntil(exam.exam_date);
                return (
                  <Card key={exam.id} className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer" onClick={() => { setEditingExam(exam); setScheduleDialogOpen(true); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-2">{exam.exam_title}</h3>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                              {exam.exam_type?.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className={`${
                              daysUntil <= 7 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                              daysUntil <= 30 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}>
                              <Clock className="h-3 w-3 mr-1" />
                              {daysUntil} days
                            </Badge>
                            <Badge className="bg-slate-500/20 text-slate-400">
                              {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">Readiness</div>
                          <div className={`text-2xl font-bold ${getReadinessColor(exam.readiness_score || 0)}`}>
                            {exam.readiness_score || 0}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[#0f1623] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            (exam.readiness_score || 0) >= 80 ? 'bg-emerald-500' :
                            (exam.readiness_score || 0) >= 60 ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}
                          style={{ width: `${exam.readiness_score || 0}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ExamScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        exam={editingExam}
        onSubmit={(data) => {
          if (editingExam) {
            updateExamMutation.mutate({ id: editingExam.id, data });
          } else {
            createExamMutation.mutate(data);
          }
        }}
        isSubmitting={createExamMutation.isPending || updateExamMutation.isPending}
      />
    </div>
  );
}