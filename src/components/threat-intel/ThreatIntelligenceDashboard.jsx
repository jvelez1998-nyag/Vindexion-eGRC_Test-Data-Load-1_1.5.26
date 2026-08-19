import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, Target, Zap, RefreshCw } from "lucide-react";
import ThreatIntelligenceFeed from "./ThreatIntelligenceFeed";
import ThreatCorrelationEngine from "./ThreatCorrelationEngine";
import AIThreatRiskSuggester from "./AIThreatRiskSuggester";
import LiveThreatFeed from "./LiveThreatFeed";

export default function ThreatIntelligenceDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: risks = [] } = useQuery({
    queryKey: ['risks', refreshKey],
    queryFn: () => base44.entities.Risk.list('-updated_date', 200),
    staleTime: 60000
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls', refreshKey],
    queryFn: () => base44.entities.Control.list('-updated_date', 200),
    staleTime: 60000
  });

  const { data: securityEvents = [] } = useQuery({
    queryKey: ['security-events', refreshKey],
    queryFn: () => base44.entities.SecurityEvent.list('-created_date', 100),
    staleTime: 30000
  });

  // Simulated threat data - in production, this would come from real threat intelligence APIs
  const [threatData] = useState({
    cves: [
      {
        id: 'CVE-2024-12001',
        severity: 'critical',
        score: 9.8,
        title: 'Critical Remote Code Execution in Web Servers',
        description: 'A critical vulnerability allowing remote code execution through specially crafted HTTP requests',
        published: '2024-12-20',
        affectedSystems: ['Apache HTTP Server', 'Nginx'],
        mitigations: ['Apply security patch', 'Implement WAF rules', 'Network segmentation']
      },
      {
        id: 'CVE-2024-11985',
        severity: 'high',
        score: 8.4,
        title: 'Authentication Bypass in Enterprise SSO',
        description: 'Authentication bypass vulnerability in widely-used SSO implementations',
        published: '2024-12-18',
        affectedSystems: ['Enterprise SSO Solutions'],
        mitigations: ['Update to latest version', 'Enable MFA', 'Monitor authentication logs']
      },
      {
        id: 'CVE-2024-11920',
        severity: 'high',
        score: 7.9,
        title: 'SQL Injection in Database Management Tools',
        description: 'SQL injection vulnerability affecting database administration interfaces',
        published: '2024-12-15',
        affectedSystems: ['Database Admin Tools'],
        mitigations: ['Input validation', 'Parameterized queries', 'Access restrictions']
      }
    ],
    ttps: [
      {
        id: 'T1566.001',
        tactic: 'Initial Access',
        technique: 'Phishing: Spearphishing Attachment',
        trend: 'increasing',
        description: 'Attackers using sophisticated spearphishing with malicious attachments',
        detection: 'Email security, User training, Endpoint protection',
        mitigation: 'Anti-phishing training, Email filtering, Attachment sandboxing'
      },
      {
        id: 'T1190',
        tactic: 'Initial Access',
        technique: 'Exploit Public-Facing Application',
        trend: 'critical',
        description: 'Exploitation of vulnerabilities in internet-facing applications',
        detection: 'WAF logs, IDS/IPS, Vulnerability scanning',
        mitigation: 'Patch management, WAF deployment, Regular security assessments'
      },
      {
        id: 'T1078',
        tactic: 'Defense Evasion',
        technique: 'Valid Accounts',
        trend: 'increasing',
        description: 'Use of compromised credentials to maintain persistence',
        detection: 'Anomalous login patterns, MFA monitoring, SIEM alerts',
        mitigation: 'Strong password policies, MFA enforcement, Account monitoring'
      }
    ],
    threatActors: [
      {
        name: 'APT29 (Cozy Bear)',
        activity: 'active',
        targets: ['Government', 'Healthcare', 'Technology'],
        methods: ['Spearphishing', 'Supply chain attacks', 'Cloud exploitation'],
        recentActivity: 'Targeting cloud infrastructure and SaaS applications'
      },
      {
        name: 'Lazarus Group',
        activity: 'active',
        targets: ['Financial', 'Cryptocurrency', 'Defense'],
        methods: ['Ransomware', 'Social engineering', 'Zero-day exploits'],
        recentActivity: 'Cryptocurrency theft and ransomware campaigns'
      }
    ]
  });

  const criticalThreats = threatData.cves.filter(c => c.severity === 'critical').length;
  const highThreats = threatData.cves.filter(c => c.severity === 'high').length;
  const activeTTPs = threatData.ttps.filter(t => t.trend === 'critical' || t.trend === 'increasing').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Critical CVEs</p>
                <p className="text-2xl font-bold text-red-400">{criticalThreats}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">High Severity</p>
                <p className="text-2xl font-bold text-amber-400">{highThreats}</p>
              </div>
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active TTPs</p>
                <p className="text-2xl font-bold text-purple-400">{activeTTPs}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Threat Actors</p>
                <p className="text-2xl font-bold text-blue-400">{threatData.threatActors.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setRefreshKey(k => k + 1)} 
          variant="outline" 
          className="gap-2 border-indigo-500/30 text-indigo-400"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Intelligence
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="feed">
            <TrendingUp className="h-4 w-4 mr-2" />
            Threat Feed
          </TabsTrigger>
          <TabsTrigger value="correlation">
            <Target className="h-4 w-4 mr-2" />
            Correlation Analysis
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Zap className="h-4 w-4 mr-2" />
            AI Risk Suggestions
          </TabsTrigger>
          <TabsTrigger value="live">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Live Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <ThreatIntelligenceFeed threatData={threatData} />
        </TabsContent>

        <TabsContent value="correlation">
          <ThreatCorrelationEngine 
            threatData={threatData}
            risks={risks}
            controls={controls}
            securityEvents={securityEvents}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <AIThreatRiskSuggester 
            threatData={threatData}
            risks={risks}
            controls={controls}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </TabsContent>

        <TabsContent value="live">
          <LiveThreatFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}