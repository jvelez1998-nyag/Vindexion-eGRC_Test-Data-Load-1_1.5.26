import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, CheckCircle2, AlertCircle, RefreshCw, Settings } from "lucide-react";

const threatFeeds = [
  { 
    name: "MITRE ATT&CK", 
    status: "connected", 
    lastSync: "2 hours ago",
    recordsImported: 1247,
    description: "Adversary tactics and techniques knowledge base"
  },
  { 
    name: "NVD (CVE Database)", 
    status: "connected", 
    lastSync: "30 minutes ago",
    recordsImported: 8954,
    description: "National Vulnerability Database - CVE feeds"
  },
  { 
    name: "CISA Known Exploits", 
    status: "connected", 
    lastSync: "1 hour ago",
    recordsImported: 342,
    description: "Known exploited vulnerabilities catalog"
  },
  { 
    name: "AlienVault OTX", 
    status: "disconnected", 
    lastSync: "Never",
    recordsImported: 0,
    description: "Open threat exchange community"
  },
  { 
    name: "Recorded Future", 
    status: "disconnected", 
    lastSync: "Never",
    recordsImported: 0,
    description: "Real-time threat intelligence platform"
  }
];

export default function ThreatIntelligenceIntegration() {
  const [feeds, setFeeds] = useState(threatFeeds);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-rose-400" />
            <div>
              <CardTitle className="text-white">Threat Intelligence Feeds</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Real-time threat data to enhance risk assessments and vulnerability management</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {feeds.map((feed, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{feed.name}</h3>
                    <Badge className={
                      feed.status === "connected" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-slate-500/20 text-slate-400"
                    }>
                      {feed.status === "connected" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{feed.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Last Sync:</span>
                      <span className="text-slate-300 ml-2">{feed.lastSync}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Records Imported:</span>
                      <span className="text-slate-300 ml-2">{feed.recordsImported.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {feed.status === "connected" && (
                    <Button size="sm" variant="outline" className="border-[#2a3548]">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="border-[#2a3548]">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-sync threat data</Label>
              <p className="text-xs text-slate-400">Automatically sync new threats hourly</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Create risks from critical threats</Label>
              <p className="text-xs text-slate-400">Auto-create risk entries for critical CVEs</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Notify on new high-severity threats</Label>
              <p className="text-xs text-slate-400">Send notifications for CVSS ≥ 9.0</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}