import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import VendorAuditTaskForm from "./VendorAuditTaskForm";

export default function VendorAuditDetail({ open, onOpenChange, audit, vendor }) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['vendor-audit-tasks', audit?.id],
    queryFn: () => base44.entities.VendorAuditTask.filter({ vendor_audit_id: audit.id }, '-created_date'),
    enabled: !!audit
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments', vendor?.id],
    queryFn: () => base44.entities.VendorAssessment.filter({ vendor_id: vendor.id }, '-assessment_date'),
    enabled: !!vendor
  });

  const updateAuditMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorAudit.update(audit.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audits'] });
      toast.success("Audit updated");
    }
  });

  const completeAudit = () => {
    const assessment = assessments.find(a => a.id === selectedAssessment);
    
    updateAuditMutation.mutate({
      status: 'completed',
      completion_date: new Date().toISOString().split('T')[0],
      progress_percentage: 100,
      assessment_id: selectedAssessment,
      overall_rating: assessment ? (
        assessment.overall_score >= 80 ? 'satisfactory' :
        assessment.overall_score >= 60 ? 'needs_improvement' : 'unsatisfactory'
      ) : 'not_rated'
    });
  };

  if (!audit) return null;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const taskStatusColors = {
    not_started: "bg-slate-500/20 text-slate-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    pending_review: "bg-amber-500/20 text-amber-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    blocked: "bg-rose-500/20 text-rose-400"
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle>{audit.audit_title}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="completion">Complete Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {audit.status.replace('_', ' ')}
                  </Badge>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <p className="text-xs text-slate-400 mb-1">Progress</p>
                  <p className="text-2xl font-bold text-white">{progress}%</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <p className="text-xs text-slate-400 mb-1">Tasks</p>
                  <p className="text-2xl font-bold text-white">{completedTasks}/{tasks.length}</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <p className="text-xs text-slate-400 mb-1">Due Date</p>
                  <p className="text-sm text-white">
                    {audit.due_date ? format(new Date(audit.due_date), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </Card>
              </div>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-lg">Audit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <p className="text-white text-sm">{audit.audit_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label>Lead Auditor</Label>
                      <p className="text-white text-sm">{audit.lead_auditor}</p>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Badge className={
                        audit.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                        audit.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        audit.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }>
                        {audit.priority}
                      </Badge>
                    </div>
                    {audit.overall_rating && audit.overall_rating !== 'not_rated' && (
                      <div>
                        <Label>Overall Rating</Label>
                        <Badge className={
                          audit.overall_rating === 'satisfactory' ? 'bg-emerald-500/20 text-emerald-400' :
                          audit.overall_rating === 'needs_improvement' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }>
                          {audit.overall_rating.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {audit.scope && (
                    <div>
                      <Label>Scope</Label>
                      <p className="text-white text-sm mt-1">{audit.scope}</p>
                    </div>
                  )}

                  {audit.objectives?.length > 0 && (
                    <div>
                      <Label>Objectives</Label>
                      <ul className="text-sm text-white mt-1 space-y-1">
                        {audit.objectives.map((obj, i) => (
                          <li key={i}>• {obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">
                  {completedTasks} of {tasks.length} completed
                </p>
                <Button onClick={() => setShowTaskForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {tasks.map(task => (
                    <Card key={task.id} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{task.task_title}</h4>
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                          )}
                        </div>
                        <Badge className={taskStatusColors[task.status]}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Assigned: {task.assigned_to}</span>
                        {task.due_date && (
                          <span>Due: {format(new Date(task.due_date), 'MMM d')}</span>
                        )}
                        <Badge className="text-[10px] bg-slate-500/10 text-slate-400">
                          {task.task_type.replace('_', ' ')}
                        </Badge>
                        {task.assigned_to_vendor && (
                          <Badge className="text-[10px] bg-purple-500/10 text-purple-400">
                            Vendor Task
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completion" className="space-y-4">
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-lg">Complete Audit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Link Vendor Assessment (Optional)</Label>
                    <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                      <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white">
                        <SelectValue placeholder="Select assessment" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                        <SelectItem value={null}>No Assessment</SelectItem>
                        {assessments.map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.assessment_type} - {format(new Date(a.assessment_date), 'MMM d, yyyy')} (Score: {a.overall_score})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">
                      Linking an assessment will automatically set the audit rating based on the assessment score
                    </p>
                  </div>

                  {progress < 100 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                      <p className="text-sm text-amber-400">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        {tasks.length - completedTasks} tasks still pending
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={completeAudit}
                    disabled={updateAuditMutation.isPending || audit.status === 'completed'}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Audit
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <VendorAuditTaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        auditId={audit?.id}
        onSuccess={() => setShowTaskForm(false)}
      />
    </>
  );
}

function Label({ children }) {
  return <label className="text-xs text-slate-400">{children}</label>;
}