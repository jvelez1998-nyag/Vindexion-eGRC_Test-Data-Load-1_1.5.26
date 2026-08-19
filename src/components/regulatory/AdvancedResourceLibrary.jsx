import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, FileText, Video, Headphones, Download, Search,
  ExternalLink, Star, Clock, Award, Target, Brain, Zap,
  CheckCircle2, PlayCircle, FileQuestion, Lightbulb, BookMarked
} from "lucide-react";

export default function AdvancedResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("all");

  const frameworks = [
    { id: "all", name: "All Frameworks", count: 150 },
    { id: "FFIEC", name: "FFIEC", count: 35 },
    { id: "SOX", name: "SOX", count: 28 },
    { id: "SOC2", name: "SOC 2", count: 22 },
    { id: "ISO27001", name: "ISO 27001", count: 30 },
    { id: "NIST", name: "NIST CSF", count: 35 }
  ];

  const studyGuides = [
    {
      title: "FFIEC Cybersecurity Assessment Tool - Complete Guide",
      framework: "FFIEC",
      duration: "4 hours",
      rating: 4.8,
      topics: 15,
      description: "Comprehensive coverage of all FFIEC domains including inherent risk profile and cybersecurity maturity"
    },
    {
      title: "SOX IT Controls Fundamentals",
      framework: "SOX",
      duration: "3 hours",
      rating: 4.9,
      topics: 12,
      description: "Deep dive into IT general controls, application controls, and SOX compliance requirements"
    },
    {
      title: "ISO 27001:2022 Implementation Masterclass",
      framework: "ISO27001",
      duration: "5 hours",
      rating: 4.7,
      topics: 18,
      description: "Updated guide for ISO 27001:2022 with practical implementation strategies"
    },
    {
      title: "NIST Cybersecurity Framework 2.0",
      framework: "NIST",
      duration: "3.5 hours",
      rating: 4.9,
      topics: 14,
      description: "Complete overview of NIST CSF 2.0 functions, categories, and subcategories"
    }
  ];

  const videos = [
    { title: "Risk Assessment Best Practices", duration: "45 min", views: "12.5K", framework: "FFIEC" },
    { title: "SOX Audit Preparation Tips", duration: "35 min", views: "8.2K", framework: "SOX" },
    { title: "ISO 27001 Certification Process", duration: "52 min", views: "15.1K", framework: "ISO27001" },
    { title: "NIST CSF Implementation Roadmap", duration: "40 min", views: "9.8K", framework: "NIST" }
  ];

  const practiceQuestions = [
    { title: "FFIEC Core Assessment - 100 Questions", framework: "FFIEC", questions: 100, difficulty: "Mixed" },
    { title: "SOX IT Controls Quiz", framework: "SOX", questions: 75, difficulty: "Intermediate" },
    { title: "ISO 27001 Annex A Controls", framework: "ISO27001", questions: 120, difficulty: "Advanced" },
    { title: "NIST CSF Functions Deep Dive", framework: "NIST", questions: 90, difficulty: "Mixed" }
  ];

  const cheatSheets = [
    { title: "FFIEC Maturity Levels Quick Reference", framework: "FFIEC", pages: 2 },
    { title: "SOX Key Controls Checklist", framework: "SOX", pages: 3 },
    { title: "ISO 27001 Controls at a Glance", framework: "ISO27001", pages: 4 },
    { title: "NIST CSF Core Functions Summary", framework: "NIST", pages: 2 }
  ];

  const podcasts = [
    { title: "Regulatory Compliance Insights", episodes: 45, framework: "all" },
    { title: "FFIEC Examiner Perspectives", episodes: 20, framework: "FFIEC" },
    { title: "SOX Compliance Roundtable", episodes: 35, framework: "SOX" },
    { title: "Cybersecurity Standards Podcast", episodes: 50, framework: "all" }
  ];

  const filteredStudyGuides = studyGuides.filter(guide =>
    (selectedFramework === "all" || guide.framework === selectedFramework) &&
    (searchQuery === "" || guide.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                Advanced Resource Library
              </h2>
              <p className="text-slate-300 text-sm">
                Comprehensive study materials, practice questions, and multimedia resources
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {frameworks.map(fw => (
                <Button
                  key={fw.id}
                  size="sm"
                  onClick={() => setSelectedFramework(fw.id)}
                  className={`whitespace-nowrap ${
                    selectedFramework === fw.id
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {fw.name} ({fw.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="guides" className="space-y-4">
        <TabsList className="bg-[#0f1623] border border-[#2a3548] p-1">
            <TabsTrigger value="guides" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
              <BookMarked className="h-4 w-4 mr-2" />
              Study Guides
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">
              <Video className="h-4 w-4 mr-2" />
              Video Tutorials
            </TabsTrigger>
            <TabsTrigger value="practice" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">
              <Target className="h-4 w-4 mr-2" />
              Practice Questions
            </TabsTrigger>
            <TabsTrigger value="cheatsheets" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">
              <FileText className="h-4 w-4 mr-2" />
              Cheat Sheets
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30">
              <Headphones className="h-4 w-4 mr-2" />
              Podcasts
            </TabsTrigger>
          </TabsList>

        <TabsContent value="guides">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredStudyGuides.map((guide, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      {guide.framework}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-semibold">{guide.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{guide.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{guide.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {guide.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {guide.topics} topics
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                    <Button size="icon" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center relative">
                    <PlayCircle className="h-12 w-12 text-white opacity-80" />
                    <Badge className="absolute top-2 right-2 bg-black/50 text-white text-xs">
                      {video.duration}
                    </Badge>
                  </div>

                  <Badge className="mb-2 text-xs">{video.framework}</Badge>
                  <h4 className="text-sm font-semibold text-white mb-1">{video.title}</h4>
                  <p className="text-xs text-slate-400">{video.views} views</p>

                  <Button className="w-full mt-3 bg-violet-500/20 text-violet-400 hover:bg-violet-500/30">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practice">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {practiceQuestions.map((quiz, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {quiz.framework}
                      </Badge>
                      <h3 className="text-lg font-bold text-white mb-1">{quiz.title}</h3>
                    </div>
                    <FileQuestion className="h-8 w-8 text-emerald-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="text-2xl font-bold text-emerald-400">{quiz.questions}</div>
                      <div className="text-xs text-slate-400">Questions</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="text-sm font-bold text-white">{quiz.difficulty}</div>
                      <div className="text-xs text-slate-400">Difficulty</div>
                    </div>
                  </div>

                  <Button className="w-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                    <Zap className="h-4 w-4 mr-2" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cheatsheets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cheatSheets.map((sheet, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {sheet.framework}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-2">{sheet.title}</h4>
                  <p className="text-xs text-slate-400 mb-4">{sheet.pages} pages • PDF Format</p>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="icon" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="podcasts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {podcasts.map((podcast, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-amber-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/20">
                      <Headphones className="h-8 w-8 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <Badge className="mb-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {podcast.framework}
                      </Badge>
                      <h3 className="text-lg font-bold text-white mb-1">{podcast.title}</h3>
                      <p className="text-sm text-slate-400 mb-4">{podcast.episodes} episodes available</p>

                      <Button className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Listen Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Study Assistant */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Brain className="h-8 w-8 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">AI Study Assistant</h3>
              <p className="text-sm text-slate-300">
                Get personalized study recommendations based on your progress and weak areas
              </p>
            </div>
            <Button className="bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30">
              <Lightbulb className="h-4 w-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}