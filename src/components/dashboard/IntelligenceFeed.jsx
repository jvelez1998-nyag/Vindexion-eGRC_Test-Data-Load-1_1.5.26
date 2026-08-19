import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Rss, AlertTriangle, FileText, Shield } from "lucide-react";

export default function IntelligenceFeed() {
  const feeds = [
    { type: "regulatory", icon: FileText, title: "SEC Updates Cybersecurity Disclosure Rules", source: "SEC.gov", time: "2h ago", priority: "high" },
    { type: "threat", icon: AlertTriangle, title: "New Ransomware Variant Targeting Financial Sector", source: "CISA", time: "4h ago", priority: "critical" },
    { type: "framework", icon: Shield, title: "NIST CSF 2.0 Implementation Guide Published", source: "NIST", time: "1d ago", priority: "medium" },
    { type: "regulatory", icon: FileText, title: "GDPR Enforcement Trends Q4 2024", source: "EDPB", time: "2d ago", priority: "medium" },
    { type: "threat", icon: AlertTriangle, title: "Critical Apache Struts Vulnerability Disclosed", source: "NVD", time: "3d ago", priority: "high" }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-rose-500/20 text-rose-400';
      case 'high': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Rss className="h-4 w-4 text-indigo-400" />
          Intelligence Feeds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px] pr-3">
          <div className="space-y-2">
            {feeds.map((feed, idx) => {
              const Icon = feed.icon;
              return (
                <div key={idx} className="p-2 rounded-lg bg-[#0f1623] hover:bg-[#151d2e] transition-colors cursor-pointer border border-[#2a3548]">
                  <div className="flex items-start gap-2 mb-1">
                    <Icon className={`h-3 w-3 mt-0.5 flex-shrink-0 ${
                      feed.type === 'threat' ? 'text-rose-400' : 
                      feed.type === 'regulatory' ? 'text-indigo-400' : 
                      'text-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium leading-tight">{feed.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{feed.source}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-500">{feed.time}</span>
                      </div>
                    </div>
                    <Badge className={`${getPriorityColor(feed.priority)} text-xs flex-shrink-0`}>
                      {feed.priority}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}