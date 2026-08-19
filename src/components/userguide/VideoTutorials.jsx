import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Target } from "lucide-react";

export default function VideoTutorials() {
  const tutorials = [
    {
      title: "Platform Overview - Getting Started",
      duration: "5:30",
      level: "Beginner",
      category: "Overview",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400",
      description: "Complete walkthrough of the platform interface and key features"
    },
    {
      title: "Creating and Managing Risks",
      duration: "8:45",
      level: "Beginner",
      category: "Risk Management",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      description: "Learn how to add risks, score them, and track mitigation"
    },
    {
      title: "Using AI Risk Analyzer",
      duration: "6:20",
      level: "Intermediate",
      category: "AI Features",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
      description: "Leverage AI to identify and assess risks automatically"
    },
    {
      title: "Setting Up Compliance Requirements",
      duration: "10:15",
      level: "Beginner",
      category: "Compliance",
      thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
      description: "Import and configure compliance frameworks for your organization"
    },
    {
      title: "Control Testing and Effectiveness",
      duration: "7:50",
      level: "Intermediate",
      category: "Controls",
      thumbnail: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400",
      description: "Schedule and execute control testing procedures"
    },
    {
      title: "Planning and Executing Audits",
      duration: "12:30",
      level: "Advanced",
      category: "Audits",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
      description: "Complete guide to audit management from planning to reporting"
    },
    {
      title: "Third-Party Risk Assessments",
      duration: "9:40",
      level: "Intermediate",
      category: "Vendor Management",
      thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400",
      description: "Assess and monitor third-party vendor risks"
    },
    {
      title: "Generating Reports with AI",
      duration: "6:55",
      level: "Intermediate",
      category: "Reports",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      description: "Create comprehensive reports using AI-powered analysis"
    },
    {
      title: "Workflow and Approvals",
      duration: "5:45",
      level: "Beginner",
      category: "Workflows",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      description: "Understand the review and approval process"
    }
  ];

  const categories = [...new Set(tutorials.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 cursor-pointer">
              All Videos
            </Badge>
            {categories.map(cat => (
              <Badge key={cat} className="bg-[#151d2e] text-slate-400 border-[#2a3548] cursor-pointer hover:bg-[#2a3548]">
                {cat}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548] overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="relative h-48 bg-[#151d2e] overflow-hidden">
              <img 
                src={tutorial.thumbnail} 
                alt={tutorial.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform cursor-pointer">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/60 text-white backdrop-blur-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {tutorial.duration}
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-500/10 text-purple-400 text-xs">{tutorial.category}</Badge>
                <Badge className={`text-xs ${
                  tutorial.level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                  tutorial.level === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  {tutorial.level}
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">{tutorial.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">{tutorial.description}</p>
              <Button variant="outline" size="sm" className="w-full border-[#2a3548]">
                <Play className="h-3 w-3 mr-2" />
                Watch Tutorial
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Paths */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Recommended Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: 'GRC Fundamentals', videos: 5, duration: '45 min', description: 'Essential concepts for getting started' },
              { title: 'Risk Management Mastery', videos: 8, duration: '1.5 hrs', description: 'Complete risk management workflow' },
              { title: 'Compliance Excellence', videos: 6, duration: '1 hr', description: 'Master compliance tracking and reporting' },
              { title: 'AI Features Deep Dive', videos: 4, duration: '35 min', description: 'Leverage AI throughout the platform' }
            ].map((path, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{path.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">{path.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{path.videos} videos</span>
                    <span>•</span>
                    <span>{path.duration}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-[#2a3548]">
                  Start Path
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}