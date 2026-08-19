import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Mail, Plus, Play, Pause, Trash2, Clock, Users } from "lucide-react";
import { toast } from "sonner";

export default function AutomatedScheduler() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    report_type: "executive_summary",
    frequency: "weekly",
    day_of_week: "1",
    time: "09:00",
    recipients: "",
    format: "pdf",
    include_ai_summary: true
  });

  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const recipientList = data.recipients.split(',').map(e => e.trim()).filter(e => e);
      return base44.entities.ScheduledReport.create({
        ...data,
        recipients: recipientList,
        status: 'active',
        next_run: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast.success('Report schedule created');
      setDialogOpen(false);
      setFormData({
        name: "",
        report_type: "executive_summary",
        frequency: "weekly",
        day_of_week: "1",
        time: "09:00",
        recipients: "",
        format: "pdf",
        include_ai_summary: true
      });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ScheduledReport.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast.success('Schedule updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast.success('Schedule deleted');
    }
  });

  const reportTypes = [
    { value: "executive_summary", label: "Executive Summary" },
    { value: "risk_overview", label: "Risk Overview" },
    { value: "compliance_status", label: "Compliance Status" },
    { value: "audit_findings", label: "Audit Findings" },
    { value: "vendor_risk", label: "Vendor Risk Assessment" },
    { value: "board_report", label: "Board Report" },
    { value: "regulatory_submission", label: "Regulatory Submission" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Automated Report Scheduling</CardTitle>
                <p className="text-sm text-slate-400 mt-0.5">Schedule reports for automatic generation and email delivery</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Report Schedule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Schedule Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Weekly Executive Report"
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Report Type</Label>
                      <Select value={formData.report_type} onValueChange={(v) => setFormData({ ...formData, report_type: v })}>
                        <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                          {reportTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                        <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                        <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.frequency === 'weekly' && (
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select value={formData.day_of_week} onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}>
                          <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Email Recipients (comma-separated)</Label>
                      <Input
                        value={formData.recipients}
                        onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                        placeholder="email1@example.com, email2@example.com"
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => createMutation.mutate(formData)}
                    disabled={!formData.name || !formData.recipients || createMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No scheduled reports</h3>
            <p className="text-slate-400 mb-6">Create your first automated report schedule</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map(schedule => (
            <Card key={schedule.id} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${schedule.status === 'active' ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                      <Calendar className={`h-6 w-6 ${schedule.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-white">{schedule.name}</h3>
                        <Badge className={schedule.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                          {schedule.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">{schedule.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="h-4 w-4" />
                          <span>{schedule.recipients?.length || 0} recipients</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Badge variant="outline" className="border-[#2a3548]">{schedule.format?.toUpperCase()}</Badge>
                        </div>
                        {schedule.next_run && (
                          <div className="text-xs text-slate-500">
                            Next: {new Date(schedule.next_run).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMutation.mutate({
                        id: schedule.id,
                        status: schedule.status === 'active' ? 'paused' : 'active'
                      })}
                      className="hover:bg-[#151d2e]"
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
                      onClick={() => deleteMutation.mutate(schedule.id)}
                      className="hover:bg-[#151d2e]"
                    >
                      <Trash2 className="h-4 w-4 text-rose-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}