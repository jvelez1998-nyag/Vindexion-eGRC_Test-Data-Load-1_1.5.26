import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calculator, Shield, FileText, Target, Activity } from "lucide-react";
import AIRiskIdentificationEngine from "@/components/assessments/AIRiskIdentificationEngine";
import AIRiskScoringEngine from "@/components/assessments/AIRiskScoringEngine";
import AIMitigationStrategyEngine from "@/components/assessments/AIMitigationStrategyEngine";
import AITreatmentPlanGenerator from "@/components/assessments/AITreatmentPlanGenerator";

export default function AIRiskAssessment() {
  const [activeTab, setActiveTab] = useState("identification");

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: async () => {
      const data = await base44.entities.ControlTest.list('-test_date', 100);
      return data || [];
    },
    staleTime: 300000
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list('-reported_date', 100);
      return data || [];
    },
    staleTime: 300000
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000
  });

  const { data: threats = [] } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const data = await base44.entities.SecurityEvent.list('-detected_date', 50);
      return data || [];
    },
    staleTime: 300000
  });

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-bold text-purple-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <Brain className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-violet-300 bg-clip-text text-transparent">
                AI-Powered Risk Assessment
              </h1>
              <p className="text-slate-400 text-sm mt-1">Automated risk discovery, scoring & treatment planning</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-rose-400" />
              <div className="text-2xl font-bold text-white">{risks.length}</div>
            </div>
            <div className="text-xs text-slate-400">Total Risks</div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <div className="text-2xl font-bold text-white">{controlTests.length}</div>
            </div>
            <div className="text-xs text-slate-400">Control Tests</div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-amber-400" />
              <div className="text-2xl font-bold text-white">{incidents.length}</div>
            </div>
            <div className="text-xs text-slate-400">Incidents</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <div className="text-2xl font-bold text-white">{threats.length}</div>
            </div>
            <div className="text-xs text-slate-400">Threats</div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
            <TabsTrigger 
              value="identification"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-purple-300"
            >
              <Brain className="h-4 w-4 mr-2" />
              Risk Identification
            </TabsTrigger>
            <TabsTrigger 
              value="scoring"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-300"
            >
              <Calculator className="h-4 w-4 mr-2" />
              AI Scoring
            </TabsTrigger>
            <TabsTrigger 
              value="mitigation"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Mitigation Strategies
            </TabsTrigger>
            <TabsTrigger 
              value="treatment"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-violet-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Treatment Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identification" className="space-y-6">
            <AIRiskIdentificationEngine
              controlTests={controlTests}
              incidents={incidents}
              externalThreats={threats}
            />
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            <AIRiskScoringEngine
              risks={risks}
              controlTests={controlTests}
              incidents={incidents}
              controls={controls}
            />
          </TabsContent>

          <TabsContent value="mitigation" className="space-y-6">
            <AIMitigationStrategyEngine
              risks={risks}
              controls={controls}
            />
          </TabsContent>

          <TabsContent value="treatment" className="space-y-6">
            <AITreatmentPlanGenerator risks={risks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}