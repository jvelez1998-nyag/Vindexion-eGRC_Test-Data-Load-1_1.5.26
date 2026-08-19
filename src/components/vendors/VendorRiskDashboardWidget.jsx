import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building2, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, PieChart as RechartsPie, Pie, Cell } from "recharts";

export default function VendorRiskDashboardWidget() {
  const [viewMode, setViewMode] = useState('radar'); // 'radar' or 'pie'
  
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const data = await base44.entities.Vendor.list('-updated_date', 50);
      return data || [];
    },
    staleTime: 120000,
    refetchOnWindowFocus: false
  });

  const safeVendors = Array.isArray(vendors) ? vendors.filter(v => v) : [];
  
  // Risk distribution by rating
  const riskDistribution = {
    critical: safeVendors.filter(v => v.criticality === 'critical').length,
    high: safeVendors.filter(v => v.criticality === 'high').length,
    medium: safeVendors.filter(v => v.criticality === 'medium').length,
    low: safeVendors.filter(v => v.criticality === 'low').length
  };

  const avgSecurityScore = safeVendors.filter(v => v.security_score).length > 0
    ? Math.round(safeVendors.reduce((sum, v) => sum + (v.security_score || 0), 0) / safeVendors.filter(v => v.security_score).length)
    : 0;

  const criticalVendors = safeVendors.filter(v => v.criticality === 'critical' || v.criticality === 'high');

  // Radar chart data for vendor risk profile
  const radarData = [
    { category: 'Security', score: avgSecurityScore, fullMark: 100 },
    { category: 'Compliance', score: safeVendors.length > 0 ? Math.round((safeVendors.filter(v => v.compliance_status === 'compliant').length / safeVendors.length) * 100) : 0, fullMark: 100 },
    { category: 'Financial', score: safeVendors.filter(v => v.financial_score).length > 0 ? Math.round(safeVendors.reduce((sum, v) => sum + (v.financial_score || 0), 0) / safeVendors.filter(v => v.financial_score).length) : 75, fullMark: 100 },
    { category: 'Operations', score: safeVendors.filter(v => v.operational_score).length > 0 ? Math.round(safeVendors.reduce((sum, v) => sum + (v.operational_score || 0), 0) / safeVendors.filter(v => v.operational_score).length) : 70, fullMark: 100 },
    { category: 'Reputation', score: 80, fullMark: 100 }
  ];

  // Pie chart data for risk distribution
  const pieData = [
    { name: 'Critical', value: riskDistribution.critical, color: '#ef4444' },
    { name: 'High', value: riskDistribution.high, color: '#f59e0b' },
    { name: 'Medium', value: riskDistribution.medium, color: '#3b82f6' },
    { name: 'Low', value: riskDistribution.low, color: '#10b981' }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f1623] border border-[#2a3548] rounded-lg p-2 shadow-lg">
          <p className="text-xs text-white font-semibold">{payload[0].payload?.category || payload[0].name}</p>
          <p className="text-xs text-slate-400">{payload[0].value}{payload[0].payload?.category ? '%' : ' vendors'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4 text-indigo-400" />
          Vendor Risk Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-white">{safeVendors.length}</div>
              <div className="text-[10px] text-slate-400">Total</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-white">{criticalVendors.length}</div>
              <div className="text-[10px] text-slate-400">High Risk</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-white">{avgSecurityScore}</div>
              <div className="text-[10px] text-slate-400">Avg Score</div>
            </div>
          </div>

          {/* Interactive Chart Toggle */}
          {safeVendors.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('radar')}
                className={`flex-1 h-8 text-xs transition-all ${
                  viewMode === 'radar' 
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' 
                    : 'bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]'
                }`}
              >
                <TrendingUp className="h-3 w-3 mr-1.5" />
                Risk Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('pie')}
                className={`flex-1 h-8 text-xs transition-all ${
                  viewMode === 'pie' 
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
                    : 'bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]'
                }`}
              >
                <BarChart3 className="h-3 w-3 mr-1.5" />
                Distribution
              </Button>
            </div>
          )}

          {/* Interactive Visualization */}
          {safeVendors.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-[#2a3548] p-4">
              <ResponsiveContainer width="100%" height={200}>
                {viewMode === 'radar' ? (
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 9 }}
                    />
                    <Radar 
                      name="Vendor Risk Profile" 
                      dataKey="score" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                ) : (
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPie>
                )}
              </ResponsiveContainer>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-[9px] bg-[#0f1623]/80 border-[#2a3548]">
                  {viewMode === 'radar' ? 'Risk Profile Analysis' : 'Risk Distribution'}
                </Badge>
              </div>
            </div>
          )}

          {/* Critical Vendors Alert */}
          {criticalVendors.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3 w-3 text-rose-400" />
                <span className="text-xs font-semibold text-rose-400">
                  High-Risk Vendors
                </span>
              </div>
              <div className="space-y-1">
                {criticalVendors.slice(0, 2).map(v => (
                  <div key={v.id} className="text-xs text-slate-300 flex items-center justify-between">
                    <span className="truncate">{v.vendor_name}</span>
                    <Badge className="bg-rose-500/20 text-rose-400 text-[10px]">
                      {v.criticality}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Status */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
              <div className="text-sm font-bold text-emerald-400">
                {safeVendors.filter(v => v.compliance_status === 'compliant').length}
              </div>
              <div className="text-[10px] text-slate-400">Compliant</div>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
              <div className="text-sm font-bold text-amber-400">
                {safeVendors.filter(v => v.compliance_status === 'under_review').length}
              </div>
              <div className="text-[10px] text-slate-400">Review</div>
            </div>
            <div className="bg-rose-500/10 rounded-lg p-2 border border-rose-500/20">
              <div className="text-sm font-bold text-rose-400">
                {safeVendors.filter(v => v.compliance_status === 'non_compliant').length}
              </div>
              <div className="text-[10px] text-slate-400">Non-Compliant</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}