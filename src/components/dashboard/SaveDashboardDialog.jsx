import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function SaveDashboardDialog({ open, onOpenChange, onSave, isLoading }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleReport, setScheduleReport] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, description, scheduleReport });
    setName("");
    setDescription("");
    setScheduleReport(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>Save Dashboard View</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Dashboard Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Executive Overview"
              required
              className="mt-1 bg-[#151d2e] border-[#2a3548]"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="mt-1 bg-[#151d2e] border-[#2a3548]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="schedule"
              checked={scheduleReport}
              onCheckedChange={setScheduleReport}
            />
            <Label htmlFor="schedule" className="text-sm cursor-pointer">
              Also schedule this dashboard as a recurring report
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? "Saving..." : "Save Dashboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}