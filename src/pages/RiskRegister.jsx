import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Card, Badge, Button, PageHeader } from '@/components/ui';
import { risks, severityColor, statusColor } from '@/data/mockData';

const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function RiskRegister() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('All');

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      const matchesQuery =
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.id.toLowerCase().includes(query.toLowerCase());
      const matchesSeverity = severity === 'All' || r.severity === severity;
      return matchesQuery && matchesSeverity;
    });
  }, [query, severity]);

  return (
    <div>
      <PageHeader
        title="Risk Register"
        subtitle={`${risks.length} identified risks across the enterprise`}
        action={
          <Button>
            <Plus className="h-4 w-4" /> New Risk
          </Button>
        }
      />

      <Card className="mb-4 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search risks by title or ID..."
            className="w-full bg-[#0f1623] border border-[#2a3548] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {severities.map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                severity === s
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                  : 'text-slate-400 border-[#2a3548] hover:text-white hover:bg-[#1a2332]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a3548] text-left text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Risk</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#2a3548] last:border-0 hover:bg-[#1e293b]/40 transition-colors">
                  <td className="px-5 py-3.5 text-indigo-400 font-mono text-xs">{r.id}</td>
                  <td className="px-5 py-3.5 text-slate-200 max-w-md">{r.title}</td>
                  <td className="px-5 py-3.5 text-slate-400">{r.category}</td>
                  <td className="px-5 py-3.5 text-slate-400">{r.owner}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={severityColor[r.severity]}>{r.severity}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusColor[r.status]}>{r.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{r.updated}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No risks match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
