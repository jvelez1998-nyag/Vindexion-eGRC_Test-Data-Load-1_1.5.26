import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Shield, Users, Target, ExternalLink, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ThreatIntelligenceEnrichment({ incident, onEnrichmentComplete }) {
  const [enrichment, setEnrichment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    enrichIncident();
  }, [incident.id]);

  const enrichIncident = async () => {
    setLoading(true);
    
    try {
      const prompt = `Analyze this security incident and provide threat intelligence enrichment:

INCIDENT: ${incident.title}
DESCRIPTION: ${incident.description || 'N/A'}
TYPE: ${incident.incident_type}
SEVERITY: ${incident.severity}
AFFECTED SYSTEMS: ${incident.affected_systems?.join(', ') || 'N/A'}

Provide threat intelligence analysis in JSON format:

{
  "iocs": {
    "ip_addresses": ["list of suspicious IPs"],
    "domains": ["list of malicious domains"],
    "file_hashes": ["list of file hashes"],
    "urls": ["list of malicious URLs"]
  },
  "threat_actors": [
    {
      "name": "threat actor name",
      "apt_group": "APT designation",
      "motivation": "financial/espionage/hacktivism",
      "target_industries": ["industry1", "industry2"],
      "confidence": "high/medium/low"
    }
  ],
  "attack_patterns": [
    {
      "technique": "MITRE ATT&CK technique",
      "tactic": "MITRE ATT&CK tactic",
      "description": "brief description",
      "mitigation": "how to mitigate"
    }
  ],
  "threat_score": 85,
  "priority_recommendation": "critical/high/medium/low",
  "known_campaign": "campaign name if applicable",
  "first_seen": "when this threat was first observed",
  "last_activity": "most recent activity",
  "affected_regions": ["geographic regions"],
  "indicators_of_compromise": ["detailed IOC descriptions"],
  "recommended_actions": ["prioritized action items"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            iocs: { type: "object" },
            threat_actors: { type: "array" },
            attack_patterns: { type: "array" },
            threat_score: { type: "number" },
            priority_recommendation: { type: "string" },
            known_campaign: { type: "string" },
            first_seen: { type: "string" },
            last_activity: { type: "string" },
            affected_regions: { type: "array" },
            indicators_of_compromise: { type: "array" },
            recommended_actions: { type: "array" }
          }
        }
      });

      setEnrichment(response);
      if (onEnrichmentComplete) {
        onEnrichmentComplete(response);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch threat intelligence");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#151d2e] border-[#2a3548]">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mr-2" />
          <span className="text-sm text-slate-400">Enriching with threat intelligence...</span>
        </CardContent>
      </Card>
    );
  }

  if (!enrichment) return null;

  return (
    <div className="space-y-4">
      {/* Threat Score & Priority */}
      <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 mb-1">Threat Intelligence Score</div>
              <div className="text-3xl font-bold text-white">{enrichment.threat_score}/100</div>
            </div>
            <div className="text-right">
              <Badge className={
                enrichment.priority_recommendation === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                enrichment.priority_recommendation === 'high' ? 'bg-amber-500/20 text-amber-400' :
                enrichment.priority_recommendation === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }>
                {enrichment.priority_recommendation?.toUpperCase()} Priority
              </Badge>
              {enrichment.known_campaign && (
                <div className="text-xs text-slate-400 mt-2">
                  Campaign: {enrichment.known_campaign}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Actors */}
      {enrichment.threat_actors?.length > 0 && (
        <Card className="bg-[#151d2e] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              Associated Threat Actors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrichment.threat_actors.map((actor, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{actor.name}</h4>
                    {actor.apt_group && (
                      <Badge className="bg-rose-500/10 text-rose-400 text-xs mt-1">
                        {actor.apt_group}
                      </Badge>
                    )}
                  </div>
                  <Badge className={
                    actor.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                    actor.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }>
                    {actor.confidence} confidence
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Motivation: {actor.motivation}</div>
                  {actor.target_industries?.length > 0 && (
                    <div>Targets: {actor.target_industries.join(', ')}</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* IOCs */}
      {(enrichment.iocs?.ip_addresses?.length > 0 || 
        enrichment.iocs?.domains?.length > 0 || 
        enrichment.iocs?.file_hashes?.length > 0 ||
        enrichment.iocs?.urls?.length > 0) && (
        <Card className="bg-[#151d2e] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-red-400" />
              Indicators of Compromise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrichment.iocs.ip_addresses?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 mb-1">IP Addresses</div>
                <div className="flex flex-wrap gap-1">
                  {enrichment.iocs.ip_addresses.map((ip, idx) => (
                    <Badge key={idx} className="bg-red-500/10 text-red-400 font-mono text-xs">
                      {ip}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {enrichment.iocs.domains?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Domains</div>
                <div className="flex flex-wrap gap-1">
                  {enrichment.iocs.domains.map((domain, idx) => (
                    <Badge key={idx} className="bg-amber-500/10 text-amber-400 font-mono text-xs">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {enrichment.iocs.file_hashes?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 mb-1">File Hashes</div>
                <div className="space-y-1">
                  {enrichment.iocs.file_hashes.map((hash, idx) => (
                    <div key={idx} className="text-xs text-slate-400 font-mono bg-[#1a2332] p-2 rounded">
                      {hash}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attack Patterns */}
      {enrichment.attack_patterns?.length > 0 && (
        <Card className="bg-[#151d2e] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              MITRE ATT&CK Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrichment.attack_patterns.map((pattern, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{pattern.technique}</h4>
                    <Badge className="bg-purple-500/10 text-purple-400 text-xs mt-1">
                      {pattern.tactic}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">{pattern.description}</p>
                <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400">Mitigation: {pattern.mitigation}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {enrichment.recommended_actions?.length > 0 && (
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-emerald-400" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {enrichment.recommended_actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={enrichIncident} variant="outline" size="sm" className="border-[#2a3548]">
          <RefreshCw className="h-3 w-3 mr-2" />
          Refresh Intelligence
        </Button>
      </div>
    </div>
  );
}