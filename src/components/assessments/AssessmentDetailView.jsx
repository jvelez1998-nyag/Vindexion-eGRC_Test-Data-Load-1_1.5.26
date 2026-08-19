import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Save, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Clock,
  User,
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

function getRiskLevel(score) {
  if (score >= 16) return { label: 'Critical', color: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30' };
  if (score >= 9) return { label: 'High', color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' };
  if (score >= 4) return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  return { label: 'Low', color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' };
}

export default function AssessmentDetailView({ open, onOpenChange, assessment }) {
  const [reviewNotes, setReviewNotes] = useState(assessment?.review_notes || "");
  const [assessmentRating, setAssessmentRating] = useState(assessment?.assessment_rating || "");
  const [reviewerName, setReviewerName] = useState(assessment?.reviewed_by || "");
  const [activeTab, setActiveTab] = useState("overview");

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RiskAssessment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast.success("Assessment updated");
    }
  });

  const handleSaveReview = () => {
    if (!assessment) return;

    updateMutation.mutate({
      id: assessment.id,
      data: {
        review_notes: reviewNotes,
        assessment_rating: assessmentRating,
        reviewed_by: reviewerName,
        review_date: new Date().toISOString()
      }
    });
  };

  if (!assessment) return null;

  const inherentScore = (assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0);
  const residualScore = (assessment.residual_likelihood || 0) * (assessment.residual_impact || 0);
  const inherentLevel = getRiskLevel(inherentScore);
  const residualLevel = getRiskLevel(residualScore);
  const riskReduction = inherentScore - residualScore;
  const reductionPercentage = inherentScore > 0 ? Math.round((riskReduction / inherentScore) * 100) : 0;
  const controlEffectiveness = assessment.control_effectiveness || 0;
  const effectivenessPercentage = (controlEffectiveness / 5) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
            <div className={`p-2 rounded-lg ${inherentLevel.color}/20 border ${inherentLevel.border}`}>
              <BarChart3 className={`h-5 w-5 ${inherentLevel.text}`} />
            </div>
            {assessment.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6">
            <TabsList className="bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="results">Assessment Results</TabsTrigger>
              <TabsTrigger value="review">Review & Notes</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(90vh-180px)] px-6">
            <div className="py-6 space-y-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-4">
                {/* Basic Information */}
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Assessment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-500 text-xs">Type</Label>
                        <div className="text-white mt-1 capitalize">{assessment.assessment_type}</div>
                      </div>
                      <div>
                        <Label className="text-slate-500 text-xs">Risk Category</Label>
                        <div className="text-white mt-1 capitalize">{assessment.risk_category}</div>
                      </div>
                      <div>
                        <Label className="text-slate-500 text-xs">Status</Label>
                        <Badge className="mt-1 bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {assessment.lifecycle_status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-slate-500 text-xs">Risk Treatment</Label>
                        <div className="text-white mt-1 capitalize">{assessment.risk_treatment || 'Not specified'}</div>
                      </div>
                    </div>

                    {assessment.description && (
                      <div>
                        <Label className="text-slate-500 text-xs">Description</Label>
                        <p className="text-white text-sm mt-1 leading-relaxed">{assessment.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#2a3548]">
                      {assessment.owner && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <div>
                            <div className="text-xs text-slate-500">Owner</div>
                            <div className="text-sm text-white">{assessment.owner}</div>
                          </div>
                        </div>
                      )}
                      {assessment.reviewer && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <div>
                            <div className="text-xs text-slate-500">Reviewer</div>
                            <div className="text-sm text-white">{assessment.reviewer}</div>
                          </div>
                        </div>
                      )}
                      {assessment.next_review_date && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-slate-500" />
                          <div>
                            <div className="text-xs text-slate-500">Next Review</div>
                            <div className="text-sm text-white">
                              {format(new Date(assessment.next_review_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Scores Visualization */}
                <Card className="bg-gradient-to-br from-[#151d2e] to-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Risk Scoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Inherent Risk */}
                      <div className={`p-4 rounded-xl border ${inherentLevel.border} bg-[#0f1623]`}>
                        <div className="text-xs text-slate-400 mb-2">Inherent Risk</div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-3xl font-bold ${inherentLevel.text}`}>{inherentScore}</span>
                          <span className="text-sm text-slate-500">/ 25</span>
                        </div>
                        <Badge className={`${inherentLevel.color}/20 ${inherentLevel.text} border ${inherentLevel.border}`}>
                          {inherentLevel.label}
                        </Badge>
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Likelihood</span>
                            <span className="text-white">{assessment.inherent_likelihood || 0}/5</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Impact</span>
                            <span className="text-white">{assessment.inherent_impact || 0}/5</span>
                          </div>
                        </div>
                      </div>

                      {/* Risk Reduction */}
                      <div className="p-4 rounded-xl border border-[#2a3548] bg-[#0f1623] flex flex-col items-center justify-center">
                        <ArrowRight className="h-6 w-6 text-indigo-400 mb-2" />
                        <div className="text-xs text-slate-400 mb-1">Risk Reduction</div>
                        <div className="text-2xl font-bold text-indigo-400">{reductionPercentage}%</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {riskReduction > 0 ? `↓ ${riskReduction} points` : 'No reduction'}
                        </div>
                      </div>

                      {/* Residual Risk */}
                      <div className={`p-4 rounded-xl border ${residualLevel.border} bg-[#0f1623]`}>
                        <div className="text-xs text-slate-400 mb-2">Residual Risk</div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-3xl font-bold ${residualLevel.text}`}>{residualScore}</span>
                          <span className="text-sm text-slate-500">/ 25</span>
                        </div>
                        <Badge className={`${residualLevel.color}/20 ${residualLevel.text} border ${residualLevel.border}`}>
                          {residualLevel.label}
                        </Badge>
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Likelihood</span>
                            <span className="text-white">{assessment.residual_likelihood || 0}/5</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Impact</span>
                            <span className="text-white">{assessment.residual_impact || 0}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Control Effectiveness */}
                    <div className="p-4 rounded-xl border border-[#2a3548] bg-[#0f1623]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">Control Effectiveness</span>
                        </div>
                        <div className="text-lg font-bold text-blue-400">{controlEffectiveness}/5</div>
                      </div>
                      <Progress value={effectivenessPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Ineffective</span>
                        <span>Highly Effective</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Linked Controls & Mappings */}
                {(assessment.linked_controls?.length > 0 || assessment.regulatory_mappings?.length > 0) && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Controls & Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {assessment.linked_controls?.length > 0 && (
                        <div>
                          <Label className="text-slate-500 text-xs">Linked Controls</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {assessment.linked_controls.map((control, idx) => (
                              <Badge key={idx} className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                {control}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {assessment.regulatory_mappings?.length > 0 && (
                        <div>
                          <Label className="text-slate-500 text-xs">Regulatory Mappings</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {assessment.regulatory_mappings.map((mapping, idx) => (
                              <Badge key={idx} className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                {mapping}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Assessment Results Tab */}
              <TabsContent value="results" className="mt-0 space-y-4">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                      Assessment Rating Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-400 text-sm mb-2 block">Overall Assessment Rating</Label>
                          <Input
                            value={assessmentRating}
                            onChange={(e) => setAssessmentRating(e.target.value)}
                            placeholder="e.g., Satisfactory, Needs Improvement, Excellent"
                            className="bg-[#0f1623] border-[#2a3548] text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-400 text-sm mb-2 block">Reviewed By</Label>
                          <Input
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder="Reviewer name"
                            className="bg-[#0f1623] border-[#2a3548] text-white"
                          />
                        </div>
                        {assessment.review_date && (
                          <div>
                            <Label className="text-slate-400 text-sm">Last Review Date</Label>
                            <div className="text-white mt-1">
                              {format(new Date(assessment.review_date), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Risk Maturity Level</span>
                            {reductionPercentage >= 60 ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : reductionPercentage >= 30 ? (
                              <Clock className="h-4 w-4 text-amber-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-rose-400" />
                            )}
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {reductionPercentage >= 60 ? 'Advanced' : reductionPercentage >= 30 ? 'Developing' : 'Basic'}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Based on {reductionPercentage}% risk reduction
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                          <div className="text-sm text-slate-400 mb-2">Control Posture</div>
                          <div className="text-lg font-semibold text-white">
                            {effectivenessPercentage >= 80 ? 'Strong' : effectivenessPercentage >= 60 ? 'Adequate' : 'Weak'}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {controlEffectiveness}/5 effectiveness rating
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                          <div className="text-sm text-slate-400 mb-2">Residual Risk Status</div>
                          <div className={`text-lg font-semibold ${residualLevel.text}`}>
                            {residualLevel.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Score: {residualScore}/25
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Findings */}
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base">Key Assessment Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0f1623]">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-white mb-1">Risk Identification</div>
                        <div className="text-xs text-slate-400">
                          Risk properly identified with {assessment.inherent_likelihood}/5 likelihood and {assessment.inherent_impact}/5 impact ratings.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0f1623]">
                      {controlEffectiveness >= 3 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white mb-1">Control Assessment</div>
                        <div className="text-xs text-slate-400">
                          {controlEffectiveness >= 3 
                            ? 'Controls are operating effectively to mitigate identified risks.'
                            : 'Control effectiveness needs improvement to adequately address risks.'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0f1623]">
                      {residualScore <= 6 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : residualScore <= 12 ? (
                        <Clock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white mb-1">Residual Risk Evaluation</div>
                        <div className="text-xs text-slate-400">
                          {residualScore <= 6 
                            ? 'Residual risk is within acceptable tolerance levels.'
                            : residualScore <= 12 
                            ? 'Residual risk requires monitoring and periodic review.'
                            : 'Residual risk exceeds tolerance - additional controls recommended.'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Review & Notes Tab */}
              <TabsContent value="review" className="mt-0 space-y-4">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Assessment Review Notes
                      </span>
                      <Button 
                        onClick={handleSaveReview}
                        disabled={updateMutation.isPending}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Review'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 block">Detailed Review Notes</Label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Document your assessment review findings, recommendations, and observations..."
                        className="min-h-[300px] bg-[#0f1623] border-[#2a3548] text-white resize-none"
                      />
                      <div className="text-xs text-slate-500 mt-2">
                        {reviewNotes.length} characters
                      </div>
                    </div>

                    {assessment.review_notes && reviewNotes !== assessment.review_notes && (
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-amber-400 mb-1">Unsaved Changes</div>
                            <div className="text-xs text-slate-400">
                              You have unsaved changes to the review notes. Click "Save Review" to preserve your updates.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2a3548]">
                      <div>
                        <Label className="text-slate-500 text-xs">Previous Review Notes</Label>
                        {assessment.review_notes ? (
                          <div className="mt-2 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] text-sm text-slate-300 max-h-40 overflow-y-auto">
                            {assessment.review_notes}
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-slate-500 italic">No previous notes</div>
                        )}
                      </div>
                      <div>
                        <Label className="text-slate-500 text-xs">Review History</Label>
                        <div className="mt-2 space-y-2">
                          {assessment.review_date && (
                            <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                              <div className="text-xs text-slate-500 mb-1">Last reviewed</div>
                              <div className="text-sm text-white">
                                {format(new Date(assessment.review_date), 'MMM d, yyyy h:mm a')}
                              </div>
                              {assessment.reviewed_by && (
                                <div className="text-xs text-slate-400 mt-1">by {assessment.reviewed_by}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}