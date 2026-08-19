import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp, Award } from "lucide-react";
import { format, subDays } from "date-fns";

export default function StreakTracker({ userProgress }) {
  const currentStreak = userProgress?.current_streak || 0;
  const longestStreak = userProgress?.longest_streak || 0;
  const lastActivityDate = userProgress?.last_activity_date 
    ? new Date(userProgress.last_activity_date) 
    : null;

  // Calculate streak progress to next milestone
  const milestones = [7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || 100;
  const streakProgress = (currentStreak / nextMilestone) * 100;

  // Generate last 7 days for visualization
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date,
      isActive: lastActivityDate && date <= lastActivityDate && date >= subDays(lastActivityDate, currentStreak)
    };
  });

  return (
    <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-rose-400" />
        Study Streak
      </h3>

      <div className="space-y-6">
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-2">{currentStreak}</div>
          <div className="text-sm text-slate-400">Day Streak</div>
          <div className="mt-4">
            <Progress value={streakProgress} className="h-2" />
            <p className="text-xs text-slate-500 mt-2">
              {nextMilestone - currentStreak} days to {nextMilestone}-day milestone
            </p>
          </div>
        </div>

        {/* Visual Calendar */}
        <div>
          <div className="text-xs text-slate-400 mb-2">Last 7 Days</div>
          <div className="grid grid-cols-7 gap-2">
            {last7Days.map((day, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    day.isActive
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700 text-slate-500'
                  }`}
                >
                  {format(day.date, 'd')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {format(day.date, 'EEE')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white">{longestStreak}</div>
            <div className="text-xs text-slate-500">Longest Streak</div>
          </div>
          <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {currentStreak >= 7 ? '🏆' : currentStreak >= 3 ? '🥉' : '🌟'}
            </div>
            <div className="text-xs text-slate-500">
              {currentStreak >= 7 ? 'On Fire!' : currentStreak >= 3 ? 'Building' : 'Getting Started'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}