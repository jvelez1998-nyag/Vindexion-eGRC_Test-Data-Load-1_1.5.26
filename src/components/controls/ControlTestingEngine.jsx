import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const TEST_TYPES = [
  { value: "design", label: "Test of Design (TOD)", description: "Validate control design adequacy" },
  { value: "effectiveness", label: "Test of Effectiveness (TOE)", description: "Verify control operating effectiveness" },
  { value: "sustainability", label: "Test of Sustainability", description: "Assess long-term control sustainability" }
];

export default function ControlTestingEngine({ preSelectedControl = null, auditMode = false }) {
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState(preSelectedControl);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTestType, setFilterTestType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    control_id: "",
    test_type: "design",
    test_objective: "",
    test_procedures: "",
    sample_size: "",
    population: "",
    test_criteria: "",
    test_results: "",
    status: "planned",
    tester: "",
    reviewer: "",
    test_date: "",
    conclusion: "",
    findings: "",
    exceptions: "",
    recommendations: ""
  });

  const queryClient = useQueryClient();

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const { data: tests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlTest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-tests'] });
      setTestFormOpen(false);
      resetForm();
      toast.success("Control test created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ControlTest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-tests'] });
      setTestFormOpen(false);
      resetForm();
      toast.success("Control test updated successfully");
    }
  });

  const resetForm = () => {
    setFormData({
      control_id: "",
      test_type: "design",
      test_objective: "",
      test_procedures: "",
      sample_size: "",
      population: "",
      test_criteria: "",
      test_results: "",
      status: "planned",
      tester: "",
      reviewer: "",
      test_date: "",
      conclusion: "",
      findings: "",
      exceptions: "",
      recommendations: ""
    });
    setSelectedControl(preSelectedControl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      updateMutation.mutate({ id: formData.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openTestForm = (control, testType = "design") => {
    setSelectedControl(control);
    setFormData({
      ...formData,
      control_id: control.id,
      test_type: testType,
      test_objective: `Test the ${testType} of ${control.name}`
    });
    setTestFormOpen(true);
  };

  const editTest = (test) => {
    const control = controls.find(c => c.id === test.control_id);
    setSelectedControl(control);
    setFormData(test);
    setTestFormOpen(true);
  };

  const filteredTests = tests.filter(test => {
    const control = controls.find(c => c.id === test.control_id);
    const matchesSearch = !searchQuery || 
      control?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.test_objective?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterTestType === "all" || test.test_type === filterTestType;
    const matchesStatus = filterStatus === "all" || test.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'planned': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <ClipboardCheck className="h-5 w-5 text-blue-400" />
              Control Testing
            </CardTitle>
            {preSelectedControl ? (
              <div className="flex items-center gap-2">
                <Button onClick={() => openTestForm(preSelectedControl, "design")} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Test Design
                </Button>
                <Button onClick={() => openTestForm(preSelectedControl, "effectiveness")} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Test Effectiveness
                </Button>
                <Button onClick={() => openTestForm(preSelectedControl, "sustainability")} size="sm" className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Test Sustainability
                </Button>
              </div>
            ) : (
              <Button onClick={() => setTestFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Test
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search tests or controls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <Select value={filterTestType} onValueChange={setFilterTestType}>
              <SelectTrigger className="w-full sm:w-48 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Test Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Types</SelectItem>
                <SelectItem value="design" className="text-white">Design</SelectItem>
                <SelectItem value="effectiveness" className="text-white">Effectiveness</SelectItem>
                <SelectItem value="sustainability" className="text-white">Sustainability</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="planned" className="text-white">Planned</SelectItem>
                <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                <SelectItem value="passed" className="text-white">Passed</SelectItem>
                <SelectItem value="failed" className="text-white">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test List */}
          <div className="space-y-3">
            {filteredTests.map(test => {
              const control = controls.find(c => c.id === test.control_id);
              return (
                <Card key={test.id} className="bg-[#151d2e] border-[#2a3548] hover:border-blue-500/30 cursor-pointer" onClick={() => editTest(test)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{control?.name || 'Unknown Control'}</h4>
                        <p className="text-sm text-slate-400">{test.test_objective}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 capitalize">{test.test_type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {test.tester && <span>Tester: {test.tester}</span>}
                      {test.test_date && <span>Date: {new Date(test.test_date).toLocaleDateString()}</span>}
                      {test.sample_size && <span>Sample: {test.sample_size}</span>}
                    </div>
                    {test.conclusion && (
                      <p className="text-sm text-slate-300 mt-2">{test.conclusion}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filteredTests.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No control tests found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Form Dialog */}
      <Dialog open={testFormOpen} onOpenChange={setTestFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit' : 'New'} Control Test</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="procedures">Test Procedures</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* Control Selection */}
                {!preSelectedControl && (
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Control</label>
                    <Select value={formData.control_id} onValueChange={(val) => {
                      const control = controls.find(c => c.id === val);
                      setSelectedControl(control);
                      setFormData({ ...formData, control_id: val });
                    }} required>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue placeholder="Select control" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {controls.map(control => (
                          <SelectItem key={control.id} value={control.id} className="text-white">
                            {control.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Test Type */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Test Type</label>
                  <Select value={formData.test_type} onValueChange={(val) => setFormData({ ...formData, test_type: val })} required>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {TEST_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-slate-400">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Objective */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Test Objective</label>
                  <Textarea
                    value={formData.test_objective}
                    onChange={(e) => setFormData({ ...formData, test_objective: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={2}
                    required
                  />
                </div>

                {/* Tester and Reviewer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Tester</label>
                    <Input
                      value={formData.tester}
                      onChange={(e) => setFormData({ ...formData, tester: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Reviewer</label>
                    <Input
                      value={formData.reviewer}
                      onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                </div>

                {/* Test Date and Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Test Date</label>
                    <Input
                      type="date"
                      value={formData.test_date}
                      onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Status</label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="planned" className="text-white">Planned</SelectItem>
                        <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                        <SelectItem value="passed" className="text-white">Passed</SelectItem>
                        <SelectItem value="failed" className="text-white">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="procedures" className="space-y-4 mt-4">
                {/* Test Procedures */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Test Procedures</label>
                  <Textarea
                    value={formData.test_procedures}
                    onChange={(e) => setFormData({ ...formData, test_procedures: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={4}
                    placeholder="Describe the testing procedures..."
                  />
                </div>

                {/* Test Criteria */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Test Criteria</label>
                  <Textarea
                    value={formData.test_criteria}
                    onChange={(e) => setFormData({ ...formData, test_criteria: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={3}
                    placeholder="Define success criteria..."
                  />
                </div>

                {/* Sample Size and Population */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Sample Size</label>
                    <Input
                      value={formData.sample_size}
                      onChange={(e) => setFormData({ ...formData, sample_size: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                      placeholder="e.g., 25 items"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Population</label>
                    <Input
                      value={formData.population}
                      onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                      placeholder="e.g., 500 total items"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4 mt-4">
                {/* Test Results */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Test Results</label>
                  <Textarea
                    value={formData.test_results}
                    onChange={(e) => setFormData({ ...formData, test_results: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={4}
                    placeholder="Document test results..."
                  />
                </div>

                {/* Conclusion */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Conclusion</label>
                  <Textarea
                    value={formData.conclusion}
                    onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={2}
                    placeholder="Overall conclusion..."
                  />
                </div>

                {/* Findings */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Findings</label>
                  <Textarea
                    value={formData.findings}
                    onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={3}
                    placeholder="Any findings or observations..."
                  />
                </div>

                {/* Exceptions */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Exceptions</label>
                  <Textarea
                    value={formData.exceptions}
                    onChange={(e) => setFormData({ ...formData, exceptions: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={2}
                    placeholder="Document any exceptions..."
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Recommendations</label>
                  <Textarea
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                    rows={3}
                    placeholder="Recommendations for improvement..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#2a3548]">
              <Button type="button" variant="outline" onClick={() => setTestFormOpen(false)} className="border-[#2a3548]">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {formData.id ? 'Update' : 'Create'} Test
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}