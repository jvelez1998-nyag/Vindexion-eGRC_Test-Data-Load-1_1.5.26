import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, FileCheck, Shield, ClipboardCheck, Calculator,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const colorSchemes = {
  default: { primary: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-400', bgLight: 'bg-indigo-500/10' },
  risk: { primary: 'rose', bg: 'bg-rose-500', text: 'text-rose-400', bgLight: 'bg-rose-500/10' },
  success: { primary: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-400', bgLight: 'bg-emerald-500/10' },
  warning: { primary: 'amber', bg: 'bg-amber-500', text: 'text-amber-400', bgLight: 'bg-amber-500/10' },
  info: { primary: 'blue', bg: 'bg-blue-500', text: 'text-blue-400', bgLight: 'bg-blue-500/10' },
};

const sourceIcons = {
  risks: AlertTriangle,
  compliance: FileCheck,
  controls: Shield,
  audits: ClipboardCheck,
  assessments: Calculator,
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

function calculateMetric(data, metric, dataSource) {
  if (!data || data.length === 0) return { value: 0, label: metric };

  switch (metric) {
    case 'count':
      return { value: data.length, label: 'Total' };
    case 'open_count':
      return { value: data.filter(d => d.status !== 'closed').length, label: 'Open' };
    case 'critical_count':
      return { value: data.filter(d => (d.likelihood || 0) * (d.impact || 0) >= 16).length, label: 'Critical' };
    case 'compliance_rate':
      const compliant = data.filter(d => d.status === 'verified' || d.status === 'implemented').length;
      return { value: Math.round((compliant / data.length) * 100), label: '% Compliant', suffix: '%' };
    case 'effective_count':
      return { value: data.filter(d => d.status === 'effective').length, label: 'Effective' };
    case 'findings_count':
      return { value: data.reduce((sum, d) => sum + (d.findings_count || 0), 0), label: 'Findings' };
    case 'critical_findings':
      return { value: data.reduce((sum, d) => sum + (d.critical_findings || 0), 0), label: 'Critical' };
    case 'gap_count':
      return { value: data.filter(d => d.status === 'non_compliant' || d.status === 'not_started').length, label: 'Gaps' };
    case 'average_score':
      const scores = data.map(d => (d.likelihood || 0) * (d.impact || 0)).filter(s => s > 0);
      return { value: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0, label: 'Avg Score' };
    case 'average_effectiveness':
      const eff = data.map(d => d.effectiveness).filter(e => e);
      return { value: eff.length ? Math.round(eff.reduce((a, b) => a + b, 0) / eff.length * 10) / 10 : 0, label: 'Avg Effectiveness' };
    default:
      return { value: data.length, label: metric };
  }
}

function groupData(data, groupBy) {
  if (!groupBy || !data.length) return [];
  const groups = {};
  data.forEach(item => {
    const key = item[groupBy] || 'Unknown';
    groups[key] = (groups[key] || 0) + 1;
  });
  return Object.entries(groups).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
}

export default function CustomWidgetRenderer({ widget, data }) {
  const colors = colorSchemes[widget.color_scheme] || colorSchemes.default;
  const Icon = sourceIcons[widget.data_source] || AlertTriangle;
  const sourceData = data[widget.data_source] || [];
  const metric = calculateMetric(sourceData, widget.metric, widget.data_source);
  const groupedData = groupData(sourceData, widget.group_by);

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-1',
    large: 'col-span-1 md:col-span-2'
  };

  // Stat Card
  if (widget.widget_type === 'stat_card') {
    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] p-4 relative overflow-hidden ${sizeClasses[widget.size]}`}>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.bg}`} />
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${colors.bgLight}`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{widget.name}</p>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-white">{metric.value}{metric.suffix || ''}</p>
          {widget.show_trend && (
            <div className="flex items-center gap-1 text-emerald-400 text-xs mb-1">
              <TrendingUp className="h-3 w-3" />
              <span>+5%</span>
            </div>
          )}
        </div>
        <p className={`text-xs ${colors.text} mt-1`}>{metric.label}</p>
      </Card>
    );
  }

  // Pie Chart
  if (widget.widget_type === 'pie_chart' && groupedData.length > 0) {
    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] p-4 ${sizeClasses[widget.size]}`}>
        <h3 className="text-sm font-medium text-white mb-3">{widget.name}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={groupedData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {groupedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {groupedData.slice(0, 4).map((item, i) => (
            <Badge key={i} className="text-[10px] bg-[#151d2e] text-slate-400 border-[#2a3548]">
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              {item.name}: {item.value}
            </Badge>
          ))}
        </div>
      </Card>
    );
  }

  // Bar Chart
  if (widget.widget_type === 'bar_chart' && groupedData.length > 0) {
    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] p-4 ${sizeClasses[widget.size]}`}>
        <h3 className="text-sm font-medium text-white mb-3">{widget.name}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedData}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }

  // Table
  if (widget.widget_type === 'table') {
    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] p-4 ${sizeClasses[widget.size]}`}>
        <h3 className="text-sm font-medium text-white mb-3">{widget.name}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {groupedData.length > 0 ? groupedData.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#151d2e]">
              <span className="text-sm text-slate-300 capitalize">{item.name}</span>
              <Badge className={`${colors.bgLight} ${colors.text} border-0`}>{item.value}</Badge>
            </div>
          )) : (
            <p className="text-sm text-slate-500 text-center py-4">No data to display</p>
          )}
        </div>
      </Card>
    );
  }

  // Gauge (simple version)
  if (widget.widget_type === 'gauge') {
    const percentage = metric.suffix === '%' ? metric.value : Math.min(100, (metric.value / (sourceData.length || 1)) * 100);
    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] p-4 ${sizeClasses[widget.size]}`}>
        <h3 className="text-sm font-medium text-white mb-3">{widget.name}</h3>
        <div className="flex items-center justify-center py-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#2a3548" strokeWidth="12" fill="none" />
              <circle 
                cx="64" cy="64" r="56" 
                stroke={colors.bg.replace('bg-', '#').replace('-500', '')} 
                strokeWidth="12" 
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 3.52} 352`}
                className="text-indigo-500"
                style={{ stroke: CHART_COLORS[0] }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
              <span className="text-xs text-slate-500">{metric.label}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default fallback
  return (
    <Card className={`bg-[#1a2332] border-[#2a3548] p-4 ${sizeClasses[widget.size]}`}>
      <h3 className="text-sm font-medium text-white mb-2">{widget.name}</h3>
      <p className="text-3xl font-bold text-white">{metric.value}{metric.suffix || ''}</p>
      <p className="text-xs text-slate-500 mt-1">{metric.label}</p>
    </Card>
  );
}