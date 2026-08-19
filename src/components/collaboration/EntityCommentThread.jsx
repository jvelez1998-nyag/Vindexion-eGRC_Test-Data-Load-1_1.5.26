import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Trash2, Edit, User, Brain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EntityCommentThread({ entityType, entityId, entityName }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    loadComments();
    loadUser();
    const interval = setInterval(loadComments, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [entityType, entityId]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load user", error);
    }
  };

  const loadComments = async () => {
    try {
      const allComments = await base44.entities.Comment.filter({
        entity_type: entityType,
        entity_id: entityId
      });
      setComments(allComments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (error) {
      console.error("Failed to load comments", error);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await base44.entities.Comment.create({
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        comment: newComment,
        author_email: user.email,
        author_name: user.full_name || user.email
      });
      setNewComment("");
      await loadComments();
      toast.success("Comment posted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await base44.entities.Comment.delete(commentId);
      await loadComments();
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const generateAISummary = async () => {
    if (comments.length === 0) return;
    try {
      const prompt = `Summarize the following discussion thread about ${entityType} "${entityName}":

COMMENTS:
${comments.map((c, i) => `[${i + 1}] ${c.author_name} (${format(new Date(c.created_date), 'MMM d, yyyy')}): ${c.comment}`).join('\n\n')}

Provide:
- key_points: Main topics discussed
- decisions_made: Any decisions or agreements
- action_items: Tasks or next steps mentioned
- concerns_raised: Issues or concerns
- consensus_level: high/medium/low`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            key_points: { type: "array", items: { type: "string" } },
            decisions_made: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } },
            concerns_raised: { type: "array", items: { type: "string" } },
            consensus_level: { type: "string" }
          }
        }
      });

      setAiSummary(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-sm">Discussion ({comments.length})</CardTitle>
          </div>
          {comments.length > 0 && (
            <Button size="sm" variant="outline" onClick={generateAISummary}>
              <Brain className="h-3 w-3 mr-1" />
              AI Summary
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aiSummary && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-indigo-400">AI Summary</h4>
                <Badge className={
                  aiSummary.consensus_level === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                  aiSummary.consensus_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }>
                  {aiSummary.consensus_level} consensus
                </Badge>
              </div>
              {aiSummary.key_points?.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 font-medium mb-1">Key Points:</p>
                  <ul className="space-y-1">
                    {aiSummary.key_points.map((p, i) => (
                      <li key={i} className="text-xs text-slate-300">• {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiSummary.action_items?.length > 0 && (
                <div>
                  <p className="text-[10px] text-emerald-400 font-medium mb-1">Action Items:</p>
                  <ul className="space-y-1">
                    {aiSummary.action_items.map((a, i) => (
                      <li key={i} className="text-xs text-slate-300">✓ {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="bg-[#0f1623] border-[#2a3548] text-white min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  postComment();
                }
              }}
            />
            <Button onClick={postComment} disabled={loading || !newComment.trim()} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <User className="h-3 w-3 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{comment.author_name}</p>
                          <p className="text-[10px] text-slate-500">
                            {format(new Date(comment.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      {user?.email === comment.author_email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteComment(comment.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-rose-400" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}