import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Grid3x3, Network, TrendingUp } from "lucide-react";
import AdvancedRiskHeatmap from "@/components/risks/AdvancedRiskHeatmap";
import InteractiveRiskMatrix from "@/components/risks/InteractiveRiskMatrix";
import RiskNetworkGraph from "@/components/risks/RiskNetworkGraph";

export default function RiskVisualizationHub({ risks = [], controls = [], incidents = [] }) {
  const [activeTab, setActiveTab] = useState("heatmap");

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Risk Visualization Hub</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive visual analytics for comprehensive risk analysis
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#0f1623] p-1 mb-6">
            <TabsTrigger 
              value="heatmap" 
              className="text-sm flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Heatmap</span>
            </TabsTrigger>
            <TabsTrigger 
              value="matrix" 
              className="text-sm flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Matrix</span>
            </TabsTrigger>
            <TabsTrigger 
              value="network" 
              className="text-sm flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-fuchsia-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30"
            >
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap">
            <AdvancedRiskHeatmap risks={risks} />
          </TabsContent>

          <TabsContent value="matrix">
            <InteractiveRiskMatrix risks={risks} />
          </TabsContent>

          <TabsContent value="network">
            <RiskNetworkGraph 
              risks={risks} 
              controls={controls}
              incidents={incidents}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}