import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Mail, Plus, X, FileText } from "lucide-react";

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduledReportForm({ open, onOpenChange, schedule, templates, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    template_id: '',
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    time: '09:00',
    recipients: [],
    format: 'pdf',
    include_summary: true,
    status: 'active'
  });
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (open) {
      if (schedule) {
        setFormData({
          name: schedule.name || '',
          template_id: schedule.template_id || '',
          frequency: schedule.frequency || 'weekly',
          day_of_week: schedule.day_of_week ?? 1,
          day_of_month: schedule.day_of_month ?? 1,
          time: schedule.time || '09:00',
          recipients: schedule.recipients || [],
          format: schedule.format || 'pdf',
          include_summary: schedule.include_summary ?? true,
          status: schedule.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          template_id: '',
          frequency: 'weekly',
          day_of_week: 1,
          day_of_month: 1,
          time: '09:00',
          recipients: [],
          format: 'pdf',
          include_summary: true,
          status: 'active'
        });
      }
      setEmailInput('');
    }
  }, [open, schedule]);

  const addRecipient = () => {
    const email = emailInput.trim();
    if (email && email.includes('@') && !formData.recipients.includes(email)) {
      setFormData(prev => ({ ...prev, recipients: [...prev.recipients, email] }));
      setEmailInput('');
    }
  };

  const removeRecipient = (email) => {
    setFormData(prev => ({ ...prev, recipients: prev.recipients.filter(r => r !== email) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            {schedule ? 'Edit Scheduled Report' : 'Schedule Report'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[55vh] px-6">
            <div className="space-y-5 py-4">
              <div>
                <Label className="text-slate-400">Schedule Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="e.g., Weekly Risk Summary"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-400">Report Template *</Label>
                <Select value={formData.template_id} onValueChange={(v) => setFormData({ ...formData, template_id: v })}>
                  <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id} className="text-white hover:bg-[#2a3548]">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          {t.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="daily" className="text-white hover:bg-[#2a3548]">Daily</SelectItem>
                      <SelectItem value="weekly" className="text-white hover:bg-[#2a3548]">Weekly</SelectItem>
                      <SelectItem value="monthly" className="text-white hover:bg-[#2a3548]">Monthly</SelectItem>
                      <SelectItem value="quarterly" className="text-white hover:bg-[#2a3548]">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Time</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                </div>
              </div>

              {formData.frequency === 'weekly' && (
                <div>
                  <Label className="text-slate-400">Day of Week</Label>
                  <Select value={formData.day_of_week.toString()} onValueChange={(v) => setFormData({ ...formData, day_of_week: parseInt(v) })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {daysOfWeek.map((day, i) => (
                        <SelectItem key={i} value={i.toString()} className="text-white hover:bg-[#2a3548]">{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.frequency === 'monthly' || formData.frequency === 'quarterly') && (
                <div>
                  <Label className="text-slate-400">Day of Month</Label>
                  <Select value={formData.day_of_month.toString()} onValueChange={(v) => setFormData({ ...formData, day_of_month: parseInt(v) })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {[...Array(28)].map((_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()} className="text-white hover:bg-[#2a3548]">{i+1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-slate-400">Recipients *</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
                      placeholder="email@example.com"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(); } }}
                    />
                  </div>
                  <Button type="button" onClick={addRecipient} variant="outline" className="border-[#2a3548] hover:bg-[#2a3548]">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.recipients.map((email, i) => (
                    <Badge key={i} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 gap-1">
                      {email}
                      <X className="h-3 w-3 cursor-pointer hover:text-rose-400" onClick={() => removeRecipient(email)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Export Format</Label>
                  <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="pdf" className="text-white hover:bg-[#2a3548]">PDF</SelectItem>
                      <SelectItem value="excel" className="text-white hover:bg-[#2a3548]">Excel</SelectItem>
                      <SelectItem value="both" className="text-white hover:bg-[#2a3548]">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="active" className="text-white hover:bg-[#2a3548]">Active</SelectItem>
                      <SelectItem value="paused" className="text-white hover:bg-[#2a3548]">Paused</SelectItem>
                      <SelectItem value="disabled" className="text-white hover:bg-[#2a3548]">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.include_summary}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_summary: checked })}
                  className="border-[#2a3548]"
                />
                <Label className="text-slate-400 text-sm">Include executive summary in email</Label>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}