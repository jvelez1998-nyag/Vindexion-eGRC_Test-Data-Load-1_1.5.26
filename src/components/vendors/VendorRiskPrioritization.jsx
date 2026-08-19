import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Building2 } from "lucide-react";

export default function VendorRiskPrioritization() {
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const criticalVendors = vendors.filter(v => v.criticality === 'critical' || v.criticality === 'high');
  const needsReview = vendors.filter(v => {
    if (!v.next_review_date) return false;
    return new Date(v.next_review_date) <= new Date();
  });

  const lowSecurityScore = vendors.filter(v => v.security_score && v.security_score < 60);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-rose-500 to-red-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-white" />
            High-Risk Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{criticalVendors.length}</div>
          <p className="text-sm text-slate-400 mb-4">Require immediate attention</p>
          <div className="space-y-2">
            {criticalVendors.slice(0, 3).map((vendor, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-white truncate">{vendor.vendor_name}</span>
                <Badge className="bg-rose-500/20 text-rose-400 text-xs">{vendor.criticality}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500 to-orange-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-white" />
            Review Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{needsReview.length}</div>
          <p className="text-sm text-slate-400 mb-4">Assessments overdue</p>
          <div className="space-y-2">
            {needsReview.slice(0, 3).map((vendor, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-white truncate">{vendor.vendor_name}</span>
                <Badge className="bg-amber-500/20 text-amber-400 text-xs">Overdue</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-cyan-500/10 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-white" />
            Low Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{lowSecurityScore.length}</div>
          <p className="text-sm text-slate-400 mb-4">Vendors below threshold</p>
          <div className="space-y-2">
            {lowSecurityScore.slice(0, 3).map((vendor, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-white truncate">{vendor.vendor_name}</span>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">{vendor.security_score}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}