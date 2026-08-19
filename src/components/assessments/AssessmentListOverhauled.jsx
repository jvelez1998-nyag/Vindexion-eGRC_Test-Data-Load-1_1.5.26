import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, Pencil, Trash2, Eye, Calendar, User, TrendingUp, 
  Shield, AlertTriangle, CheckCircle2, Clock, FileText, BarChart3,
  Filter, ArrowUpDown, Grid, List, Download
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const severityColors = {
  critical: { bg: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', glow: 'shadow-rose-500/20' },
  high: { bg: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', glow: 'shadow-amber-500/20' },
  medium: { bg: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', glow: 'shadow-yellow-500/20' },
  low: { bg: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', glow: 'shadow-emerald-500/20' }
};

const statusColors = {
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  monitoring: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

export default function AssessmentListOverhauled({ 
  assessments = [], 
  onEdit, 
  onDelete, 
  onOpenWorkflow,
  onOpenSummary,
  controlLibrary = []
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const calculateRiskScore = (assessment) => {
    const inherent = (assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0);
    const residual = (assessment.residual_likelihood || 0) * (assessment.residual_impact || 0);
    return { inherent, residual };
  };

  const getRiskLevel = (score) => {
    if (score >= 16) return 'critical';
    if (score >= 12) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  };

  const sortedAssessments = [...assessments].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'risk_score':
        aVal = calculateRiskScore(a).residual;
        bVal = calculateRiskScore(b).residual;
        break;
      case 'title':
        aVal = a.assessment_name || a.title || '';
        bVal = b.assessment_name || b.title || '';
        break;
      case 'created_date':
        aVal = new Date(a.created_date);
        bVal = new Date(b.created_date);
        break;
      default:
        aVal = a[sortBy] || 0;
        bVal = b[sortBy] || 0;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const AssessmentCard = ({ assessment }) => {
    const { inherent, residual } = calculateRiskScore(assessment);
    const riskLevel = getRiskLevel(residual);
    const severity = severityColors[riskLevel];
    
    const radarData = [
      { category: 'Likelihood', value: assessment.residual_likelihood || 0 },
      { category: 'Impact', value: assessment.residual_impact || 0 },
      { category: 'Controls', value: assessment.control_effectiveness || 0 },
      { category: 'Maturity', value: assessment.maturity_level || 0 },
    ];

    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all overflow-hidden group ${severity.glow} hover:shadow-lg`}>
        <div className="flex">
          <div className={`w-1 ${severity.bg}`} />
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white text-base truncate">
                    {assessment.assessment_name || assessment.title || 'Untitled Assessment'}
                  </h3>
                  {assessment.is_mandatory && (
                    <Badge className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
                      Mandatory
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={`text-[10px] border ${statusColors[assessment.lifecycle_status || 'draft']}`}>
                    {(assessment.lifecycle_status || 'draft').replace(/_/g, ' ')}
                  </Badge>
                  <Badge className={`text-[10px] border ${severity.badge}`}>
                    Risk: {residual} ({riskLevel})
                  </Badge>
                  {assessment.assessment_type && (
                    <Badge className="text-[10px] border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      {assessment.assessment_type}
                    </Badge>
                  )}
                  {assessment.overall_score && (
                    <Badge className="text-[10px] border bg-purple-500/10 text-purple-400 border-purple-500/20">
                      Score: {assessment.overall_score}%
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="p-1.5 rounded bg-rose-500/10">
                      <AlertTriangle className="h-3 w-3 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Inherent</div>
                      <div className="text-white font-medium">{inherent}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="p-1.5 rounded bg-emerald-500/10">
                      <Shield className="h-3 w-3 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Residual</div>
                      <div className="text-white font-medium">{residual}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {assessment.assessed_by && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      {assessment.assessed_by}
                    </span>
                  )}
                  {assessment.assessment_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(assessment.assessment_date), 'MMM d, yyyy')}
                    </span>
                  )}
                  {assessment.next_review_date && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Review: {format(new Date(assessment.next_review_date), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                    <DropdownMenuItem onClick={() => onEdit(assessment)} className="text-white hover:bg-[#2a3548]">
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(assessment)} className="text-white hover:bg-[#2a3548]">
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    {onOpenWorkflow && (
                      <DropdownMenuItem onClick={() => onOpenWorkflow(assessment)} className="text-blue-400 hover:bg-blue-500/10">
                        <TrendingUp className="h-4 w-4 mr-2" /> Workflow
                      </DropdownMenuItem>
                    )}
                    {onOpenSummary && (
                      <DropdownMenuItem onClick={() => onOpenSummary(assessment)} className="text-purple-400 hover:bg-purple-500/10">
                        <FileText className="h-4 w-4 mr-2" /> AI Summary
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDelete(assessment)} className="text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#2a3548" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 8 }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} />
                      <Radar dataKey="value" stroke={severity.bg.replace('bg-', '#')} fill={severity.bg.replace('bg-', '#')} fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2a3548]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3" />
                  {assessment.control_effectiveness || 0}/5 Controls
                </div>
                {assessment.questions_answered && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FileText className="h-3 w-3" />
                    {assessment.questions_answered}/{assessment.total_questions} Questions
                  </div>
                )}
              </div>
              <Button 
                onClick={() => onEdit(assessment)}
                size="sm" 
                variant="outline" 
                className="bg-indigo-500/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 h-7 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Open
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const AssessmentRow = ({ assessment }) => {
    const { inherent, residual } = calculateRiskScore(assessment);
    const riskLevel = getRiskLevel(residual);
    const severity = severityColors[riskLevel];

    return (
      <Card className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-1 h-12 rounded ${severity.bg}`} />
            
            <div className="flex-1 grid grid-cols-5 gap-4 items-center">
              <div className="col-span-2">
                <h3 className="font-medium text-white text-sm mb-1">
                  {assessment.assessment_name || assessment.title || 'Untitled'}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] border ${statusColors[assessment.lifecycle_status || 'draft']}`}>
                    {(assessment.lifecycle_status || 'draft').replace(/_/g, ' ')}
                  </Badge>
                  {assessment.assessment_type && (
                    <Badge className="text-[10px] border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      {assessment.assessment_type}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                <Badge className={`${severity.badge}`}>
                  {residual} ({riskLevel})
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Assessment Date</div>
                <div className="text-xs text-white">
                  {assessment.assessment_date ? format(new Date(assessment.assessment_date), 'MMM d, yyyy') : '-'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button onClick={() => onEdit(assessment)} size="sm" variant="outline" className="bg-indigo-500/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 h-7 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                    <DropdownMenuItem onClick={() => onEdit(assessment)} className="text-white hover:bg-[#2a3548]">
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(assessment)} className="text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (assessments.length === 0) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Assessments Yet</h3>
          <p className="text-slate-400 text-sm">Start by creating your first risk assessment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30'}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort: {sortBy.replace(/_/g, ' ')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                  <DropdownMenuItem onClick={() => setSortBy('created_date')} className="text-white hover:bg-[#2a3548]">
                    Created Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('risk_score')} className="text-white hover:bg-[#2a3548]">
                    Risk Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('title')} className="text-white hover:bg-[#2a3548]">
                    Title
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>

              <Button variant="outline" size="sm" className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedAssessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedAssessments.map((assessment) => (
            <AssessmentRow key={assessment.id} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}