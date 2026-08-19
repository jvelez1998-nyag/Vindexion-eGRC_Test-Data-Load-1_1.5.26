import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function AuditScheduler({ onScheduleComplete }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    scope: "",
    start_date: "",
    end_date: "",
    assigned_auditors: [],
    team_members: [],
    audit_frequency: "one_time",
    priority: "medium",
    objectives: "",
    deliverables: ""
  });
  const [loading, setLoading] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const audit = await base44.entities.Audit.create({
        title: formData.title,
        type: formData.type,
        scope: formData.scope,
        status: "planned",
        start_date: formData.start_date,
        end_date: formData.end_date,
        auditor: formData.assigned_auditors.join(", "),
        notes: `Priority: ${formData.priority}\nFrequency: ${formData.audit_frequency}\nObjectives: ${formData.objectives}\nDeliverables: ${formData.deliverables}\nTeam: ${formData.team_members.join(", ")}`
      });

      toast.success("Audit scheduled successfully");
      if (onScheduleComplete) onScheduleComplete(audit);
      
      // Reset form
      setFormData({
        title: "",
        type: "",
        scope: "",
        start_date: "",
        end_date: "",
        assigned_auditors: [],
        team_members: [],
        audit_frequency: "one_time",
        priority: "medium",
        objectives: "",
        deliverables: ""
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule audit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-indigo-400" />
        Schedule New Audit
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Audit Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Q1 2025 SOX Audit"
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="internal" className="text-white">Internal</SelectItem>
                <SelectItem value="external" className="text-white">External</SelectItem>
                <SelectItem value="regulatory" className="text-white">Regulatory</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Scope *</Label>
          <Textarea
            value={formData.scope}
            onChange={(e) => setFormData({...formData, scope: e.target.value})}
            placeholder="Define audit scope and coverage areas"
            rows={3}
            required
            className="bg-[#151d2e] border-[#2a3548] text-white"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label>End Date *</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="low" className="text-white">Low</SelectItem>
                <SelectItem value="medium" className="text-white">Medium</SelectItem>
                <SelectItem value="high" className="text-white">High</SelectItem>
                <SelectItem value="critical" className="text-white">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Lead Auditor(s) *</Label>
          <Select 
            value={formData.assigned_auditors[0] || ""} 
            onValueChange={(v) => setFormData({...formData, assigned_auditors: [v]})}
          >
            <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Select lead auditor" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              {users.map(user => (
                <SelectItem key={user.id} value={user.email} className="text-white">
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={formData.audit_frequency} onValueChange={(v) => setFormData({...formData, audit_frequency: v})}>
            <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="one_time" className="text-white">One Time</SelectItem>
              <SelectItem value="quarterly" className="text-white">Quarterly</SelectItem>
              <SelectItem value="semi_annually" className="text-white">Semi-Annually</SelectItem>
              <SelectItem value="annually" className="text-white">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Objectives</Label>
          <Textarea
            value={formData.objectives}
            onChange={(e) => setFormData({...formData, objectives: e.target.value})}
            placeholder="Define audit objectives"
            rows={2}
            className="bg-[#151d2e] border-[#2a3548] text-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Expected Deliverables</Label>
          <Textarea
            value={formData.deliverables}
            onChange={(e) => setFormData({...formData, deliverables: e.target.value})}
            placeholder="List expected deliverables"
            rows={2}
            className="bg-[#151d2e] border-[#2a3548] text-white"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Schedule Audit
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}