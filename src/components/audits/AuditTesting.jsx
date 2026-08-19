import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertCircle, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AuditTesting({ audit }) {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    control_id: "",
    test_procedure: "",
    sample_size: "",
    test_result: "not_started",
    exceptions_found: "",
    notes: ""
  });

  const addTest = () => {
    const newTest = {
      id: Date.now(),
      ...formData,
      tested_date: new Date().toISOString(),
      tester: "current_user@example.com"
    };
    setTests([...tests, newTest]);
    setFormData({
      control_id: "",
      test_procedure: "",
      sample_size: "",
      test_result: "not_started",
      exceptions_found: "",
      notes: ""
    });
    setShowForm(false);
    toast.success("Test added");
  };

  const updateTestResult = (testId, result) => {
    setTests(tests.map(t => t.id === testId ? {...t, test_result: result} : t));
    toast.success("Test result updated");
  };

  const deleteTest = (testId) => {
    setTests(tests.filter(t => t.id !== testId));
    toast.success("Test deleted");
  };

  const resultColors = {
    not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    passed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    passed_with_exceptions: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          Control Testing
        </h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Test
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#151d2e] border-[#2a3548] p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Control ID</Label>
              <Input
                value={formData.control_id}
                onChange={(e) => setFormData({...formData, control_id: e.target.value})}
                placeholder="CTRL-001"
                className="bg-[#1a2332] border-[#2a3548] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Test Procedure</Label>
              <Textarea
                value={formData.test_procedure}
                onChange={(e) => setFormData({...formData, test_procedure: e.target.value})}
                placeholder="Describe the testing procedure"
                rows={3}
                className="bg-[#1a2332] border-[#2a3548] text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sample Size</Label>
                <Input
                  value={formData.sample_size}
                  onChange={(e) => setFormData({...formData, sample_size: e.target.value})}
                  placeholder="25 items"
                  className="bg-[#1a2332] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Test Result</Label>
                <Select value={formData.test_result} onValueChange={(v) => setFormData({...formData, test_result: v})}>
                  <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="not_started" className="text-white">Not Started</SelectItem>
                    <SelectItem value="passed" className="text-white">Passed</SelectItem>
                    <SelectItem value="passed_with_exceptions" className="text-white">Passed with Exceptions</SelectItem>
                    <SelectItem value="failed" className="text-white">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Exceptions Found</Label>
              <Textarea
                value={formData.exceptions_found}
                onChange={(e) => setFormData({...formData, exceptions_found: e.target.value})}
                placeholder="Describe any exceptions or issues"
                rows={2}
                className="bg-[#1a2332] border-[#2a3548] text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={addTest} className="bg-emerald-600 hover:bg-emerald-700">
                Add Test
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-[#2a3548]">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {tests.length === 0 ? (
          <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tests added yet</p>
          </Card>
        ) : (
          tests.map(test => (
            <Card key={test.id} className="bg-[#151d2e] border-[#2a3548] p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                      {test.control_id}
                    </Badge>
                    <Badge className={`text-xs border ${resultColors[test.test_result]}`}>
                      {test.test_result.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{test.test_procedure}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Sample: {test.sample_size}</span>
                    <span>Tested: {new Date(test.tested_date).toLocaleDateString()}</span>
                  </div>
                  {test.exceptions_found && (
                    <div className="mt-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded text-xs text-amber-400">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {test.exceptions_found}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Select value={test.test_result} onValueChange={(v) => updateTestResult(test.id, v)}>
                    <SelectTrigger className="h-8 w-32 bg-[#1a2332] border-[#2a3548] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="not_started" className="text-white text-xs">Not Started</SelectItem>
                      <SelectItem value="passed" className="text-white text-xs">Passed</SelectItem>
                      <SelectItem value="passed_with_exceptions" className="text-white text-xs">With Exceptions</SelectItem>
                      <SelectItem value="failed" className="text-white text-xs">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTest(test.id)}
                    className="h-8 w-8 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-[#151d2e] border-[#2a3548] p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Testing Summary</h4>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{tests.length}</div>
            <div className="text-xs text-slate-500">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{tests.filter(t => t.test_result === 'passed').length}</div>
            <div className="text-xs text-slate-500">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{tests.filter(t => t.test_result === 'passed_with_exceptions').length}</div>
            <div className="text-xs text-slate-500">With Exceptions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-400">{tests.filter(t => t.test_result === 'failed').length}</div>
            <div className="text-xs text-slate-500">Failed</div>
          </div>
        </div>
      </Card>
    </div>
  );
}