import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck, AlertTriangle, TrendingUp, CheckCircle2, XCircle, Loader2, Brain } from "lucide-react";
import FrameworkMapper from "@/components/frameworks/FrameworkMapper";
import ComplianceGapAnalysis from "@/components/frameworks/ComplianceGapAnalysis";
import FrameworkStatusReport from "@/components/frameworks/FrameworkStatusReport";
import AIControlSuggestions from "@/components/frameworks/AIControlSuggestions";
import ComplianceFrameworkAIInsightsPanel from "@/components/frameworks/ComplianceFrameworkAIInsightsPanel";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

const frameworks = [
  { id: "ISO27001", name: "ISO 27001", description: "Information Security Management", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "NIST", name: "NIST CSF", description: "Cybersecurity Framework", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "SOC2", name: "SOC 2", description: "Service Organization Controls", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "PCI-DSS", name: "PCI-DSS", description: "Payment Card Security", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: "HIPAA", name: "HIPAA", description: "Healthcare Privacy", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { id: "GDPR", name: "GDPR", description: "Data Protection", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" }
];

export default function ComplianceFrameworks() {
  const [selectedFramework, setSelectedFramework] = useState("ISO27001");
  const [activeTab, setActiveTab] = useState("overview");

  const queryClient = useQueryClient();

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list();
      return data || [];
    }
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list();
      return data || [];
    }
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list();
      return data || [];
    }
  });

  const { data: mappings = [] } = useQuery({
    queryKey: ['framework-mappings'],
    queryFn: async () => {
      const data = await base44.entities.FrameworkMapping.list();
      return data || [];
    }
  });

  const selectedFrameworkData = frameworks.find(f => f.id === selectedFramework);

  // Calculate compliance stats
  const mappedControls = controls.filter(c => c.framework_mappings?.[selectedFramework]?.length > 0);
  const effectiveControls = mappedControls.filter(c => c.status === 'effective');
  const compliancePercentage = mappedControls.length > 0 ? Math.round((effectiveControls.length / mappedControls.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f1623] p-6">
      <FloatingChatbot context="compliance" contextData={{ framework: selectedFramework, controls, risks }} />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-indigo-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Shield className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Compliance Framework Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">Map controls, identify gaps, and track compliance across frameworks</p>
          </div>
        </div>

        {/* Framework Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {frameworks.map(fw => (
            <Card
              key={fw.id}
              className={`cursor-pointer transition-all ${
                selectedFramework === fw.id 
                  ? `border-2 ${fw.color}` 
                  : 'bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558]'
              }`}
              onClick={() => setSelectedFramework(fw.id)}
            >
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-white text-sm mb-1">{fw.name}</h3>
                <p className="text-xs text-slate-400">{fw.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {compliancePercentage}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{mappedControls.length}</div>
              <div className="text-xs text-slate-400">Mapped Controls</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Effective
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{effectiveControls.length}</div>
              <div className="text-xs text-slate-400">Compliant Controls</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  Gaps
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">
                {mappedControls.length - effectiveControls.length}
              </div>
              <div className="text-xs text-slate-400">Control Gaps</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Score
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{compliancePercentage}%</div>
              <div className="text-xs text-slate-400">Compliance Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="overview">
              <FileCheck className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="mapper">
              <Shield className="h-4 w-4 mr-2" />
              Control Mapping
            </TabsTrigger>
            <TabsTrigger value="gaps">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger value="ai-suggestions">
              <Brain className="h-4 w-4 mr-2" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="report">
              <FileCheck className="h-4 w-4 mr-2" />
              Status Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ComplianceFrameworkAIInsightsPanel 
              compliance={compliance}
              controls={controls}
              mappings={mappings}
              risks={risks}
            />
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  {selectedFrameworkData.name} - {selectedFrameworkData.description}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white">Framework Details</h4>
                    <p className="text-sm text-slate-400">
                      {selectedFramework === "ISO27001" && "ISO/IEC 27001 is an international standard for information security management systems (ISMS). It provides requirements for establishing, implementing, maintaining and continually improving an ISMS."}
                      {selectedFramework === "NIST" && "The NIST Cybersecurity Framework provides guidance to help organizations assess and improve their ability to prevent, detect, and respond to cyber attacks."}
                      {selectedFramework === "SOC2" && "SOC 2 is an auditing procedure that ensures service providers securely manage data to protect the interests of the organization and the privacy of its clients."}
                      {selectedFramework === "PCI-DSS" && "Payment Card Industry Data Security Standard is an information security standard for organizations that handle credit cards from major card schemes."}
                      {selectedFramework === "HIPAA" && "Health Insurance Portability and Accountability Act sets the standard for protecting sensitive patient health information."}
                      {selectedFramework === "GDPR" && "General Data Protection Regulation is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white">Key Requirements</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      {selectedFramework === "ISO27001" && (
                        <>
                          <li>• Risk assessment and treatment</li>
                          <li>• Information security policies</li>
                          <li>• Asset management</li>
                          <li>• Access control</li>
                          <li>• Incident management</li>
                        </>
                      )}
                      {selectedFramework === "NIST" && (
                        <>
                          <li>• Identify assets and risks</li>
                          <li>• Protect critical infrastructure</li>
                          <li>• Detect cybersecurity events</li>
                          <li>• Respond to incidents</li>
                          <li>• Recover from events</li>
                        </>
                      )}
                      {selectedFramework === "SOC2" && (
                        <>
                          <li>• Security controls</li>
                          <li>• Availability assurance</li>
                          <li>• Processing integrity</li>
                          <li>• Confidentiality measures</li>
                          <li>• Privacy protection</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setActiveTab("mapper")} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/20">
                    <Shield className="h-4 w-4 mr-2" />
                    Start Mapping
                  </Button>
                  <Button onClick={() => setActiveTab("gaps")} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Analyze Gaps
                  </Button>
                  <Button onClick={() => setActiveTab("ai-suggestions")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapper">
            <FrameworkMapper framework={selectedFramework} controls={controls} />
          </TabsContent>

          <TabsContent value="gaps">
            <ComplianceGapAnalysis framework={selectedFramework} controls={controls} risks={risks} />
          </TabsContent>

          <TabsContent value="ai-suggestions">
            <AIControlSuggestions framework={selectedFramework} controls={controls} />
          </TabsContent>

          <TabsContent value="report">
            <FrameworkStatusReport framework={selectedFramework} controls={controls} risks={risks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}