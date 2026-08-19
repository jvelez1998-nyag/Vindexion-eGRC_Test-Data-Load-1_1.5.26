import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, Network, TrendingUp, FileText, AlertTriangle } from "lucide-react";
import AutomatedFrameworkMapper from "./AutomatedFrameworkMapper.jsx";
import RealTimeComplianceMonitor from "./RealTimeComplianceMonitor.jsx";
import ComplianceReportGenerator from "./ComplianceReportGenerator.jsx";
import ComplianceRiskIntegration from "./ComplianceRiskIntegration.jsx";

export default function ComplianceAutomationEngine() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: controls = [] } = useQuery({
    queryKey: ['controls', refreshKey],
    queryFn: () => base44.entities.Control.list('-updated_date', 200),
    staleTime: 60000
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance', refreshKey],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 200),
    staleTime: 60000
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks', refreshKey],
    queryFn: () => base44.entities.Risk.list('-updated_date', 200),
    staleTime: 60000
  });

  const { data: securityEvents = [] } = useQuery({
    queryKey: ['security-events', refreshKey],
    queryFn: () => base44.entities.SecurityEvent.list('-created_date', 100),
    staleTime: 30000
  });

  // Calculate automation metrics
  const mappedControls = controls.filter(c => 
    c.framework_mappings && Object.keys(c.framework_mappings).length > 0
  ).length;
  const mappingCoverage = controls.length ? Math.round((mappedControls / controls.length) * 100) : 0;

  const activeMonitoring = controls.filter(c => 
    c.status === 'effective' || c.status === 'implemented'
  ).length;

  const complianceGaps = compliance.filter(c => 
    c.status === 'not_started' || c.status === 'non_compliant'
  ).length;

  const avgComplianceScore = compliance.length ? 
    Math.round((compliance.filter(c => c.status === 'verified' || c.status === 'implemented').length / compliance.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Mapping Coverage</p>
                <p className="text-2xl font-bold text-indigo-400">{mappingCoverage}%</p>
              </div>
              <Network className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active Monitoring</p>
                <p className="text-2xl font-bold text-emerald-400">{activeMonitoring}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Gaps Identified</p>
                <p className="text-2xl font-bold text-amber-400">{complianceGaps}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Compliance Score</p>
                <p className="text-2xl font-bold text-blue-400">{avgComplianceScore}%</p>
              </div>
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="mapping" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="mapping">
            <Network className="h-4 w-4 mr-2" />
            Framework Mapping
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <TrendingUp className="h-4 w-4 mr-2" />
            Real-Time Monitoring
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Automated Reports
          </TabsTrigger>
          <TabsTrigger value="risk-integration">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mapping">
          <AutomatedFrameworkMapper 
            controls={controls}
            compliance={compliance}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </TabsContent>

        <TabsContent value="monitoring">
          <RealTimeComplianceMonitor 
            controls={controls}
            compliance={compliance}
            securityEvents={securityEvents}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ComplianceReportGenerator 
            controls={controls}
            compliance={compliance}
            risks={risks}
          />
        </TabsContent>

        <TabsContent value="risk-integration">
          <ComplianceRiskIntegration 
            compliance={compliance}
            risks={risks}
            controls={controls}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}