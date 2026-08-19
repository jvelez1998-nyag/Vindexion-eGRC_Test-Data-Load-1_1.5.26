import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Loader2, Save, MessageSquare, X, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VendorTaskDetail({ open, onOpenChange, task, userEmail }) {
  const [uploading, setUploading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['task-comments', task?.id],
    queryFn: () => base44.entities.Comment.filter({ 
      entity_type: 'vendor_audit_task',
      entity_id: task.id 
    }, '-created_date'),
    enabled: !!task
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorAuditTask.update(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-tasks'] });
      toast.success("Task updated");
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (content) => base44.entities.Comment.create({
      entity_type: 'vendor_audit_task',
      entity_id: task.id,
      content
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments'] });
      setNewComment("");
      toast.success("Comment added");
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);

      await updateTaskMutation.mutateAsync({
        evidence_urls: [...(task.evidence_urls || []), ...urls]
      });

      toast.success(`Uploaded ${files.length} file(s)`);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (url) => {
    updateTaskMutation.mutate({
      evidence_urls: task.evidence_urls.filter(u => u !== url)
    });
  };

  const updateStatus = (status) => {
    updateTaskMutation.mutate({ status });
  };

  const submitForReview = () => {
    if (!task.evidence_urls || task.evidence_urls.length === 0) {
      toast.error("Please upload evidence before submitting");
      return;
    }
    updateTaskMutation.mutate({ 
      status: 'pending_review',
      completion_date: new Date().toISOString().split('T')[0]
    });
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>{task.task_title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Task Info */}
            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardContent className="p-4 space-y-3">
                {task.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-white mt-1">{task.description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm text-white">{task.task_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge className={
                      task.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <p className="text-sm text-white">
                      {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'Not set'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Update Status</Label>
                  <Select value={task.status} onValueChange={updateStatus}>
                    <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {task.status === 'blocked' && (
                  <div>
                    <Label>Blocker Description</Label>
                    <Textarea
                      value={task.blockers || ""}
                      onChange={(e) => updateTaskMutation.mutate({ blockers: e.target.value })}
                      placeholder="Describe what's blocking this task..."
                      className="bg-[#1a2332] border-[#2a3548] text-white mt-1"
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence Upload */}
            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-lg">Evidence & Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="bg-[#1a2332] border-[#2a3548] text-white"
                  />
                  {uploading && (
                    <p className="text-xs text-blue-400 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin inline mr-2" />
                      Uploading...
                    </p>
                  )}
                </div>

                {task.evidence_urls && task.evidence_urls.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files ({task.evidence_urls.length})</Label>
                    {task.evidence_urls.map((url, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#1a2332] p-2 rounded border border-[#2a3548]">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-white truncate max-w-[300px]">
                            File {i + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(url, '_blank')}
                            className="h-7"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(url)}
                            className="h-7 text-rose-400 hover:text-rose-300"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {task.status !== 'pending_review' && task.status !== 'completed' && (
                  <Button 
                    onClick={submitForReview}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Submit for Review
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Communication */}
            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-[#1a2332] p-3 rounded border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-semibold text-white">
                          {comment.created_by}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No messages yet
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or provide an update..."
                    className="bg-[#1a2332] border-[#2a3548] text-white"
                    rows={2}
                  />
                  <Button
                    onClick={() => addCommentMutation.mutate(newComment)}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}