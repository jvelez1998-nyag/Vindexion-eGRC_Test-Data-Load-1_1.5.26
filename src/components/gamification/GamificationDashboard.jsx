import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Flame, Target, TrendingUp, Star, Zap, Crown } from "lucide-react";
import LeaderboardWidget from "./LeaderboardWidget";
import BadgeCollection from "./BadgeCollection";
import StreakTracker from "./StreakTracker";
import PersonalizedChallenges from "./PersonalizedChallenges";

export default function GamificationDashboard({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', userEmail],
    queryFn: async () => {
      const progress = await base44.entities.UserProgress.filter({ user_email: userEmail });
      if (progress.length > 0) return progress[0];
      
      // Create initial progress
      return await base44.entities.UserProgress.create({
        user_email: userEmail,
        total_points: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        badges_earned: [],
        completed_challenges: [],
        frameworks_mastered: [],
        total_exams_passed: 0,
        perfect_scores_count: 0,
        study_time_minutes: 0
      });
    },
    enabled: !!userEmail
  });

  const pointsToNextLevel = userProgress ? (userProgress.level * 1000) - (userProgress.total_points % 1000) : 1000;
  const levelProgress = userProgress ? ((userProgress.total_points % 1000) / 1000) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Crown className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Level {userProgress?.level || 1}</div>
              <div className="text-xs text-slate-400">
                {pointsToNextLevel} pts to next level
              </div>
            </div>
          </div>
          <Progress value={levelProgress} className="h-1.5 mt-3" />
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Star className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userProgress?.total_points || 0}</div>
              <div className="text-xs text-slate-400">Total Points</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <Flame className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userProgress?.current_streak || 0}</div>
              <div className="text-xs text-slate-400">Day Streak</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Award className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userProgress?.badges_earned?.length || 0}</div>
              <div className="text-xs text-slate-400">Badges Earned</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <StreakTracker userProgress={userProgress} />
            <Card className="bg-[#1a2332] border-[#2a3548] p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <span className="text-sm text-slate-300">Exams Passed</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400">{userProgress?.total_exams_passed || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <span className="text-sm text-slate-300">Perfect Scores</span>
                  <Badge className="bg-amber-500/10 text-amber-400">{userProgress?.perfect_scores_count || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <span className="text-sm text-slate-300">Study Time</span>
                  <Badge className="bg-blue-500/10 text-blue-400">{Math.floor((userProgress?.study_time_minutes || 0) / 60)}h</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <span className="text-sm text-slate-300">Frameworks Mastered</span>
                  <Badge className="bg-violet-500/10 text-violet-400">{userProgress?.frameworks_mastered?.length || 0}</Badge>
                </div>
              </div>
            </Card>
          </div>
          <PersonalizedChallenges userEmail={userEmail} userProgress={userProgress} />
        </TabsContent>

        <TabsContent value="challenges">
          <PersonalizedChallenges userEmail={userEmail} userProgress={userProgress} detailed />
        </TabsContent>

        <TabsContent value="badges">
          <BadgeCollection userProgress={userProgress} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardWidget currentUserEmail={userEmail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}