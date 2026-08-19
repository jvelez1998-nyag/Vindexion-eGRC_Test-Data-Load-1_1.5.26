import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BookOpen, Lightbulb, AlertTriangle, CheckCircle2, XCircle, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnhancedQuestionDisplay({ 
  question, 
  onAnswer, 
  showFeedback = false,
  selectedAnswer = null 
}) {
  const [expanded, setExpanded] = useState({
    explanation: false,
    reference: false,
    commonMistakes: false,
    relatedConcepts: false
  });

  const isCorrect = selectedAnswer === question.correct_answer;
  const hasAnswered = selectedAnswer !== null;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {question.scenario && (
              <div className="p-3 mb-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Scenario:
                </div>
                <p className="text-sm text-slate-300">{question.scenario}</p>
              </div>
            )}
            <CardTitle className="text-base leading-relaxed">{question.question}</CardTitle>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={
              question.difficulty === 'advanced' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
              question.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }>
              {question.difficulty}
            </Badge>
            {question.category && (
              <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                {question.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedAnswer} onValueChange={onAnswer}>
          <div className="space-y-3">
            {question.options?.map((option, idx) => {
              const letter = option.charAt(0);
              const isSelected = selectedAnswer === letter;
              const isCorrectAnswer = letter === question.correct_answer;
              
              let borderColor = 'border-[#2a3548]';
              let bgColor = 'bg-[#151d2e]';
              
              if (hasAnswered && showFeedback) {
                if (isCorrectAnswer) {
                  borderColor = 'border-emerald-500/50';
                  bgColor = 'bg-emerald-500/10';
                } else if (isSelected && !isCorrectAnswer) {
                  borderColor = 'border-rose-500/50';
                  bgColor = 'bg-rose-500/10';
                }
              } else if (isSelected) {
                borderColor = 'border-indigo-500/50';
                bgColor = 'bg-indigo-500/10';
              }

              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${bgColor} ${borderColor} hover:border-indigo-500/40`}
                  onClick={() => !hasAnswered && onAnswer(letter)}
                >
                  <RadioGroupItem value={letter} id={`opt-${letter}`} disabled={hasAnswered} />
                  <Label htmlFor={`opt-${letter}`} className="flex-1 text-slate-300 cursor-pointer">
                    {option}
                  </Label>
                  {hasAnswered && showFeedback && isCorrectAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {hasAnswered && showFeedback && isSelected && !isCorrectAnswer && (
                    <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {hasAnswered && showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-4 border-t border-[#2a3548]"
            >
              {/* Result Badge */}
              <div className={`p-4 rounded-lg border ${
                isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400" />
                  )}
                  <span className="font-semibold text-white">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-sm text-slate-300">
                    The correct answer is <span className="font-bold text-emerald-400">{question.correct_answer}</span>
                  </p>
                )}
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <button
                  onClick={() => setExpanded({ ...expanded, explanation: !expanded.explanation })}
                  className="flex items-center justify-between w-full mb-2"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">Detailed Explanation</span>
                  </div>
                  <span className="text-blue-400">{expanded.explanation ? '−' : '+'}</span>
                </button>
                {expanded.explanation && (
                  <div className="text-sm text-slate-300 space-y-2">
                    <p>{question.explanation}</p>
                    {question.why_others_wrong && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-slate-500">Why other options are incorrect:</div>
                        {Object.entries(question.why_others_wrong).map(([opt, reason]) => (
                          <div key={opt} className="text-xs text-slate-400 pl-3">
                            <span className="text-rose-400">{opt}:</span> {reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Regulatory Reference */}
              {question.reference && (
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <button
                    onClick={() => setExpanded({ ...expanded, reference: !expanded.reference })}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-semibold text-purple-400">Regulatory Reference</span>
                    </div>
                    <span className="text-purple-400">{expanded.reference ? '−' : '+'}</span>
                  </button>
                  {expanded.reference && (
                    <p className="text-sm text-slate-300 mt-2">{question.reference}</p>
                  )}
                </div>
              )}

              {/* Learning Objective */}
              {question.learning_objective && (
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs text-indigo-400 font-semibold">Learning Objective</span>
                  </div>
                  <p className="text-xs text-slate-300">{question.learning_objective}</p>
                </div>
              )}

              {/* Common Mistakes */}
              {question.common_mistakes?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <button
                    onClick={() => setExpanded({ ...expanded, commonMistakes: !expanded.commonMistakes })}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">Common Mistakes</span>
                    </div>
                    <span className="text-amber-400">{expanded.commonMistakes ? '−' : '+'}</span>
                  </button>
                  {expanded.commonMistakes && (
                    <ul className="mt-2 space-y-1">
                      {question.common_mistakes.map((mistake, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Related Concepts */}
              {question.related_concepts?.length > 0 && (
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <button
                    onClick={() => setExpanded({ ...expanded, relatedConcepts: !expanded.relatedConcepts })}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-semibold text-cyan-400">Related Concepts</span>
                    </div>
                    <span className="text-cyan-400">{expanded.relatedConcepts ? '−' : '+'}</span>
                  </button>
                  {expanded.relatedConcepts && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {question.related_concepts.map((concept, idx) => (
                        <Badge key={idx} className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}