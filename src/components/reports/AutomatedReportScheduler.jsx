import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, Clock, Send, Plus, Trash2, 
  Users, FileText, CheckCircle2, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function AutomatedReportScheduler() {
  const [showForm, setShowForm] = useState(false);
  const [schedule, setSchedule] = useState({
    name: "",
    template_id: "",
    frequency: "weekly",
    day_of_week: 1,
    time: "09:00",
    recipients: [],
    format: "pdf",
    include_summary: true,
    status: "active"
  });
  const [recipientInput, setRecipientInput] = useState("");

  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date', 50)
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date', 50)
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success("Schedule created successfully");
      setShowForm(false);
      resetForm();
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success("Schedule deleted");
    }
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ScheduledReport.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success("Schedule updated");
    }
  });

  const resetForm = () => {
    setSchedule({
      name: "",
      template_id: "",
      frequency: "weekly",
      day_of_week: 1,
      time: "09:00",
      recipients: [],
      format: "pdf",
      include_summary: true,
      status: "active"
    });
    setRecipientInput("");
  };

  const addRecipient = () => {
    if (recipientInput && !schedule.recipients.includes(recipientInput)) {
      setSchedule({ ...schedule, recipients: [...schedule.recipients, recipientInput] });
      setRecipientInput("");
    }
  };

  const removeRecipient = (email) => {
    setSchedule({ ...schedule, recipients: schedule.recipients.filter(r => r !== email) });
  };

  const handleSubmit = () => {
    if (!schedule.name || !schedule.template_id || schedule.recipients.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    createScheduleMutation.mutate(schedule);
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const dayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border-indigo-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Automated Report Scheduling</h2>
              <p className="text-slate-400 text-sm mt-1">
                Schedule and distribute reports automatically
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Create Report Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-400 mb-2">Schedule Name</Label>
                <Input
                  value={schedule.name}
                  onChange={(e) => setSchedule({ ...schedule, name: e.target.value })}
                  placeholder="Weekly Executive Report"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <Label className="text-sm text-slate-400 mb-2">Report Template</Label>
                <Select value={schedule.template_id} onValueChange={(val) => setSchedule({ ...schedule, template_id: val })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id} className="text-white">{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-slate-400 mb-2">Frequency</Label>
                <Select value={schedule.frequency} onValueChange={(val) => setSchedule({ ...schedule, frequency: val })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {frequencyOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {schedule.frequency === 'weekly' && (
                <div>
                  <Label className="text-sm text-slate-400 mb-2">Day of Week</Label>
                  <Select value={schedule.day_of_week.toString()} onValueChange={(val) => setSchedule({ ...schedule, day_of_week: parseInt(val) })}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {dayOptions.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()} className="text-white">{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-sm text-slate-400 mb-2">Time</Label>
                <Input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <Label className="text-sm text-slate-400 mb-2">Format</Label>
                <Select value={schedule.format} onValueChange={(val) => setSchedule({ ...schedule, format: val })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="pdf" className="text-white">PDF</SelectItem>
                    <SelectItem value="excel" className="text-white">Excel</SelectItem>
                    <SelectItem value="both" className="text-white">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm text-slate-400 mb-2">Recipients</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  placeholder="Enter email address"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
                <Button onClick={addRecipient} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {schedule.recipients.map((email, idx) => (
                  <Badge key={idx} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 pr-1">
                    {email}
                    <button onClick={() => removeRecipient(email)} className="ml-2 hover:text-rose-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2a3548]">
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-[#2a3548]">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createScheduleMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {createScheduleMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Create Schedule</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map(sched => {
          const template = templates.find(t => t.id === sched.template_id);
          
          return (
            <Card key={sched.id} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">{sched.name}</h4>
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                      {template?.name || 'Unknown Template'}
                    </Badge>
                  </div>
                  <Switch
                    checked={sched.status === 'active'}
                    onCheckedChange={(checked) => 
                      toggleScheduleMutation.mutate({ 
                        id: sched.id, 
                        status: checked ? 'active' : 'paused' 
                      })
                    }
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{sched.frequency}</span>
                    {sched.frequency === 'weekly' && (
                      <span>• {dayOptions.find(d => d.value === sched.day_of_week)?.label}</span>
                    )}
                    <span>• {sched.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="h-4 w-4" />
                    <span className="uppercase">{sched.format}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{sched.recipients?.length || 0} recipients</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#2a3548]">
                  <div className="text-xs text-slate-500">
                    Next: {sched.next_run ? new Date(sched.next_run).toLocaleDateString() : 'Not scheduled'}
                  </div>
                  <Button
                    onClick={() => deleteScheduleMutation.mutate(sched.id)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}