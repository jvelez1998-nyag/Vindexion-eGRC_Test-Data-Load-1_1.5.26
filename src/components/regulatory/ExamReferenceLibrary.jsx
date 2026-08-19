import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Search, FileText, ExternalLink, Download,
  Shield, CheckCircle2, AlertTriangle, Brain, Target
} from "lucide-react";

export default function ExamReferenceLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const references = [
    {
      category: 'FFIEC',
      items: [
        { title: 'FFIEC IT Examination Handbook', type: 'Handbook', pages: 250, description: 'Comprehensive guide for IT examinations', url: '#', topics: ['Governance', 'Risk Management', 'Audit', 'Cybersecurity'] },
        { title: 'Cybersecurity Assessment Tool (CAT)', type: 'Tool', pages: 50, description: 'Self-assessment tool for cybersecurity preparedness', url: '#', topics: ['Threat Intelligence', 'Vulnerability Management', 'Incident Response'] },
        { title: 'Business Continuity Planning Booklet', type: 'Guide', pages: 75, description: 'BCP requirements and best practices', url: '#', topics: ['Business Impact Analysis', 'Recovery Strategies', 'Testing'] },
        { title: 'Outsourcing Technology Services', type: 'Guidance', pages: 40, description: 'Third-party risk management guidance', url: '#', topics: ['Due Diligence', 'Contract Management', 'Ongoing Monitoring'] }
      ]
    },
    {
      category: 'SOX',
      items: [
        { title: 'COSO Internal Control Framework', type: 'Framework', pages: 150, description: 'Foundation for SOX compliance', url: '#', topics: ['Control Environment', 'Risk Assessment', 'Monitoring'] },
        { title: 'PCAOB Auditing Standards', type: 'Standards', pages: 200, description: 'Audit requirements for public companies', url: '#', topics: ['Audit Planning', 'Testing', 'Reporting'] },
        { title: 'SOX 404 Implementation Guide', type: 'Guide', pages: 100, description: 'Step-by-step implementation guidance', url: '#', topics: ['Scoping', 'Documentation', 'Testing', 'Certification'] },
        { title: 'IT General Controls (ITGC) Handbook', type: 'Handbook', pages: 120, description: 'Technology controls for SOX compliance', url: '#', topics: ['Access Controls', 'Change Management', 'Backups'] }
      ]
    },
    {
      category: 'ISO 27001',
      items: [
        { title: 'ISO/IEC 27001:2022 Standard', type: 'Standard', pages: 60, description: 'Official ISMS requirements', url: '#', topics: ['ISMS Requirements', 'Annex A Controls', 'Certification Process'] },
        { title: 'ISO 27002 Implementation Guide', type: 'Guide', pages: 180, description: 'Control implementation guidance', url: '#', topics: ['114 Controls', 'Best Practices', 'Implementation'] },
        { title: 'Auditor Certification Study Guide', type: 'Study Guide', pages: 250, description: 'Lead auditor exam preparation', url: '#', topics: ['Audit Planning', 'Interviewing', 'Report Writing'] },
        { title: 'Risk Assessment Templates', type: 'Templates', pages: 30, description: 'Ready-to-use risk assessment tools', url: '#', topics: ['Asset Inventory', 'Threat Analysis', 'Risk Treatment'] }
      ]
    },
    {
      category: 'GDPR',
      items: [
        { title: 'GDPR Complete Text', type: 'Regulation', pages: 88, description: 'Official EU regulation text', url: '#', topics: ['Articles', 'Recitals', 'Definitions'] },
        { title: 'DPO Handbook', type: 'Handbook', pages: 150, description: 'Data Protection Officer guide', url: '#', topics: ['DPO Role', 'Responsibilities', 'Independence'] },
        { title: 'DPIA Templates & Guidelines', type: 'Templates', pages: 45, description: 'Data protection impact assessments', url: '#', topics: ['DPIA Process', 'Risk Assessment', 'Safeguards'] },
        { title: 'Breach Notification Guide', type: 'Guide', pages: 60, description: 'Incident response and notification', url: '#', topics: ['72-hour Rule', 'Notification Content', 'Documentation'] }
      ]
    },
    {
      category: 'NIST',
      items: [
        { title: 'NIST Cybersecurity Framework 2.0', type: 'Framework', pages: 100, description: 'CSF core functions and categories', url: '#', topics: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'] },
        { title: 'NIST SP 800-53 Rev 5', type: 'Publication', pages: 400, description: 'Security and privacy controls catalog', url: '#', topics: ['Control Families', 'Baselines', 'Tailoring'] },
        { title: 'Risk Management Framework (RMF)', type: 'Framework', pages: 120, description: 'Risk-based approach to security', url: '#', topics: ['Categorize', 'Select', 'Implement', 'Assess', 'Authorize'] },
        { title: 'Privacy Framework', type: 'Framework', pages: 80, description: 'Privacy risk management', url: '#', topics: ['Privacy Engineering', 'Risk Assessment', 'Controls'] }
      ]
    }
  ];

  const allReferences = references.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.category }))
  );

  const filteredReferences = allReferences.filter(ref => {
    const matchesSearch = !search || 
      ref.title.toLowerCase().includes(search.toLowerCase()) ||
      ref.description.toLowerCase().includes(search.toLowerCase()) ||
      ref.topics.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || ref.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Reference Library</h2>
            <p className="text-slate-400 text-sm mt-1">
              Comprehensive regulatory frameworks, standards, and guidance documents
            </p>
          </div>
        </div>
      </Card>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {references.map(cat => (
          <Card 
            key={cat.category}
            className={`cursor-pointer transition-all ${
              selectedCategory === cat.category
                ? 'bg-indigo-500/20 border-indigo-500/40'
                : 'bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30'
            }`}
            onClick={() => setSelectedCategory(selectedCategory === cat.category ? 'all' : cat.category)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{cat.items.length}</div>
              <div className="text-xs text-slate-400">{cat.category}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search by title, description, or topic..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
          />
        </div>
        {(search || selectedCategory !== 'all') && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-400">Showing {filteredReferences.length} references</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="h-7 text-xs text-indigo-400"
            >
              Clear
            </Button>
          </div>
        )}
      </Card>

      {/* Reference Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReferences.map((ref, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/40 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                      {ref.category}
                    </Badge>
                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
                      {ref.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-base text-white">{ref.title}</CardTitle>
                </div>
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-400">{ref.description}</p>
              
              <div className="text-xs text-slate-500">
                {ref.pages} pages
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">Topics:</div>
                <div className="flex flex-wrap gap-1">
                  {ref.topics.map((topic, tidx) => (
                    <Badge key={tidx} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 border-[#2a3548] text-slate-400">
                  <Download className="h-3 w-3 mr-2" />
                  Download
                </Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}