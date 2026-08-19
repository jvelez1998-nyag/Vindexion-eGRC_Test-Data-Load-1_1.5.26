import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, CheckCircle2, Star, Trophy, Flame, Zap, Target, Shield, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const BADGE_DEFINITIONS = [
  { id: "first_exam", name: "First Steps", description: "Complete your first exam", icon: Award, color: "text-blue-400", requirement: 1, type: "exams" },
  { id: "exam_master_10", name: "Exam Master", description: "Pass 10 exams", icon: Trophy, color: "text-amber-400", requirement: 10, type: "exams" },
  { id: "exam_master_25", name: "Exam Legend", description: "Pass 25 exams", icon: Crown, color: "text-purple-400", requirement: 25, type: "exams" },
  { id: "perfect_score", name: "Perfectionist", description: "Achieve a 100% score", icon: Star, color: "text-yellow-400", requirement: 1, type: "perfect" },
  { id: "perfect_x5", name: "Flawless", description: "Achieve 5 perfect scores", icon: Zap, color: "text-indigo-400", requirement: 5, type: "perfect" },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: Flame, color: "text-rose-400", requirement: 7, type: "streak" },
  { id: "streak_30", name: "Month Master", description: "Maintain a 30-day streak", icon: Flame, color: "text-orange-400", requirement: 30, type: "streak" },
  { id: "streak_100", name: "Streak Legend", description: "Maintain a 100-day streak", icon: Flame, color: "text-red-400", requirement: 100, type: "streak" },
  { id: "framework_master", name: "Framework Expert", description: "Master a framework", icon: Shield, color: "text-emerald-400", requirement: 1, type: "frameworks" },
  { id: "framework_master_3", name: "Multi-Domain Pro", description: "Master 3 frameworks", icon: Target, color: "text-cyan-400", requirement: 3, type: "frameworks" },
  { id: "early_adopter", name: "Early Adopter", description: "Join the platform", icon: Award, color: "text-slate-400", requirement: 0, type: "special" },
  { id: "study_time_10h", name: "Dedicated Learner", description: "Study for 10 hours", icon: CheckCircle2, color: "text-green-400", requirement: 600, type: "study_time" },
  { id: "study_time_50h", name: "Scholar", description: "Study for 50 hours", icon: CheckCircle2, color: "text-teal-400", requirement: 3000, type: "study_time" }
];

export default function BadgeCollection({ userProgress }) {
  const earnedBadges = userProgress?.badges_earned || [];

  const checkBadgeEarned = (badge) => {
    if (earnedBadges.includes(badge.id)) return true;

    // Check if user meets requirements
    const stats = {
      exams: userProgress?.total_exams_passed || 0,
      perfect: userProgress?.perfect_scores_count || 0,
      streak: userProgress?.longest_streak || 0,
      frameworks: userProgress?.frameworks_mastered?.length || 0,
      study_time: userProgress?.study_time_minutes || 0
    };

    switch (badge.type) {
      case "exams":
        return stats.exams >= badge.requirement;
      case "perfect":
        return stats.perfect >= badge.requirement;
      case "streak":
        return stats.streak >= badge.requirement;
      case "frameworks":
        return stats.frameworks >= badge.requirement;
      case "study_time":
        return stats.study_time >= badge.requirement;
      case "special":
        return true; // Early adopter - everyone gets it
      default:
        return false;
    }
  };

  const earnedCount = BADGE_DEFINITIONS.filter(checkBadgeEarned).length;
  const totalCount = BADGE_DEFINITIONS.length;
  const progressPercentage = (earnedCount / totalCount) * 100;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-400" />
            Badge Collection
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {earnedCount} of {totalCount} badges earned
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-amber-400">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-slate-500">Complete</div>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {BADGE_DEFINITIONS.map((badge) => {
            const Icon = badge.icon;
            const isEarned = checkBadgeEarned(badge);

            return (
              <Card
                key={badge.id}
                className={`p-4 transition-all ${
                  isEarned
                    ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
                    : 'bg-[#151d2e] border-[#2a3548] opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isEarned ? 'bg-amber-500/20' : 'bg-slate-700'
                    }`}
                  >
                    {isEarned ? (
                      <Icon className={`h-6 w-6 ${badge.color}`} />
                    ) : (
                      <Lock className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-sm ${isEarned ? 'text-white' : 'text-slate-500'}`}>
                        {badge.name}
                      </h3>
                      {isEarned && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400">{badge.description}</p>
                    {!isEarned && (
                      <Badge className="bg-slate-700 text-slate-400 text-xs mt-2">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}