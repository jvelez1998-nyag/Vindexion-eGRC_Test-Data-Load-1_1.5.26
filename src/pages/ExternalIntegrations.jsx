import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, FileText, Users } from "lucide-react";
import ThreatIntelligenceIntegration from "@/components/integrations/ThreatIntelligenceIntegration";
import RegulatoryMonitoring from "@/components/integrations/RegulatoryMonitoring";
import FinancialDataIntegration from "@/components/integrations/FinancialDataIntegration";
import HRSystemIntegration from "@/components/integrations/HRSystemIntegration";

export default function ExternalIntegrations() {
  const [activeTab, setActiveTab] = useState("threat");

  const integrationStats = [
    { label: "Active Connections", value: "4", color: "text-emerald-400" },
    { label: "Data Syncs Today", value: "127", color: "text-blue-400" },
    { label: "Enriched Records", value: "2,453", color: "text-purple-400" },
    { label: "Last Sync", value: "2m ago", color: "text-slate-400" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">External Data Integrations</h1>
        <p className="text-slate-400">Connect to external data sources to enrich GRC capabilities</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {integrationStats.map((stat, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="threat" className="data-[state=active]:bg-indigo-600">
            <Shield className="h-4 w-4 mr-2" />
            Threat Intelligence
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="data-[state=active]:bg-indigo-600">
            <FileText className="h-4 w-4 mr-2" />
            Regulatory Monitoring
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-indigo-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Financial Data
          </TabsTrigger>
          <TabsTrigger value="hr" className="data-[state=active]:bg-indigo-600">
            <Users className="h-4 w-4 mr-2" />
            HR Systems
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threat" className="mt-6">
          <ThreatIntelligenceIntegration />
        </TabsContent>

        <TabsContent value="regulatory" className="mt-6">
          <RegulatoryMonitoring />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <FinancialDataIntegration />
        </TabsContent>

        <TabsContent value="hr" className="mt-6">
          <HRSystemIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}