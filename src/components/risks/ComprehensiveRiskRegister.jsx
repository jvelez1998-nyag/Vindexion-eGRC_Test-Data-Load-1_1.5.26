import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, TrendingUp, Target, Brain, Download, Plus } from "lucide-react";
import RiskHeatmapVisualization from "./RiskHeatmapVisualization";
import RiskControlMatrix from "./RiskControlMatrix";
import AIRiskIdentification from "./AIRiskIdentification";
import RiskMitigationTracker from "./RiskMitigationTracker";
import RiskReportGenerator from "./RiskReportGenerator";
import RiskCategorization from "./RiskCategorization";
import { toast } from "sonner";

export default function ComprehensiveRiskRegister({ onCreateRisk }) {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 200),
    staleTime: 60000
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 200),
    staleTime: 60000
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 100),
    staleTime: 60000
  });

  const { data: securityEvents = [] } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => base44.entities.SecurityEvent.list('-created_date', 100),
    staleTime: 30000
  });

  // Calculate risk metrics
  const criticalRisks = risks.filter(r => (r.residual_likelihood || 0) * (r.residual_impact || 0) >= 16);
  const highRisks = risks.filter(r => {
    const score = (r.residual_likelihood || 0) * (r.residual_impact || 0);
    return score >= 9 && score < 16;
  });
  const unmitigatedRisks = risks.filter(r => !r.linked_controls || r.linked_controls.length === 0);
  const avgRiskScore = risks.length ? 
    (risks.reduce((sum, r) => sum + ((r.residual_likelihood || 0) * (r.residual_impact || 0)), 0) / risks.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Critical Risks</p>
                <p className="text-2xl font-bold text-rose-400">{criticalRisks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">High Risks</p>
                <p className="text-2xl font-bold text-amber-400">{highRisks.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Unmitigated</p>
                <p className="text-2xl font-bold text-blue-400">{unmitigatedRisks.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Risk Score</p>
                <p className="text-2xl font-bold text-indigo-400">{avgRiskScore}</p>
              </div>
              <Target className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categorization">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Categorization
          </TabsTrigger>
          <TabsTrigger value="heatmap">
            <TrendingUp className="h-4 w-4 mr-2" />
            Risk Heatmap
          </TabsTrigger>
          <TabsTrigger value="controls">
            <Shield className="h-4 w-4 mr-2" />
            Risk-Control Matrix
          </TabsTrigger>
          <TabsTrigger value="ai-identification">
            <Brain className="h-4 w-4 mr-2" />
            AI Identification
          </TabsTrigger>
          <TabsTrigger value="mitigation">
            <Target className="h-4 w-4 mr-2" />
            Mitigation Tracking
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Download className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskHeatmapVisualization risks={risks} />
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Risk Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['strategic', 'operational', 'financial', 'compliance', 'cybersecurity', 'technology'].map(category => {
                    const count = risks.filter(r => r.category === category).length;
                    const percentage = risks.length ? ((count / risks.length) * 100).toFixed(0) : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 capitalize">{category}</span>
                          <span className="text-white">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-[#0f1623] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categorization">
          <RiskCategorization 
            risks={risks}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['risks'] })}
          />
        </TabsContent>

        <TabsContent value="heatmap">
          <RiskHeatmapVisualization risks={risks} detailed />
        </TabsContent>

        <TabsContent value="controls">
          <RiskControlMatrix 
            risks={risks}
            controls={controls}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['risks'] });
              queryClient.invalidateQueries({ queryKey: ['controls'] });
            }}
          />
        </TabsContent>

        <TabsContent value="ai-identification">
          <AIRiskIdentification 
            risks={risks}
            controls={controls}
            compliance={compliance}
            securityEvents={securityEvents}
            onCreateRisk={(riskData) => {
              if (onCreateRisk) onCreateRisk(riskData);
              queryClient.invalidateQueries({ queryKey: ['risks'] });
            }}
          />
        </TabsContent>

        <TabsContent value="mitigation">
          <RiskMitigationTracker 
            risks={risks}
            controls={controls}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['risks'] })}
          />
        </TabsContent>

        <TabsContent value="reports">
          <RiskReportGenerator 
            risks={risks}
            controls={controls}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}