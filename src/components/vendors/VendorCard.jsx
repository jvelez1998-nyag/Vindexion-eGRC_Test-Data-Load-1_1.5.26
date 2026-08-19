import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Shield, AlertTriangle, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import VendorRiskScoreCard from "./VendorRiskScoreCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const criticalityColors = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-rose-500/20 text-rose-400 border-rose-500/30"
};

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  under_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  suspended: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  terminated: "bg-slate-500/20 text-slate-400 border-slate-500/30"
};

export default function VendorCard({ vendor, onEdit, onDelete, onView }) {
  const daysUntilReview = vendor.next_review_date
    ? Math.floor((new Date(vendor.next_review_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all cursor-pointer" onClick={() => onView(vendor)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-white text-lg">{vendor.vendor_name}</h3>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2">{vendor.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548] text-white">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(vendor); }} className="hover:bg-[#2a3548]">
                <Eye className="h-4 w-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(vendor); }} className="hover:bg-[#2a3548]">
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(vendor.id); }} className="hover:bg-[#2a3548] text-rose-400">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={criticalityColors[vendor.criticality]}>
            {vendor.criticality}
          </Badge>
          <Badge className={statusColors[vendor.status]}>
            {vendor.status.replace('_', ' ')}
          </Badge>
          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
            {vendor.vendor_type}
          </Badge>
        </div>

        {vendor.security_score !== null && vendor.security_score !== undefined && (
          <div className="mb-4">
            <VendorRiskScoreCard vendor={vendor} compact={true} />
          </div>
        )}

        <div className="space-y-2">

          {vendor.next_review_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Next Review:
              </span>
              <span className={`text-xs ${
                daysUntilReview <= 7 ? 'text-rose-400' :
                daysUntilReview <= 30 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {daysUntilReview < 0 ? 'Overdue' : `${daysUntilReview} days`}
              </span>
            </div>
          )}

          {vendor.contract_end_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Contract Ends:</span>
              <span className="text-xs text-slate-400">
                {format(new Date(vendor.contract_end_date), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        {(vendor.linked_risks?.length > 0 || vendor.linked_controls?.length > 0) && (
          <div className="mt-3 pt-3 border-t border-[#2a3548] flex items-center gap-3 text-xs text-slate-400">
            {vendor.linked_risks?.length > 0 && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                {vendor.linked_risks.length} Risks
              </span>
            )}
            {vendor.linked_controls?.length > 0 && (
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-400" />
                {vendor.linked_controls.length} Controls
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}