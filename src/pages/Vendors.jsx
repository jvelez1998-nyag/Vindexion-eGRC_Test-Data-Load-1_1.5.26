import { Building2 } from 'lucide-react';
import { Card, Badge, ProgressBar, PageHeader } from '@/components/ui';
import { vendors, statusColor } from '@/data/mockData';

function riskColor(score) {
  if (score >= 60) return 'text-red-400';
  if (score >= 35) return 'text-amber-400';
  return 'text-emerald-400';
}

export default function Vendors() {
  return (
    <div>
      <PageHeader title="Vendor Risk Management" subtitle={`${vendors.length} third parties under management`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <Card key={v.name} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                <Building2 className="h-4.5 w-4.5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{v.name}</h3>
                <p className="text-xs text-slate-500">{v.tier} tier</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">Risk Score</span>
              <span className={`text-sm font-bold ${riskColor(v.riskScore)}`}>{v.riskScore}</span>
            </div>
            <ProgressBar value={v.riskScore} className="mb-3" />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <Badge className={statusColor[v.status]}>{v.status}</Badge>
              <span>Contract ends {v.contract}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
