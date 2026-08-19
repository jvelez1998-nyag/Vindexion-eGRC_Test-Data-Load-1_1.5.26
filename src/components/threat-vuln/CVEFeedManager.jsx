import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, ExternalLink, AlertTriangle, Shield, Download } from "lucide-react";

const MOCK_CVES = [
  {
    id: "CVE-2024-12345",
    description: "Critical remote code execution vulnerability in Apache Web Server",
    cvss: 9.8,
    severity: "critical",
    published: "2024-12-10",
    affected: "Apache HTTP Server 2.4.x",
    status: "Unpatched",
    exploitAvailable: true
  },
  {
    id: "CVE-2024-11223",
    description: "SQL injection vulnerability in WordPress plugin",
    cvss: 8.5,
    severity: "high",
    published: "2024-12-08",
    affected: "WordPress Contact Form 7",
    status: "Patch Available",
    exploitAvailable: false
  },
  {
    id: "CVE-2024-10987",
    description: "Cross-site scripting (XSS) in React component library",
    cvss: 7.2,
    severity: "high",
    published: "2024-12-05",
    affected: "React-Bootstrap < 2.9.0",
    status: "Patched",
    exploitAvailable: false
  },
  {
    id: "CVE-2024-10456",
    description: "Authentication bypass in Microsoft Exchange Server",
    cvss: 9.1,
    severity: "critical",
    published: "2024-12-03",
    affected: "Exchange Server 2019/2016",
    status: "Patch Available",
    exploitAvailable: true
  },
  {
    id: "CVE-2024-10234",
    description: "Privilege escalation in Linux kernel",
    cvss: 7.8,
    severity: "high",
    published: "2024-11-30",
    affected: "Linux Kernel 5.x - 6.x",
    status: "Patched",
    exploitAvailable: false
  }
];

export default function CVEFeedManager() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const filteredCVEs = MOCK_CVES.filter(cve => {
    const matchesSearch = !search || 
      cve.id.toLowerCase().includes(search.toLowerCase()) ||
      cve.description.toLowerCase().includes(search.toLowerCase()) ||
      cve.affected.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || cve.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">CVE Intelligence Feed</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Real-time vulnerability intelligence from NVD and other sources</p>
            </div>
            <Button onClick={handleRefresh} disabled={loading} variant="outline" className="border-[#2a3548]">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search CVEs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Severity</SelectItem>
                <SelectItem value="critical" className="text-white">Critical</SelectItem>
                <SelectItem value="high" className="text-white">High</SelectItem>
                <SelectItem value="medium" className="text-white">Medium</SelectItem>
                <SelectItem value="low" className="text-white">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-[#151d2e]">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{MOCK_CVES.length}</div>
              <div className="text-xs text-slate-400">Total CVEs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-400">{MOCK_CVES.filter(c => c.severity === 'critical').length}</div>
              <div className="text-xs text-slate-400">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{MOCK_CVES.filter(c => c.exploitAvailable).length}</div>
              <div className="text-xs text-slate-400">Exploitable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{MOCK_CVES.filter(c => c.status === 'Patched').length}</div>
              <div className="text-xs text-slate-400">Patched</div>
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {filteredCVEs.map((cve) => (
                <Card key={cve.id} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-white">{cve.id}</h3>
                          <Badge className={
                            cve.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                            cve.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }>
                            {cve.severity} - CVSS {cve.cvss}
                          </Badge>
                          {cve.exploitAvailable && (
                            <Badge className="bg-red-500/20 text-red-400">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Exploit Available
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{cve.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Affected: {cve.affected}</span>
                          <span>•</span>
                          <span>Published: {cve.published}</span>
                          <span>•</span>
                          <Badge className="bg-blue-500/10 text-blue-400 text-xs">{cve.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-[#2a3548]">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Download className="h-3 w-3 mr-1" />
                          Import
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}