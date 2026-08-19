import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { CheckSquare, Loader2, Edit3, X } from "lucide-react";

const FRAMEWORKS = ["SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", "HIPAA", "NIST", "COBIT", "FFIEC", "DORA"];

export default function QuestionBulkEditor({ questions, onClose, onUpdate }) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [bulkAction, setBulkAction] = useState({
    framework: null,
    difficulty: null,
    status: null,
    addTags: [],
    removeTags: []
  });
  const [updating, setUpdating] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const toggleQuestion = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAll = () => {
    setSelectedQuestions(questions.map(q => q.id));
  };

  const deselectAll = () => {
    setSelectedQuestions([]);
  };

  const addBulkTag = () => {
    if (tagInput.trim()) {
      setBulkAction(prev => ({
        ...prev,
        addTags: [...prev.addTags, tagInput.trim().toLowerCase()]
      }));
      setTagInput("");
    }
  };

  const applyBulkEdit = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select questions to edit");
      return;
    }

    setUpdating(true);
    try {
      for (const questionId of selectedQuestions) {
        const question = questions.find(q => q.id === questionId);
        const updates = {};

        if (bulkAction.framework) updates.framework = bulkAction.framework;
        if (bulkAction.difficulty) updates.difficulty = bulkAction.difficulty;
        if (bulkAction.status) updates.status = bulkAction.status;

        if (bulkAction.addTags.length > 0) {
          const existingTags = question.tags || [];
          updates.tags = [...new Set([...existingTags, ...bulkAction.addTags])];
        }

        if (bulkAction.removeTags.length > 0) {
          const existingTags = question.tags || [];
          updates.tags = existingTags.filter(t => !bulkAction.removeTags.includes(t));
        }

        await base44.entities.QuestionBank.update(questionId, updates);
      }

      toast.success(`Updated ${selectedQuestions.length} questions`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update questions");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-[#1a2332] border-[#2a3548] max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-[#2a3548]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-violet-400" />
              Bulk Edit Questions
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Question Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Select Questions ({selectedQuestions.length} selected)</h3>
              <div className="flex gap-2">
                <Button onClick={selectAll} size="sm" variant="outline" className="border-violet-500/30 text-violet-400 h-7">
                  Select All
                </Button>
                <Button onClick={deselectAll} size="sm" variant="outline" className="border-violet-500/30 text-violet-400 h-7">
                  Deselect All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-48 bg-[#151d2e] rounded-lg border border-[#2a3548] p-3">
              <div className="space-y-2">
                {questions.map(q => (
                  <div key={q.id} className="flex items-start gap-2 p-2 rounded hover:bg-[#1a2332] transition-colors">
                    <Checkbox
                      checked={selectedQuestions.includes(q.id)}
                      onCheckedChange={() => toggleQuestion(q.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">{q.framework}</Badge>
                        <Badge className="bg-slate-500/10 text-slate-400 text-[10px] capitalize">{q.difficulty}</Badge>
                      </div>
                      <p className="text-xs text-white line-clamp-1">{q.question_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Bulk Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Bulk Actions</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Change Framework</label>
                <Select value={bulkAction.framework || "none"} onValueChange={(v) => setBulkAction(prev => ({ ...prev, framework: v === "none" ? null : v }))}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="none" className="text-slate-400">No change</SelectItem>
                    {FRAMEWORKS.map(fw => (
                      <SelectItem key={fw} value={fw} className="text-white">{fw}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Change Difficulty</label>
                <Select value={bulkAction.difficulty || "none"} onValueChange={(v) => setBulkAction(prev => ({ ...prev, difficulty: v === "none" ? null : v }))}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="none" className="text-slate-400">No change</SelectItem>
                    <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Change Status</label>
                <Select value={bulkAction.status || "none"} onValueChange={(v) => setBulkAction(prev => ({ ...prev, status: v === "none" ? null : v }))}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="none" className="text-slate-400">No change</SelectItem>
                    <SelectItem value="active" className="text-white">Active</SelectItem>
                    <SelectItem value="draft" className="text-white">Draft</SelectItem>
                    <SelectItem value="archived" className="text-white">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Add Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBulkTag())}
                  placeholder="Enter tag..."
                  className="bg-[#151d2e] border-[#2a3548] text-white h-9"
                />
                <Button onClick={addBulkTag} size="sm" className="bg-violet-600 hover:bg-violet-700 h-9">
                  Add
                </Button>
              </div>
              {bulkAction.addTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bulkAction.addTags.map(tag => (
                    <Badge key={tag} className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                      +{tag}
                      <button 
                        onClick={() => setBulkAction(prev => ({ ...prev, addTags: prev.addTags.filter(t => t !== tag) }))}
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-3 pt-4 border-t border-[#2a3548]">
            <Button
              onClick={applyBulkEdit}
              disabled={updating || selectedQuestions.length === 0}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Apply to {selectedQuestions.length} Questions
                </>
              )}
            </Button>
            <Button onClick={onClose} variant="outline" className="border-[#2a3548]">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}