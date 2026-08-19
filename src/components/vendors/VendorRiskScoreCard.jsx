import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function VendorRiskScoreCard({ vendor, compact = false }) {
  const score = vendor.security_score || 0;
  
  const getRiskRating = (score) => {
    if (score >= 90) return { label: 'Low', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (score >= 70) return { label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (score >= 50) return { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { label: 'Critical', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-blue-400';
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getScoreBarColor = (score) => {
    if (score >= 90) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-emerald-500 to-teal-500';
    if (score >= 50) return 'from-amber-500 to-yellow-500';
    if (score >= 30) return 'from-orange-500 to-rose-500';
    return 'from-rose-500 to-red-600';
  };

  const rating = getRiskRating(score);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
          <div className="text-[10px] text-slate-400">Risk Score</div>
        </div>
        <Badge className={rating.color}>{rating.label}</Badge>
      </div>
    );
  }

  return (
    <Card className="bg-[#151d2e] border-[#2a3548]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-slate-400 font-medium">RISK SCORE</span>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <p className="text-xs text-slate-500 mt-1">out of 100</p>
          </div>
          <Badge className={rating.color}>
            {rating.label} Risk
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="h-2 bg-[#0f1623] rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreBarColor(score)} transition-all duration-500`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a3548]">
            <div>
              <div className="text-xs text-slate-400">Tier</div>
              <div className="text-sm font-semibold text-white capitalize">
                {vendor.risk_tier?.replace('_', ' ') || 'Not Set'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Status</div>
              <div className="text-sm font-semibold text-white capitalize">
                {vendor.compliance_status?.replace('_', ' ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}