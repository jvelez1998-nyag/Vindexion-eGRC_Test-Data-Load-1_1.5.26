import { ShieldCheck } from 'lucide-react';
import { Card, ProgressBar, PageHeader } from '@/components/ui';
import { frameworks } from '@/data/mockData';

function scoreColor(score) {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-amber-400';
  return 'text-red-400';
}

export default function Compliance() {
  const avg = Math.round(frameworks.reduce((s, f) => s + f.score, 0) / frameworks.length);

  return (
    <div>
      <PageHeader
        title="Compliance Frameworks"
        subtitle={`Tracking ${frameworks.length} frameworks · ${avg}% average program score`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {frameworks.map((f) => (
          <Card key={f.name} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{f.name}</h3>
              </div>
              <span className={`text-xl font-bold ${scoreColor(f.score)}`}>{f.score}%</span>
            </div>
            <ProgressBar value={f.score} className="mb-3" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>
                {f.met} / {f.controls} controls met
              </span>
              <span>{f.controls - f.met} gaps</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
