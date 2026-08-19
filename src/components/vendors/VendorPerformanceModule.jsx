import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FileText, Brain } from "lucide-react";
import AIVendorPerformanceTracker from "./AIVendorPerformanceTracker";
import AIPerformanceReportGenerator from "./AIPerformanceReportGenerator";

export default function VendorPerformanceModule() {
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-updated_date', 100)
  });

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  return (
    <div className="space-y-6">
      {/* Vendor Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
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
      </Card>

      {selectedVendor ? (
        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="tracker">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Tracker
            </TabsTrigger>
            <TabsTrigger value="report">
              <FileText className="h-4 w-4 mr-2" />
              Report Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker">
            <AIVendorPerformanceTracker vendor={selectedVendor} />
          </TabsContent>

          <TabsContent value="report">
            <AIPerformanceReportGenerator 
              vendor={selectedVendor} 
              performanceData={performanceData}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">AI Performance Tracking</h3>
          <p className="text-slate-400">Select a vendor to analyze performance trends and generate reports</p>
        </Card>
      )}
    </div>
  );
}