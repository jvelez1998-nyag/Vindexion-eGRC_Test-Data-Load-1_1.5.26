import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Brain, Upload, BarChart3 } from "lucide-react";
import AIVendorAuditPlanner from "./AIVendorAuditPlanner";
import AIAuditEvidenceAnalyzer from "./AIAuditEvidenceAnalyzer";
import AIVendorAuditReportGenerator from "./AIVendorAuditReportGenerator";

export default function VendorAuditModule() {
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-updated_date', 100)
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['vendor-audits', selectedVendorId],
    queryFn: () => selectedVendorId 
      ? base44.entities.VendorAudit.filter({ vendor_id: selectedVendorId })
      : base44.entities.VendorAudit.list('-created_date', 50),
    enabled: true
  });

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
  const selectedAudit = audits.find(a => a.id === selectedAuditId);

  return (
    <div className="space-y-6">
      {/* Vendor Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Select Vendor</label>
            <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                <SelectValue placeholder="Choose a vendor..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {vendors.map(vendor => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedVendorId && audits.length > 0 && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Select Audit (Optional)</label>
              <Select value={selectedAuditId} onValueChange={setSelectedAuditId}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                  <SelectValue placeholder="Choose existing audit..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {audits.map(audit => (
                    <SelectItem key={audit.id} value={audit.id}>
                      {audit.audit_name} ({audit.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {selectedVendor ? (
        <Tabs defaultValue="planner" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="planner">
              <Brain className="h-4 w-4 mr-2" />
              Audit Planner
            </TabsTrigger>
            <TabsTrigger value="evidence">
              <Upload className="h-4 w-4 mr-2" />
              Evidence Analysis
            </TabsTrigger>
            <TabsTrigger value="report">
              <FileText className="h-4 w-4 mr-2" />
              Report Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner">
            <AIVendorAuditPlanner vendor={selectedVendor} />
          </TabsContent>

          <TabsContent value="evidence">
            {selectedAudit ? (
              <AIAuditEvidenceAnalyzer 
                audit={selectedAudit} 
                vendor={selectedVendor}
              />
            ) : (
              <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
                <Upload className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Select an audit to analyze evidence</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="report">
            {selectedAudit ? (
              <AIVendorAuditReportGenerator
                audit={selectedAudit}
                vendor={selectedVendor}
                analysisData={analysisData}
              />
            ) : (
              <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Select an audit to generate report</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">AI Vendor Audit Module</h3>
          <p className="text-slate-400">Select a vendor to begin AI-powered audit process</p>
        </Card>
      )}
    </div>
  );
}