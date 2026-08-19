import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Target, Zap, Play } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AIControlTesting({ controls }) {
  const [testing, setTesting] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [improvements, setImprovements] = useState(null);

  const queryClient = useQueryClient();

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list('-test_date')
  });

  const createTestMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlTest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-tests'] });
    }
  });

  const runAutomatedTest = async (control) => {
    setTesting(true);
    setSelectedControl(control);
    try {
      const prompt = `You are an expert control testing automation system. Simulate automated testing of this control.

CONTROL DETAILS:
Name: ${control.name}
Category: ${control.category}
Domain: ${control.domain}
Description: ${control.description || 'No description'}
Procedures: ${control.control_procedures || 'Not specified'}
Current Effectiveness: ${control.effectiveness || 0}/5

Simulate an automated control test:

1. **Sample Selection**: Generate realistic sample size based on control frequency and risk
2. **Evidence Analysis**: Simulate checking digital evidence (logs, configurations, approvals, etc.)
3. **Test Results**: Determine pass/fail for each sample based on control procedures
4. **Design Assessment**: Evaluate if control is designed appropriately (0-100 score)
5. **Operating Effectiveness**: Evaluate if control operates as designed (0-100 score)
6. **Failure Analysis**: If failures exist, identify specific reasons
7. **Recommendations**: Provide specific, actionable improvement recommendations

Be realistic - controls rarely achieve 100%. Common issues include:
- Missing documentation
- Approval delays
- Incomplete evidence
- Configuration drift
- Human error in manual steps

Return detailed test results.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sample_size: { type: "number" },
            passed_items: { type: "number" },
            failed_items: { type: "number" },
            test_result: { type: "string" },
            design_rating: { type: "number" },
            operating_rating: { type: "number" },
            failure_reasons: { type: "array", items: { type: "string" } },
            evidence_samples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sample_id: { type: "string" },
                  description: { type: "string" },
                  result: { type: "string" },
                  issue: { type: "string" }
                }
              }
            },
            design_assessment: {
              type: "object",
              properties: {
                score: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } }
              }
            },
            operating_assessment: {
              type: "object",
              properties: {
                score: { type: "number" },
                consistency: { type: "string" },
                reliability: { type: "string" },
                issues: { type: "array", items: { type: "string" } }
              }
            },
            ai_assessment: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string" },
                  recommendation: { type: "string" },
                  expected_impact: { type: "string" },
                  effort: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save test results
      await createTestMutation.mutateAsync({
        control_id: control.id,
        test_date: new Date().toISOString().split('T')[0],
        test_type: 'both',
        test_method: 'automated',
        sample_size: response.sample_size,
        passed_items: response.passed_items,
        failed_items: response.failed_items,
        test_result: response.test_result,
        design_rating: response.design_rating,
        operating_rating: response.operating_rating,
        failure_reasons: response.failure_reasons,
        evidence_samples: response.evidence_samples,
        ai_assessment: response.ai_assessment,
        recommendations: response.recommendations?.map(r => r.recommendation),
        tester: 'AI Automation'
      });

      setTestResults(response);
      toast.success("Automated test completed");
    } catch (error) {
      console.error(error);
      toast.error("Test failed");
    } finally {
      setTesting(false);
    }
  };

  const analyzeRecurringFailures = async () => {
    setAnalyzing(true);
    try {
      const failedTests = controlTests.filter(t => t.test_result === 'failed' || t.test_result === 'passed_with_exceptions');
      
      // Group by control
      const testsByControl = {};
      failedTests.forEach(test => {
        if (!testsByControl[test.control_id]) {
          testsByControl[test.control_id] = [];
        }
        testsByControl[test.control_id].push(test);
      });

      // Find recurring failures
      const recurringIssues = Object.entries(testsByControl)
        .filter(([_, tests]) => tests.length >= 2)
        .map(([controlId, tests]) => {
          const control = controls.find(c => c.id === controlId);
          const allReasons = tests.flatMap(t => t.failure_reasons || []);
          const reasonCounts = {};
          allReasons.forEach(r => {
            reasonCounts[r] = (reasonCounts[r] || 0) + 1;
          });
          return {
            control,
            test_count: tests.length,
            failure_reasons: reasonCounts,
            avg_design_rating: tests.reduce((sum, t) => sum + (t.design_rating || 0), 0) / tests.length,
            avg_operating_rating: tests.reduce((sum, t) => sum + (t.operating_rating || 0), 0) / tests.length
          };
        });

      const prompt = `Analyze recurring control testing failures and provide strategic improvement recommendations.

RECURRING CONTROL FAILURES:
${recurringIssues.map((issue, i) => `
${i + 1}. Control: ${issue.control?.name || 'Unknown'}
   Domain: ${issue.control?.domain}
   Category: ${issue.control?.category}
   Test Count: ${issue.test_count}
   Avg Design Rating: ${Math.round(issue.avg_design_rating)}%
   Avg Operating Rating: ${Math.round(issue.avg_operating_rating)}%
   Recurring Issues: ${Object.entries(issue.failure_reasons).map(([reason, count]) => `${reason} (${count}x)`).join(', ')}
`).join('\n')}

TOTAL TESTS: ${controlTests.length}
FAILED/EXCEPTION TESTS: ${failedTests.length}
UNIQUE CONTROLS WITH ISSUES: ${recurringIssues.length}

Provide:
1. **Root Cause Analysis**: What are the systemic issues causing recurring failures?
2. **Control Redesign Recommendations**: How to fundamentally improve problematic controls
3. **Process Improvements**: What process changes would prevent these failures?
4. **Automation Opportunities**: Where can more automation reduce failures?
5. **Priority Actions**: Immediate steps to address critical recurring issues
6. **Long-term Strategy**: Strategic improvements for control framework

Be specific and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            root_causes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  cause: { type: "string" },
                  affected_controls: { type: "number" },
                  severity: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            control_redesigns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  current_issue: { type: "string" },
                  proposed_design: { type: "string" },
                  expected_improvement: { type: "string" },
                  implementation_effort: { type: "string" }
                }
              }
            },
            process_improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  improvement: { type: "string" },
                  impact: { type: "string" },
                  affected_domains: { type: "array", items: { type: "string" } }
                }
              }
            },
            automation_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  controls_benefited: { type: "number" },
                  automation_approach: { type: "string" },
                  effort: { type: "string" }
                }
              }
            },
            priority_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  expected_outcome: { type: "string" }
                }
              }
            },
            long_term_strategy: { type: "string" }
          }
        }
      });

      setImprovements(response);
      toast.success("Analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI-Powered Control Testing</h2>
              <p className="text-sm text-slate-400">Automated evidence sampling, testing, and improvement recommendations</p>
            </div>
          </div>
          <Button onClick={analyzeRecurringFailures} disabled={analyzing || controlTests.length === 0} variant="outline" className="border-[#2a3548]">
            {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Brain className="h-4 w-4 mr-2" />Analyze Failures</>}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{controlTests.length}</div>
            <div className="text-xs text-slate-500">Total Tests</div>
          </div>
          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {controlTests.filter(t => t.test_result === 'passed').length}
            </div>
            <div className="text-xs text-slate-500">Passed</div>
          </div>
          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-400">
              {controlTests.filter(t => t.test_result === 'passed_with_exceptions').length}
            </div>
            <div className="text-xs text-slate-500">With Exceptions</div>
          </div>
          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
            <div className="text-2xl font-bold text-rose-400">
              {controlTests.filter(t => t.test_result === 'failed').length}
            </div>
            <div className="text-xs text-slate-500">Failed</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="test" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="test">Run Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          {improvements && <TabsTrigger value="improvements">Improvement Feedback</TabsTrigger>}
        </TabsList>

        <TabsContent value="test">
          <div className="space-y-4">
            {testResults ? (
              <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{selectedControl?.name}</h3>
                    <p className="text-sm text-slate-400">{selectedControl?.domain} • {selectedControl?.category}</p>
                  </div>
                  <Button onClick={() => setTestResults(null)} variant="outline" className="border-[#2a3548]">
                    Test Another
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
                    <Badge className={`mb-2 ${testResults.test_result === 'passed' ? 'bg-emerald-500/20 text-emerald-400' : testResults.test_result === 'failed' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {testResults.test_result.replace('_', ' ')}
                    </Badge>
                    <div className="text-xs text-slate-500">Overall Result</div>
                  </div>
                  <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{testResults.design_rating}%</div>
                    <div className="text-xs text-slate-500">Design Effectiveness</div>
                  </div>
                  <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{testResults.operating_rating}%</div>
                    <div className="text-xs text-slate-500">Operating Effectiveness</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Test Summary</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-slate-400">Sample Size:</span>
                    <Badge className="bg-blue-500/10 text-blue-400">{testResults.sample_size} items</Badge>
                  </div>
                  <Progress value={(testResults.passed_items / testResults.sample_size) * 100} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span className="text-emerald-400">{testResults.passed_items} passed</span>
                    <span className="text-rose-400">{testResults.failed_items} failed</span>
                  </div>
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-6 pr-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">AI Assessment</h4>
                      <p className="text-sm text-slate-300 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                        {testResults.ai_assessment}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Design Assessment</h4>
                      <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                        <div className="mb-3">
                          <div className="text-xs text-slate-500 mb-2">Strengths:</div>
                          {testResults.design_assessment?.strengths?.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-emerald-400 mb-1">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {s}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Weaknesses:</div>
                          {testResults.design_assessment?.weaknesses?.map((w, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-rose-400 mb-1">
                              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {w}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Operating Effectiveness Assessment</h4>
                      <Card className="bg-[#151d2e] border-[#2a3548] p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Consistency:</span>
                          <span className="text-white">{testResults.operating_assessment?.consistency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Reliability:</span>
                          <span className="text-white">{testResults.operating_assessment?.reliability}</span>
                        </div>
                        {testResults.operating_assessment?.issues?.length > 0 && (
                          <div className="pt-2 border-t border-[#2a3548]">
                            <div className="text-xs text-slate-500 mb-2">Issues Identified:</div>
                            {testResults.operating_assessment.issues.map((issue, i) => (
                              <div key={i} className="text-sm text-amber-400 mb-1">• {issue}</div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>

                    {testResults.failure_reasons?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-400" />
                          Failure Reasons
                        </h4>
                        <div className="space-y-2">
                          {testResults.failure_reasons.map((reason, i) => (
                            <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded text-sm text-rose-300">
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Recommendations</h4>
                      <div className="space-y-3">
                        {testResults.recommendations?.map((rec, i) => (
                          <Card key={i} className="bg-[#151d2e] border-[#2a3548] p-4">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm text-white flex-1">{rec.recommendation}</span>
                              <Badge className={severityColors[rec.priority?.toLowerCase() || 'medium']}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-500">Impact:</span>
                                <span className="text-slate-300 ml-2">{rec.expected_impact}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Effort:</span>
                                <span className="text-slate-300 ml-2">{rec.effort}</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {testResults.evidence_samples?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Evidence Samples</h4>
                        <div className="space-y-2">
                          {testResults.evidence_samples.map((sample, i) => (
                            <div key={i} className={`p-3 rounded border ${sample.result === 'passed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400">{sample.sample_id}</span>
                                <Badge className={`text-xs ${sample.result === 'passed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {sample.result}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-300">{sample.description}</div>
                              {sample.issue && <div className="text-xs text-rose-400 mt-1">{sample.issue}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {controls.map(control => (
                  <Card key={control.id} className="bg-[#1a2332] border-[#2a3548] p-5 hover:border-indigo-500/30 transition-colors">
                    <div className="mb-3">
                      <h4 className="font-semibold text-white mb-1">{control.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-slate-500/10 text-slate-400">{control.domain}</Badge>
                        <Badge className="text-xs bg-slate-500/10 text-slate-400">{control.category}</Badge>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Current Effectiveness</span>
                        <span>{control.effectiveness || 0}/5</span>
                      </div>
                      <Progress value={((control.effectiveness || 0) / 5) * 100} className="h-1" />
                    </div>
                    <Button
                      onClick={() => runAutomatedTest(control)}
                      disabled={testing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      size="sm"
                    >
                      {testing && selectedControl?.id === control.id ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Testing...</>
                      ) : (
                        <><Play className="h-4 w-4 mr-2" />Run Test</>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <ScrollArea className="h-[700px]">
            <div className="space-y-4 pr-4">
              {controlTests.map(test => {
                const control = controls.find(c => c.id === test.control_id);
                return (
                  <Card key={test.id} className="bg-[#1a2332] border-[#2a3548] p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{control?.name || 'Unknown Control'}</h4>
                        <p className="text-xs text-slate-500">
                          Tested {format(new Date(test.test_date), 'MMM d, yyyy')} by {test.tester}
                        </p>
                      </div>
                      <Badge className={`${test.test_result === 'passed' ? 'bg-emerald-500/20 text-emerald-400' : test.test_result === 'failed' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {test.test_result.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{test.sample_size}</div>
                        <div className="text-xs text-slate-500">Samples</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{test.design_rating}%</div>
                        <div className="text-xs text-slate-500">Design</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{test.operating_rating}%</div>
                        <div className="text-xs text-slate-500">Operating</div>
                      </div>
                    </div>

                    {test.ai_assessment && (
                      <p className="text-sm text-slate-300 p-3 bg-[#151d2e] border border-[#2a3548] rounded">
                        {test.ai_assessment}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {improvements && (
          <TabsContent value="improvements">
            <ScrollArea className="h-[700px]">
              <div className="space-y-6 pr-4">
                <Card className="bg-indigo-500/5 border-indigo-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
                  <p className="text-sm text-slate-300">{improvements.executive_summary}</p>
                </Card>

                <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-rose-400" />
                    Root Causes
                  </h3>
                  <div className="space-y-3">
                    {improvements.root_causes?.map((cause, i) => (
                      <Card key={i} className="bg-[#151d2e] border-[#2a3548] p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">{cause.cause}</h4>
                          <Badge className={severityColors[cause.severity?.toLowerCase() || 'medium']}>
                            {cause.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{cause.description}</p>
                        <div className="text-xs text-slate-500">Affects {cause.affected_controls} controls</div>
                      </Card>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Control Redesign Recommendations
                  </h3>
                  <div className="space-y-3">
                    {improvements.control_redesigns?.map((redesign, i) => (
                      <Card key={i} className="bg-[#151d2e] border-[#2a3548] p-4">
                        <h4 className="font-medium text-white mb-3">{redesign.control_name}</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-rose-400">Current Issue:</span>
                            <p className="text-slate-400 mt-1">{redesign.current_issue}</p>
                          </div>
                          <div>
                            <span className="text-indigo-400">Proposed Design:</span>
                            <p className="text-slate-300 mt-1">{redesign.proposed_design}</p>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[#2a3548]">
                            <span className="text-emerald-400">Impact: {redesign.expected_improvement}</span>
                            <span className="text-slate-500">Effort: {redesign.implementation_effort}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Priority Actions</h3>
                  <div className="space-y-2">
                    {improvements.priority_actions?.map((action, i) => (
                      <div key={i} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm text-white flex-1">{action.action}</span>
                          <Badge className={severityColors[action.priority?.toLowerCase() || 'medium']}>
                            {action.priority}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>Timeline: {action.timeline}</span>
                          <span>•</span>
                          <span className="text-emerald-400">{action.expected_outcome}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Long-term Strategy</h3>
                  <p className="text-sm text-slate-300">{improvements.long_term_strategy}</p>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}