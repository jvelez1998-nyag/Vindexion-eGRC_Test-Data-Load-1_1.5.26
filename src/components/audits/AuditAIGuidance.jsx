import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Brain, Target, CheckCircle2, FileText, Lightbulb } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const GUIDANCE_CATEGORIES = [
  {
    id: 'planning',
    title: 'Audit Planning',
    icon: Target,
    color: 'indigo',
    prompts: [
      'How do I develop an effective audit plan?',
      'What should I include in the audit scope?',
      'How to assess materiality thresholds?'
    ]
  },
  {
    id: 'execution',
    title: 'Audit Execution',
    icon: CheckCircle2,
    color: 'emerald',
    prompts: [
      'What are the best sampling techniques?',
      'How to perform substantive testing?',
      'Testing internal controls effectively'
    ]
  },
  {
    id: 'findings',
    title: 'Findings & Reporting',
    icon: FileText,
    color: 'amber',
    prompts: [
      'How to write clear audit findings?',
      'What makes a strong recommendation?',
      'How to classify finding severity?'
    ]
  },
  {
    id: 'insights',
    title: 'Best Practices',
    icon: Lightbulb,
    color: 'violet',
    prompts: [
      'Industry audit best practices',
      'Common audit mistakes to avoid',
      'Tips for efficient auditing'
    ]
  }
];

export default function AuditAIGuidance() {
  const [selectedCategory, setSelectedCategory] = useState(GUIDANCE_CATEGORIES[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const askAI = async (question) => {
    setLoading(true);
    try {
      const prompt = `You are an expert audit consultant. Provide comprehensive guidance on:

${question}

Provide:
1. Clear explanation of the concept
2. Step-by-step approach
3. Best practices and standards
4. Common pitfalls to avoid
5. Practical examples
6. Key takeaways

Format in clear, professional markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiResponse(response);
      toast.success("Guidance generated");
    } catch (error) {
      toast.error("Failed to generate guidance");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setCustomQuestion(prompt);
    askAI(prompt);
  };

  const colorClasses = {
    indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Guidance Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {GUIDANCE_CATEGORIES.map(category => {
              const Icon = category.icon;
              const isSelected = selectedCategory.id === category.id;
              
              return (
                <Card
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    setAiResponse(null);
                    setCustomQuestion('');
                  }}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${colorClasses[category.color]}`
                      : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isSelected ? `text-${category.color}-400` : 'text-slate-500'}`} />
                      <h4 className="text-sm font-medium text-white">{category.title}</h4>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
            <h4 className="text-xs font-medium text-indigo-400 mb-2">💡 AI Guidance</h4>
            <p className="text-xs text-slate-400">
              Ask me anything about auditing. I can help with planning, execution, reporting, and best practices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Interface */}
      <div className="lg:col-span-2 space-y-6">
        <Card className={`bg-gradient-to-br ${colorClasses[selectedCategory.color]} border-${selectedCategory.color}-500/30`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <selectedCategory.icon className={`h-6 w-6 text-${selectedCategory.color}-400`} />
              <div>
                <CardTitle className="text-lg">{selectedCategory.title}</CardTitle>
                <p className="text-sm text-slate-400 mt-1">AI-powered audit guidance</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Prompts */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Quick Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {selectedCategory.prompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={loading}
                  className="border-[#2a3548] hover:bg-[#2a3548] justify-start text-left h-auto py-3 px-4"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-violet-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{prompt}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Question */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Ask Custom Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g., What are the key steps in performing a risk assessment?"
                rows={4}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
              <Button
                onClick={() => askAI(customQuestion)}
                disabled={!customQuestion.trim() || loading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Get AI Guidance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Response */}
        {aiResponse && (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-violet-400" />
                AI Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="bg-[#151d2e] border border-[#2a3548] rounded-xl p-6">
                  <ReactMarkdown 
                    className="prose prose-sm prose-invert max-w-none text-slate-300"
                    components={{
                      h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-0">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                      p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-slate-300">{children}</li>,
                      strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-violet-500 pl-4 my-4 text-slate-400 italic">
                          {children}
                        </blockquote>
                      ),
                      code: ({inline, children}) => inline ? (
                        <code className="px-1.5 py-0.5 rounded bg-[#1a2332] text-violet-400 text-xs">{children}</code>
                      ) : (
                        <code className="block px-3 py-2 rounded bg-[#1a2332] text-slate-300 text-xs my-2">{children}</code>
                      ),
                    }}
                  >
                    {aiResponse}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}