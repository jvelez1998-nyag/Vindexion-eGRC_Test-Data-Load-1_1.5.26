import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BookOpen, Workflow, AlertTriangle, Brain, FileText, Database, Users, Globe, Activity, MapPin } from "lucide-react";
import ModernPrivacyDashboard from "@/components/privacy/ModernPrivacyDashboard";
import DPIABuilder from "@/components/privacy/DPIABuilder";
import DataSubjectRightsManager from "@/components/privacy/DataSubjectRightsManager";
import ProcessingActivityRegister from "@/components/privacy/ProcessingActivityRegister";
import PrivacyFrameworkLibrary from "@/components/privacy/PrivacyFrameworkLibrary";
import AIDataMappingEngine from "@/components/privacy/AIDataMappingEngine";
import AIPolicyGenerator from "@/components/privacy/AIPolicyGenerator";
import PrivacySimulator from "@/components/privacy/PrivacySimulator";
import PrivacyStudyGuide from "@/components/privacy/PrivacyStudyGuide";
import PrivacyWorkflow from "@/components/privacy/PrivacyWorkflow";
import PrivacyRisksControls from "@/components/privacy/PrivacyRisksControls";
import PrivacyUserGuide from "@/components/privacy/PrivacyUserGuide";
import PrivacyAIInsightsPanel from "@/components/privacy/PrivacyAIInsightsPanel";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

export default function PrivacyAssessment() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['privacy-assessments'],
    queryFn: async () => {
      const data = await base44.entities.RiskAssessment.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: dsrRequests = [] } = useQuery({
    queryKey: ['dsr-requests'],
    queryFn: async () => {
      const data = await base44.entities.DataSubjectRequest.list('-submission_date', 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: processingActivities = [] } = useQuery({
    queryKey: ['processing-activities'],
    queryFn: async () => {
      const data = await base44.entities.DataProcessingActivity.list('-created_date', 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[#1a2332] animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-72 bg-[#1a2332] animate-pulse rounded" />
            <div className="h-4 w-96 bg-[#1a2332] animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-[#1a2332] animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalDPIAs = assessments.filter(a => a.assessment_type === 'dpia').length;

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-[1800px] mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-purple-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bS0yIDJ2LTJoLTJ2Mmgyem0wLTR2LTJoLTJ2Mmgyem0yLTJ2LTJoLTJ2Mmgyem0wLTRoMnYtMmgtMnYyem0tMiAwdi0yaC0ydjJoMnptLTIgMGgtMnYyaDJ2LTJ6bTQgMGgydi0yaC0ydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
          <div className="relative p-8 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-600 shadow-2xl shadow-purple-500/40">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent mb-2">
                    Privacy Compliance Center
                  </h1>
                  <p className="text-slate-300 text-base">Global privacy law compliance & data protection management</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{totalDPIAs}</div>
                  <div className="text-xs text-slate-400">DPIAs Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20 p-4 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{assessments.length}</div>
            </div>
            <div className="text-xs text-slate-400">Privacy Assessments</div>
            <div className="text-[10px] text-purple-400 mt-0.5">DPIAs & PIAs</div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-4 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{processingActivities.length}</div>
            </div>
            <div className="text-xs text-slate-400">Processing Activities</div>
            <div className="text-[10px] text-blue-400 mt-0.5">RoPA (Art. 30)</div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dsrRequests.length}</div>
            </div>
            <div className="text-xs text-slate-400">DSR Requests</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Subject rights</div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-4 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Globe className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">6</div>
            </div>
            <div className="text-xs text-slate-400">Frameworks</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Global coverage</div>
          </Card>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto scrollbar-thin">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30 text-xs">
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="dpia" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30 text-xs">
              <Shield className="h-4 w-4 mr-2" />
              DPIA Builder
            </TabsTrigger>
            <TabsTrigger value="dsr" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30 text-xs">
              <Users className="h-4 w-4 mr-2" />
              DSR Management
            </TabsTrigger>
            <TabsTrigger value="ropa" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 text-xs">
              <Database className="h-4 w-4 mr-2" />
              RoPA Register
            </TabsTrigger>
            <TabsTrigger value="mapping" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30 text-xs">
              <MapPin className="h-4 w-4 mr-2" />
              Data Mapping
            </TabsTrigger>
            <TabsTrigger value="policy-generator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30 text-xs">
              <FileText className="h-4 w-4 mr-2" />
              Policy Generator
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30 text-xs">
              <Globe className="h-4 w-4 mr-2" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="simulator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-rose-300 data-[state=active]:border data-[state=active]:border-rose-500/30 text-xs">
              <Brain className="h-4 w-4 mr-2" />
              AI Simulator
            </TabsTrigger>
            <TabsTrigger value="study" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30 text-xs">
              <BookOpen className="h-4 w-4 mr-2" />
              Study Guide
            </TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30 text-xs">
              <Workflow className="h-4 w-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-300 data-[state=active]:border data-[state=active]:border-orange-500/30 text-xs">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risks
            </TabsTrigger>
            <TabsTrigger value="user-guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500/20 data-[state=active]:to-gray-500/20 data-[state=active]:text-slate-300 data-[state=active]:border data-[state=active]:border-slate-500/30 text-xs">
              <BookOpen className="h-4 w-4 mr-2" />
              Guide
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <PrivacyAIInsightsPanel 
            assessments={assessments}
            risks={risks}
            controls={controls}
            compliance={compliance}
            incidents={incidents}
          />
          <ModernPrivacyDashboard />
        </TabsContent>

        <TabsContent value="dpia">
          <DPIABuilder />
        </TabsContent>

        <TabsContent value="dsr">
          <DataSubjectRightsManager />
        </TabsContent>

        <TabsContent value="ropa">
          <ProcessingActivityRegister />
        </TabsContent>

        <TabsContent value="mapping">
          <AIDataMappingEngine />
        </TabsContent>

        <TabsContent value="policy-generator">
          <AIPolicyGenerator />
        </TabsContent>

        <TabsContent value="frameworks">
          <PrivacyFrameworkLibrary />
        </TabsContent>

        <TabsContent value="simulator">
          <PrivacySimulator />
        </TabsContent>

        <TabsContent value="study">
          <PrivacyStudyGuide />
        </TabsContent>

        <TabsContent value="workflow">
          <PrivacyWorkflow />
        </TabsContent>

        <TabsContent value="risks">
          <PrivacyRisksControls />
        </TabsContent>

        <TabsContent value="user-guide">
          <PrivacyUserGuide />
        </TabsContent>
      </Tabs>
      </div>

      <FloatingChatbot context="privacy" contextData={{ assessments: assessments.length, dsrRequests: dsrRequests.length }} />
    </div>
  );
}