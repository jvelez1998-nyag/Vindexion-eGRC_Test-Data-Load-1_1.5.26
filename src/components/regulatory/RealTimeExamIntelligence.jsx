import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, TrendingUp, AlertCircle, Activity, Zap, Clock, Target, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function RealTimeExamIntelligence() {
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState(72);

  // Simulate real-time intelligence feed
  useEffect(() => {
    const updates = [
      {
        type: "trend",
        title: "Cybersecurity Focus Intensifies",
        description: "80% of recent exams include enhanced cybersecurity assessments",
        timestamp: new Date().toISOString(),
        priority: "high",
        confidence: 94
      },
      {
        type: "alert",
        title: "Model Risk Management Under Scrutiny",
        description: "AI/ML model governance requirements being emphasized across regulators",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        priority: "critical",
        confidence: 89
      },
      {
        type: "insight",
        title: "Third-Party Risk Management",
        description: "Increased examination depth on vendor due diligence processes",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        priority: "medium",
        confidence: 85
      },
      {
        type: "trend",
        title: "Climate Risk Integration",
        description: "Regulators incorporating climate scenario analysis in stress testing",
        timestamp: new Date(Date.now() - 900000).toISOString(),
        priority: "high",
        confidence: 78
      },
      {
        type: "alert",
        title: "Operational Resilience Testing",
        description: "Real-time testing of critical business services becoming mandatory",
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        priority: "high",
        confidence: 92
      },
      {
        type: "insight",
        title: "Consumer Protection Emphasis",
        description: "Enhanced focus on fair lending and consumer complaint management",
        timestamp: new Date(Date.now() - 1500000).toISOString(),
        priority: "medium",
        confidence: 81
      }
    ];

    setLiveUpdates(updates);

    const interval = setInterval(() => {
      setMarketSentiment(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const typeIcons = {
    trend: TrendingUp,
    alert: AlertCircle,
    insight: Sparkles
  };

  const priorityColors = {
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                <Radio className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>
            <div>
              <CardTitle className="text-lg text-white">Real-Time Exam Intelligence</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Live insights from regulatory examinations</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Live
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Market Sentiment Gauge */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">Regulatory Intensity Index</span>
            </div>
            <span className={`text-2xl font-bold ${
              marketSentiment >= 75 ? 'text-rose-400' :
              marketSentiment >= 50 ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {Math.round(marketSentiment)}
            </span>
          </div>
          <Progress 
            value={marketSentiment} 
            className={`h-2 ${
              marketSentiment >= 75 ? '[&>div]:bg-rose-500' :
              marketSentiment >= 50 ? '[&>div]:bg-amber-500' :
              '[&>div]:bg-emerald-500'
            }`}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">Current examination stringency level</span>
            <span className={`text-xs font-semibold ${
              marketSentiment >= 75 ? 'text-rose-400' :
              marketSentiment >= 50 ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {marketSentiment >= 75 ? 'High Scrutiny' :
               marketSentiment >= 50 ? 'Moderate' :
               'Standard'}
            </span>
          </div>
        </div>

        {/* Key Focus Areas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-slate-400">Top Priority</span>
            </div>
            <div className="text-sm font-bold text-white">Cybersecurity</div>
            <div className="text-xs text-violet-400 mt-1">94% exam coverage</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Emerging</span>
            </div>
            <div className="text-sm font-bold text-white">AI Governance</div>
            <div className="text-xs text-emerald-400 mt-1">+67% this quarter</div>
          </div>
        </div>

        {/* Live Intelligence Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Intelligence Stream</h4>
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last 24h
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {liveUpdates.map((update, idx) => {
                const Icon = typeIcons[update.type];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        update.type === 'alert' ? 'bg-rose-500/20' :
                        update.type === 'trend' ? 'bg-blue-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        <Icon className={`h-3.5 w-3.5 ${
                          update.type === 'alert' ? 'text-rose-400' :
                          update.type === 'trend' ? 'text-blue-400' :
                          'text-purple-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="text-sm font-semibold text-white leading-tight">{update.title}</h5>
                          <Badge className={`${priorityColors[update.priority]} text-[10px] whitespace-nowrap`}>
                            {update.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">{update.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-500" />
                              <span className="text-[10px] text-slate-500">{getTimeAgo(update.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">{update.confidence}% confidence</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}