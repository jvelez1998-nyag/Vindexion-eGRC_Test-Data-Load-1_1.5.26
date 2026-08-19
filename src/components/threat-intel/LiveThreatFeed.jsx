import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, TrendingUp, Radio } from "lucide-react";
import { format } from "date-fns";

export default function LiveThreatFeed() {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    // Simulated live threat feed
    const initialThreats = [
      {
        id: 1,
        type: 'cve',
        severity: 'critical',
        title: 'Zero-day vulnerability in Apache HTTP Server',
        source: 'NVD',
        timestamp: new Date(),
        description: 'Remote code execution vulnerability discovered'
      },
      {
        id: 2,
        type: 'ttp',
        severity: 'high',
        title: 'Phishing campaign targeting financial sector',
        source: 'Threat Intel Feed',
        timestamp: new Date(Date.now() - 300000),
        description: 'Sophisticated spearphishing attacks observed'
      },
      {
        id: 3,
        type: 'actor',
        severity: 'high',
        title: 'APT group targeting healthcare organizations',
        source: 'OSINT',
        timestamp: new Date(Date.now() - 600000),
        description: 'Increased activity from known threat actor'
      }
    ];

    setThreats(initialThreats);

    // Simulate new threats arriving
    const interval = setInterval(() => {
      const newThreat = {
        id: Date.now(),
        type: ['cve', 'ttp', 'actor'][Math.floor(Math.random() * 3)],
        severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
        title: [
          'New ransomware variant detected',
          'Credential stuffing attack in progress',
          'Supply chain vulnerability identified',
          'Malware campaign targeting cloud infrastructure',
          'DDoS attack patterns observed'
        ][Math.floor(Math.random() * 5)],
        source: ['NVD', 'Threat Intel Feed', 'OSINT', 'MITRE'][Math.floor(Math.random() * 4)],
        timestamp: new Date(),
        description: 'Real-time threat intelligence update'
      };

      setThreats(prev => [newThreat, ...prev].slice(0, 50));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Radio className="h-4 w-4 text-red-400 animate-pulse" />
          Live Threat Intelligence Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {threats.map(threat => (
              <div
                key={threat.id}
                className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {threat.type === 'cve' && <Shield className="h-4 w-4 text-amber-400" />}
                    {threat.type === 'ttp' && <TrendingUp className="h-4 w-4 text-purple-400" />}
                    {threat.type === 'actor' && <AlertTriangle className="h-4 w-4 text-rose-400" />}
                    <Badge className={`${
                      threat.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      threat.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    } text-xs`}>
                      {threat.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{threat.source}</Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    {format(threat.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{threat.title}</h4>
                <p className="text-xs text-slate-400">{threat.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}