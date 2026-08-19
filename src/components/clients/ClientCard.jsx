import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, Shield, TrendingUp, AlertTriangle, 
  Calendar, User, MapPin, Edit, Trash2, UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function ClientCard({ client, onEdit, onDelete, onClick, onOffboard }) {
  const getRiskColor = (level) => {
    const colors = {
      critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
    return colors[level] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      at_risk: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      prospect: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      churned: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <Card 
      className="bg-[#1a2332] border-[#2a3548] hover:border-cyan-500/40 transition-all cursor-pointer group"
      onClick={() => onClick?.(client)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
              {client.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-[9px] h-4 px-1.5 ${getStatusColor(client.status)}`}>
                {client.status?.replace(/_/g, ' ')}
              </Badge>
              {client.risk_level && (
                <Badge className={`text-[9px] h-4 px-1.5 ${getRiskColor(client.risk_level)}`}>
                  {client.risk_level}
                </Badge>
              )}
              <Badge className="text-[9px] h-4 px-1.5 bg-slate-500/10 text-slate-400 border-slate-500/20">
                {client.client_type?.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onEdit?.(client); }}
                className="text-white hover:bg-[#2a3548]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onOffboard?.(client); }}
                className="text-amber-400 hover:bg-amber-500/10"
              >
                <UserX className="h-4 w-4 mr-2" />
                Offboard Client
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(client); }}
                className="text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Industry & Location */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {client.industry}
          </div>
          {client.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {client.address.split(',')[0]}
            </div>
          )}
        </div>

        {/* Risk & Compliance Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Risk Score</span>
              <span className="text-xs font-semibold text-white">{client.risk_score || 0}</span>
            </div>
            <Progress 
              value={client.risk_score || 0} 
              className="h-1.5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Compliance</span>
              <span className="text-xs font-semibold text-white">{client.compliance_score || 0}</span>
            </div>
            <Progress 
              value={client.compliance_score || 0} 
              className="h-1.5"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#2a3548]">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{client.incident_count || 0}</div>
            <div className="text-[10px] text-slate-500">Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{client.finding_count || 0}</div>
            <div className="text-[10px] text-slate-500">Findings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-rose-400">{client.critical_issues || 0}</div>
            <div className="text-[10px] text-slate-500">Critical</div>
          </div>
        </div>

        {/* Contact & Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#2a3548]">
          {client.contact_name && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {client.contact_name}
            </div>
          )}
          {client.last_assessment_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(client.last_assessment_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}