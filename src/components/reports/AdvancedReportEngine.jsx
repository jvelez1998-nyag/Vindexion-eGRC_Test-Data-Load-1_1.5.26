import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileBarChart, Calendar, Sparkles, Library, Wand2 } from "lucide-react";
import CustomDataPointSelector from "./CustomDataPointSelector";
import AutomatedScheduler from "./AutomatedScheduler";
import AIExecutiveIntegrator from "./AIExecutiveIntegrator";
import ProfessionalTemplateLibrary from "./ProfessionalTemplateLibrary";

export default function AdvancedReportEngine({ data }) {
  const [activeTab, setActiveTab] = useState("builder");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <CardHeader className="relative">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-xl">
              <Wand2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                Advanced Reporting Engine
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Custom reports • Automated scheduling • AI-powered insights • Professional templates
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
          <TabsTrigger 
            value="builder"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-300"
          >
            <FileBarChart className="h-4 w-4 mr-2" />
            Custom Builder
          </TabsTrigger>
          <TabsTrigger 
            value="schedule"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-300"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Automated Scheduling
          </TabsTrigger>
          <TabsTrigger 
            value="ai"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-violet-300"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Integration
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-300"
          >
            <Library className="h-4 w-4 mr-2" />
            Template Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <CustomDataPointSelector data={data} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <AutomatedScheduler />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIExecutiveIntegrator data={data} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <ProfessionalTemplateLibrary data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}