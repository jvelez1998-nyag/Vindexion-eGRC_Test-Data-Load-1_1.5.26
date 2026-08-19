import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar,
  User,
  Settings,
  Activity,
  FileText,
  Download,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

export default function AuditTrailViewer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");

  const { data: auditLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-timestamp', 500),
    staleTime: 60000
  });

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;

    // Date range filter
    const logDate = new Date(log.timestamp);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    const matchesDate = dateRange === "all" || logDate >= daysAgo;

    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  // Extract unique values for filters
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))].filter(Boolean);
  const uniqueEntities = [...new Set(auditLogs.map(log => log.entity_type))].filter(Boolean);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Action", "Entity Type", "Entity ID", "Details"];
    const rows = filteredLogs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.user_email || 'System',
      log.action,
      log.entity_type || 'N/A',
      log.entity_id || 'N/A',
      log.details || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getActionColor = (action) => {
    if (action?.includes('create')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (action?.includes('update') || action?.includes('modify')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (action?.includes('delete')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (action?.includes('login') || action?.includes('logout')) return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getActionIcon = (action) => {
    if (action?.includes('user')) return User;
    if (action?.includes('role')) return Shield;
    if (action?.includes('automation') || action?.includes('workflow')) return Activity;
    if (action?.includes('integration')) return Settings;
    return FileText;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
                <p className="text-sm text-slate-400">Complete system activity log & compliance tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {filteredLogs.length} Events
              </Badge>
              <Button onClick={() => refetch()} size="sm" variant="outline" className="border-indigo-500/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex items-center gap-2">
                <Search className="h-3 w-3" />
                Search
              </label>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex items-center gap-2">
                <Activity className="h-3 w-3" />
                Action Type
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Entity Type
              </label>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueEntities.map(entity => (
                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="1">Last 24 Hours</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity Log</span>
            {filteredLogs.length !== auditLogs.length && (
              <Badge variant="outline" className="border-[#2a3548]">
                Filtered: {filteredLogs.length} of {auditLogs.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredLogs.map((log, idx) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          <ActionIcon className="h-4 w-4 text-indigo-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                            {log.entity_type && (
                              <Badge variant="outline" className="border-[#2a3548] text-slate-400">
                                {log.entity_type}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3 text-slate-400" />
                              <span className="text-white">{log.user_email || 'System'}</span>
                            </div>

                            {log.details && (
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {log.details}
                              </p>
                            )}

                            {log.entity_id && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Entity ID:</span>
                                <code className="px-2 py-0.5 rounded bg-[#1a2332] text-indigo-400 font-mono">
                                  {log.entity_id}
                                </code>
                              </div>
                            )}

                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <details className="text-xs mt-2">
                                <summary className="cursor-pointer text-indigo-400 hover:text-indigo-300">
                                  View Metadata
                                </summary>
                                <pre className="mt-2 p-2 bg-[#1a2332] rounded border border-[#2a3548] text-[10px] text-slate-400 overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No audit logs found matching your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}