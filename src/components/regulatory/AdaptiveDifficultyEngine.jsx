import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

export default function AdaptiveDifficultyEngine({ userAnswers, questions, currentQuestionIndex }) {
  const [adaptiveMetrics, setAdaptiveMetrics] = useState({
    currentDifficulty: "intermediate",
    confidenceLevel: 50,
    recommendedDifficulty: "intermediate",
    performanceTrend: "stable"
  });

  useEffect(() => {
    if (Object.keys(userAnswers).length < 3) return;

    const recentAnswers = Object.entries(userAnswers)
      .slice(-5)
      .map(([idx, answer]) => ({
        isCorrect: answer === questions[idx]?.correct,
        riskLevel: questions[idx]?.risk_level
      }));

    const recentCorrect = recentAnswers.filter(a => a.isCorrect).length;
    const recentPerformance = (recentCorrect / recentAnswers.length) * 100;

    // Calculate overall performance
    const overallCorrect = Object.entries(userAnswers).filter(
      ([idx, answer]) => answer === questions[idx]?.correct
    ).length;
    const overallPerformance = (overallCorrect / Object.keys(userAnswers).length) * 100;

    // Determine adaptive difficulty
    let newDifficulty = "intermediate";
    let confidenceLevel = overallPerformance;
    let trend = "stable";

    if (overallPerformance >= 85) {
      newDifficulty = "advanced";
      trend = recentPerformance > 85 ? "improving" : "stable";
    } else if (overallPerformance >= 70) {
      newDifficulty = "intermediate";
      trend = recentPerformance > overallPerformance + 5 ? "improving" : 
              recentPerformance < overallPerformance - 5 ? "declining" : "stable";
    } else {
      newDifficulty = "beginner";
      trend = recentPerformance > overallPerformance + 5 ? "improving" : "declining";
    }

    setAdaptiveMetrics({
      currentDifficulty: newDifficulty,
      confidenceLevel: Math.round(confidenceLevel),
      recommendedDifficulty: newDifficulty,
      performanceTrend: trend
    });
  }, [userAnswers, questions]);

  if (Object.keys(userAnswers).length < 3) {
    return null;
  }

  const getTrendIcon = () => {
    if (adaptiveMetrics.performanceTrend === "improving") return TrendingUp;
    if (adaptiveMetrics.performanceTrend === "declining") return TrendingDown;
    return Target;
  };

  const getTrendColor = () => {
    if (adaptiveMetrics.performanceTrend === "improving") return "text-emerald-400";
    if (adaptiveMetrics.performanceTrend === "declining") return "text-rose-400";
    return "text-blue-400";
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-400" />
          <h4 className="text-sm font-semibold text-white">Adaptive Analysis</h4>
        </div>
        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-[#151d2e] rounded-lg p-3 text-center border border-[#2a3548]">
          <div className="text-xs text-slate-500 mb-1">Confidence</div>
          <div className="text-lg font-bold text-white">{adaptiveMetrics.confidenceLevel}%</div>
        </div>
        <div className="bg-[#151d2e] rounded-lg p-3 text-center border border-[#2a3548]">
          <div className="text-xs text-slate-500 mb-1">Level</div>
          <div className="text-xs font-semibold text-indigo-400 capitalize">
            {adaptiveMetrics.currentDifficulty}
          </div>
        </div>
        <div className="bg-[#151d2e] rounded-lg p-3 text-center border border-[#2a3548]">
          <div className="text-xs text-slate-500 mb-1">Trend</div>
          <TrendIcon className={`h-4 w-4 mx-auto ${getTrendColor()}`} />
        </div>
      </div>

      <div className="text-xs text-slate-400">
        <Progress value={adaptiveMetrics.confidenceLevel} className="h-2 mb-2" />
        {adaptiveMetrics.performanceTrend === "improving" && (
          <p className="text-emerald-400">📈 Great progress! Keep it up!</p>
        )}
        {adaptiveMetrics.performanceTrend === "declining" && (
          <p className="text-amber-400">⚠️ Consider reviewing recent topics</p>
        )}
        {adaptiveMetrics.performanceTrend === "stable" && (
          <p className="text-blue-400">✓ Consistent performance</p>
        )}
      </div>
    </Card>
  );
}