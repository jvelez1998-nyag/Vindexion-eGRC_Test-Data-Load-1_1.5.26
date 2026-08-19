import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Play, Pause, Trash2, Plus, Bell } from "lucide-react";
import { toast } from "sonner";

export default function AutomatedTestingScheduler({ open, onOpenChange, controls }) {
  const [formData, setFormData] = useState({
    control_id: "",
    schedule_name: "",
    frequency: "monthly",
    test_type: "both",
    auto_execute: false,
    notification_days_before: 7,
    assigned_tester: ""
  });

  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ['control-test-schedules'],
    queryFn: () => base44.entities.ControlTestSchedule.list()
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlTestSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-test-schedules'] });
      toast.success("Test schedule created");
      resetForm();
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ControlTestSchedule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-test-schedules'] });
      toast.success("Schedule updated");
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id) => base44.entities.ControlTestSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-test-schedules'] });
      toast.success("Schedule deleted");
    }
  });

  const resetForm = () => {
    setFormData({
      control_id: "",
      schedule_name: "",
      frequency: "monthly",
      test_type: "both",
      auto_execute: false,
      notification_days_before: 7,
      assigned_tester: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const control = controls.find(c => c.id === formData.control_id);
    const nextTestDate = new Date();
    nextTestDate.setDate(nextTestDate.getDate() + 7);

    createScheduleMutation.mutate({
      ...formData,
      schedule_name: formData.schedule_name || `${control?.name} - ${formData.frequency} test`,
      next_test_date: nextTestDate.toISOString().split('T')[0]
    });
  };

  const toggleSchedule = (schedule) => {
    updateScheduleMutation.mutate({
      id: schedule.id,
      data: { ...schedule, is_active: !schedule.is_active }
    });
  };

  const getControlName = (controlId) => {
    return controls.find(c => c.id === controlId)?.name || controlId;
  };

  const activeSchedules = schedules.filter(s => s.is_active);
  const inactiveSchedules = schedules.filter(s => !s.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Automated Testing Scheduler</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Create Schedule Form */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Create New Schedule</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-300">Control *</Label>
                <Select value={formData.control_id} onValueChange={(v) => setFormData({...formData, control_id: v})}>
                  <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select control" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {controls.map(control => (
                      <SelectItem key={control.id} value={control.id} className="text-white hover:bg-[#2a3548]">
                        {control.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Schedule Name</Label>
                <Input
                  value={formData.schedule_name}
                  onChange={(e) => setFormData({...formData, schedule_name: e.target.value})}
                  className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="daily" className="text-white">Daily</SelectItem>
                      <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                      <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                      <SelectItem value="quarterly" className="text-white">Quarterly</SelectItem>
                      <SelectItem value="semi_annually" className="text-white">Semi-Annually</SelectItem>
                      <SelectItem value="annually" className="text-white">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Test Type</Label>
                  <Select value={formData.test_type} onValueChange={(v) => setFormData({...formData, test_type: v})}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="design" className="text-white">Design</SelectItem>
                      <SelectItem value="operating_effectiveness" className="text-white">Operating Effectiveness</SelectItem>
                      <SelectItem value="both" className="text-white">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Assigned Tester</Label>
                <Input
                  type="email"
                  value={formData.assigned_tester}
                  onChange={(e) => setFormData({...formData, assigned_tester: e.target.value})}
                  className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="tester@company.com"
                />
              </div>

              <div>
                <Label className="text-slate-300">Notify (days before test)</Label>
                <Input
                  type="number"
                  value={formData.notification_days_before}
                  onChange={(e) => setFormData({...formData, notification_days_before: parseInt(e.target.value)})}
                  className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"
                  min="1"
                  max="30"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.auto_execute}
                  onCheckedChange={(checked) => setFormData({...formData, auto_execute: checked})}
                  className="border-[#2a3548]"
                />
                <Label className="text-slate-300 text-sm">Auto-execute tests (AI-driven)</Label>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </form>
          </div>

          {/* Schedules List */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Active Schedules ({activeSchedules.length})</h4>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-3">
                {activeSchedules.map(schedule => (
                  <Card key={schedule.id} className="bg-[#151d2e] border-[#2a3548] p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white mb-1">{schedule.schedule_name}</h5>
                        <div className="text-xs text-slate-500">{getControlName(schedule.control_id)}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleSchedule(schedule)}
                          className="h-7 w-7 text-slate-400 hover:text-white"
                        >
                          {schedule.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                          className="h-7 w-7 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        {schedule.frequency}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {schedule.next_test_date ? new Date(schedule.next_test_date).toLocaleDateString() : 'Not scheduled'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {schedule.test_type}
                      </Badge>
                      {schedule.auto_execute && (
                        <Badge className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                          Auto
                        </Badge>
                      )}
                      {schedule.assigned_tester && (
                        <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                          {schedule.assigned_tester.split('@')[0]}
                        </Badge>
                      )}
                    </div>

                    {schedule.notification_days_before > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <Bell className="h-3 w-3" />
                        Notify {schedule.notification_days_before}d before
                      </div>
                    )}
                  </Card>
                ))}

                {activeSchedules.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No active schedules
                  </div>
                )}

                {inactiveSchedules.length > 0 && (
                  <>
                    <h5 className="text-sm font-semibold text-slate-400 mt-6 mb-3">Inactive ({inactiveSchedules.length})</h5>
                    {inactiveSchedules.map(schedule => (
                      <Card key={schedule.id} className="bg-[#151d2e] border-[#2a3548] p-4 opacity-60">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm text-white">{schedule.schedule_name}</h5>
                            <div className="text-xs text-slate-500">{schedule.frequency}</div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleSchedule(schedule)}
                            className="h-7 w-7 text-slate-400 hover:text-emerald-400"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}