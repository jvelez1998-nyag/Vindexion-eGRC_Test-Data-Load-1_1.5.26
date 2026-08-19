import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Loader2, Trophy, Clock, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

export default function PersonalizedChallenges({ userEmail, userProgress, detailed = false }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', userEmail],
    queryFn: () => base44.entities.Challenge.filter({ user_email: userEmail, status: 'active' }),
    enabled: !!userEmail
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['regulatory-exams'],
    queryFn: () => base44.entities.RegulatoryExam.filter({ created_by: userEmail }),
    enabled: !!userEmail
  });

  const createChallengeMutation = useMutation({
    mutationFn: (data) => base44.entities.Challenge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    }
  });

  const generateChallenges = async () => {
    setGenerating(true);
    try {
      const completedExams = exams.filter(e => e.status === 'completed' || e.status === 'passed' || e.status === 'failed');
      
      const prompt = `You are a learning coach. Generate 3-5 personalized challenges for this user based on their performance.

USER STATS:
- Current Streak: ${userProgress?.current_streak || 0} days
- Total Exams Passed: ${userProgress?.total_exams_passed || 0}
- Perfect Scores: ${userProgress?.perfect_scores_count || 0}
- Study Time: ${userProgress?.study_time_minutes || 0} minutes
- Frameworks Mastered: ${userProgress?.frameworks_mastered?.length || 0}
- Recent Exams: ${completedExams.length}

RECENT EXAM PERFORMANCE:
${completedExams.slice(0, 5).map(e => `- ${e.framework}: ${e.score_percentage}% (${e.status})`).join('\n')}

Generate personalized, achievable challenges that:
1. Address weak areas or encourage improvement
2. Are realistic based on current performance
3. Have clear metrics and rewards
4. Expire in 7-14 days
5. Award appropriate points (50-200) and badges

Return JSON array of challenges.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  challenge_type: { type: "string" },
                  target_value: { type: "number" },
                  framework: { type: "string" },
                  reward_points: { type: "number" },
                  reward_badge: { type: "string" },
                  difficulty: { type: "string" },
                  days_to_expire: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Create challenges
      for (const challenge of response.challenges || []) {
        await createChallengeMutation.mutateAsync({
          user_email: userEmail,
          title: challenge.title,
          description: challenge.description,
          challenge_type: challenge.challenge_type,
          target_value: challenge.target_value,
          current_value: 0,
          framework: challenge.framework,
          reward_points: challenge.reward_points,
          reward_badge: challenge.reward_badge,
          difficulty: challenge.difficulty || 'medium',
          status: 'active',
          expires_at: addDays(new Date(), challenge.days_to_expire || 7).toISOString()
        });
      }

      toast.success("New challenges generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate challenges");
    } finally {
      setGenerating(false);
    }
  };

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  const typeIcons = {
    exam_score: TrendingUp,
    streak: CheckCircle2,
    framework_mastery: Trophy,
    study_time: Clock,
    module_completion: Target
  };

  if (!detailed) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-400" />
            Active Challenges ({challenges.length})
          </h3>
          <Button
            onClick={generateChallenges}
            disabled={generating || challenges.length >= 5}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate New
              </>
            )}
          </Button>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No active challenges. Generate some to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.slice(0, 3).map((challenge) => {
              const Icon = typeIcons[challenge.challenge_type] || Target;
              const progress = (challenge.current_value / challenge.target_value) * 100;

              return (
                <div key={challenge.id} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-violet-500/10">
                        <Icon className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm mb-1">{challenge.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge className={difficultyColors[challenge.difficulty]}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{challenge.current_value} / {challenge.target_value}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-violet-400" />
          Your Challenges
        </h2>
        <Button
          onClick={generateChallenges}
          disabled={generating || challenges.length >= 5}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate New Challenges
            </>
          )}
        </Button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No active challenges</p>
          <p className="text-sm">Click "Generate New Challenges" to get personalized goals based on your performance!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const Icon = typeIcons[challenge.challenge_type] || Target;
            const progress = (challenge.current_value / challenge.target_value) * 100;
            const expiresAt = new Date(challenge.expires_at);

            return (
              <Card key={challenge.id} className="bg-[#151d2e] border-[#2a3548] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <Icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{challenge.title}</h3>
                      <p className="text-sm text-slate-400">{challenge.description}</p>
                    </div>
                  </div>
                  <Badge className={difficultyColors[challenge.difficulty]}>
                    {challenge.difficulty}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                    <span>Progress: {challenge.current_value} / {challenge.target_value}</span>
                    <span className="font-medium text-white">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2a3548]">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {challenge.reward_points} pts
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires {format(expiresAt, 'MMM d')}
                    </div>
                  </div>
                  {challenge.framework && (
                    <Badge className="bg-indigo-500/10 text-indigo-400 text-xs">
                      {challenge.framework}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
}