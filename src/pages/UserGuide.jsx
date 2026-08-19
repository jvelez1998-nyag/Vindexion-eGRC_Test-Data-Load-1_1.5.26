import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Search, Play, Video, FileText, Rocket, 
  Target, Brain, Zap, HelpCircle, MessageCircle
} from "lucide-react";
import GettingStartedGuide from "@/components/userguide/GettingStartedGuide";
import ModuleDocumentation from "@/components/userguide/ModuleDocumentation";
import VideoTutorials from "@/components/userguide/VideoTutorials";
import BestPractices from "@/components/userguide/BestPractices";
import FAQSection from "@/components/userguide/FAQSection";
import InteractiveTour from "@/components/userguide/InteractiveTour";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

export default function UserGuide() {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [search, setSearch] = useState('');
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <BookOpen className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">User Guide & Documentation</h1>
              <p className="text-slate-400 text-sm">Everything you need to master Vindexion eGRC Hub™</p>
            </div>
          </div>
          <Button 
            onClick={() => setTourOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Interactive Tour
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Search documentation, tutorials, FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-[#151d2e] border-[#2a3548] text-white text-base h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Rocket, title: 'Getting Started', description: 'Quick start guide', color: 'from-blue-500 to-cyan-500' },
            { icon: FileText, title: 'Documentation', description: 'Complete module docs', color: 'from-emerald-500 to-teal-500' },
            { icon: Video, title: 'Video Tutorials', description: 'Step-by-step videos', color: 'from-purple-500 to-pink-500' },
            { icon: Target, title: 'Best Practices', description: 'Expert guidance', color: 'from-amber-500 to-orange-500' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color}/20 w-fit mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
            <TabsTrigger 
              value="getting-started"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger 
              value="documentation"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger 
              value="tutorials"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400"
            >
              <Video className="h-4 w-4 mr-2" />
              Video Tutorials
            </TabsTrigger>
            <TabsTrigger 
              value="best-practices"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400"
            >
              <Brain className="h-4 w-4 mr-2" />
              Best Practices
            </TabsTrigger>
            <TabsTrigger 
              value="faq"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-indigo-400"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <GettingStartedGuide />
          </TabsContent>

          <TabsContent value="documentation">
            <ModuleDocumentation searchTerm={search} />
          </TabsContent>

          <TabsContent value="tutorials">
            <VideoTutorials />
          </TabsContent>

          <TabsContent value="best-practices">
            <BestPractices />
          </TabsContent>

          <TabsContent value="faq">
            <FAQSection />
          </TabsContent>
        </Tabs>
      </div>

      <InteractiveTour open={tourOpen} onOpenChange={setTourOpen} />

      <FloatingChatbot
        context="userguide"
        contextData={{
          section: activeTab,
          searchTerm: search
        }}
      />
    </div>
  );
}