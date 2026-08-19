import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  FileText, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Upload,
  Loader2,
  Sparkles,
  Target
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIControlTestingEngine({ controls = [] }) {
  const [selectedControl, setSelectedControl] = useState("");
  const [testEvidence, setTestEvidence] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedProcedure, setGeneratedProcedure] = useState(null);
  const [optimizationRecs, setOptimizationRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const control = controls.find(c => c.id === selectedControl);

  const analyzeEvidenceMutation = useMutation({
    mutationFn: async ({ controlData, evidence, files }) => {
      setLoading(true);
      
      const prompt = `You are an expert GRC auditor analyzing control effectiveness evidence.

CONTROL INFORMATION:
- Name: ${controlData.name}
- Objective: ${controlData.control_objective || "Not specified"}
- Type: ${controlData.category || "Not specified"}
- Description: ${controlData.description || "Not specified"}

EVIDENCE PROVIDED:
${evidence}

${files.length > 0 ? `UPLOADED FILES: ${files.map(f => f.name).join(", ")}` : ""}

TASK:
Analyze the provided evidence and determine:
1. Control Effectiveness Rating (1-5 scale where 5 is highly effective)
2. Key Findings (both positive and negative)
3. Gaps or Deficiencies identified
4. Testing Coverage Assessment
5. Compliance Status
6. Specific Recommendations for improvement

Provide your analysis in a structured format with clear sections.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        file_urls: files.map(f => f.url)
      });

      return response;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setLoading(false);
      toast.success("Evidence analysis complete");
    },
    onError: () => {
      setLoading(false);
      toast.error("Analysis failed");
    }
  });

  const generateTestProcedureMutation = useMutation({
    mutationFn: async (controlData) => {
      setLoading(true);
      
      const prompt = `You are an expert control testing specialist. Generate a comprehensive test procedure.

CONTROL INFORMATION:
- Name: ${controlData.name}
- Objective: ${controlData.control_objective || "Not specified"}
- Type: ${controlData.category || "Not specified"}
- Frequency: ${controlData.frequency || "Not specified"}
- Description: ${controlData.description || "Not specified"}

TASK:
Generate a detailed, step-by-step test procedure that includes:

1. **Test Scope & Objectives**
   - What will be tested
   - Expected outcomes

2. **Prerequisites**
   - Required access/permissions
   - Tools needed
   - Documentation required

3. **Step-by-Step Test Procedure**
   - Detailed numbered steps
   - What to verify at each step
   - Expected results

4. **Evidence Collection Requirements**
   - What evidence to collect
   - How to document findings
   - Screenshots/logs needed

5. **Pass/Fail Criteria**
   - Clear criteria for effectiveness
   - Threshold metrics
   - Exception handling

6. **Sample Test Scripts** (if applicable)
   - Command-line scripts
   - SQL queries
   - API calls

Make it practical, actionable, and audit-ready.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedProcedure(data);
      setLoading(false);
      toast.success("Test procedure generated");
    },
    onError: () => {
      setLoading(false);
      toast.error("Generation failed");
    }
  });

  const generateOptimizationMutation = useMutation({
    mutationFn: async ({ controlData, performanceData }) => {
      setLoading(true);
      
      const prompt = `You are an expert in control optimization and threat intelligence. Analyze this control and provide strategic recommendations.

CONTROL INFORMATION:
- Name: ${controlData.name}
- Type: ${controlData.category || "Not specified"}
- Current Effectiveness: ${controlData.effectiveness || "Not assessed"}/100
- Implementation Status: ${controlData.implementation_status || "Not specified"}
- Last Tested: ${controlData.last_tested_date || "Never"}
- Description: ${controlData.description || "Not specified"}

PERFORMANCE DATA:
${performanceData}

TASK:
Provide a comprehensive optimization analysis including:

1. **Current State Assessment**
   - Strengths of current control
   - Weaknesses and gaps
   - Performance vs. industry benchmarks

2. **Threat Landscape Analysis**
   - Emerging threats this control addresses
   - Threat trends relevant to this control
   - Risk exposure if control fails

3. **Optimization Recommendations**
   - Quick wins (immediate improvements)
   - Medium-term enhancements
   - Strategic long-term upgrades

4. **Technology & Automation Opportunities**
   - Tools that could enhance effectiveness
   - Automation possibilities
   - Integration opportunities

5. **Alternative Control Considerations**
   - Should this control be replaced?
   - Compensating controls to consider
   - Cost-benefit analysis

6. **Implementation Roadmap**
   - Prioritized action items
   - Resource requirements
   - Timeline estimates

Consider current cybersecurity trends, regulatory requirements, and best practices.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      return response;
    },
    onSuccess: (data) => {
      setOptimizationRecs(data);
      setLoading(false);
      toast.success("Optimization analysis complete");
    },
    onError: () => {
      setLoading(false);
      toast.error("Analysis failed");
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push({ name: file.name, url: file_url });
      }
      setUploadedFiles([...uploadedFiles, ...uploaded]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const createTestRecordMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlTest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['control-tests']);
      toast.success("Test record created");
    }
  });

  const handleSaveTestResult = () => {
    if (!selectedControl || !analysisResult) return;

    const effectivenessMatch = analysisResult.match(/effectiveness.*?([1-5])/i);
    const effectiveness = effectivenessMatch ? parseInt(effectivenessMatch[1]) : 3;

    createTestRecordMutation.mutate({
      control_id: selectedControl,
      test_date: new Date().toISOString().split('T')[0],
      test_type: "operating_effectiveness",
      tester: "AI Analysis Engine",
      methodology: "AI-powered evidence analysis",
      test_results: analysisResult,
      evidence_collected: testEvidence,
      effectiveness_rating: effectiveness,
      issues_identified: analysisResult.includes("gap") || analysisResult.includes("deficiency"),
      test_conclusion: effectiveness >= 4 ? "passed" : effectiveness >= 3 ? "passed_with_exceptions" : "failed"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Control Testing Engine
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Automated evidence analysis, test generation, and optimization recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Select Control</label>
              <Select value={selectedControl} onValueChange={setSelectedControl}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Choose a control to test..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {controls.map(control => (
                    <SelectItem key={control.id} value={control.id} className="text-white">
                      {control.name || control.control_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {control && (
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">{control.name}</h4>
                  <p className="text-xs text-slate-400 mb-2">{control.description}</p>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400">
                      {control.category}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      {control.implementation_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedControl && (
        <Tabs defaultValue="analyze" className="space-y-4">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="analyze">
              <Brain className="h-4 w-4 mr-2" />
              Analyze Evidence
            </TabsTrigger>
            <TabsTrigger value="generate">
              <FileText className="h-4 w-4 mr-2" />
              Generate Procedure
            </TabsTrigger>
            <TabsTrigger value="optimize">
              <TrendingUp className="h-4 w-4 mr-2" />
              Optimize Control
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Evidence Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Paste Evidence (logs, configs, docs)</label>
                  <Textarea
                    value={testEvidence}
                    onChange={(e) => setTestEvidence(e.target.value)}
                    placeholder="Paste test evidence here: system logs, configuration files, policy documents, screenshots descriptions, etc."
                    className="bg-[#151d2e] border-[#2a3548] text-white min-h-[200px]"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Upload Evidence Files</label>
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".txt,.pdf,.jpg,.jpeg,.png,.csv,.xlsx,.docx"
                      />
                      <Button variant="outline" className="border-[#2a3548]" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </span>
                      </Button>
                    </label>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => analyzeEvidenceMutation.mutate({
                    controlData: control,
                    evidence: testEvidence,
                    files: uploadedFiles
                  })}
                  disabled={!testEvidence && uploadedFiles.length === 0 || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Brain className="h-4 w-4 mr-2" /> Analyze Evidence with AI</>
                  )}
                </Button>

                {analysisResult && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          AI Analysis Results
                        </CardTitle>
                        <Button
                          onClick={handleSaveTestResult}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Save Test Record
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-slate-300">
                          {analysisResult}
                        </ReactMarkdown>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Generate Test Procedure</CardTitle>
                <p className="text-xs text-slate-400">AI will create a detailed testing procedure for this control</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => generateTestProcedureMutation.mutate(control)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><FileText className="h-4 w-4 mr-2" /> Generate Test Procedure</>
                  )}
                </Button>

                {generatedProcedure && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        Generated Test Procedure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-slate-300">
                          {generatedProcedure}
                        </ReactMarkdown>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Control Optimization Analysis</CardTitle>
                <p className="text-xs text-slate-400">
                  AI-driven recommendations based on performance, threats, and best practices
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Performance Data (optional)
                  </label>
                  <Textarea
                    placeholder="Add any performance metrics, test history, incident data, or other context..."
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={4}
                    id="perfData"
                  />
                </div>

                <Button
                  onClick={() => {
                    const perfData = document.getElementById('perfData').value;
                    generateOptimizationMutation.mutate({
                      controlData: control,
                      performanceData: perfData || "No additional performance data provided"
                    });
                  }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><TrendingUp className="h-4 w-4 mr-2" /> Generate Optimization Recommendations</>
                  )}
                </Button>

                {optimizationRecs && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        Optimization Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-slate-300">
                          {optimizationRecs}
                        </ReactMarkdown>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}