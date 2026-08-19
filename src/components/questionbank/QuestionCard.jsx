import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, CheckCircle2, AlertCircle, TrendingUp, FileCheck, Shield, Link2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function QuestionCard({ question, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  // Fetch linked entities
  const { data: linkedCompliance = [] } = useQuery({
    queryKey: ['compliance', question.linked_compliance],
    queryFn: async () => {
      if (!question.linked_compliance?.length) return [];
      const all = await base44.entities.Compliance.list();
      return all.filter(c => question.linked_compliance.includes(c.id));
    },
    enabled: !!question.linked_compliance?.length
  });

  const { data: linkedRisks = [] } = useQuery({
    queryKey: ['risks', question.linked_risks],
    queryFn: async () => {
      if (!question.linked_risks?.length) return [];
      const all = await base44.entities.Risk.list();
      return all.filter(r => question.linked_risks.includes(r.id));
    },
    enabled: !!question.linked_risks?.length
  });

  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  const typeColors = {
    scenario: 'bg-blue-500/10 text-blue-400',
    definition: 'bg-purple-500/10 text-purple-400',
    technical: 'bg-cyan-500/10 text-cyan-400',
    conceptual: 'bg-pink-500/10 text-pink-400'
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-5 hover:border-indigo-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              {question.framework}
            </Badge>
            <Badge className={difficultyColors[question.difficulty]}>
              {question.difficulty}
            </Badge>
            {question.question_type && (
              <Badge className={typeColors[question.question_type]}>
                {question.question_type}
              </Badge>
            )}
            {question.is_verified && (
              <Badge className="bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <h3 className="text-white font-medium mb-2 leading-relaxed">{question.question_text}</h3>
          
          {/* Quick Link Indicators */}
          {((question.linked_compliance?.length || 0) > 0 || (question.linked_risks?.length || 0) > 0) && (
            <div className="flex items-center gap-2 mt-2">
              {(question.linked_compliance?.length || 0) > 0 && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  <FileCheck className="h-3 w-3 mr-1" />
                  {question.linked_compliance.length} Compliance
                </Badge>
              )}
              {(question.linked_risks?.length || 0) > 0 && (
                <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                  <Shield className="h-3 w-3 mr-1" />
                  {question.linked_risks.length} Risks
                </Badge>
              )}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
            <DropdownMenuItem onClick={onEdit} className="text-white hover:bg-[#2a3548]">
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-rose-400 hover:bg-rose-500/10">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!expanded && (
        <Button
          onClick={() => setExpanded(true)}
          variant="ghost"
          size="sm"
          className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-7"
        >
          View Details
        </Button>
      )}

      {expanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-[#2a3548]">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Answer Options</h4>
            <div className="space-y-2">
              {question.options?.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-sm ${
                    option.charAt(0) === question.correct_answer
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#151d2e] text-slate-300'
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Explanation</h4>
            <p className="text-sm text-slate-300">{question.explanation}</p>
          </div>

          {question.regulation_section && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Regulation Section</h4>
              <Badge className="bg-slate-700 text-slate-300">{question.regulation_section}</Badge>
            </div>
          )}

          {linkedCompliance.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase flex items-center gap-1">
                <FileCheck className="h-3 w-3" />
                Linked Compliance ({linkedCompliance.length})
              </h4>
              <div className="space-y-2">
                {linkedCompliance.map((comp) => (
                  <div key={comp.id} className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {comp.framework}
                      </Badge>
                      <Badge className={`text-[10px] ${
                        comp.status === 'implemented' ? 'bg-emerald-500/10 text-emerald-400' :
                        comp.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {comp.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-white font-medium">{comp.requirement}</p>
                    {comp.requirement_id && (
                      <p className="text-[10px] text-slate-500 mt-1">{comp.requirement_id}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {linkedRisks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Linked Risks ({linkedRisks.length})
              </h4>
              <div className="space-y-2">
                {linkedRisks.map((risk) => (
                  <div key={risk.id} className="p-2 rounded bg-rose-500/5 border border-rose-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-rose-500/10 text-rose-400 text-[10px] capitalize">
                        {risk.category}
                      </Badge>
                      <Badge className={`text-[10px] ${
                        (risk.likelihood || 0) * (risk.impact || 0) >= 12 ? 'bg-rose-500/10 text-rose-400' :
                        (risk.likelihood || 0) * (risk.impact || 0) >= 6 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        L{risk.likelihood}×I{risk.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-white font-medium">{risk.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.related_controls?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Related Controls</h4>
              <div className="flex flex-wrap gap-1">
                {question.related_controls.map((ctrl, idx) => (
                  <Badge key={idx} className="bg-blue-500/10 text-blue-400 text-xs">{ctrl}</Badge>
                ))}
              </div>
            </div>
          )}

          {question.tags?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {question.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-slate-700 text-slate-400 text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-[#2a3548]">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Used {question.usage_count || 0} times
            </div>
            {question.quality_rating && (
              <div>Quality: {question.quality_rating}/5 ⭐</div>
            )}
            {question.risk_level && (
              <Badge className={`text-xs ${
                question.risk_level === 'critical' ? 'bg-rose-500/10 text-rose-400' :
                question.risk_level === 'high' ? 'bg-orange-500/10 text-orange-400' :
                question.risk_level === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {question.risk_level} risk
              </Badge>
            )}
          </div>

          <Button
            onClick={() => setExpanded(false)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-[#2a3548] h-7"
          >
            Hide Details
          </Button>
        </div>
      )}
    </Card>
  );
}