import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, ArrowRight, Shield, GitBranch, Brain, FileText } from "lucide-react";
import { format } from "date-fns";
import { WorkflowBadge } from "@/components/workflow/WorkflowActions";
import AIAssessmentResults from "./AIAssessmentResults";
import AssessmentDetailView from "./AssessmentDetailView";

const typeColors = {
  it: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  operational: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  security: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  financial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

const statusColors = {
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  monitoring: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  archived: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

const treatmentColors = {
  accept: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  mitigate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  transfer: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  avoid: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

function getRiskLevel(score) {
  if (score >= 16) return { label: 'Critical', color: 'bg-rose-500' };
  if (score >= 9) return { label: 'High', color: 'bg-amber-500' };
  if (score >= 4) return { label: 'Medium', color: 'bg-yellow-500' };
  return { label: 'Low', color: 'bg-emerald-500' };
}

export default function AssessmentList({ assessments, onEdit, onDelete, controlLibrary, onOpenWorkflow, onOpenSummary }) {
  const [aiResultsOpen, setAiResultsOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const handleOpenAIResults = (assessment) => {
    setSelectedAssessment(assessment);
    setAiResultsOpen(true);
  };

  const handleOpenDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setDetailViewOpen(true);
  };

  if (assessments.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
        <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">No assessments found</h3>
        <p className="text-slate-500 mt-1">Create your first risk assessment to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {assessments.map(assessment => {
        const inherentScore = (assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0);
        const residualScore = (assessment.residual_likelihood || 0) * (assessment.residual_impact || 0);
        const inherentLevel = getRiskLevel(inherentScore);
        const residualLevel = getRiskLevel(residualScore);
        const linkedControlCount = assessment.linked_controls?.length || 0;

        return (
          <Card key={assessment.id} className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all overflow-hidden">
            <div className="flex">
              <div className={`w-1 ${inherentLevel.color}`} />
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 
                        className="font-semibold text-white text-lg truncate cursor-pointer hover:text-indigo-400 transition-colors"
                        onClick={() => onEdit(assessment)}
                      >
                        {assessment.title}
                      </h3>
                    </div>
                    {assessment.description && (
                      <p className="text-slate-400 text-sm line-clamp-2 mb-3">{assessment.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge className={`text-[10px] border uppercase ${typeColors[assessment.assessment_type]}`}>
                        {assessment.assessment_type}
                      </Badge>
                      <Badge className={`text-[10px] border ${statusColors[assessment.lifecycle_status]}`}>
                        {assessment.lifecycle_status?.replace(/_/g, ' ')}
                      </Badge>
                      {assessment.workflow_status && <WorkflowBadge status={assessment.workflow_status} />}
                      <Badge className="text-[10px] border bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">
                        {assessment.risk_category}
                      </Badge>
                      {assessment.risk_treatment && (
                        <Badge className={`text-[10px] border capitalize ${treatmentColors[assessment.risk_treatment]}`}>
                          {assessment.risk_treatment}
                        </Badge>
                      )}
                    </div>

                    {/* Risk Scores */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Inherent:</span>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#151d2e] border border-[#2a3548]">
                          <span className={`w-2 h-2 rounded-full ${inherentLevel.color}`} />
                          <span className="text-xs text-white font-medium">{inherentScore || '-'}</span>
                          <span className="text-[10px] text-slate-500">({inherentLevel.label})</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-600" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Residual:</span>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#151d2e] border border-[#2a3548]">
                          <span className={`w-2 h-2 rounded-full ${residualLevel.color}`} />
                          <span className="text-xs text-white font-medium">{residualScore || '-'}</span>
                          <span className="text-[10px] text-slate-500">({residualLevel.label})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {linkedControlCount > 0 && (
                        <span>{linkedControlCount} linked control{linkedControlCount > 1 ? 's' : ''}</span>
                      )}
                      {assessment.regulatory_mappings?.length > 0 && (
                        <span>{assessment.regulatory_mappings.join(', ')}</span>
                      )}
                      {assessment.owner && <span>Owner: {assessment.owner}</span>}
                      {assessment.next_review_date && (
                        <span>Review: {format(new Date(assessment.next_review_date), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenDetails(assessment)}
                      className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenAIResults(assessment)}
                      className="gap-1.5 border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      <Brain className="h-3.5 w-3.5" />
                      AI Results
                    </Button>
                    {onOpenWorkflow && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onOpenWorkflow(assessment)}
                        className="gap-1.5 border-[#2a3548] text-slate-400 hover:text-white hover:bg-[#2a3548]"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        Workflow
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                        <DropdownMenuItem onClick={() => onEdit(assessment)} className="text-white hover:bg-[#2a3548]">
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(assessment)} className="text-rose-400 hover:bg-rose-500/10">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <AIAssessmentResults
        open={aiResultsOpen}
        onOpenChange={setAiResultsOpen}
        assessment={selectedAssessment}
        onSaveResults={(results) => {
          // Optionally save AI results to the assessment record
          console.log('AI Results generated:', results);
        }}
      />

      <AssessmentDetailView
        open={detailViewOpen}
        onOpenChange={setDetailViewOpen}
        assessment={selectedAssessment}
      />
    </div>
  );
}