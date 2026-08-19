import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BookOpen, Target, Workflow, AlertTriangle, Brain, ListChecks, Building2, BarChart3, HelpCircle, Zap, TrendingDown, Activity, Sparkles, FileCheck, TrendingUp, GitBranch } from "lucide-react";
import VendorAssessmentBuilder from "@/components/vendors/VendorAssessmentBuilder";
import VendorRiskSimulator from "@/components/vendors/VendorRiskSimulator";
import VendorRiskLibrary from "@/components/vendors/VendorRiskLibrary";
import VendorRiskStudyGuide from "@/components/vendors/VendorRiskStudyGuide";
import VendorWorkflowEngine from "@/components/vendors/VendorWorkflowEngine";
import VendorRisksControls from "@/components/vendors/VendorRisksControls";
import VendorRiskPrioritization from "@/components/vendors/VendorRiskPrioritization";
import VendorDashboard from "@/components/vendors/VendorDashboard";
import VendorRiskAutomation from "@/components/vendors/VendorRiskAutomation";
import VendorRiskUserGuide from "@/components/vendors/VendorRiskUserGuide";
import VendorAIInsightsPanel from "@/components/vendors/VendorAIInsightsPanel";
import AIVendorRiskScoring from "@/components/vendors/AIVendorRiskScoring";
import AIVendorFailurePrediction from "@/components/vendors/AIVendorFailurePrediction";
import AIVendorMitigationEngine from "@/components/vendors/AIVendorMitigationEngine";
import AIContinuousMonitoring from "@/components/vendors/AIContinuousMonitoring";
import AIVendorRiskIntelligence from "@/components/vendors/AIVendorRiskIntelligence";
import AIVendorRiskAssessment from "@/components/vendors/AIVendorRiskAssessment";
import AIComplianceAnalyzer from "@/components/vendors/AIComplianceAnalyzer";
import AutomatedDueDiligenceReport from "@/components/vendors/AutomatedDueDiligenceReport";
import AIVendorWorkflowAutomation from "@/components/vendors/AIVendorWorkflowAutomation";
import AITaskAssignmentEngine from "@/components/vendors/AITaskAssignmentEngine";
import VendorProgressTracker from "@/components/vendors/VendorProgressTracker";
import VendorAuditModule from "@/components/vendors/VendorAuditModule";
import AIVendorOnboardingAssistant from "@/components/vendors/AIVendorOnboardingAssistant";
import VendorPerformanceModule from "@/components/vendors/VendorPerformanceModule";
import AIVendorRiskCorrelationEngine from "@/components/vendors/AIVendorRiskCorrelationEngine";

export default function ThirdPartyRiskManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [complianceAnalysis, setComplianceAnalysis] = useState(null);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const data = await base44.entities.Vendor.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: async () => {
      const data = await base44.entities.VendorAssessment.list('-created_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-indigo-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>
        <VendorRiskAutomation />
        
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Shield className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-blue-300 bg-clip-text text-transparent">
              Third-Party Risk Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">Comprehensive vendor lifecycle and risk assessment</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto scrollbar-thin">
            <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1">
            {/* Dashboard & Overview */}
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
              <Shield className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            
            {/* Core Vendor Management */}
            <TabsTrigger value="builder" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">
              <ListChecks className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">
              <Workflow className="h-4 w-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="ai_workflows" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30">
              <Zap className="h-4 w-4 mr-2" />
              AI Workflows
            </TabsTrigger>
            <TabsTrigger value="ai_audit" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
              <FileCheck className="h-4 w-4 mr-2" />
              AI Audits
            </TabsTrigger>
            <TabsTrigger value="ai_onboarding" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Onboarding
            </TabsTrigger>
            <TabsTrigger value="ai_performance" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">
              <TrendingUp className="h-4 w-4 mr-2" />
              AI Performance
            </TabsTrigger>
            <TabsTrigger value="ai_correlation" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300 data-[state=active]:border data-[state=active]:border-pink-500/30">
              <GitBranch className="h-4 w-4 mr-2" />
              AI Correlation
            </TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risks & Controls
            </TabsTrigger>
            
            {/* AI & Intelligence */}
            <TabsTrigger value="ai_intelligence" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30">
              <Brain className="h-4 w-4 mr-2" />
              AI Intelligence
            </TabsTrigger>
            <TabsTrigger value="ai_assessment" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
              <Shield className="h-4 w-4 mr-2" />
              AI Assessment
            </TabsTrigger>
            <TabsTrigger value="ai_scoring" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30">
              <Zap className="h-4 w-4 mr-2" />
              AI Scoring
            </TabsTrigger>
            <TabsTrigger value="ai_prediction" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 data-[state=active]:border data-[state=active]:border-rose-500/30">
              <TrendingDown className="h-4 w-4 mr-2" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="ai_mitigation" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">
              <Shield className="h-4 w-4 mr-2" />
              AI Mitigation
            </TabsTrigger>
            <TabsTrigger value="ai_monitoring" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">
              <Activity className="h-4 w-4 mr-2" />
              AI Monitoring
            </TabsTrigger>
            
            {/* Learning & Resources */}
            <TabsTrigger value="simulator" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">
              <Brain className="h-4 w-4 mr-2" />
              Simulator
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30">
              <BookOpen className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="study" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300 data-[state=active]:border data-[state=active]:border-pink-500/30">
              <Target className="h-4 w-4 mr-2" />
              Study Guide
            </TabsTrigger>
            <TabsTrigger value="guide" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
              <HelpCircle className="h-4 w-4 mr-2" />
              User Guide
            </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
          <VendorAIInsightsPanel 
            vendors={vendors}
            assessments={assessments}
            controls={controls}
            risks={risks}
          />
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500/10 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-white" />
                  Assessment Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">Create custom vendor assessments with AI-powered questionnaires</p>
                <Button onClick={() => setActiveTab("builder")} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                  Start Building
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-blue-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-white" />
                  Risk Simulator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">Practice vendor risk scenarios with AI-driven simulations</p>
                <Button onClick={() => setActiveTab("simulator")} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg">
                  Launch Simulator
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-teal-500/10 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-white" />
                  Risk Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">Access comprehensive vendor risk frameworks and best practices</p>
                <Button onClick={() => setActiveTab("library")} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg">
                  Browse Library
                </Button>
              </CardContent>
            </Card>
          </div>

          <VendorRiskPrioritization />
        </TabsContent>

        <TabsContent value="dashboard">
          <VendorDashboard />
        </TabsContent>

        <TabsContent value="builder">
          <VendorAssessmentBuilder />
        </TabsContent>

        <TabsContent value="simulator">
          <VendorRiskSimulator />
        </TabsContent>

        <TabsContent value="library">
          <VendorRiskLibrary />
        </TabsContent>

        <TabsContent value="study">
          <VendorRiskStudyGuide />
        </TabsContent>

        <TabsContent value="workflow">
          <VendorWorkflowEngine />
        </TabsContent>

        <TabsContent value="risks">
          <VendorRisksControls />
        </TabsContent>

        <TabsContent value="ai_scoring">
          <AIVendorRiskScoring />
        </TabsContent>

        <TabsContent value="ai_prediction">
          <AIVendorFailurePrediction />
        </TabsContent>

        <TabsContent value="ai_mitigation">
          <AIVendorMitigationEngine />
        </TabsContent>

        <TabsContent value="ai_monitoring">
          <AIContinuousMonitoring />
        </TabsContent>

        <TabsContent value="ai_intelligence">
          <AIVendorRiskIntelligence />
        </TabsContent>

        <TabsContent value="ai_workflows" className="space-y-6">
          <AIVendorWorkflowAutomation />
          
          {selectedVendor && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AITaskAssignmentEngine vendor={selectedVendor} />
              <VendorProgressTracker vendor={selectedVendor} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai_audit">
          <VendorAuditModule />
        </TabsContent>

        <TabsContent value="ai_onboarding">
          <AIVendorOnboardingAssistant onComplete={(vendorId) => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            setActiveTab('overview');
            toast.success("Vendor onboarding initiated successfully");
          }} />
        </TabsContent>

        <TabsContent value="ai_performance">
          <VendorPerformanceModule />
        </TabsContent>

        <TabsContent value="ai_correlation">
          {selectedVendor ? (
            <AIVendorRiskCorrelationEngine vendor={selectedVendor} />
          ) : (
            <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
              <GitBranch className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Correlation Analysis</h3>
              <p className="text-slate-400">Select a vendor from the dashboard to run correlation analysis</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai_assessment" className="space-y-6">
          {vendors.length === 0 ? (
            <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
              <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">No Vendors</h3>
              <p className="text-slate-400 text-sm">Add vendors to perform AI-powered assessments</p>
            </Card>
          ) : (
            <>
              {/* Vendor Selection */}
              <Card className="bg-[#1a2332] border-[#2a3548] p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Select Vendor for Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {vendors.slice(0, 6).map(vendor => (
                    <Button
                      key={vendor.id}
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setRiskAssessment(null);
                        setComplianceAnalysis(null);
                      }}
                      variant={selectedVendor?.id === vendor.id ? "default" : "outline"}
                      className={selectedVendor?.id === vendor.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg" : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 border-slate-500/30"}
                    >
                      {vendor.name}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Assessment Components */}
              {selectedVendor && (
                <>
                  <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-indigo-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{selectedVendor.name}</h3>
                        <p className="text-xs text-slate-400">{selectedVendor.vendor_category} • {selectedVendor.tier} Tier</p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <AIVendorRiskAssessment 
                        vendor={selectedVendor}
                      />
                      <AIComplianceAnalyzer 
                        vendor={selectedVendor}
                      />
                    </div>
                    <AutomatedDueDiligenceReport
                      vendor={selectedVendor}
                      riskAssessment={riskAssessment}
                      complianceAnalysis={complianceAnalysis}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

          <TabsContent value="guide">
            <VendorRiskUserGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}