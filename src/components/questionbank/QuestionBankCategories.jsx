import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, FileQuestion, ChevronRight, Star } from "lucide-react";

export default function QuestionBankCategories({ questions, isLoading, onQuestionClick }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (isLoading) {
    return <Skeleton className="h-96 bg-[#1a2332]" />;
  }

  // Group by framework
  const byFramework = questions.reduce((acc, q) => {
    const fw = q.framework || 'Uncategorized';
    if (!acc[fw]) acc[fw] = [];
    acc[fw].push(q);
    return acc;
  }, {});

  // Group by difficulty
  const byDifficulty = questions.reduce((acc, q) => {
    const diff = q.difficulty || 'intermediate';
    if (!acc[diff]) acc[diff] = [];
    acc[diff].push(q);
    return acc;
  }, {});

  // Group by type
  const byType = questions.reduce((acc, q) => {
    const type = q.question_type || 'conceptual';
    if (!acc[type]) acc[type] = [];
    acc[type].push(q);
    return acc;
  }, {});

  // Group by risk level
  const byRiskLevel = questions.reduce((acc, q) => {
    const risk = q.risk_level || 'medium';
    if (!acc[risk]) acc[risk] = [];
    acc[risk].push(q);
    return acc;
  }, {});

  const CategoryGrid = ({ data, colorMap }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(data)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([category, items]) => (
          <Card 
            key={category}
            onClick={() => setSelectedCategory({ category, items })}
            className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${colorMap[category]?.bg || 'bg-slate-500/20'} border ${colorMap[category]?.border || 'border-slate-500/30'}`}>
                  <Layers className={`h-5 w-5 ${colorMap[category]?.text || 'text-slate-400'}`} />
                </div>
                <div className="text-3xl font-bold text-white">{items.length}</div>
              </div>
              <h3 className="text-white font-semibold capitalize mb-1">{category}</h3>
              <p className="text-xs text-slate-400">
                {items.filter(i => i.is_verified).length} verified
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  );

  const frameworkColors = {
    'SOX': { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    'SOC2': { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    'ISO27001': { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
    'GDPR': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    'NIST': { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  };

  const difficultyColors = {
    'beginner': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    'intermediate': { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    'advanced': { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-400' },
  };

  const typeColors = {
    'scenario': { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    'definition': { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
    'technical': { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    'conceptual': { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
  };

  const riskColors = {
    'low': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    'medium': { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    'high': { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    'critical': { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-400' },
  };

  return (
    <div className="space-y-6">
      {selectedCategory ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant="outline"
              size="sm"
              className="border-[#2a3548]"
            >
              ← Back
            </Button>
            <div>
              <h2 className="text-xl font-bold text-white capitalize">{selectedCategory.category}</h2>
              <p className="text-sm text-slate-400">{selectedCategory.items.length} questions</p>
            </div>
          </div>

          <div className="grid gap-4">
            {selectedCategory.items.map((question) => (
              <Card 
                key={question.id}
                onClick={() => onQuestionClick(question)}
                className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/30 cursor-pointer transition-all p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">
                        {question.framework}
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-400 text-[10px] capitalize">
                        {question.difficulty}
                      </Badge>
                      {question.is_verified && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-white font-medium mb-2 leading-relaxed">{question.question_text}</h3>
                    {question.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {question.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 flex-shrink-0 ml-3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="framework" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="framework">By Framework</TabsTrigger>
            <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
            <TabsTrigger value="type">By Type</TabsTrigger>
            <TabsTrigger value="risk">By Risk Level</TabsTrigger>
          </TabsList>

          <TabsContent value="framework">
            <CategoryGrid data={byFramework} colorMap={frameworkColors} />
          </TabsContent>

          <TabsContent value="difficulty">
            <CategoryGrid data={byDifficulty} colorMap={difficultyColors} />
          </TabsContent>

          <TabsContent value="type">
            <CategoryGrid data={byType} colorMap={typeColors} />
          </TabsContent>

          <TabsContent value="risk">
            <CategoryGrid data={byRiskLevel} colorMap={riskColors} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}