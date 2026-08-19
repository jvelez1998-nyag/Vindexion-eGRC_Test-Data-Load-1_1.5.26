import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Play, Clock, TrendingUp } from "lucide-react";

const VIDEO_TUTORIALS = [
  {
    title: "Platform Overview (5 min)",
    description: "Quick tour of Vindexion eGRC's main features and navigation",
    duration: "5:23",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Risk Management Basics (8 min)",
    description: "Learn how to create, assess, and manage risks effectively",
    duration: "8:15",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Building Your Control Library (6 min)",
    description: "Set up security controls and map them to frameworks",
    duration: "6:40",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Compliance Framework Mapping (10 min)",
    description: "Track compliance across SOX, GDPR, ISO 27001, and more",
    duration: "10:12",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Conducting Risk Assessments (12 min)",
    description: "Comprehensive guide to performing RCSA and risk assessments",
    duration: "12:08",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Audit Planning & Execution (15 min)",
    description: "Plan, execute, and report on internal and external audits",
    duration: "15:30",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "AI Features Deep Dive (10 min)",
    description: "Leverage AI for risk scoring, policy generation, and insights",
    duration: "10:45",
    difficulty: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Privacy Compliance (GDPR/CCPA) (14 min)",
    description: "Master data mapping, DPIAs, and privacy assessments",
    duration: "14:20",
    difficulty: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Vendor Risk Management (9 min)",
    description: "Assess and monitor third-party vendor risks",
    duration: "9:18",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Advanced Reporting (11 min)",
    description: "Create executive dashboards and custom reports",
    duration: "11:05",
    difficulty: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Workflow Automation (8 min)",
    description: "Automate tasks, approvals, and notifications",
    duration: "8:33",
    difficulty: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=225&fit=crop",
    url: "#"
  },
  {
    title: "Best Practices Webinar (25 min)",
    description: "Learn GRC best practices from industry experts",
    duration: "25:00",
    difficulty: "All Levels",
    thumbnail: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=225&fit=crop",
    url: "#"
  }
];

export default function VideoTutorials() {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Intermediate": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Advanced": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "All Levels": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <Video className="h-5 w-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Video Tutorial Library</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Watch comprehensive video tutorials covering all aspects of the platform. Learn at your own pace.
          </p>
          <div className="flex gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {VIDEO_TUTORIALS.filter(v => v.difficulty === "Beginner").length} Beginner
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {VIDEO_TUTORIALS.filter(v => v.difficulty === "Intermediate").length} Intermediate
            </Badge>
            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
              {VIDEO_TUTORIALS.filter(v => v.difficulty === "Advanced").length} Advanced
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VIDEO_TUTORIALS.map((video, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30 transition-all overflow-hidden group">
            <div className="relative h-40 bg-slate-800 overflow-hidden">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-white line-clamp-2">{video.title}</h4>
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge className={getDifficultyColor(video.difficulty)}>
                  {video.difficulty}
                </Badge>
                <Button size="sm" variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                  <Play className="h-3 w-3 mr-1" />
                  Watch
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Learning Path Recommendations</h4>
              <p className="text-xs text-slate-400">
                Start with beginner videos, then progress to intermediate and advanced topics. Track your progress in the checklist tab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}