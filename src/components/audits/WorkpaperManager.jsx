import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, X, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function WorkpaperManager({ open, onOpenChange, auditId }) {
  const [formData, setFormData] = useState({
    title: "",
    audit_id: auditId || "",
    workpaper_type: "testing",
    content: "",
    evidence_urls: [],
    prepared_by: "",
    time_spent_hours: 0,
    status: "draft"
  });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditWorkpaper.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-workpapers'] });
      onOpenChange(false);
      toast.success("Workpaper created");
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setFormData(prev => ({ ...prev, evidence_urls: [...prev.evidence_urls, ...uploadedUrls] }));
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, audit_id: auditId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-6">
        <DialogHeader>
          <DialogTitle>Create Workpaper</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="mt-1 bg-[#151d2e] border-[#2a3548]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={formData.workpaper_type} onValueChange={(v) => setFormData({...formData, workpaper_type: v})}>
                <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="testing" className="text-white">Testing</SelectItem>
                  <SelectItem value="analysis" className="text-white">Analysis</SelectItem>
                  <SelectItem value="evidence" className="text-white">Evidence</SelectItem>
                  <SelectItem value="interview" className="text-white">Interview</SelectItem>
                  <SelectItem value="documentation" className="text-white">Documentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Spent (hours)</Label>
              <Input type="number" value={formData.time_spent_hours} onChange={(e) => setFormData({...formData, time_spent_hours: parseFloat(e.target.value)})} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
            </div>
          </div>
          <div>
            <Label>Content</Label>
            <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={6} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
          </div>
          <div>
            <Label>Evidence Files</Label>
            <div className="mt-2 border-2 border-dashed border-[#2a3548] rounded-lg p-4 text-center">
              <input type="file" multiple onChange={handleFileUpload} className="hidden" id="evidence-upload" disabled={uploading} />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">{uploading ? "Uploading..." : "Upload evidence"}</p>
              </label>
            </div>
            {formData.evidence_urls.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.evidence_urls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#151d2e] rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm text-white truncate">{url.split('/').pop()}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({...formData, evidence_urls: formData.evidence_urls.filter((_, i) => i !== idx)})} className="h-6 w-6"><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}