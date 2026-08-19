import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Shield, AlertTriangle, CheckCircle2, TrendingUp, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import VendorCard from "@/components/vendors/VendorCard.jsx";
import VendorForm from "@/components/vendors/VendorForm.jsx";
import VendorDetailView from "@/components/vendors/VendorDetailView.jsx";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

export default function VendorManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [criticalityFilter, setCriticalityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list('-assessment_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vendor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success("Vendor deleted");
    }
  });

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (vendor) => {
    setSelectedVendor(vendor);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = searchQuery === "" ||
      vendor.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    const matchesCriticality = criticalityFilter === "all" || vendor.criticality === criticalityFilter;
    const matchesType = typeFilter === "all" || vendor.vendor_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesCriticality && matchesType;
  });

  // Statistics
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const criticalVendors = vendors.filter(v => v.criticality === 'critical').length;
  const needsReview = vendors.filter(v => {
    if (!v.next_review_date) return false;
    const reviewDate = new Date(v.next_review_date);
    const today = new Date();
    const daysUntil = Math.floor((reviewDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil >= 0;
  }).length;
  const avgSecurityScore = vendors.filter(v => v.security_score).length > 0
    ? Math.round(vendors.reduce((sum, v) => sum + (v.security_score || 0), 0) / vendors.filter(v => v.security_score).length)
    : 0;

  return (
    <div className="min-h-screen bg-[#0f1623] p-6">
      <FloatingChatbot context="vendors" contextData={{ vendors, assessments }} />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
              <Building2 className="h-8 w-8 text-indigo-400" />
              Vendor Management
            </h1>
            <p className="text-slate-400">Track and assess third-party vendors</p>
          </div>
          <Button onClick={() => { setEditingVendor(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Vendor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Total</Badge>
              </div>
              <div className="text-2xl font-bold text-white">{totalVendors}</div>
              <div className="text-xs text-slate-400">All Vendors</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
              </div>
              <div className="text-2xl font-bold text-white">{activeVendors}</div>
              <div className="text-xs text-slate-400">Active Vendors</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Critical</Badge>
              </div>
              <div className="text-2xl font-bold text-white">{criticalVendors}</div>
              <div className="text-xs text-slate-400">Critical Vendors</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Review</Badge>
              </div>
              <div className="text-2xl font-bold text-white">{needsReview}</div>
              <div className="text-xs text-slate-400">Due for Review</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Score</Badge>
              </div>
              <div className="text-2xl font-bold text-white">{avgSecurityScore}</div>
              <div className="text-xs text-slate-400">Avg Security</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vendors..."
                  className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Criticality" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="all">All Criticality</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
            <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No vendors found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vendor Form Dialog */}
      <VendorForm
        open={showForm}
        onOpenChange={setShowForm}
        vendor={editingVendor}
        onSuccess={() => {
          setShowForm(false);
          setEditingVendor(null);
        }}
      />

      {/* Vendor Detail View */}
      <VendorDetailView
        open={!!selectedVendor}
        onOpenChange={(open) => !open && setSelectedVendor(null)}
        vendor={selectedVendor}
        assessments={assessments.filter(a => a.vendor_id === selectedVendor?.id)}
      />
    </div>
  );
}