import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ThreatIntelligenceFeed({ threatData }) {
  return (
    <Tabs defaultValue="cves" className="space-y-4">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="cves">CVE Database</TabsTrigger>
        <TabsTrigger value="ttps">Attack TTPs</TabsTrigger>
        <TabsTrigger value="actors">Threat Actors</TabsTrigger>
      </TabsList>

      <TabsContent value="cves">
        <div className="grid grid-cols-1 gap-4">
          {threatData.cves.map(cve => (
            <Card key={cve.id} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-white">{cve.id}</h4>
                      <Badge className={`${
                        cve.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        cve.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {cve.severity.toUpperCase()}
                      </Badge>
                      <Badge className="bg-indigo-500/20 text-indigo-400">
                        CVSS {cve.score}
                      </Badge>
                    </div>
                    <h5 className="text-sm font-medium text-white mb-2">{cve.title}</h5>
                    <p className="text-xs text-slate-400 mb-3">{cve.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Affected Systems:</p>
                    <div className="flex flex-wrap gap-1">
                      {cve.affectedSystems.map((system, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Recommended Mitigations:</p>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {cve.mitigations.map((mitigation, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400">•</span>
                          <span>{mitigation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#2a3548]">
                    <p className="text-xs text-slate-500">
                      Published: {format(new Date(cve.published), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="ttps">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {threatData.ttps.map(ttp => (
            <Card key={ttp.id} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-white">{ttp.id}</h4>
                      <Badge className={`${
                        ttp.trend === 'critical' ? 'bg-red-500/20 text-red-400' :
                        ttp.trend === 'increasing' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {ttp.trend}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="mb-2 text-xs">{ttp.tactic}</Badge>
                    <h5 className="text-sm font-medium text-white mb-2">{ttp.technique}</h5>
                    <p className="text-xs text-slate-400 mb-3">{ttp.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2 rounded bg-[#0f1623] border border-[#2a3548]">
                    <p className="text-xs font-medium text-emerald-400 mb-1">Detection:</p>
                    <p className="text-xs text-slate-300">{ttp.detection}</p>
                  </div>

                  <div className="p-2 rounded bg-[#0f1623] border border-[#2a3548]">
                    <p className="text-xs font-medium text-blue-400 mb-1">Mitigation:</p>
                    <p className="text-xs text-slate-300">{ttp.mitigation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="actors">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {threatData.threatActors.map(actor => (
            <Card key={actor.name} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-white">{actor.name}</h4>
                      <Badge className={`${
                        actor.activity === 'active' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {actor.activity}
                      </Badge>
                    </div>
                  </div>
                  <Target className="h-5 w-5 text-rose-400" />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Primary Targets:</p>
                    <div className="flex flex-wrap gap-1">
                      {actor.targets.map((target, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Attack Methods:</p>
                    <div className="flex flex-wrap gap-1">
                      {actor.methods.map((method, idx) => (
                        <Badge key={idx} className="bg-purple-500/20 text-purple-400 text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs font-medium text-amber-400 mb-1">Recent Activity:</p>
                    <p className="text-xs text-slate-300">{actor.recentActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}