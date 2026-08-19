import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import VendorCard from "./VendorCard";
import VendorForm from "./VendorForm";
import VendorDetailView from "./VendorDetailView";
import VendorOnboardingQuestionnaire from "./VendorOnboardingQuestionnaire";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

export default function VendorManagementView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [criticalityFilter, setCriticalityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list('-assessment_date')
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (id) => base44.entities.Vendor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success("Vendor deleted");
    }
  });

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
                          v.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const matchesCriticality = criticalityFilter === "all" || v.criticality === criticalityFilter;
    return matchesSearch && matchesStatus && matchesCriticality;
  });

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    critical: vendors.filter(v => v.criticality === 'critical').length,
    highRisk: vendors.filter(v => v.risk_tier === 'tier_1').length
  };

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-400">Total Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-xs text-slate-400">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-rose-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.critical}</p>
                  <p className="text-xs text-slate-400">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.highRisk}</p>
                  <p className="text-xs text-slate-400">High Risk (Tier 1)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="all">All Criticality</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => setShowOnboarding(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Onboard New Vendor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
        {filteredVendors.length === 0 ? (
          <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
            <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {vendors.length === 0 ? "No vendors yet" : "No vendors match filters"}
            </h3>
            <p className="text-slate-400 mb-4">
              {vendors.length === 0 ? "Add your first vendor to start" : "Try adjusting your filters"}
            </p>
            {vendors.length === 0 && (
              <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                Add Vendor
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onView={setSelectedVendor}
                onEdit={(v) => {
                  setEditingVendor(v);
                  setShowForm(true);
                }}
                onDelete={(id) => deleteVendorMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      <VendorForm
        open={showForm}
        onOpenChange={setShowForm}
        vendor={editingVendor}
        onSuccess={() => {
          setShowForm(false);
          setEditingVendor(null);
        }}
      />

      <VendorDetailView
        open={!!selectedVendor}
        onOpenChange={(open) => !open && setSelectedVendor(null)}
        vendor={selectedVendor}
        assessments={assessments.filter(a => a.vendor_id === selectedVendor?.id)}
      />

      <VendorOnboardingQuestionnaire
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={(vendor) => {
          setSelectedVendor(vendor);
          setShowOnboarding(false);
        }}
      />

      <FloatingChatbot context="vendors" contextData={selectedVendor} />
    </>
  );
}