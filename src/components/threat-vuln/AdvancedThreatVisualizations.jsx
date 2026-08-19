import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ScatterChart, Scatter, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, PieChart, Pie
} from "recharts";
import { Shield, TrendingUp, Target, Activity } from "lucide-react";

export default function AdvancedThreatVisualizations({ threats = [], vulnerabilities = [] }) {
  // Threat Landscape Scatter
  const threatScatter = threats.map(t => ({
    name: t.name,
    impact: t.impact || Math.floor(Math.random() * 10) + 1,
    likelihood: t.likelihood || Math.floor(Math.random() * 10) + 1,
    severity: t.severity
  }));

  // CVSS Distribution
  const cvssData = [
    { range: '0-3.9 Low', count: vulnerabilities.filter(v => (v.cvss_score || 0) < 4).length, color: '#3b82f6' },
    { range: '4-6.9 Medium', count: vulnerabilities.filter(v => (v.cvss_score || 0) >= 4 && (v.cvss_score || 0) < 7).length, color: '#f59e0b' },
    { range: '7-8.9 High', count: vulnerabilities.filter(v => (v.cvss_score || 0) >= 7 && (v.cvss_score || 0) < 9).length, color: '#ef4444' },
    { range: '9-10 Critical', count: vulnerabilities.filter(v => (v.cvss_score || 0) >= 9).length, color: '#dc2626' }
  ];

  // Threat Actor Profile
  const actorProfile = [
    { actor: 'Nation State', sophistication: 9, activity: 7 },
    { actor: 'Organized Crime', sophistication: 7, activity: 9 },
    { actor: 'Hacktivists', sophistication: 5, activity: 6 },
    { actor: 'Insider Threat', sophistication: 4, activity: 5 },
    { actor: 'Script Kiddies', sophistication: 2, activity: 8 }
  ];

  // Attack Vector Distribution
  const attackVectors = [
    { name: 'Phishing', value: 35, color: '#ef4444' },
    { name: 'Malware', value: 25, color: '#f59e0b' },
    { name: 'Exploits', value: 20, color: '#a855f7' },
    { name: 'Social Eng', value: 15, color: '#06b6d4' },
    { name: 'Other', value: 5, color: '#94a3b8' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Threat Landscape Scatter */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-rose-400" />
            Threat Landscape
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">Threat positioning by impact and likelihood vectors</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis 
                type="number" 
                dataKey="likelihood" 
                name="Likelihood" 
                domain={[0, 10]}
                stroke="#94a3b8"
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                label={{ value: 'Likelihood', position: 'insideBottom', offset: -8, fill: '#e2e8f0', fontSize: 11 }}
              />
              <YAxis 
                type="number" 
                dataKey="impact" 
                name="Impact" 
                domain={[0, 10]}
                stroke="#94a3b8"
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                label={{ value: 'Impact', angle: -90, position: 'insideLeft', offset: 5, fill: '#e2e8f0', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter name="Threats" data={threatScatter} fill="#ef4444">
                {threatScatter.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={
                      entry.impact * entry.likelihood > 64 ? '#dc2626' :
                      entry.impact * entry.likelihood > 36 ? '#ef4444' :
                      entry.impact * entry.likelihood > 16 ? '#f59e0b' : '#3b82f6'
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CVSS Score Distribution */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            CVSS Score Distribution
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">Vulnerability severity breakdown by CVSS scoring ranges</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cvssData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {cvssData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Threat Actor Sophistication */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            Threat Actor Profile
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">Actor sophistication and activity levels across threat categories</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={actorProfile} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <PolarGrid stroke="#2a3548" />
              <PolarAngleAxis dataKey="actor" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 10 }} />
              <Radar name="Sophistication" dataKey="sophistication" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} strokeWidth={2} />
              <Radar name="Activity" dataKey="activity" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#e2e8f0' }} iconType="circle" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attack Vector Distribution */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Attack Vector Distribution
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">Most common attack methods used in threat landscape</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={attackVectors}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                style={{ fontSize: '11px', fontWeight: '600', fill: '#e2e8f0' }}
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
              >
                {attackVectors.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}