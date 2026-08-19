import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, Activity, Target, CheckCircle2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subMonths } from "date-fns";

export default function VendorPerformanceReport({ vendor }) {
  const { data: metrics = [] } = useQuery({
    queryKey: ['vendor-performance', vendor.id],
    queryFn: () => base44.entities.VendorPerformanceMetric.filter({ vendor_id: vendor.id }, '-metric_date')
  });

  // Calculate overall performance score
  const calculatePerformanceScore = () => {
    if (metrics.length === 0) return 0;
    
    const avgRating = metrics.reduce((sum, m) => sum + (m.rating || 0), 0) / metrics.length;
    const slaCompliance = metrics.filter(m => m.meets_sla).length / metrics.filter(m => m.meets_sla !== null).length;
    const targetAchievement = metrics.filter(m => m.metric_value >= m.target_value).length / metrics.length;
    
    return Math.round(((avgRating / 5) * 0.4 + slaCompliance * 0.4 + targetAchievement * 0.2) * 100);
  };

  // Group metrics by type for trends
  const getMetricTrends = () => {
    const last6Months = subMonths(new Date(), 6);
    const recentMetrics = metrics.filter(m => new Date(m.metric_date) >= last6Months);
    
    const grouped = {};
    recentMetrics.forEach(metric => {
      if (!grouped[metric.metric_type]) {
        grouped[metric.metric_type] = [];
      }
      grouped[metric.metric_type].push({
        date: format(new Date(metric.metric_date), 'MMM yyyy'),
        value: metric.metric_value,
        target: metric.target_value
      });
    });
    
    return grouped;
  };

  // Category breakdown
  const getCategoryBreakdown = () => {
    const categories = {};
    metrics.forEach(metric => {
      if (!categories[metric.category]) {
        categories[metric.category] = { count: 0, avgRating: 0, slaCompliance: 0 };
      }
      categories[metric.category].count++;
      categories[metric.category].avgRating += metric.rating || 0;
      if (metric.meets_sla) categories[metric.category].slaCompliance++;
    });

    return Object.entries(categories).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      avgRating: (data.avgRating / data.count).toFixed(1),
      slaCompliance: Math.round((data.slaCompliance / data.count) * 100)
    }));
  };

  const performanceScore = calculatePerformanceScore();
  const trends = getMetricTrends();
  const categoryData = getCategoryBreakdown();

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (score >= 60) return { label: 'Good', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'Needs Improvement', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  };

  const scoreBadge = getScoreBadge(performanceScore);

  return (
    <div className="space-y-4">
      {/* Overall Performance Score */}
      <Card className="bg-[#151d2e] border-[#2a3548]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 mb-1">Overall Performance Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}
              </div>
              <Badge className={`mt-2 ${scoreBadge.color}`}>
                {scoreBadge.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`h-4 w-4 ${star <= Math.round((performanceScore / 100) * 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                ))}
              </div>
              <div className="text-xs text-slate-400">{metrics.length} metrics tracked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card className="bg-[#151d2e] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="avgRating" fill="#6366f1" name="Avg Rating" />
                <Bar dataKey="slaCompliance" fill="#10b981" name="SLA Compliance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Metric Trends */}
      {Object.entries(trends).slice(0, 2).map(([metricType, data]) => (
        <Card key={metricType} className="bg-[#151d2e] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg capitalize">
              {metricType.replace('_', ' ')} Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}

      {/* Key Insights */}
      <Card className="bg-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.filter(m => m.meets_sla).length / metrics.filter(m => m.meets_sla !== null).length >= 0.9 ? (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
              <div>
                <div className="text-white font-medium">Strong SLA Compliance</div>
                <div className="text-slate-400">
                  {Math.round((metrics.filter(m => m.meets_sla).length / metrics.filter(m => m.meets_sla !== null).length) * 100)}% of metrics meet SLA targets
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-rose-400 mt-0.5" />
              <div>
                <div className="text-white font-medium">SLA Improvement Needed</div>
                <div className="text-slate-400">
                  Only {Math.round((metrics.filter(m => m.meets_sla).length / metrics.filter(m => m.meets_sla !== null).length) * 100)}% of metrics meet SLA targets
                </div>
              </div>
            </div>
          )}

          {metrics.filter(m => m.impact === 'positive').length > metrics.filter(m => m.impact === 'negative').length ? (
            <div className="flex items-start gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5" />
              <div>
                <div className="text-white font-medium">Positive Performance Trend</div>
                <div className="text-slate-400">
                  More positive than negative performance indicators
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-amber-400 mt-0.5" />
              <div>
                <div className="text-white font-medium">Monitor Performance Closely</div>
                <div className="text-slate-400">
                  Recent metrics show areas requiring attention
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}