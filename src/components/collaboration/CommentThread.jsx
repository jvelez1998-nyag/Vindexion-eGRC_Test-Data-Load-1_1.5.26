import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Reply, Trash2, Edit2, Check, X, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function CommentThread({ entityType, entityId }) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      const allComments = await base44.entities.Comment.filter({ entity_type: entityType, entity_id: entityId }, '-created_date');
      return allComments;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] });
      setNewComment("");
      setReplyingTo(null);
      toast.success("Comment posted");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Comment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] });
      setEditingComment(null);
      setEditContent("");
      toast.success("Comment updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] });
      toast.success("Comment deleted");
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const commentData = {
      entity_type: entityType,
      entity_id: entityId,
      content: newComment,
      parent_comment_id: replyingTo?.id || null,
      mentions: extractMentions(newComment)
    };

    createMutation.mutate(commentData);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;

    updateMutation.mutate({
      id: editingComment.id,
      data: {
        ...editingComment,
        content: editContent,
        is_edited: true,
        edited_at: new Date().toISOString()
      }
    });
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\S+@\S+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const rootComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId);

  const CommentItem = ({ comment, isReply = false }) => {
    const replies = getReplies(comment.id);
    const isOwner = currentUser?.email === comment.created_by;

    return (
      <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 bg-indigo-500/20 border border-indigo-500/30">
            <AvatarFallback className="text-indigo-400 text-xs">
              {comment.created_by?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-white">{comment.created_by}</span>
                  <span className="text-xs text-slate-500 ml-2">
                    {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                  </span>
                  {comment.is_edited && (
                    <Badge className="ml-2 text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">edited</Badge>
                  )}
                </div>
                {isOwner && !editingComment && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-400" onClick={() => handleEdit(comment)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-400" onClick={() => deleteMutation.mutate(comment.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {editingComment?.id === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-[#0f1623] border-[#2a3548] text-white text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700 h-7">
                      <Check className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingComment(null)} className="border-[#2a3548] h-7">
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment)}
                className="mt-1 text-xs text-slate-400 hover:text-indigo-400 h-7"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-96">
          <div className="space-y-4 pr-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No comments yet. Start the discussion!</p>
              </div>
            ) : (
              rootComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </ScrollArea>

        {/* New Comment / Reply Input */}
        <div className="pt-4 border-t border-[#2a3548]">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 p-2 rounded bg-indigo-500/5 border border-indigo-500/20">
              <span className="text-xs text-indigo-400">Replying to {replyingTo.created_by}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setReplyingTo(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (use @email to mention)"
              className="bg-[#151d2e] border-[#2a3548] text-white resize-none"
              rows={3}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!newComment.trim() || createMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Tip: Use @email to mention team members</p>
        </div>
      </CardContent>
    </Card>
  );
}