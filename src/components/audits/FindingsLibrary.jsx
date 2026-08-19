import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, Search, Filter, FileText, Calendar, 
  User, TrendingUp, CheckCircle2, Clock, AlertCircle, Plus 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { toast } from "sonner";

export default function FindingsLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFinding, setExpandedFinding] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    audit_id: "",
    severity: "medium",
    category: "control_deficiency",
    description: "",
    criteria: "",
    condition: "",
    cause: "",
    effect: "",
    recommendation: "",
    responsible_party: "",
    target_date: "",
    status: "open"
  });

  const queryClient = useQueryClient();

  const { data: findings = [], isLoading } = useQuery({
    queryKey: ['audit-findings'],
    queryFn: () => base44.entities.AuditFinding.list('-updated_date', 100)
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-updated_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditFinding.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-findings'] });
      setFormOpen(false);
      setFormData({
        title: "",
        audit_id: "",
        severity: "medium",
        category: "control_deficiency",
        description: "",
        criteria: "",
        condition: "",
        cause: "",
        effect: "",
        recommendation: "",
        responsible_party: "",
        target_date: "",
        status: "open"
      });
      toast.success("Finding created successfully");
    },
    onError: () => {
      toast.error("Failed to create finding");
    }
  });

  const getAuditTitle = (auditId) => {
    const audit = audits.find(a => a.id === auditId);
    return audit?.title || 'N/A';
  };

  const filteredFindings = findings.filter(finding => {
    const matchesSearch = finding.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         finding.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "all" || finding.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || finding.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || finding.category === selectedCategory;
    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
  });

  const severityColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  const statusColors = {
    open: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    remediated: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  const categoryIcons = {
    control_deficiency: AlertTriangle,
    compliance_violation: AlertCircle,
    risk_exposure: TrendingUp,
    inefficiency: Clock,
    best_practice: CheckCircle2
  };

  if (isLoading) {
    return <div className="text-white">Loading findings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <FileText className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Findings Library</h2>
            <p className="text-sm text-slate-400">{findings.length} total findings across all audits</p>
          </div>
        </div>
        <Button 
          onClick={() => setFormOpen(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Finding
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
          />
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#151d2e] border border-[#2a3548] text-white text-sm"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#151d2e] border border-[#2a3548] text-white text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="remediated">Remediated</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#151d2e] border border-[#2a3548] text-white text-sm"
        >
          <option value="all">All Categories</option>
          <option value="control_deficiency">Control Deficiency</option>
          <option value="compliance_violation">Compliance Violation</option>
          <option value="risk_exposure">Risk Exposure</option>
          <option value="inefficiency">Inefficiency</option>
          <option value="best_practice">Best Practice</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/30">
          <CardContent className="p-4">
            <div className="text-xs text-rose-400 mb-1">Critical</div>
            <div className="text-2xl font-bold text-white">
              {findings.filter(f => f.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="text-xs text-orange-400 mb-1">High</div>
            <div className="text-2xl font-bold text-white">
              {findings.filter(f => f.severity === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="text-xs text-amber-400 mb-1">Medium</div>
            <div className="text-2xl font-bold text-white">
              {findings.filter(f => f.severity === 'medium').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="text-xs text-blue-400 mb-1">Open</div>
            <div className="text-2xl font-bold text-white">
              {findings.filter(f => f.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
          <CardContent className="p-4">
            <div className="text-xs text-indigo-400 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-white">
              {findings.filter(f => f.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Findings List */}
      <ScrollArea className="h-[800px]">
        <div className="space-y-4 pr-4">
          {filteredFindings.map((finding) => {
            const CategoryIcon = categoryIcons[finding.category] || AlertTriangle;
            const isExpanded = expandedFinding === finding.id;

            return (
              <Card key={finding.id} className="bg-[#1a2332] border-[#2a3548] hover:border-amber-500/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="h-4 w-4 text-amber-400" />
                        <CardTitle className="text-base">{finding.title}</CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={severityColors[finding.severity]}>
                          {finding.severity}
                        </Badge>
                        <Badge className={statusColors[finding.status]}>
                          {finding.status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {finding.category?.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          Audit: {getAuditTitle(finding.audit_id)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-300">{finding.description}</p>

                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t border-[#2a3548]">
                      {/* Criteria */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Criteria</h4>
                        <p className="text-sm text-slate-400">{finding.criteria}</p>
                      </div>

                      {/* Condition */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Condition</h4>
                        <p className="text-sm text-slate-400">{finding.condition}</p>
                      </div>

                      {/* Cause */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Cause</h4>
                        <p className="text-sm text-slate-400">{finding.cause}</p>
                      </div>

                      {/* Effect */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Effect</h4>
                        <p className="text-sm text-slate-400">{finding.effect}</p>
                      </div>

                      {/* Recommendation */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Recommendation</h4>
                        <p className="text-sm text-slate-400 whitespace-pre-line">{finding.recommendation}</p>
                      </div>

                      {/* Management Response */}
                      {finding.management_response && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Management Response</h4>
                          <p className="text-sm text-slate-400">{finding.management_response}</p>
                        </div>
                      )}

                      {/* Action Plan */}
                      {finding.action_plan && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Action Plan</h4>
                          <p className="text-sm text-slate-400 whitespace-pre-line">{finding.action_plan}</p>
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#2a3548]">
                        {finding.responsible_party && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-500">Responsible Party</div>
                              <div className="text-sm text-white">{finding.responsible_party}</div>
                            </div>
                          </div>
                        )}
                        {finding.target_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-500">Target Date</div>
                              <div className="text-sm text-white">
                                {format(new Date(finding.target_date), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredFindings.length === 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No findings match your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Create Finding Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Finding</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Finding title"
                  className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-slate-400">Audit *</Label>
                <Select value={formData.audit_id} onValueChange={(value) => setFormData({ ...formData, audit_id: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5">
                    <SelectValue placeholder="Select audit" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {audits.map(audit => (
                      <SelectItem key={audit.id} value={audit.id} className="text-white">
                        {audit.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Severity *</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="low" className="text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-white">High</SelectItem>
                    <SelectItem value="critical" className="text-white">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-400">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="control_deficiency" className="text-white">Control Deficiency</SelectItem>
                    <SelectItem value="compliance_violation" className="text-white">Compliance Violation</SelectItem>
                    <SelectItem value="risk_exposure" className="text-white">Risk Exposure</SelectItem>
                    <SelectItem value="inefficiency" className="text-white">Inefficiency</SelectItem>
                    <SelectItem value="best_practice" className="text-white">Best Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-400">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the finding"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-20"
              />
            </div>

            <div>
              <Label className="text-slate-400">Criteria</Label>
              <Textarea
                value={formData.criteria}
                onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                placeholder="What standard, policy, or requirement should be met?"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-20"
              />
            </div>

            <div>
              <Label className="text-slate-400">Condition</Label>
              <Textarea
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder="What is the actual state or situation?"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-20"
              />
            </div>

            <div>
              <Label className="text-slate-400">Cause</Label>
              <Textarea
                value={formData.cause}
                onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                placeholder="What caused this condition to exist?"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-20"
              />
            </div>

            <div>
              <Label className="text-slate-400">Effect</Label>
              <Textarea
                value={formData.effect}
                onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                placeholder="What is the impact or consequence?"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-20"
              />
            </div>

            <div>
              <Label className="text-slate-400">Recommendation</Label>
              <Textarea
                value={formData.recommendation}
                onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                placeholder="What should be done to address this finding?"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Responsible Party</Label>
                <Input
                  value={formData.responsible_party}
                  onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
                  placeholder="Who is responsible for remediation?"
                  className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-slate-400">Target Date</Label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setFormOpen(false)} className="border-[#2a3548]">
                Cancel
              </Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.title || !formData.audit_id || createMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                Create Finding
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}