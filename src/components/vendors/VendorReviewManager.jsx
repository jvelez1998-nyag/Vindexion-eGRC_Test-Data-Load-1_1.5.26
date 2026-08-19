import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MessageSquare, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function VendorReviewManager({ vendor }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    review_date: new Date().toISOString().split('T')[0],
    review_period_start: "",
    review_period_end: "",
    overall_rating: 3,
    performance_rating: 3,
    quality_rating: 3,
    communication_rating: 3,
    responsiveness_rating: 3,
    value_rating: 3,
    strengths: "",
    areas_for_improvement: "",
    feedback: "",
    recommendation: "continue",
    is_formal_review: false
  });

  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews', vendor.id],
    queryFn: () => base44.entities.VendorReview.filter({ vendor_id: vendor.id }, '-review_date')
  });

  const createReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews'] });
      toast.success("Review submitted");
      setShowForm(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      review_date: new Date().toISOString().split('T')[0],
      review_period_start: "",
      review_period_end: "",
      overall_rating: 3,
      performance_rating: 3,
      quality_rating: 3,
      communication_rating: 3,
      responsiveness_rating: 3,
      value_rating: 3,
      strengths: "",
      areas_for_improvement: "",
      feedback: "",
      recommendation: "continue",
      is_formal_review: false
    });
  };

  const handleSubmit = async () => {
    const user = await base44.auth.me();
    createReviewMutation.mutate({
      vendor_id: vendor.id,
      reviewer_email: user.email,
      ...formData
    });
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
    : 0;

  const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          className="focus:outline-none disabled:cursor-default"
        >
          <Star className={`h-5 w-5 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} ${!readonly && 'hover:text-amber-300'} transition-colors`} />
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Card className="bg-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Vendor Reviews</CardTitle>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={Math.round(avgRating)} readonly />
                  <span className="text-sm text-slate-400">({reviews.length} reviews)</span>
                </div>
              )}
            </div>
            <Button onClick={() => setShowForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="bg-[#1a2332] border-[#2a3548] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating value={review.overall_rating} readonly />
                      {review.is_formal_review && (
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                          Formal Review
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {format(parseISO(review.review_date), 'MMM d, yyyy')} • {review.reviewer_email}
                    </div>
                  </div>
                  <Badge className={
                    review.recommendation === 'continue' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    review.recommendation === 'continue_with_improvement' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    review.recommendation === 'review_contract' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }>
                    {review.recommendation.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Performance:</span>
                    <StarRating value={review.performance_rating} readonly />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quality:</span>
                    <StarRating value={review.quality_rating} readonly />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Communication:</span>
                    <StarRating value={review.communication_rating} readonly />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Responsiveness:</span>
                    <StarRating value={review.responsiveness_rating} readonly />
                  </div>
                </div>

                {review.strengths && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Strengths</span>
                    </div>
                    <p className="text-xs text-slate-300">{review.strengths}</p>
                  </div>
                )}

                {review.areas_for_improvement && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsDown className="h-3 w-3 text-amber-400" />
                      <span className="text-xs font-medium text-amber-400">Areas for Improvement</span>
                    </div>
                    <p className="text-xs text-slate-300">{review.areas_for_improvement}</p>
                  </div>
                )}

                {review.feedback && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MessageSquare className="h-3 w-3 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400">Feedback</span>
                    </div>
                    <p className="text-xs text-slate-300">{review.feedback}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Vendor Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Review Date *</Label>
                <Input
                  type="date"
                  value={formData.review_date}
                  onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Period Start</Label>
                <Input
                  type="date"
                  value={formData.review_period_start}
                  onChange={(e) => setFormData({ ...formData, review_period_start: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Period End</Label>
                <Input
                  type="date"
                  value={formData.review_period_end}
                  onChange={(e) => setFormData({ ...formData, review_period_end: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-[#151d2e] rounded-lg">
              <h4 className="font-medium text-white">Ratings</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Overall Rating *</Label>
                  <StarRating value={formData.overall_rating} onChange={(v) => setFormData({ ...formData, overall_rating: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Performance</Label>
                  <StarRating value={formData.performance_rating} onChange={(v) => setFormData({ ...formData, performance_rating: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Quality</Label>
                  <StarRating value={formData.quality_rating} onChange={(v) => setFormData({ ...formData, quality_rating: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Communication</Label>
                  <StarRating value={formData.communication_rating} onChange={(v) => setFormData({ ...formData, communication_rating: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Responsiveness</Label>
                  <StarRating value={formData.responsiveness_rating} onChange={(v) => setFormData({ ...formData, responsiveness_rating: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Value for Money</Label>
                  <StarRating value={formData.value_rating} onChange={(v) => setFormData({ ...formData, value_rating: v })} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Strengths</Label>
              <Textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={2}
                placeholder="What does this vendor do well?"
              />
            </div>

            <div className="space-y-2">
              <Label>Areas for Improvement</Label>
              <Textarea
                value={formData.areas_for_improvement}
                onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={2}
                placeholder="Where could they improve?"
              />
            </div>

            <div className="space-y-2">
              <Label>Detailed Feedback</Label>
              <Textarea
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={3}
                placeholder="Additional comments..."
              />
            </div>

            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select value={formData.recommendation} onValueChange={(value) => setFormData({ ...formData, recommendation: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="continue">Continue Relationship</SelectItem>
                  <SelectItem value="continue_with_improvement">Continue with Improvements</SelectItem>
                  <SelectItem value="review_contract">Review Contract</SelectItem>
                  <SelectItem value="terminate">Consider Termination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => { setShowForm(false); resetForm(); }} variant="outline" className="flex-1 border-[#2a3548]">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}