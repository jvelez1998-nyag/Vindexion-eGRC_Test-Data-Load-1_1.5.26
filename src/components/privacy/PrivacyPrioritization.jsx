import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertTriangle, Clock } from "lucide-react";

export default function PrivacyPrioritization() {
  const priorities = [
    {
      category: 'Immediate (This Week)',
      color: 'rose',
      items: [
        { task: 'Complete overdue DSAR', deadline: '2 days', impact: 'Regulatory penalty risk', effort: 'high' },
        { task: 'Address consent management gap', deadline: '5 days', impact: 'Active non-compliance', effort: 'medium' },
        { task: 'Update breach response plan', deadline: '7 days', impact: 'Preparedness gap', effort: 'low' }
      ]
    },
    {
      category: 'Short-term (This Month)',
      color: 'amber',
      items: [
        { task: 'Conduct vendor privacy assessments', deadline: '3 weeks', impact: 'Third-party risk', effort: 'high' },
        { task: 'Implement data retention automation', deadline: '4 weeks', impact: 'Operational efficiency', effort: 'medium' },
        { task: 'Privacy training refresh', deadline: '4 weeks', impact: 'Awareness & culture', effort: 'low' }
      ]
    },
    {
      category: 'Mid-term (This Quarter)',
      color: 'blue',
      items: [
        { task: 'Privacy by design review', deadline: '8 weeks', impact: 'Proactive compliance', effort: 'medium' },
        { task: 'Enhanced monitoring tools', deadline: '10 weeks', impact: 'Detection capability', effort: 'high' },
        { task: 'Cross-border transfer assessment', deadline: '12 weeks', impact: 'International compliance', effort: 'medium' }
      ]
    }
  ];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Privacy Priorities & Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {priorities.map((priority, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`bg-${priority.color}-500/20 text-${priority.color}-400`}>
                {priority.category}
              </Badge>
            </div>
            <div className="space-y-2">
              {priority.items.map((item, i) => (
                <div key={i} className={`p-3 rounded-lg border bg-gradient-to-r from-${priority.color}-500/5 to-transparent border-${priority.color}-500/20`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white mb-1">{item.task}</div>
                      <p className="text-xs text-slate-400">{item.impact}</p>
                    </div>
                    <Badge className={`ml-2 ${
                      item.effort === 'high' ? 'bg-rose-500/20 text-rose-400' :
                      item.effort === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.effort} effort
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3 w-3" />
                      {item.deadline}
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}