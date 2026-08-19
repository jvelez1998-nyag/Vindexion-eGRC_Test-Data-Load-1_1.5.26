import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Target, Shield, FileText, Brain } from "lucide-react";
import AIRiskTreatmentPlanner from "@/components/ai/AIRiskTreatmentPlanner";
import AIControlEnhancementEngine from "@/components/ai/AIControlEnhancementEngine";
import AIComplianceReportGenerator from "@/components/ai/AIComplianceReportGenerator";

export default function AIWorkflowAutomation() {
  const [selectedRisk, setSelectedRisk] = useState(null);

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 100),
    staleTime: 300000
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100),
    staleTime: 300000
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 100),
    staleTime: 300000
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-reported_date', 50),
    staleTime: 300000
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-updated_date', 50),
    staleTime: 300000
  });

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-indigo-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <Brain className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent">
              AI Workflow Automation
            </h1>
            <p className="text-slate-400 text-sm mt-1">Automated risk treatment, control enhancement & compliance reporting</p>
          </div>
        </div>

        <Tabs defaultValue="treatment" className="space-y-6">
          <TabsList className="bg-[#0f1623] border border-[#2a3548] p-1">
            <TabsTrigger value="treatment" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Risk Treatment Plans
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Control Enhancement
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Compliance Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="treatment" className="space-y-6">
            {/* Risk Selector */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Select Risk for Treatment Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {risks.slice(0, 9).map(risk => (
                    <div
                      key={risk.id}
                      onClick={() => setSelectedRisk(risk)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRisk?.id === risk.id
                          ? 'bg-indigo-500/20 border-indigo-500/50'
                          : 'bg-[#0f1623] border-[#2a3548] hover:border-indigo-500/30'
                      }`}
                    >
                      <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">{risk.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{risk.category}</span>
                        <span className="text-xs text-rose-400">
                          Score: {risk.residual_risk_score || ((risk.residual_likelihood || 0) * (risk.residual_impact || 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedRisk && (
              <AIRiskTreatmentPlanner 
                risk={selectedRisk}
                controls={controls}
              />
            )}
          </TabsContent>

          <TabsContent value="controls">
            <AIControlEnhancementEngine 
              controls={controls}
              risks={risks}
              incidents={incidents}
            />
          </TabsContent>

          <TabsContent value="compliance">
            <AIComplianceReportGenerator 
              risks={risks}
              controls={controls}
              compliance={compliance}
              incidents={incidents}
              audits={audits}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}