import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Rss, Shield, AlertTriangle, ExternalLink, 
  RefreshCw, Loader2, TrendingUp, Zap 
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveThreatFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchLiveThreat = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a realistic current cybersecurity threat intelligence feed with 6-8 recent items. Include:
        
1. Critical CVEs
2. Active ransomware campaigns
3. Zero-day vulnerabilities
4. Data breaches
5. APT activity
6. Emerging threat vectors

For each item provide:
- title (concise)
- severity: "critical", "high", "medium", or "low"
- category: "vulnerability", "breach", "malware", "apt", or "exploit"
- description (brief 1-2 sentences)
- cve_id (if applicable, e.g., CVE-2024-xxxxx)
- affected_systems (array of system types)
- mitigation (brief guidance)
- source (e.g., "CISA", "NIST NVD", "Microsoft", "CrowdStrike")
- timestamp (recent ISO datetime)

Make it realistic with current-looking dates and real-world threat actor names.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            feed_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  severity: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  cve_id: { type: "string" },
                  affected_systems: { type: "array", items: { type: "string" } },
                  mitigation: { type: "string" },
                  source: { type: "string" },
                  timestamp: { type: "string" }
                }
              }
            }
          }
        }
      });

      setFeed(response.feed_items || []);
      setLastUpdate(new Date());
      toast.success("Threat feed updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch threat feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveThreat();
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[severity] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      vulnerability: Shield,
      breach: AlertTriangle,
      malware: Zap,
      apt: TrendingUp,
      exploit: AlertTriangle
    };
    return icons[category] || Shield;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Rss className="h-4 w-4 text-rose-400" />
            Live Threat Intelligence Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-[10px] text-slate-500">
                Updated {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={fetchLiveThreat}
              disabled={loading}
              className="h-7 w-7 text-slate-400 hover:text-white"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 pr-3">
            <AnimatePresence>
              {feed.map((item, idx) => {
                const Icon = getCategoryIcon(item.category);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-[#151d2e] border-[#2a3548] hover:border-rose-500/30 transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg ${getSeverityColor(item.severity)} flex-shrink-0`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-white line-clamp-1">
                                {item.title}
                              </h4>
                              <Badge className={`text-[8px] px-1 py-0 h-4 ${getSeverityColor(item.severity)}`}>
                                {item.severity}
                              </Badge>
                            </div>
                            
                            {item.cve_id && (
                              <Badge className="text-[8px] mb-1 bg-violet-500/10 text-violet-400 border-violet-500/20">
                                {item.cve_id}
                              </Badge>
                            )}
                            
                            <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            
                            {item.affected_systems?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.affected_systems.slice(0, 3).map((sys, i) => (
                                  <Badge key={i} className="text-[8px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                    {sys}
                                  </Badge>
                                ))}
                                {item.affected_systems.length > 3 && (
                                  <Badge className="text-[8px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                    +{item.affected_systems.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-500">
                                {item.source} • {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 text-slate-500 hover:text-cyan-400"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}