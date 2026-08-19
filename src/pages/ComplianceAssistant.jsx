import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, AlertTriangle, Zap, Activity } from "lucide-react";
import ComplianceAssistantDashboard from "@/components/compliance/ComplianceAssistantDashboard";
import AIComplianceChat from "@/components/compliance/AIComplianceChat";
import ComplianceGapIdentifier from "@/components/compliance/ComplianceGapIdentifier";
import AutomatedComplianceWorkflow from "@/components/compliance/AutomatedComplianceWorkflow";

export default function ComplianceAssistant() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list(),
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list(),
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list(),
  });



  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Brain className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              AI Compliance Assistant
            </h1>
            <p className="text-slate-400 text-sm mt-1">Intelligent compliance guidance, gap analysis, and automation</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="gaps" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400">
              <Zap className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ComplianceAssistantDashboard 
              compliance={compliance}
              onStartChat={() => setActiveTab("chat")}
            />
          </TabsContent>

          <TabsContent value="chat">
            <AIComplianceChat
              compliance={compliance}
              controls={controls}
              risks={risks}
            />
          </TabsContent>

          <TabsContent value="gaps">
            <ComplianceGapIdentifier
              compliance={compliance}
              controls={controls}
            />
          </TabsContent>

          <TabsContent value="automation">
            <AutomatedComplianceWorkflow />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}