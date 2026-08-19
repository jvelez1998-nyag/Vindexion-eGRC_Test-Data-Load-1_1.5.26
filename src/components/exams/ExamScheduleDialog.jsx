import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function ExamScheduleDialog({ open, onOpenChange, exam, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    exam_title: '',
    exam_type: 'FFIEC',
    exam_date: '',
    description: '',
    status: 'scheduled',
    readiness_score: 0
  });

  useEffect(() => {
    if (exam) {
      setFormData({
        exam_title: exam.exam_title || '',
        exam_type: exam.exam_type || 'FFIEC',
        exam_date: exam.exam_date || '',
        description: exam.description || '',
        status: exam.status || 'scheduled',
        readiness_score: exam.readiness_score || 0
      });
    } else {
      setFormData({
        exam_title: '',
        exam_type: 'FFIEC',
        exam_date: '',
        description: '',
        status: 'scheduled',
        readiness_score: 0
      });
    }
  }, [exam, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>{exam ? 'Edit' : 'Schedule'} Regulatory Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Exam Title *</Label>
            <Input
              value={formData.exam_title}
              onChange={(e) => setFormData({ ...formData, exam_title: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Exam Type *</Label>
              <Select value={formData.exam_type} onValueChange={(value) => setFormData({ ...formData, exam_type: value })}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="FFIEC" className="text-white">FFIEC</SelectItem>
                  <SelectItem value="FDIC" className="text-white">FDIC</SelectItem>
                  <SelectItem value="OCC" className="text-white">OCC</SelectItem>
                  <SelectItem value="FRB" className="text-white">Federal Reserve</SelectItem>
                  <SelectItem value="NCUA" className="text-white">NCUA</SelectItem>
                  <SelectItem value="SEC" className="text-white">SEC</SelectItem>
                  <SelectItem value="FINRA" className="text-white">FINRA</SelectItem>
                  <SelectItem value="state_regulator" className="text-white">State Regulator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Exam Date *</Label>
              <Input
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5"
                required
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5 h-24"
              placeholder="Scope and focus areas for this exam..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {exam ? 'Update' : 'Schedule'} Exam
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}