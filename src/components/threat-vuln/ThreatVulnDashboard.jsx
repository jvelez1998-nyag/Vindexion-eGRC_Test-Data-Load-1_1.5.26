import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Rss, BookOpen } from "lucide-react";
import LiveThreatFeed from "./LiveThreatFeed";
import AdvancedThreatVisualizations from "./AdvancedThreatVisualizations";
import ThreatMetricsWidgets from "./ThreatMetricsWidgets";
import ThreatTermsGlossary from "./ThreatTermsGlossary";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, TrendingUp, Clock } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function ThreatVulnDashboard() {
  // Mock data for demo
  const threats = Array.from({ length: 20 }, (_, i) => ({
    name: `Threat-${i + 1}`,
    impact: Math.floor(Math.random() * 10) + 1,
    likelihood: Math.floor(Math.random() * 10) + 1,
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)]
  }));

  const vulnerabilities = Array.from({ length: 50 }, (_, i) => ({
    id: `vuln-${i + 1}`,
    cvss_score: Math.random() * 10,
    status: ['open', 'patched', 'in_progress'][Math.floor(Math.random() * 3)]
  }));

  return (
    <div className="space-y-4">
      {/* Metrics Widgets */}
      <ThreatMetricsWidgets threats={threats} vulnerabilities={vulnerabilities} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
          <TabsTrigger value="feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-rose-400">
            <Rss className="h-4 w-4 mr-2" />
            Live Feed
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="glossary" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-400">
            <BookOpen className="h-4 w-4 mr-2" />
            Glossary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4 space-y-4">
          <AdvancedThreatVisualizations threats={threats} vulnerabilities={vulnerabilities} />
          <LiveThreatFeed />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AdvancedThreatVisualizations threats={threats} vulnerabilities={vulnerabilities} />
        </TabsContent>

        <TabsContent value="glossary" className="mt-4">
          <ThreatTermsGlossary />
        </TabsContent>
      </Tabs>
    </div>
  );
}