import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Plus, Shield, Globe, AlertTriangle, Search, FileText } from "lucide-react";
import { toast } from "sonner";

const LAWFUL_BASES = [
  "Consent", "Contract", "Legal Obligation", "Vital Interests", "Public Task", "Legitimate Interests"
];

export default function ProcessingActivityRegister() {
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activity, setActivity] = useState({
    activity_name: "",
    description: "",
    lawful_basis: "consent",
    data_categories: [],
    special_category_data: [],
    cross_border_transfers: false,
    technical_measures: [],
    organizational_measures: [],
    status: "active"
  });

  const queryClient = useQueryClient();

  const { data: activities = [] } = useQuery({
    queryKey: ['processing-activities'],
    queryFn: () => base44.entities.DataProcessingActivity.list('-created_date', 100),
    staleTime: 300000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DataProcessingActivity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-activities'] });
      setFormOpen(false);
      toast.success("Processing activity registered");
    }
  });

  const filteredActivities = activities.filter(a =>
    !searchTerm || 
    a.activity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highRiskCount = activities.filter(a => 
    a.special_category_data?.length > 0 || a.cross_border_transfers
  ).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-xl">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Processing Activity Register</h3>
                <p className="text-sm text-slate-400">GDPR Article 30 Record of Processing Activities (RoPA)</p>
              </div>
            </div>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register Processing Activity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Activity Name *</Label>
                    <Input
                      value={activity.activity_name}
                      onChange={(e) => setActivity({ ...activity, activity_name: e.target.value })}
                      placeholder="e.g., Customer Marketing Campaign"
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={activity.description}
                      onChange={(e) => setActivity({ ...activity, description: e.target.value })}
                      className="bg-[#151d2e] border-[#2a3548] text-white h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lawful Basis (Art. 6) *</Label>
                    <Select value={activity.lawful_basis} onValueChange={(v) => setActivity({ ...activity, lawful_basis: v })}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        {LAWFUL_BASES.map(basis => (
                          <SelectItem key={basis.toLowerCase().replace(/ /g, '_')} value={basis.toLowerCase().replace(/ /g, '_')}>
                            {basis}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-[#151d2e] rounded border border-[#2a3548]">
                    <Checkbox
                      checked={activity.cross_border_transfers}
                      onCheckedChange={(checked) => setActivity({ ...activity, cross_border_transfers: checked })}
                    />
                    <Label className="text-white">Involves Cross-Border Data Transfers (Chapter V)</Label>
                  </div>

                  <Button onClick={() => createMutation.mutate(activity)} className="w-full bg-emerald-600">
                    Register Activity
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between mb-2">
            <Database className="h-5 w-5 text-emerald-400" />
            <div className="text-2xl font-bold text-white">{activities.length}</div>
          </div>
          <div className="text-xs text-slate-400">Total Activities</div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <div className="text-2xl font-bold text-white">{highRiskCount}</div>
          </div>
          <div className="text-xs text-slate-400">High Risk</div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-5 w-5 text-blue-400" />
            <div className="text-2xl font-bold text-white">{activities.filter(a => a.cross_border_transfers).length}</div>
          </div>
          <div className="text-xs text-slate-400">Cross-Border</div>
        </Card>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Registered Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredActivities.map(act => (
                <Card key={act.id} className="bg-[#151d2e] border-[#2a3548] hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-2">{act.activity_name}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            {act.lawful_basis?.replace(/_/g, ' ')}
                          </Badge>
                          {act.cross_border_transfers && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Cross-Border
                            </Badge>
                          )}
                          {act.special_category_data?.length > 0 && (
                            <Badge className="bg-rose-500/20 text-rose-400 text-xs">
                              Special Cat. (Art. 9)
                            </Badge>
                          )}
                          {act.dpia_required && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              DPIA Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {act.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{act.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}