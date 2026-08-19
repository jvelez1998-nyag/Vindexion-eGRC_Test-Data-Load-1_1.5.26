import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp } from "lucide-react";

export default function RiskCategorization({ risks }) {
  const categories = {
    strategic: { color: 'purple', label: 'Strategic' },
    operational: { color: 'blue', label: 'Operational' },
    financial: { color: 'emerald', label: 'Financial' },
    compliance: { color: 'amber', label: 'Compliance' },
    cybersecurity: { color: 'rose', label: 'Cybersecurity' },
    technology: { color: 'cyan', label: 'Technology' },
    third_party: { color: 'indigo', label: 'Third Party' },
    reputational: { color: 'pink', label: 'Reputational' }
  };

  const getCategoryRisks = (category) => risks.filter(r => r.category === category);

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="detailed">Detailed View</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categories).map(([key, { color, label }]) => {
            const categoryRisks = getCategoryRisks(key);
            const criticalCount = categoryRisks.filter(r => (r.residual_likelihood || 0) * (r.residual_impact || 0) >= 16).length;
            const avgScore = categoryRisks.length ? 
              (categoryRisks.reduce((sum, r) => sum + ((r.residual_likelihood || 0) * (r.residual_impact || 0)), 0) / categoryRisks.length).toFixed(1) : 0;

            return (
              <Card key={key} className={`bg-${color}-500/10 border-${color}-500/20`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-semibold text-${color}-400`}>{label}</h3>
                    <AlertTriangle className={`h-4 w-4 text-${color}-400`} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-white">{categoryRisks.length}</div>
                    <div className="text-xs text-slate-400">
                      {criticalCount} critical • Avg: {avgScore}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="detailed">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(categories).map(([key, { color, label }]) => {
            const categoryRisks = getCategoryRisks(key);
            return (
              <Card key={key} className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 text-${color}-400`} />
                    {label} Risks ({categoryRisks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {categoryRisks.map(risk => {
                        const score = (risk.residual_likelihood || 0) * (risk.residual_impact || 0);
                        return (
                          <div key={risk.id} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="text-sm font-semibold text-white flex-1">{risk.title}</h4>
                              <Badge className={`${
                                score >= 16 ? 'bg-red-500/20 text-red-400' :
                                score >= 9 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {score}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>L:{risk.residual_likelihood || 0}</span>
                              <span>•</span>
                              <span>I:{risk.residual_impact || 0}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">{risk.status}</Badge>
                            </div>
                          </div>
                        );
                      })}
                      {categoryRisks.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-8">No risks in this category</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
  );
}