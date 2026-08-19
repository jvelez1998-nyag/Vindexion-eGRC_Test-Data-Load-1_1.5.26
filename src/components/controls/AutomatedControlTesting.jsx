import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Play, Pause, Trash2, Plus, Bell, Brain, Loader2, CheckCircle2, AlertTriangle, Settings, Zap, Target, PlayCircle, StopCircle } from "lucide-react";
import { toast } from "sonner";

export default function AutomatedControlTesting({ controls }) {
  const [selectedControl, setSelectedControl] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [testConfig, setTestConfig] = useState({
    control_id: "",
    schedule_name: "",
    frequency: "monthly",
    test_types: ["design", "effectiveness"],
    auto_execute: true,
    sample_size: "",
    population: "",
    test_criteria: "",
    automated_evidence_collection: false,
    notification_emails: [],
    advanced_config: {
      retry_on_failure: true,
      max_retries: 3,
      parallel_execution: false,
      evidence_retention_days: 365
    }
  });

  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ['control-test-schedules'],
    queryFn: () => base44.entities.ControlTestSchedule.list()
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list()
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlTestSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-test-schedules'] });
      toast.success("Automated test schedule created");
      setConfigOpen(false);
      resetConfig();
    }
  });

  const executeTestMutation = useMutation({
    mutationFn: async (scheduleId) => {
      const schedule = schedules.find(s => s.id === scheduleId);
      const control = controls.find(c => c.id === schedule.control_id);
      
      // Simulate automated test execution
      const testResult = await base44.entities.ControlTest.create({
        control_id: schedule.control_id,
        test_type: schedule.test_type || "effectiveness",
        test_objective: `Automated test: ${control.name}`,
        test_procedures: schedule.test_procedures || "Automated testing procedure",
        sample_size: schedule.sample_size || "Auto-selected",
        population: schedule.population || "Full population",
        status: "in_progress",
        tester: "Automated Testing System",
        test_date: new Date().toISOString().split('T')[0]
      });

      // Auto-update next test date
      const nextDate = calculateNextTestDate(schedule.frequency);
      await base44.entities.ControlTestSchedule.update(schedule.id, {
        last_test_date: new Date().toISOString().split('T')[0],
        next_test_date: nextDate,
        total_tests_executed: (schedule.total_tests_executed || 0) + 1
      });

      return testResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-tests'] });
      queryClient.invalidateQueries({ queryKey: ['control-test-schedules'] });
      toast.success("Automated test executed successfully");
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id) => base44.entities.ControlTestSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-test-schedules'] });
      toast.success("Schedule deleted");
    }
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: ({ id, isActive }) => 
      base44.entities.ControlTestSchedule.update(id, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-test-schedules'] });
      toast.success("Schedule status updated");
    }
  });

  const calculateNextTestDate = (frequency) => {
    const date = new Date();
    switch(frequency) {
      case 'daily': date.setDate(date.getDate() + 1); break;
      case 'weekly': date.setDate(date.getDate() + 7); break;
      case 'monthly': date.setMonth(date.getMonth() + 1); break;
      case 'quarterly': date.setMonth(date.getMonth() + 3); break;
      case 'semi_annually': date.setMonth(date.getMonth() + 6); break;
      case 'annually': date.setFullYear(date.getFullYear() + 1); break;
      default: date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  const resetConfig = () => {
    setTestConfig({
      control_id: "",
      schedule_name: "",
      frequency: "monthly",
      test_types: ["design", "effectiveness"],
      auto_execute: true,
      sample_size: "",
      population: "",
      test_criteria: "",
      automated_evidence_collection: false,
      notification_emails: [],
      advanced_config: {
        retry_on_failure: true,
        max_retries: 3,
        parallel_execution: false,
        evidence_retention_days: 365
      }
    });
  };

  const generateAISchedule = async () => {
    if (!testConfig.control_id) {
      toast.error("Please select a control first");
      return;
    }

    setAiOptimizing(true);
    try {
      const control = controls.find(c => c.id === testConfig.control_id);
      const linkedRisks = risks.filter(r => r.linked_controls?.includes(control.id));
      const previousTests = controlTests.filter(t => t.control_id === control.id);

      const prompt = `As an expert in control testing optimization, recommend optimal testing parameters for this control:

CONTROL DETAILS:
- Name: ${control.name}
- Type: ${control.category}
- Domain: ${control.domain}
- Current Status: ${control.status}
- Effectiveness: ${control.effectiveness || 'Not rated'}
- Last Tested: ${control.last_tested_date || 'Never'}
- Review Frequency: ${control.review_frequency || 'Not set'}

RISK CONTEXT:
- Linked Risks: ${linkedRisks.length}
- High Risk Links: ${linkedRisks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 15).length}

TESTING HISTORY:
- Previous Tests: ${previousTests.length}
- Failures: ${previousTests.filter(t => t.status === 'failed').length}
- Last Test Result: ${previousTests[0]?.status || 'N/A'}

PROVIDE OPTIMAL TESTING RECOMMENDATIONS:
1. Test frequency (consider risk level, control criticality, regulatory requirements)
2. Test types to include (design, effectiveness, sustainability)
3. Sample size recommendations
4. Optimal testing methods
5. Evidence collection requirements
6. Testing schedule (best time of month/quarter)
7. Resource allocation (hours, personnel)
8. Success criteria definition`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_frequency: { type: "string" },
            rationale: { type: "string" },
            test_types: { type: "array", items: { type: "string" } },
            sample_size: { type: "string" },
            testing_method: { type: "string" },
            evidence_requirements: { type: "array", items: { type: "string" } },
            optimal_timing: { type: "string" },
            estimated_hours: { type: "number" },
            success_criteria: { type: "string" },
            test_procedures: { type: "array", items: { type: "string" } },
            risk_considerations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiRecommendations(result);
      setTestConfig(prev => ({
        ...prev,
        frequency: result.recommended_frequency || prev.frequency,
        test_types: result.test_types || prev.test_types,
        sample_size: result.sample_size || prev.sample_size,
        test_criteria: result.success_criteria || prev.test_criteria
      }));

      toast.success("AI recommendations generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI recommendations");
    } finally {
      setAiOptimizing(false);
    }
  };

  const handleCreateSchedule = () => {
    if (!testConfig.control_id) {
      toast.error("Please select a control");
      return;
    }

    const control = controls.find(c => c.id === testConfig.control_id);
    const nextTestDate = calculateNextTestDate(testConfig.frequency);

    createScheduleMutation.mutate({
      control_id: testConfig.control_id,
      schedule_name: testConfig.schedule_name || `${control.name} - Automated Testing`,
      frequency: testConfig.frequency,
      test_type: testConfig.test_types.join(','),
      auto_execute: testConfig.auto_execute,
      sample_size: testConfig.sample_size,
      population: testConfig.population,
      test_criteria: testConfig.test_criteria,
      test_procedures: aiRecommendations?.test_procedures?.join('\n'),
      notification_emails: testConfig.notification_emails.join(','),
      next_test_date: nextTestDate,
      is_active: true,
      automated_evidence_collection: testConfig.automated_evidence_collection,
      advanced_config: testConfig.advanced_config,
      ai_optimized: !!aiRecommendations
    });
  };

  const executeTest = (schedule) => {
    if (confirm(`Execute automated test for "${schedule.schedule_name}"?`)) {
      executeTestMutation.mutate(schedule.id);
    }
  };

  const activeSchedules = schedules.filter(s => s.is_active);
  const inactiveSchedules = schedules.filter(s => !s.is_active);

  const getControlName = (controlId) => {
    return controls.find(c => c.id === controlId)?.name || controlId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Zap className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-white">Automated Control Testing</CardTitle>
                <p className="text-slate-400 text-sm mt-1">
                  AI-optimized testing schedules with automated execution and evidence collection
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setConfigOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{activeSchedules.length}</div>
              <div className="text-xs text-slate-400 mt-1">Active Schedules</div>
            </div>
            <PlayCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {schedules.reduce((sum, s) => sum + (s.total_tests_executed || 0), 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Tests Executed</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {schedules.filter(s => s.ai_optimized).length}
              </div>
              <div className="text-xs text-slate-400 mt-1">AI Optimized</div>
            </div>
            <Brain className="h-8 w-8 text-violet-400" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {schedules.filter(s => s.automated_evidence_collection).length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Auto Evidence</div>
            </div>
            <Zap className="h-8 w-8 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Schedules List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="active">Active ({activeSchedules.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveSchedules.length})</TabsTrigger>
          <TabsTrigger value="execution">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {activeSchedules.length === 0 ? (
                <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
                  <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Active Schedules</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Create automated testing schedules to streamline control validation
                  </p>
                  <Button onClick={() => setConfigOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </Card>
              ) : (
                activeSchedules.map(schedule => (
                  <Card key={schedule.id} className="bg-[#1a2332] border-[#2a3548] p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{schedule.schedule_name}</h4>
                          {schedule.ai_optimized && (
                            <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">
                              AI Optimized
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{getControlName(schedule.control_id)}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {schedule.frequency}
                          </Badge>
                          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                            {schedule.test_type || 'All types'}
                          </Badge>
                          {schedule.auto_execute && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-Execute
                            </Badge>
                          )}
                          {schedule.automated_evidence_collection && (
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                              Auto Evidence
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => executeTest(schedule)}
                          className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleScheduleMutation.mutate({ id: schedule.id, isActive: schedule.is_active })}
                          className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        >
                          {schedule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete schedule "${schedule.schedule_name}"?`)) {
                              deleteScheduleMutation.mutate(schedule.id);
                            }
                          }}
                          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        Next: {schedule.next_test_date ? new Date(schedule.next_test_date).toLocaleDateString() : 'TBD'}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Executed: {schedule.total_tests_executed || 0}
                      </div>
                      {schedule.sample_size && (
                        <div className="text-slate-400">
                          Sample: {schedule.sample_size}
                        </div>
                      )}
                      {schedule.notification_emails && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Bell className="h-3 w-3" />
                          {schedule.notification_emails.split(',').length} recipients
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="space-y-3">
            {inactiveSchedules.length === 0 ? (
              <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
                <p className="text-slate-400 text-sm">No inactive schedules</p>
              </Card>
            ) : (
              inactiveSchedules.map(schedule => (
                <Card key={schedule.id} className="bg-[#1a2332] border-[#2a3548] p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">{schedule.schedule_name}</h4>
                      <p className="text-xs text-slate-500">{getControlName(schedule.control_id)}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => toggleScheduleMutation.mutate({ id: schedule.id, isActive: false })}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Activate
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="execution">
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h4 className="text-sm font-semibold text-white mb-4">Recent Automated Test Executions</h4>
            <div className="space-y-2">
              {controlTests
                .filter(t => t.tester === "Automated Testing System")
                .slice(0, 10)
                .map(test => (
                  <div key={test.id} className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{getControlName(test.control_id)}</p>
                        <p className="text-xs text-slate-500">{test.test_type} - {test.test_date}</p>
                      </div>
                      <Badge className={
                        test.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' :
                        test.status === 'failed' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-blue-500/20 text-blue-400'
                      }>
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      {configOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-[#1a2332] border-[#2a3548] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-violet-400" />
                  Configure Automated Testing
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setConfigOpen(false)}>
                  <StopCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Config */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400">Control to Test *</Label>
                  <Select value={testConfig.control_id} onValueChange={(v) => setTestConfig({...testConfig, control_id: v})}>
                    <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select control" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {controls.map(control => (
                        <SelectItem key={control.id} value={control.id} className="text-white hover:bg-[#2a3548]">
                          {control.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {testConfig.control_id && (
                  <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Get AI Recommendations</h4>
                        <p className="text-xs text-slate-400">
                          AI will analyze risk level, control type, and testing history to suggest optimal parameters
                        </p>
                      </div>
                      <Button 
                        onClick={generateAISchedule}
                        disabled={aiOptimizing}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                      >
                        {aiOptimizing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Brain className="h-4 w-4 mr-2" />
                        )}
                        Optimize
                      </Button>
                    </div>
                  </Card>
                )}

                {aiRecommendations && (
                  <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3">AI Recommendations Applied</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Frequency:</span>
                        <span className="text-white font-medium">{aiRecommendations.recommended_frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Test Types:</span>
                        <span className="text-white font-medium">{aiRecommendations.test_types?.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sample Size:</span>
                        <span className="text-white font-medium">{aiRecommendations.sample_size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Hours:</span>
                        <span className="text-white font-medium">{aiRecommendations.estimated_hours}h</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-emerald-500/20">
                        <span className="text-slate-400">Rationale:</span>
                        <p className="text-slate-300 mt-1">{aiRecommendations.rationale}</p>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Schedule Name</Label>
                    <Input
                      value={testConfig.schedule_name}
                      onChange={(e) => setTestConfig({...testConfig, schedule_name: e.target.value})}
                      placeholder="Auto-generated if empty"
                      className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Test Frequency *</Label>
                    <Select value={testConfig.frequency} onValueChange={(v) => setTestConfig({...testConfig, frequency: v})}>
                      <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="daily" className="text-white">Daily</SelectItem>
                        <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                        <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                        <SelectItem value="quarterly" className="text-white">Quarterly</SelectItem>
                        <SelectItem value="semi_annually" className="text-white">Semi-Annually</SelectItem>
                        <SelectItem value="annually" className="text-white">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Sample Size</Label>
                    <Input
                      value={testConfig.sample_size}
                      onChange={(e) => setTestConfig({...testConfig, sample_size: e.target.value})}
                      placeholder="e.g., 25 items or 10%"
                      className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Population</Label>
                    <Input
                      value={testConfig.population}
                      onChange={(e) => setTestConfig({...testConfig, population: e.target.value})}
                      placeholder="e.g., All users, Monthly transactions"
                      className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-400">Test Criteria</Label>
                  <Textarea
                    value={testConfig.test_criteria}
                    onChange={(e) => setTestConfig({...testConfig, test_criteria: e.target.value})}
                    placeholder="Define success criteria for automated testing..."
                    className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                    <div>
                      <p className="text-sm text-white font-medium">Auto-Execute Tests</p>
                      <p className="text-xs text-slate-400">Automatically run tests when scheduled</p>
                    </div>
                    <Switch
                      checked={testConfig.auto_execute}
                      onCheckedChange={(v) => setTestConfig({...testConfig, auto_execute: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                    <div>
                      <p className="text-sm text-white font-medium">Automated Evidence Collection</p>
                      <p className="text-xs text-slate-400">Auto-collect evidence from integrated systems</p>
                    </div>
                    <Switch
                      checked={testConfig.automated_evidence_collection}
                      onCheckedChange={(v) => setTestConfig({...testConfig, automated_evidence_collection: v})}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#2a3548]">
                <Button 
                  onClick={() => setConfigOpen(false)}
                  variant="outline"
                  className="flex-1 border-[#2a3548]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSchedule}
                  disabled={!testConfig.control_id || createScheduleMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {createScheduleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}