import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Lightbulb, BookOpen, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIAnswerFeedback({ question, userAnswer, isLive = false }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const getFeedback = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are an expert GRC exam tutor. A student just answered this question.

QUESTION: ${question.question}

OPTIONS:
${question.options.join('\n')}

STUDENT'S ANSWER: ${userAnswer}
CORRECT ANSWER: ${question.correct}
IS CORRECT: ${userAnswer === question.correct}

ADDITIONAL CONTEXT:
- Regulation Section: ${question.regulation_section || 'N/A'}
- Reference: ${question.reference || 'N/A'}
- Risk Level if Wrong: ${question.risk_level || 'N/A'}
- Related Controls: ${question.related_controls?.join(', ') || 'N/A'}

PROVIDE:

1. **Immediate Feedback**
   ${userAnswer === question.correct ? 
     '- Affirm their correct answer and explain WHY it\'s right' :
     '- Gently explain what was incorrect about their choice\n- Explain the correct answer clearly'}

2. **Learning Point**
   - Key concept they should understand from this question
   - Why this concept matters in real-world GRC
   - Common misconceptions to avoid

3. **Deeper Explanation**
   - Detailed explanation of the correct answer
   - Reference to specific regulation sections
   - How this applies in practice

4. **Related Concepts**
   - Connected topics they should review
   - How this relates to other ${question.regulation_section ? 'controls/requirements' : 'concepts'}

5. **Memory Tip**
   - A memorable way to remember this concept
   - Mnemonic or practical example

Be encouraging, clear, and pedagogical. Format in markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setFeedback(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get AI feedback");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!feedback && !isLive) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={getFeedback}
        disabled={analyzing}
        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
      >
        {analyzing ? (
          <>
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Getting feedback...
          </>
        ) : (
          <>
            <Brain className="h-3 w-3 mr-2" />
            Get AI Feedback
          </>
        )}
      </Button>
    );
  }

  if (feedback) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-4 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-purple-400" />
          <h4 className="text-sm font-semibold text-white">AI Tutor Feedback</h4>
        </div>
        <ReactMarkdown 
          className="prose prose-sm prose-invert max-w-none text-slate-300"
          components={{
            h1: ({children}) => <h1 className="text-base font-bold text-white mb-2 mt-3 first:mt-0">{children}</h1>,
            h2: ({children}) => <h2 className="text-sm font-semibold text-white mb-2 mt-3">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm font-medium text-white mb-1 mt-2">{children}</h3>,
            p: ({children}) => <p className="text-slate-300 mb-2 leading-relaxed text-xs">{children}</p>,
            ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
            li: ({children}) => <li className="text-slate-300 text-xs">{children}</li>,
            strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
            blockquote: ({children}) => (
              <blockquote className="border-l-2 border-purple-400 pl-3 my-2 text-purple-300 italic text-xs">
                {children}
              </blockquote>
            ),
          }}
        >
          {feedback}
        </ReactMarkdown>
      </Card>
    );
  }

  return null;
}