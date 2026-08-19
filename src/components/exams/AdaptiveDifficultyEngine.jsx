import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";

export default function AdaptiveDifficultyEngine({ responses, currentDifficulty, onDifficultyChange }) {
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    if (responses.length >= 3) {
      analyzePerformance();
    }
  }, [responses]);

  const analyzePerformance = () => {
    const recentResponses = responses.slice(-5);
    const correctCount = recentResponses.filter(r => r.is_correct).length;
    const accuracyRate = (correctCount / recentResponses.length) * 100;
    const avgResponseTime = recentResponses.reduce((sum, r) => sum + (r.time_spent || 0), 0) / recentResponses.length;

    // Difficulty adjustment logic
    let suggestedDifficulty = currentDifficulty;
    let adjustmentReason = '';

    if (accuracyRate >= 80 && avgResponseTime < 90) {
      suggestedDifficulty = currentDifficulty === 'beginner' ? 'intermediate' : 
                            currentDifficulty === 'intermediate' ? 'advanced' : 'advanced';
      adjustmentReason = 'High accuracy with fast response times';
    } else if (accuracyRate < 50 && currentDifficulty !== 'beginner') {
      suggestedDifficulty = currentDifficulty === 'advanced' ? 'intermediate' : 'beginner';
      adjustmentReason = 'Low accuracy suggests difficulty too high';
    }

    const weakAreas = identifyWeakAreas(responses);

    setPerformance({
      accuracyRate,
      avgResponseTime,
      suggestedDifficulty,
      adjustmentReason,
      weakAreas,
      shouldAdjust: suggestedDifficulty !== currentDifficulty
    });

    if (suggestedDifficulty !== currentDifficulty && onDifficultyChange) {
      onDifficultyChange(suggestedDifficulty, adjustmentReason, weakAreas);
    }
  };

  const identifyWeakAreas = (allResponses) => {
    const categoryPerformance = {};
    
    allResponses.forEach(response => {
      const category = response.category || 'general';
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { correct: 0, total: 0 };
      }
      categoryPerformance[category].total++;
      if (response.is_correct) categoryPerformance[category].correct++;
    });

    return Object.entries(categoryPerformance)
      .map(([category, stats]) => ({
        category,
        accuracy: (stats.correct / stats.total) * 100,
        total: stats.total
      }))
      .filter(area => area.accuracy < 60 && area.total >= 2)
      .sort((a, b) => a.accuracy - b.accuracy);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (!performance || responses.length < 3) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-400" />
          AI Adaptive Difficulty
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
            <div className="text-2xl font-bold text-white">{Math.round(performance.accuracyRate)}%</div>
            <div className="text-xs text-slate-400">Accuracy</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
            <div className="text-2xl font-bold text-white">{Math.round(performance.avgResponseTime)}s</div>
            <div className="text-xs text-slate-400">Avg Time</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
            <Badge className={getDifficultyColor(currentDifficulty)}>
              {currentDifficulty}
            </Badge>
          </div>
        </div>

        {performance.shouldAdjust && (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              {performance.suggestedDifficulty > currentDifficulty ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-400" />
              )}
              <span className="text-sm font-semibold text-white">Difficulty Adjusted</span>
            </div>
            <p className="text-xs text-slate-300">{performance.adjustmentReason}</p>
          </div>
        )}

        {performance.weakAreas.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span>Areas Needing Focus:</span>
            </div>
            {performance.weakAreas.slice(0, 3).map((area, idx) => (
              <div key={idx} className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{area.category}</span>
                  <span className="text-xs text-amber-400">{Math.round(area.accuracy)}%</span>
                </div>
                <Progress value={area.accuracy} className="h-1" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}