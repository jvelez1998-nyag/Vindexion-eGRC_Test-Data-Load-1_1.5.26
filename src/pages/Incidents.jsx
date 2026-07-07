import { Card, Badge, PageHeader } from '@/components/ui';
import { incidents, severityColor, statusColor } from '@/data/mockData';

export default function Incidents() {
  return (
    <div>
      <PageHeader title="Incidents" subtitle={`${incidents.length} incidents logged in the last 30 days`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((i) => (
          <Card key={i.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <span className="text-indigo-400 font-mono text-xs">{i.id}</span>
              <Badge className={severityColor[i.severity]}>{i.severity}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-white mb-3 leading-snug">{i.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{i.category} · {i.owner}</span>
              <Badge className={statusColor[i.status]}>{i.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">Reported {i.reported}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
