import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Flame, Award } from "lucide-react";

export default function LeaderboardWidget({ currentUserEmail }) {
  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-user-progress'],
    queryFn: () => base44.entities.UserProgress.list('-total_points', 100),
  });

  const topByPoints = [...allProgress].sort((a, b) => b.total_points - a.total_points).slice(0, 10);
  const topByStreak = [...allProgress].sort((a, b) => b.current_streak - a.current_streak).slice(0, 10);
  const topByLevel = [...allProgress].sort((a, b) => b.level - a.level).slice(0, 10);

  const renderLeaderboard = (data, metric, icon) => {
    return (
      <div className="space-y-2">
        {data.map((user, idx) => {
          const isCurrentUser = user.user_email === currentUserEmail;
          const rankColors = {
            0: 'from-amber-500 to-yellow-500',
            1: 'from-slate-300 to-slate-400',
            2: 'from-amber-700 to-amber-800'
          };

          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                isCurrentUser
                  ? 'bg-indigo-500/10 border-indigo-500/50'
                  : 'bg-[#151d2e] border-[#2a3548]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  idx < 3
                    ? `bg-gradient-to-br ${rankColors[idx]} text-white`
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isCurrentUser ? 'text-white' : 'text-slate-300'}`}>
                    {user.user_email.split('@')[0]}
                  </span>
                  {isCurrentUser && (
                    <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">You</Badge>
                  )}
                  {idx === 0 && <Trophy className="h-4 w-4 text-amber-400" />}
                </div>
                <div className="text-xs text-slate-500">Level {user.level}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {metric === 'points' && user.total_points}
                  {metric === 'streak' && user.current_streak}
                  {metric === 'level' && user.level}
                </div>
                <div className="text-xs text-slate-500">
                  {metric === 'points' && 'points'}
                  {metric === 'streak' && 'days'}
                  {metric === 'level' && 'level'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-amber-400" />
        Leaderboards
      </h2>

      <Tabs defaultValue="points" className="space-y-6">
        <TabsList className="bg-[#151d2e] border border-[#2a3548]">
          <TabsTrigger value="points">
            <TrendingUp className="h-4 w-4 mr-2" />
            Points
          </TabsTrigger>
          <TabsTrigger value="streak">
            <Flame className="h-4 w-4 mr-2" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="level">
            <Award className="h-4 w-4 mr-2" />
            Level
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          {renderLeaderboard(topByPoints, 'points')}
        </TabsContent>

        <TabsContent value="streak">
          {renderLeaderboard(topByStreak, 'streak')}
        </TabsContent>

        <TabsContent value="level">
          {renderLeaderboard(topByLevel, 'level')}
        </TabsContent>
      </Tabs>
    </Card>
  );
}