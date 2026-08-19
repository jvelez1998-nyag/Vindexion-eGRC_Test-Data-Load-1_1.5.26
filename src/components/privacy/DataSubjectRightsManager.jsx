import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Plus, Clock, CheckCircle2, AlertTriangle, FileText, Shield, Search } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

const REQUEST_TYPES = [
  { value: "access", label: "Right of Access (Art. 15)", icon: FileText },
  { value: "rectification", label: "Right to Rectification (Art. 16)", icon: FileText },
  { value: "erasure", label: "Right to Erasure (Art. 17)", icon: FileText },
  { value: "restriction", label: "Right to Restriction (Art. 18)", icon: Shield },
  { value: "portability", label: "Data Portability (Art. 20)", icon: FileText },
  { value: "objection", label: "Right to Object (Art. 21)", icon: AlertTriangle },
  { value: "automated_decision", label: "Automated Decision Rights (Art. 22)", icon: FileText },
  { value: "withdraw_consent", label: "Withdraw Consent (Art. 7)", icon: FileText }
];

export default function DataSubjectRightsManager() {
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newRequest, setNewRequest] = useState({
    request_type: "access",
    data_subject_name: "",
    data_subject_email: "",
    request_details: "",
    submission_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "received"
  });

  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['dsr-requests'],
    queryFn: () => base44.entities.DataSubjectRequest.list('-submission_date', 100),
    staleTime: 60000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DataSubjectRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsr-requests'] });
      setFormOpen(false);
      setNewRequest({
        request_type: "access",
        data_subject_name: "",
        data_subject_email: "",
        request_details: "",
        submission_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "received"
      });
      toast.success("DSR request created");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DataSubjectRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsr-requests'] });
      toast.success("Request updated");
    }
  });

  const filteredRequests = requests.filter(r => {
    const matchesSearch = !searchTerm ||
      r.data_subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.data_subject_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.request_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'received' || r.status === 'in_progress').length;
  const overdueCount = requests.filter(r => {
    if (r.status === 'completed') return false;
    return new Date(r.due_date) < new Date();
  }).length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejected': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'extended': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getDaysRemaining = (dueDate) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Data Subject Rights Management</h3>
                <p className="text-sm text-slate-400">GDPR Chapter III compliance tracking</p>
              </div>
            </div>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Data Subject Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Subject Name</Label>
                      <Input
                        value={newRequest.data_subject_name}
                        onChange={(e) => setNewRequest({ ...newRequest, data_subject_name: e.target.value })}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newRequest.data_subject_email}
                        onChange={(e) => setNewRequest({ ...newRequest, data_subject_email: e.target.value })}
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Request Type</Label>
                    <Select value={newRequest.request_type} onValueChange={(v) => setNewRequest({ ...newRequest, request_type: v })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {REQUEST_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Request Details</Label>
                    <Textarea
                      value={newRequest.request_details}
                      onChange={(e) => setNewRequest({ ...newRequest, request_details: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white h-24"
                    />
                  </div>

                  <Button onClick={() => createMutation.mutate(newRequest)} className="w-full bg-indigo-600">
                    Create Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-blue-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <div className="text-2xl font-bold text-white">{requests.length}</div>
          </div>
          <div className="text-xs text-slate-400">Total Requests</div>
        </Card>

        <Card className="bg-[#1a2332] border-amber-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-amber-400" />
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
          </div>
          <div className="text-xs text-slate-400">Pending</div>
        </Card>

        <Card className="bg-[#1a2332] border-rose-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <div className="text-2xl font-bold text-white">{overdueCount}</div>
          </div>
          <div className="text-xs text-slate-400">Overdue</div>
        </Card>

        <Card className="bg-[#1a2332] border-emerald-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div className="text-2xl font-bold text-white">{requests.filter(r => r.status === 'completed').length}</div>
          </div>
          <div className="text-xs text-slate-400">Completed</div>
        </Card>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">DSR Request Queue</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm bg-[#151d2e] border-[#2a3548] w-48"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-sm bg-[#151d2e] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredRequests.map(request => {
                const daysRemaining = getDaysRemaining(request.due_date);
                const isOverdue = daysRemaining < 0 && request.status !== 'completed';
                
                return (
                  <Card key={request.id} className={`bg-[#151d2e] border transition-all ${
                    isOverdue ? 'border-rose-500/50' : 'border-[#2a3548] hover:border-indigo-500/30'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                              {REQUEST_TYPES.find(t => t.value === request.request_type)?.label.split('(')[0].trim()}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            {isOverdue && (
                              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1">{request.data_subject_name}</h4>
                          <p className="text-xs text-slate-400">{request.data_subject_email}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${isOverdue ? 'text-rose-400' : 'text-white'}`}>
                            {Math.abs(daysRemaining)}d
                          </div>
                          <div className="text-[10px] text-slate-500">{isOverdue ? 'overdue' : 'remaining'}</div>
                        </div>
                      </div>

                      {request.request_details && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{request.request_details}</p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Submitted: {format(new Date(request.submission_date), 'MMM d, yyyy')}</span>
                        {request.status !== 'completed' && (
                          <Select 
                            value={request.status}
                            onValueChange={(v) => updateMutation.mutate({ id: request.id, data: { status: v } })}
                          >
                            <SelectTrigger className="w-32 h-7 text-xs bg-[#1a2332] border-[#2a3548]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                              <SelectItem value="received">Received</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No requests found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}