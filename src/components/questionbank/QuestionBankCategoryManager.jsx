import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileQuestion, Tag, BarChart3, CheckCircle2 } from "lucide-react";

export default function QuestionBankCategoryManager({ questions }) {
  // Framework breakdown
  const frameworkStats = Object.entries(
    questions.reduce((acc, q) => {
      if (!acc[q.framework]) {
        acc[q.framework] = { total: 0, approved: 0, easy: 0, medium: 0, hard: 0 };
      }
      acc[q.framework].total++;
      if (q.status === 'approved') acc[q.framework].approved++;
      if (q.difficulty === 'easy') acc[q.framework].easy++;
      if (q.difficulty === 'medium') acc[q.framework].medium++;
      if (q.difficulty === 'hard') acc[q.framework].hard++;
      return acc;
    }, {})
  );

  // Category breakdown
  const categoryStats = Object.entries(
    questions.reduce((acc, q) => {
      const cat = q.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = { total: 0, approved: 0 };
      }
      acc[cat].total++;
      if (q.status === 'approved') acc[cat].approved++;
      return acc;
    }, {})
  );

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            Framework Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(frameworkStats).map(([framework, stats]) => {
              const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
              
              return (
                <Card key={framework} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white mb-1">{framework}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-500/20 text-indigo-400 text-[10px]">
                            {stats.total} questions
                          </Badge>
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                            {stats.approved} approved
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{approvalRate}%</div>
                        <div className="text-xs text-slate-500">Approved</div>
                      </div>
                    </div>
                    <Progress value={approvalRate} className="h-2 mb-3" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-[#0f1623]">
                        <div className="text-xs text-emerald-400">{stats.easy}</div>
                        <div className="text-[10px] text-slate-500">Easy</div>
                      </div>
                      <div className="p-2 rounded bg-[#0f1623]">
                        <div className="text-xs text-amber-400">{stats.medium}</div>
                        <div className="text-[10px] text-slate-500">Medium</div>
                      </div>
                      <div className="p-2 rounded bg-[#0f1623]">
                        <div className="text-xs text-rose-400">{stats.hard}</div>
                        <div className="text-[10px] text-slate-500">Hard</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-400" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
              
              return (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white font-medium">{category}</span>
                      <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">
                        {stats.total}
                      </Badge>
                    </div>
                    <Progress value={approvalRate} className="h-1.5" />
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-bold text-white">{approvalRate}%</div>
                    <div className="text-[10px] text-slate-500">Approved</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Coverage Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Comprehensive Coverage</p>
                  <p className="text-xs text-slate-400">Questions span {Object.keys(frameworkStats).length} frameworks</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Quality Assured</p>
                  <p className="text-xs text-slate-400">Approved questions ready for exams</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Difficulty Balance</p>
                  <p className="text-xs text-slate-400">Mix of easy, medium, and hard questions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Organized Categories</p>
                  <p className="text-xs text-slate-400">Structured by topic and framework</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}