import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, ExternalLink, FileText } from "lucide-react";

export default function PrivacyRegulationLibrary() {
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);

  const regulations = [
    {
      id: 'gdpr',
      name: 'GDPR',
      fullName: 'General Data Protection Regulation',
      jurisdiction: 'European Union',
      effective: '2018-05-25',
      scope: 'Applies to organizations processing EU residents\' personal data',
      keyPrinciples: ['Lawfulness, fairness, transparency', 'Purpose limitation', 'Data minimization', 'Accuracy', 'Storage limitation', 'Integrity and confidentiality', 'Accountability'],
      penalties: 'Up to €20 million or 4% of global annual turnover',
      dataSubjectRights: ['Right to access', 'Right to rectification', 'Right to erasure', 'Right to restrict processing', 'Right to data portability', 'Right to object', 'Rights related to automated decision making'],
      keyArticles: [
        { article: 'Article 5', title: 'Principles', description: 'Core data protection principles' },
        { article: 'Article 6', title: 'Lawfulness', description: 'Legal basis for processing' },
        { article: 'Article 13-14', title: 'Information', description: 'Privacy notices' },
        { article: 'Article 15-22', title: 'Rights', description: 'Data subject rights' },
        { article: 'Article 25', title: 'Privacy by Design', description: 'Built-in protection' },
        { article: 'Article 32', title: 'Security', description: 'Security of processing' },
        { article: 'Article 33-34', title: 'Breach', description: 'Breach notification (72 hours)' },
        { article: 'Article 35', title: 'DPIA', description: 'Data Protection Impact Assessment' }
      ]
    },
    {
      id: 'ccpa',
      name: 'CCPA',
      fullName: 'California Consumer Privacy Act',
      jurisdiction: 'California, USA',
      effective: '2020-01-01',
      scope: 'Applies to for-profit businesses meeting thresholds processing CA residents\' data',
      keyPrinciples: ['Transparency', 'Consumer control', 'Accountability', 'Non-discrimination'],
      penalties: 'Up to $7,500 per intentional violation, $2,500 per unintentional violation',
      dataSubjectRights: ['Right to know', 'Right to delete', 'Right to opt-out of sale', 'Right to non-discrimination'],
      keyArticles: [
        { article: '1798.100', title: 'Right to Know', description: 'Information disclosure requirements' },
        { article: '1798.105', title: 'Right to Delete', description: 'Deletion requests' },
        { article: '1798.110', title: 'Disclosure', description: 'Categories disclosed' },
        { article: '1798.115', title: 'Sale Disclosure', description: 'Information about sales' },
        { article: '1798.120', title: 'Opt-Out', description: 'Right to opt-out of sale' },
        { article: '1798.130', title: 'Privacy Notice', description: 'Notice requirements' },
        { article: '1798.135', title: 'Do Not Sell', description: 'Clear link requirements' }
      ]
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      fullName: 'Health Insurance Portability and Accountability Act',
      jurisdiction: 'United States',
      effective: '1996-08-21',
      scope: 'Applies to covered entities and business associates handling PHI',
      keyPrinciples: ['Privacy', 'Security', 'Breach notification', 'Enforcement'],
      penalties: 'Up to $1.5 million per violation category per year',
      dataSubjectRights: ['Right to access', 'Right to amend', 'Right to accounting of disclosures', 'Right to request restrictions'],
      keyArticles: [
        { article: 'Privacy Rule', title: '45 CFR Part 160/164', description: 'PHI privacy standards' },
        { article: 'Security Rule', title: '45 CFR Part 160/164', description: 'ePHI security requirements' },
        { article: 'Breach Notification', title: '45 CFR Part 164 Subpart D', description: 'Breach notification requirements' },
        { article: 'Administrative Safeguards', title: '§164.308', description: 'Policies and procedures' },
        { article: 'Physical Safeguards', title: '§164.310', description: 'Physical access controls' },
        { article: 'Technical Safeguards', title: '§164.312', description: 'Technology controls' }
      ]
    },
    {
      id: 'pipeda',
      name: 'PIPEDA',
      fullName: 'Personal Information Protection and Electronic Documents Act',
      jurisdiction: 'Canada',
      effective: '2001-01-01',
      scope: 'Applies to private sector organizations in Canada',
      keyPrinciples: ['Accountability', 'Identifying purposes', 'Consent', 'Limiting collection', 'Limiting use/disclosure', 'Accuracy', 'Safeguards', 'Openness', 'Individual access', 'Challenging compliance'],
      penalties: 'Up to CAD $100,000 per violation',
      dataSubjectRights: ['Right to access', 'Right to challenge accuracy', 'Right to withdraw consent'],
      keyArticles: [
        { article: 'Principle 1', title: 'Accountability', description: 'Organization responsibility' },
        { article: 'Principle 2', title: 'Purposes', description: 'Identify collection purposes' },
        { article: 'Principle 3', title: 'Consent', description: 'Knowledge and consent' },
        { article: 'Principle 4', title: 'Limiting Collection', description: 'Minimal collection' },
        { article: 'Principle 7', title: 'Safeguards', description: 'Security safeguards' }
      ]
    }
  ];

  const filtered = regulations.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.jurisdiction.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            Privacy Regulation Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search regulations..."
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {filtered.map(reg => (
          <Card key={reg.id} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/30 transition-all cursor-pointer" onClick={() => setSelectedReg(reg)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base mb-1">{reg.name}</CardTitle>
                  <p className="text-sm text-slate-400">{reg.fullName}</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400">{reg.jurisdiction}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Effective Date</div>
                <div className="text-sm text-slate-300">{new Date(reg.effective).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Scope</div>
                <p className="text-xs text-slate-300">{reg.scope}</p>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Maximum Penalties</div>
                <p className="text-xs text-rose-400 font-semibold">{reg.penalties}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-3 w-3 mr-2" />
                View Full Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedReg && (
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selectedReg.fullName} - Deep Dive</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReg(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">Key Principles</h4>
              <div className="flex flex-wrap gap-2">
                {selectedReg.keyPrinciples.map((p, i) => (
                  <Badge key={i} className="bg-emerald-500/20 text-emerald-400">{p}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Data Subject Rights</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                {selectedReg.dataSubjectRights.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Articles/Provisions</h4>
              <div className="space-y-2">
                {selectedReg.keyArticles.map((art, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-white text-sm mb-1">{art.article}: {art.title}</div>
                        <p className="text-xs text-slate-400">{art.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}