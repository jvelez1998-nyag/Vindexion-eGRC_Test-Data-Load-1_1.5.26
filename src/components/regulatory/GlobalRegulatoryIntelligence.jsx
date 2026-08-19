import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, TrendingUp, AlertCircle, FileText, Calendar, Building2, MapPin, ExternalLink, BarChart3 } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function GlobalRegulatoryIntelligence() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [viewMode, setViewMode] = useState("feed"); // feed, radar, distribution

  // Global regulatory updates by region
  const regulatoryUpdates = [
    {
      region: "USA",
      country: "United States",
      regulator: "SEC",
      title: "New Cybersecurity Disclosure Requirements",
      date: "2025-12-15",
      priority: "high",
      impact: "All public companies must disclose material cybersecurity incidents within 4 business days",
      tags: ["Cybersecurity", "Disclosure", "Public Companies"],
      url: "#"
    },
    {
      region: "USA",
      country: "United States",
      regulator: "FFIEC",
      title: "Updated IT Examination Handbook",
      date: "2025-12-10",
      priority: "medium",
      impact: "Enhanced focus on cloud security and third-party risk management",
      tags: ["IT Security", "Cloud", "Third Party"],
      url: "#"
    },
    {
      region: "UK",
      country: "United Kingdom",
      regulator: "FCA",
      title: "Consumer Duty Implementation Deadline",
      date: "2025-12-20",
      priority: "critical",
      impact: "Final implementation deadline for closed products and services",
      tags: ["Consumer Protection", "Compliance"],
      url: "#"
    },
    {
      region: "UK",
      country: "United Kingdom",
      regulator: "PRA",
      title: "Operational Resilience Updates",
      date: "2025-12-08",
      priority: "high",
      impact: "New requirements for impact tolerance testing and scenario analysis",
      tags: ["Operational Resilience", "Risk Management"],
      url: "#"
    },
    {
      region: "EMEA",
      country: "European Union",
      regulator: "ECB",
      title: "DORA Compliance Guidelines Released",
      date: "2025-12-18",
      priority: "critical",
      impact: "Digital Operational Resilience Act final implementation guidance",
      tags: ["DORA", "Digital Resilience", "Cybersecurity"],
      url: "#"
    },
    {
      region: "EMEA",
      country: "Germany",
      regulator: "BaFin",
      title: "AI in Financial Services Regulation",
      date: "2025-12-12",
      priority: "high",
      impact: "New requirements for AI model governance and explainability",
      tags: ["AI", "Model Risk", "Governance"],
      url: "#"
    },
    {
      region: "UAE",
      country: "United Arab Emirates",
      regulator: "CBUAE",
      title: "Enhanced AML/CFT Requirements",
      date: "2025-12-14",
      priority: "high",
      impact: "Strengthened customer due diligence and transaction monitoring",
      tags: ["AML", "CFT", "Compliance"],
      url: "#"
    },
    {
      region: "UAE",
      country: "Dubai",
      regulator: "DFSA",
      title: "Crypto Asset Regulatory Framework",
      date: "2025-12-11",
      priority: "medium",
      impact: "Comprehensive framework for digital asset service providers",
      tags: ["Crypto", "Digital Assets", "Licensing"],
      url: "#"
    },
    {
      region: "LATAM",
      country: "Brazil",
      regulator: "BCB",
      title: "Open Banking Phase 4 Launch",
      date: "2025-12-16",
      priority: "medium",
      impact: "Payment initiation and international transactions enabled",
      tags: ["Open Banking", "Payments", "API"],
      url: "#"
    },
    {
      region: "LATAM",
      country: "Mexico",
      regulator: "CNBV",
      title: "Fintech Regulation Updates",
      date: "2025-12-09",
      priority: "high",
      impact: "New requirements for crowdfunding and payment platforms",
      tags: ["Fintech", "Digital Payments", "Licensing"],
      url: "#"
    },
    {
      region: "EMEA",
      country: "France",
      regulator: "ACPR",
      title: "Climate Risk Stress Testing",
      date: "2025-12-13",
      priority: "medium",
      impact: "Mandatory climate scenario analysis for all banks",
      tags: ["Climate Risk", "Stress Testing", "ESG"],
      url: "#"
    },
    {
      region: "USA",
      country: "United States",
      regulator: "CFTC",
      title: "Derivatives Margin Requirements",
      date: "2025-12-17",
      priority: "high",
      impact: "Phase 6 implementation for smaller counterparties",
      tags: ["Derivatives", "Margin", "Risk"],
      url: "#"
    }
  ];

  // Region statistics
  const regionStats = [
    { name: "USA", updates: regulatoryUpdates.filter(u => u.region === "USA").length, criticalLevel: 85, color: "#3b82f6" },
    { name: "UK", updates: regulatoryUpdates.filter(u => u.region === "UK").length, criticalLevel: 90, color: "#8b5cf6" },
    { name: "EMEA", updates: regulatoryUpdates.filter(u => u.region === "EMEA").length, criticalLevel: 92, color: "#10b981" },
    { name: "UAE", updates: regulatoryUpdates.filter(u => u.region === "UAE").length, criticalLevel: 78, color: "#f59e0b" },
    { name: "LATAM", updates: regulatoryUpdates.filter(u => u.region === "LATAM").length, criticalLevel: 72, color: "#ef4444" }
  ];

  const filteredUpdates = selectedRegion === "all" 
    ? regulatoryUpdates 
    : regulatoryUpdates.filter(u => u.region === selectedRegion);

  const priorityColors = {
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f1623] border border-[#2a3548] rounded-lg p-2 shadow-lg">
          <p className="text-xs text-white font-semibold">{payload[0].payload?.name}</p>
          <p className="text-xs text-slate-400">{payload[0].value} updates</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Global Regulatory Intelligence</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time updates from regulators worldwide</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-semibold">Live Feed</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Region Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedRegion("all")}
            className={`${
              selectedRegion === "all"
                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                : "bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]"
            }`}
          >
            <Globe className="h-3 w-3 mr-1.5" />
            All Regions
          </Button>
          {regionStats.map((region) => (
            <Button
              key={region.name}
              size="sm"
              variant="outline"
              onClick={() => setSelectedRegion(region.name)}
              className={`${
                selectedRegion === region.name
                  ? "border-2"
                  : "bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]"
              }`}
              style={{
                backgroundColor: selectedRegion === region.name ? `${region.color}20` : undefined,
                borderColor: selectedRegion === region.name ? `${region.color}60` : undefined,
                color: selectedRegion === region.name ? region.color : undefined
              }}
            >
              <MapPin className="h-3 w-3 mr-1.5" />
              {region.name}
              <Badge className="ml-2 text-[10px]" variant="secondary">{region.updates}</Badge>
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode("feed")}
            className={`flex-1 ${
              viewMode === "feed"
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                : "bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]"
            }`}
          >
            <FileText className="h-3 w-3 mr-1.5" />
            Intelligence Feed
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode("radar")}
            className={`flex-1 ${
              viewMode === "radar"
                ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                : "bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]"
            }`}
          >
            <TrendingUp className="h-3 w-3 mr-1.5" />
            Regional Analysis
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode("distribution")}
            className={`flex-1 ${
              viewMode === "distribution"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]"
            }`}
          >
            <BarChart3 className="h-3 w-3 mr-1.5" />
            Distribution
          </Button>
        </div>

        {/* Content Views */}
        {viewMode === "feed" && (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredUpdates.map((update, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={priorityColors[update.priority]}>
                          {update.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {update.regulator}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {update.country}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-2">{update.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{update.impact}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#2a3548]">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(update.date).toLocaleDateString()}
                    </div>
                    <div className="flex gap-1">
                      {update.tags.map((tag, tagIdx) => (
                        <Badge key={tagIdx} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {viewMode === "radar" && (
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-[#2a3548] p-4">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={regionStats}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Radar
                  name="Critical Level"
                  dataKey="criticalLevel"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {regionStats.map((region) => (
                <div key={region.name} className="text-center p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-xs font-semibold text-white">{region.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{region.criticalLevel}% critical</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "distribution" && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-[#2a3548] p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="updates" radius={[6, 6, 0, 0]}>
                    {regionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {regulatoryUpdates.reduce((acc, update) => {
                const existing = acc.find(r => r.regulator === update.regulator);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ regulator: update.regulator, count: 1, region: update.region });
                }
                return acc;
              }, []).sort((a, b) => b.count - a.count).slice(0, 6).map((regulator, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="flex items-center justify-between">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    <Badge className="text-[10px]">{regulator.count}</Badge>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-white">{regulator.regulator}</div>
                    <div className="text-[10px] text-slate-400">{regulator.region}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}