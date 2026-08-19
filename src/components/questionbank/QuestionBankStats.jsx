import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BookOpen, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";

export default function QuestionBankStats({ questions }) {
  // Framework distribution
  const frameworkCounts = {};
  questions.forEach(q => {
    frameworkCounts[q.framework] = (frameworkCounts[q.framework] || 0) + 1;
  });
  const frameworkData = Object.entries(frameworkCounts).map(([name, count]) => ({ name, count }));

  // Difficulty distribution
  const difficultyCounts = {
    beginner: questions.filter(q => q.difficulty === 'beginner').length,
    intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
    advanced: questions.filter(q => q.difficulty === 'advanced').length
  };
  const difficultyData = Object.entries(difficultyCounts).map(([name, value]) => ({ name, value }));

  // Type distribution
  const typeCounts = {};
  questions.forEach(q => {
    if (q.question_type) {
      typeCounts[q.question_type] = (typeCounts[q.question_type] || 0) + 1;
    }
  });
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  // Quality stats
  const verifiedCount = questions.filter(q => q.is_verified).length;
  const totalUsage = questions.reduce((sum, q) => sum + (q.usage_count || 0), 0);
  const avgUsage = questions.length > 0 ? Math.round(totalUsage / questions.length) : 0;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{questions.length}</div>
              <div className="text-xs text-slate-500">Total Questions</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{verifiedCount}</div>
              <div className="text-xs text-slate-500">Verified</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalUsage}</div>
              <div className="text-xs text-slate-500">Total Usage</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{avgUsage}</div>
              <div className="text-xs text-slate-500">Avg Usage</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Questions by Framework</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frameworkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Difficulty Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {typeData.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Question Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}