import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Search, Plus, Download, Send, 
  CheckCircle2, AlertTriangle, Shield, Lock 
} from "lucide-react";

const QUESTIONNAIRE_TEMPLATES = [
  {
    id: 'security',
    name: 'Security Assessment Questionnaire',
    category: 'Security',
    questions: 42,
    difficulty: 'Advanced',
    frameworks: ['ISO 27001', 'NIST CSF', 'CIS'],
    icon: Shield,
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
  },
  {
    id: 'compliance',
    name: 'Compliance Readiness Assessment',
    category: 'Compliance',
    questions: 38,
    difficulty: 'Intermediate',
    frameworks: ['SOX', 'GDPR', 'HIPAA'],
    icon: CheckCircle2,
    color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20'
  },
  {
    id: 'risk',
    name: 'Enterprise Risk Assessment',
    category: 'Risk Management',
    questions: 35,
    difficulty: 'Advanced',
    frameworks: ['COSO', 'ISO 31000'],
    icon: AlertTriangle,
    color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20'
  },
  {
    id: 'privacy',
    name: 'Data Privacy & Protection',
    category: 'Privacy',
    questions: 29,
    difficulty: 'Intermediate',
    frameworks: ['GDPR', 'CCPA', 'PIPEDA'],
    icon: Lock,
    color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20'
  },
  {
    id: 'vendor',
    name: 'Third-Party Vendor Assessment',
    category: 'Third Party',
    questions: 45,
    difficulty: 'Comprehensive',
    frameworks: ['ISO 27001', 'SOC 2'],
    icon: FileText,
    color: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20'
  },
  {
    id: 'financial',
    name: 'Financial Controls Assessment',
    category: 'Financial',
    questions: 31,
    difficulty: 'Advanced',
    frameworks: ['SOX', 'COSO'],
    icon: CheckCircle2,
    color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20'
  }
];

export default function ClientQuestionnaireLibrary({ onSelect }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [...new Set(QUESTIONNAIRE_TEMPLATES.map(t => t.category))];

  const filteredTemplates = QUESTIONNAIRE_TEMPLATES.filter(template => {
    const matchesSearch = !search || 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Questionnaire Library</h3>
                <p className="text-xs text-slate-400">Industry-standard assessment templates</p>
              </div>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {QUESTIONNAIRE_TEMPLATES.length} Templates
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search questionnaires..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className={selectedCategory === "all" ? "bg-cyan-600" : "border-[#2a3548] text-slate-400"}
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-cyan-600" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {filteredTemplates.map(template => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className={`bg-gradient-to-br ${template.color} hover:scale-[1.02] transition-all cursor-pointer`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#1a2332]/50">
                        <Icon className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-white">{template.name}</CardTitle>
                        <Badge className="mt-1 text-[9px] bg-slate-500/20 text-slate-400">{template.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{template.questions} Questions</span>
                    <Badge className="bg-indigo-500/20 text-indigo-400 text-[9px]">{template.difficulty}</Badge>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Frameworks</div>
                    <div className="flex flex-wrap gap-1">
                      {template.frameworks.map((fw, idx) => (
                        <Badge key={idx} className="text-[8px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {fw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-700 h-8 text-xs" onClick={() => onSelect?.(template)}>
                      <Send className="h-3 w-3 mr-1" />
                      Send to Client
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-8">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}