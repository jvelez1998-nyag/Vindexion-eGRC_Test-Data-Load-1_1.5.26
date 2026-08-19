import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Play, Pause, Edit, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import ScheduledReportForm from "./ScheduledReportForm";

export default function ScheduledReportsManager() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date')
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Schedule created');
      setFormOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Schedule updated');
      setFormOpen(false);
      setEditingSchedule(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Schedule deleted');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ScheduledReport.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Schedule updated');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-400" />
              Scheduled Reports
            </CardTitle>
            <Button 
              onClick={() => { setEditingSchedule(null); setFormOpen(true); }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No scheduled reports</h3>
              <p className="text-slate-400 mb-4">Set up automated report generation and delivery</p>
              <Button onClick={() => { setEditingSchedule(null); setFormOpen(true); }}>
                Create Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map(schedule => {
                const template = templates.find(t => t.id === schedule.template_id);
                return (
                  <Card key={schedule.id} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            schedule.status === 'active' 
                              ? 'bg-emerald-500/10' 
                              : 'bg-slate-500/10'
                          }`}>
                            <Calendar className={`h-5 w-5 ${
                              schedule.status === 'active' 
                                ? 'text-emerald-400' 
                                : 'text-slate-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white mb-1">{schedule.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span>{template?.name || 'Unknown template'}</span>
                              <span>•</span>
                              <span className="capitalize">{schedule.frequency}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{schedule.recipients?.length || 0} recipients</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            schedule.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-slate-500/10 text-slate-400'
                          }>
                            {schedule.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleMutation.mutate({
                              id: schedule.id,
                              status: schedule.status === 'active' ? 'paused' : 'active'
                            })}
                          >
                            {schedule.status === 'active' ? (
                              <Pause className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Play className="h-4 w-4 text-emerald-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingSchedule(schedule); setFormOpen(true); }}
                          >
                            <Edit className="h-4 w-4 text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-400" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduledReportForm
        open={formOpen}
        onOpenChange={setFormOpen}
        schedule={editingSchedule}
        templates={templates}
        onSubmit={(data) => {
          if (editingSchedule) {
            updateMutation.mutate({ id: editingSchedule.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}