import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, Clock, TrendingUp, CheckCircle2, AlertCircle, 
  FileText, Users, Search, Filter, MoreVertical, Eye,
  Edit, Trash2, Plus, BookOpen, Target, Sparkles, Download, Loader2, Brain
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExamInventoryListing({ onViewExam, onEditExam, onCreateNew }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['regulatory-exams'],
    queryFn: async () => {
      const data = await base44.entities.RegulatoryExam.list('-exam_date', 100);
      return data || [];
    }
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: async () => {
      const data = await base44.entities.AuditFinding.list('-created_date', 100);
      return data || [];
    }
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    }
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RegulatoryExam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] });
      toast.success("Exam deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete exam");
    }
  });

  const filteredExams = exams.filter(exam => {
    const matchesSearch = !searchTerm || 
      exam.exam_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.exam_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    const matchesType = typeFilter === "all" || exam.exam_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusColors = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_preparation: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    in_progress: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    postponed: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  const workflowStageColors = {
    preparation: 'bg-amber-500/10 text-amber-400',
    documentation: 'bg-blue-500/10 text-blue-400',
    testing: 'bg-violet-500/10 text-violet-400',
    final_review: 'bg-indigo-500/10 text-indigo-400',
    exam_ready: 'bg-emerald-500/10 text-emerald-400'
  };

  const examTypeIcons = {
    FFIEC: '🏛️',
    FDIC: '🏦',
    OCC: '💼',
    FRB: '🏢',
    NCUA: '🏛️',
    SEC: '📊',
    FINRA: '📈',
    state_regulator: '🏛️'
  };

  const generateExecutiveSummary = async () => {
    setGeneratingSummary(true);
    try {
      const scheduledExams = exams.filter(e => e.status === 'scheduled');
      const inPrepExams = exams.filter(e => e.status === 'in_preparation');
      const activeExams = exams.filter(e => e.status === 'in_progress');
      const completedExams = exams.filter(e => e.status === 'completed');
      
      const avgReadiness = exams.filter(e => e.readiness_score).length > 0
        ? Math.round(exams.filter(e => e.readiness_score).reduce((sum, e) => sum + e.readiness_score, 0) / exams.filter(e => e.readiness_score).length)
        : 0;

      const prompt = `As a regulatory compliance expert, generate a comprehensive executive summary for regulatory exam management.

CURRENT EXAM PORTFOLIO:
- Total Exams: ${exams.length}
- Scheduled: ${scheduledExams.length}
- In Preparation: ${inPrepExams.length}
- Active/In Progress: ${activeExams.length}
- Completed: ${completedExams.length}
- Average Readiness Score: ${avgReadiness}%

EXAM DETAILS:
${exams.slice(0, 10).map(e => `- ${e.exam_title} (${e.exam_type}): Status: ${e.status}, Readiness: ${e.readiness_score || 'N/A'}%, Findings: ${e.findings_count || 0}`).join('\n')}

Generate an executive summary with:

1. **Overall Status Assessment** (2-3 sentences on the current state)
2. **Key Metrics Highlight** (bullet points of critical numbers)
3. **Risk Areas & Concerns** (identify any exams with low readiness, upcoming deadlines, high findings)
4. **Readiness Analysis** (assessment of preparedness levels)
5. **Strategic Recommendations** (3-5 actionable recommendations to improve exam readiness)
6. **Next 30 Days Priorities** (immediate action items)

Make it concise, executive-level, and actionable. Use professional tone suitable for senior management.`;

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setExecutiveSummary(summary);
      toast.success("Executive summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const exportSummary = () => {
    if (!executiveSummary) return;
    
    const blob = new Blob([`# Regulatory Exam Status - Executive Summary\nGenerated: ${new Date().toLocaleDateString()}\n\n${executiveSummary}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-executive-summary-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    toast.success("Summary exported");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Exam Inventory</h2>
          <p className="text-sm text-slate-400">{filteredExams.length} exams in your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={generateExecutiveSummary}
            disabled={generatingSummary || exams.length === 0}
            variant="outline"
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            {generatingSummary ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Executive Summary
          </Button>
          <Button 
            onClick={onCreateNew}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Exam
          </Button>
        </div>
      </div>

      {/* Executive Summary Card */}
      {executiveSummary && (
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Executive Summary - Regulatory Exam Status
              </CardTitle>
              <Button
                onClick={exportSummary}
                variant="ghost"
                size="sm"
                className="text-violet-400 hover:bg-violet-500/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                {executiveSummary}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by title, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#151d2e] border border-[#2a3548] text-white text-sm min-w-[180px]"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_preparation">In Preparation</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#151d2e] border border-[#2a3548] text-white text-sm min-w-[180px]"
            >
              <option value="all">All Exam Types</option>
              <option value="FFIEC">FFIEC</option>
              <option value="FDIC">FDIC</option>
              <option value="OCC">OCC</option>
              <option value="FRB">Federal Reserve Board</option>
              <option value="NCUA">NCUA</option>
              <option value="SEC">SEC</option>
              <option value="FINRA">FINRA</option>
              <option value="state_regulator">State Regulator</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <Badge className={statusColors.scheduled}>Scheduled</Badge>
            </div>
            <div className="text-2xl font-bold text-white">
              {exams.filter(e => e.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <Badge className={statusColors.in_preparation}>Preparing</Badge>
            </div>
            <div className="text-2xl font-bold text-white">
              {exams.filter(e => e.status === 'in_preparation').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              <Badge className={statusColors.in_progress}>Active</Badge>
            </div>
            <div className="text-2xl font-bold text-white">
              {exams.filter(e => e.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <Badge className={statusColors.completed}>Done</Badge>
            </div>
            <div className="text-2xl font-bold text-white">
              {exams.filter(e => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-indigo-400" />
              <span className="text-xs text-slate-400">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {exams.filter(e => e.readiness_score).length > 0
                ? Math.round(
                    exams
                      .filter(e => e.readiness_score)
                      .reduce((sum, e) => sum + e.readiness_score, 0) /
                      exams.filter(e => e.readiness_score).length
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {filteredExams.length === 0 ? (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Exams Found</h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by scheduling your first regulatory exam"}
                </p>
                <Button onClick={onCreateNew} className="bg-gradient-to-r from-violet-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredExams.map((exam) => (
              <Card 
                key={exam.id} 
                className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 transition-all cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                        <span className="text-2xl">{examTypeIcons[exam.exam_type] || '📋'}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                              {exam.exam_title}
                            </h3>
                            <p className="text-sm text-slate-400 line-clamp-2">
                              {exam.description || 'No description provided'}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setSummaryOpen(true);
                                }}
                                className="text-white hover:bg-[#2a3548]"
                              >
                                <Brain className="h-4 w-4 mr-2 text-violet-400" />
                                AI Executive Summary
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onViewExam?.(exam)}
                                className="text-white hover:bg-[#2a3548]"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onEditExam?.(exam)}
                                className="text-white hover:bg-[#2a3548]"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (confirm(`Delete "${exam.exam_title}"?`)) {
                                    deleteMutation.mutate(exam.id);
                                  }
                                }}
                                className="text-rose-400 hover:bg-rose-500/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`border ${statusColors[exam.status]}`}>
                            {exam.status?.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400">
                            {exam.exam_type}
                          </Badge>
                          {exam.workflow_stage && (
                            <Badge className={workflowStageColors[exam.workflow_stage]}>
                              {exam.workflow_stage?.replace('_', ' ')}
                            </Badge>
                          )}
                          {exam.readiness_score !== undefined && exam.readiness_score !== null && (
                            <Badge 
                              className={`${
                                exam.readiness_score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                exam.readiness_score >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              } border`}
                            >
                              {exam.readiness_score}% Ready
                            </Badge>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {exam.exam_date && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(exam.exam_date), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                          {exam.lead_coordinator && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Users className="h-3 w-3" />
                              <span className="truncate">{exam.lead_coordinator}</span>
                            </div>
                          )}
                          {exam.scope_areas && exam.scope_areas.length > 0 && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <BookOpen className="h-3 w-3" />
                              <span>{exam.scope_areas.length} Areas</span>
                            </div>
                          )}
                          {exam.findings_count !== undefined && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <AlertCircle className="h-3 w-3" />
                              <span>{exam.findings_count || 0} Findings</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Executive Summary Dialog */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Brain className="h-6 w-6 text-violet-400" />
              Executive Summary: {selectedExam?.exam_title}
            </DialogTitle>
          </DialogHeader>
          <AIExamExecutiveSummary 
            exam={selectedExam}
            findings={findings}
            controls={controls}
            risks={risks}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}