import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, Shield, FileCheck, ClipboardCheck, 
  Calculator, Users, BookOpen, Search, TrendingUp 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function KnowledgeCategories({ knowledgeData }) {
  const [search, setSearch] = useState("");

  const categories = [
    {
      id: "risks",
      title: "Risk Management",
      icon: AlertTriangle,
      color: "rose",
      data: knowledgeData.risks,
      metrics: {
        total: knowledgeData.risks.length,
        critical: knowledgeData.risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length,
        open: knowledgeData.risks.filter(r => r.status !== 'closed').length
      },
      subcategories: Array.from(new Set(knowledgeData.risks.map(r => r.category).filter(Boolean)))
    },
    {
      id: "incidents",
      title: "Incident Response",
      icon: AlertTriangle,
      color: "amber",
      data: knowledgeData.incidents,
      metrics: {
        total: knowledgeData.incidents.length,
        open: knowledgeData.incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length,
        critical: knowledgeData.incidents.filter(i => i.severity === 'critical').length
      },
      subcategories: Array.from(new Set(knowledgeData.incidents.map(i => i.incident_type).filter(Boolean)))
    },
    {
      id: "controls",
      title: "Security Controls",
      icon: Shield,
      color: "blue",
      data: knowledgeData.controls,
      metrics: {
        total: knowledgeData.controls.length,
        effective: knowledgeData.controls.filter(c => c.status === 'effective').length,
        ineffective: knowledgeData.controls.filter(c => c.status === 'ineffective').length
      },
      subcategories: Array.from(new Set(knowledgeData.controls.map(c => c.domain).filter(Boolean)))
    },
    {
      id: "compliance",
      title: "Compliance Management",
      icon: FileCheck,
      color: "emerald",
      data: knowledgeData.compliance,
      metrics: {
        total: knowledgeData.compliance.length,
        compliant: knowledgeData.compliance.filter(c => ['implemented', 'verified'].includes(c.status)).length,
        non_compliant: knowledgeData.compliance.filter(c => c.status === 'non_compliant').length
      },
      subcategories: Array.from(new Set(knowledgeData.compliance.map(c => c.framework).filter(Boolean)))
    },
    {
      id: "assessments",
      title: "Risk Assessments",
      icon: Calculator,
      color: "purple",
      data: knowledgeData.assessments,
      metrics: {
        total: knowledgeData.assessments.length,
        pending: knowledgeData.assessments.filter(a => a.lifecycle_status === 'pending_review').length,
        approved: knowledgeData.assessments.filter(a => a.lifecycle_status === 'approved').length
      },
      subcategories: Array.from(new Set(knowledgeData.assessments.map(a => a.assessment_type).filter(Boolean)))
    },
    {
      id: "audits",
      title: "Audits & Reviews",
      icon: ClipboardCheck,
      color: "indigo",
      data: knowledgeData.audits,
      metrics: {
        total: knowledgeData.audits.length,
        in_progress: knowledgeData.audits.filter(a => a.status === 'in_progress').length,
        completed: knowledgeData.audits.filter(a => a.status === 'completed').length
      },
      subcategories: Array.from(new Set(knowledgeData.audits.map(a => a.type).filter(Boolean)))
    },
    {
      id: "vendors",
      title: "Third-Party Risk",
      icon: Users,
      color: "cyan",
      data: knowledgeData.vendors,
      metrics: {
        total: knowledgeData.vendors.length,
        critical: knowledgeData.vendors.filter(v => v.criticality === 'critical').length,
        high_risk: knowledgeData.vendors.filter(v => v.risk_score > 70).length
      },
      subcategories: Array.from(new Set(knowledgeData.vendors.map(v => v.industry).filter(Boolean)))
    },
    {
      id: "guidance",
      title: "Regulatory Guidance",
      icon: BookOpen,
      color: "teal",
      data: knowledgeData.guidance,
      metrics: {
        total: knowledgeData.guidance.length,
        active: knowledgeData.guidance.filter(g => g.status === 'active').length
      },
      subcategories: Array.from(new Set(knowledgeData.guidance.map(g => g.framework).filter(Boolean)))
    }
  ];

  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(search.toLowerCase()) ||
    cat.subcategories.some(sub => sub.toLowerCase().includes(search.toLowerCase()))
  );

  const getColorClasses = (color) => {
    const colors = {
      rose: { bg: "from-rose-500/20 to-red-500/20", border: "border-rose-500/30", text: "text-rose-400" },
      amber: { bg: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", text: "text-amber-400" },
      blue: { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-400" },
      emerald: { bg: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", text: "text-emerald-400" },
      purple: { bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", text: "text-purple-400" },
      indigo: { bg: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30", text: "text-indigo-400" },
      cyan: { bg: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30", text: "text-cyan-400" },
      teal: { bg: "from-teal-500/20 to-emerald-500/20", border: "border-teal-500/30", text: "text-teal-400" }
    };
    return colors[color] || colors.blue;
  };

  const chartData = categories.map(cat => ({
    name: cat.title.split(' ')[0],
    value: cat.data.length
  }));

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="pl-10 bg-[#1a2332] border-[#2a3548] text-white"
        />
      </div>

      {/* Overview Chart */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Knowledge Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => {
                  const colors = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#6366f1', '#06b6d4', '#14b8a6'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map(category => {
          const Icon = category.icon;
          const colors = getColorClasses(category.color);
          
          return (
            <Card key={category.id} className={`bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                    <CardTitle className="text-base">{category.title}</CardTitle>
                  </div>
                  <Badge className="bg-white/10 text-white">{category.data.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(category.metrics).map(([key, value]) => (
                    <div key={key} className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-white">{value}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{key.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>

                {/* Subcategories */}
                {category.subcategories.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Subcategories:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 5).map((sub, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] border-[#2a3548]">
                          {sub}
                        </Badge>
                      ))}
                      {category.subcategories.length > 5 && (
                        <Badge variant="outline" className="text-[10px] border-[#2a3548]">
                          +{category.subcategories.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}