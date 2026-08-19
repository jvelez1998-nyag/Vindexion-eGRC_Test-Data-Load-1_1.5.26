import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  FileSpreadsheet,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981'
};

export default function AutomatedReportGenerator({ audits, findings }) {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedTypes, setSelectedTypes] = useState(['internal', 'external', 'regulatory', 'it', 'financial', 'operational']);
  
  const auditTypes = ['internal', 'external', 'regulatory', 'it', 'financial', 'operational'];

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = audits.filter(a => selectedTypes.includes(a.type));
    
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(a => {
        const auditDate = new Date(a.start_date || a.created_date);
        return isWithinInterval(auditDate, { start: dateRange.from, end: dateRange.to });
      });
    }
    
    const auditIds = new Set(filtered.map(a => a.id));
    const filteredFindings = findings.filter(f => auditIds.has(f.audit_id));
    
    return { audits: filtered, findings: filteredFindings };
  }, [audits, findings, dateRange, selectedTypes]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const { audits: filteredAudits, findings: filteredFindings } = filteredData;
    
    const total = filteredAudits.length;
    const completed = filteredAudits.filter(a => a.status === 'completed').length;
    const inProgress = filteredAudits.filter(a => a.status === 'in_progress').length;
    const planned = filteredAudits.filter(a => a.status === 'planned').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const totalFindings = filteredFindings.length;
    const critical = filteredFindings.filter(f => f.severity === 'critical').length;
    const high = filteredFindings.filter(f => f.severity === 'high').length;
    const medium = filteredFindings.filter(f => f.severity === 'medium').length;
    const low = filteredFindings.filter(f => f.severity === 'low').length;
    
    const openFindings = filteredFindings.filter(f => f.status === 'open').length;
    const remediatedFindings = filteredFindings.filter(f => f.status === 'remediated' || f.status === 'closed').length;
    
    return {
      total,
      completed,
      inProgress,
      planned,
      completionRate,
      totalFindings,
      critical,
      high,
      medium,
      low,
      openFindings,
      remediatedFindings
    };
  }, [filteredData]);

  // Chart data
  const findingsBySeverity = useMemo(() => [
    { name: 'Critical', value: metrics.critical, color: SEVERITY_COLORS.critical },
    { name: 'High', value: metrics.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: metrics.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: metrics.low, color: SEVERITY_COLORS.low }
  ], [metrics]);

  const auditStatusData = useMemo(() => [
    { name: 'Completed', value: metrics.completed },
    { name: 'In Progress', value: metrics.inProgress },
    { name: 'Planned', value: metrics.planned }
  ], [metrics]);

  const auditTypeBreakdown = useMemo(() => {
    const counts = {};
    filteredData.audits.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData.audits]);

  // Export to CSV
  const exportToCSV = () => {
    const { audits: filteredAudits, findings: filteredFindings } = filteredData;
    
    // Audit summary
    const auditHeaders = ['Audit ID', 'Title', 'Type', 'Status', 'Auditor', 'Start Date', 'End Date', 'Findings Count', 'Critical', 'High', 'Medium', 'Low'];
    const auditRows = filteredAudits.map(audit => {
      const auditFindings = filteredFindings.filter(f => f.audit_id === audit.id);
      return [
        audit.id,
        audit.title,
        audit.type,
        audit.status,
        audit.auditor || '',
        audit.start_date ? format(new Date(audit.start_date), 'yyyy-MM-dd') : '',
        audit.end_date ? format(new Date(audit.end_date), 'yyyy-MM-dd') : '',
        auditFindings.length,
        auditFindings.filter(f => f.severity === 'critical').length,
        auditFindings.filter(f => f.severity === 'high').length,
        auditFindings.filter(f => f.severity === 'medium').length,
        auditFindings.filter(f => f.severity === 'low').length
      ];
    });
    
    // Findings detail
    const findingHeaders = ['Audit Title', 'Finding Title', 'Severity', 'Category', 'Status', 'Responsible Party', 'Target Date'];
    const findingRows = filteredFindings.map(finding => {
      const audit = filteredAudits.find(a => a.id === finding.audit_id);
      return [
        audit?.title || 'Unknown',
        finding.title,
        finding.severity,
        finding.category,
        finding.status,
        finding.responsible_party || '',
        finding.target_date ? format(new Date(finding.target_date), 'yyyy-MM-dd') : ''
      ];
    });
    
    const csvContent = 
      'AUDIT SUMMARY\n' +
      [auditHeaders, ...auditRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n') +
      '\n\nFINDINGS DETAIL\n' +
      [findingHeaders, ...findingRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast.success("CSV report exported");
  };

  // Export to PDF
  const exportToPDF = () => {
    const { audits: filteredAudits, findings: filteredFindings } = filteredData;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title Page
    doc.setFontSize(24);
    doc.text('Comprehensive Audit Report', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth / 2, 40, { align: 'center' });
    
    if (dateRange.from && dateRange.to) {
      doc.setFontSize(10);
      doc.text(
        `Period: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`,
        pageWidth / 2, 48, { align: 'center' }
      );
    }
    
    // Executive Summary
    let yPos = 65;
    doc.setFontSize(16);
    doc.text('Executive Summary', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    
    const summaryData = [
      ['Total Audits', metrics.total],
      ['Completed', `${metrics.completed} (${metrics.completionRate}%)`],
      ['In Progress', metrics.inProgress],
      ['Planned', metrics.planned],
      ['', ''],
      ['Total Findings', metrics.totalFindings],
      ['Critical', metrics.critical],
      ['High', metrics.high],
      ['Medium', metrics.medium],
      ['Low', metrics.low],
      ['', ''],
      ['Open Findings', metrics.openFindings],
      ['Remediated/Closed', metrics.remediatedFindings]
    ];
    
    summaryData.forEach(([label, value]) => {
      if (label === '') {
        yPos += 3;
      } else {
        doc.text(`${label}: ${value}`, 14, yPos);
        yPos += 6;
      }
    });
    
    // Findings by Severity
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.text('Findings by Severity', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    findingsBySeverity.forEach(item => {
      doc.text(`${item.name}: ${item.value} (${metrics.totalFindings > 0 ? Math.round((item.value / metrics.totalFindings) * 100) : 0}%)`, 14, yPos);
      yPos += 6;
    });
    
    // Audit Details
    yPos += 10;
    doc.setFontSize(16);
    doc.text('Audit Details', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(9);
    
    filteredAudits.forEach(audit => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const auditFindings = filteredFindings.filter(f => f.audit_id === audit.id);
      
      doc.setFont(undefined, 'bold');
      doc.text(audit.title, 14, yPos);
      yPos += 5;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Type: ${audit.type} | Status: ${audit.status} | Findings: ${auditFindings.length}`, 14, yPos);
      yPos += 5;
      
      if (audit.start_date) {
        doc.text(`Date: ${format(new Date(audit.start_date), 'MMM d, yyyy')}`, 14, yPos);
        yPos += 5;
      }
      
      yPos += 3;
    });
    
    // Findings Details
    if (filteredFindings.length > 0) {
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.text('Findings Details', 14, yPos);
      
      yPos += 10;
      doc.setFontSize(8);
      
      filteredFindings.forEach(finding => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const audit = filteredAudits.find(a => a.id === finding.audit_id);
        
        doc.setFont(undefined, 'bold');
        doc.text(`[${finding.severity.toUpperCase()}] ${finding.title}`, 14, yPos);
        yPos += 4;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Audit: ${audit?.title || 'Unknown'}`, 14, yPos);
        yPos += 4;
        doc.text(`Status: ${finding.status} | Category: ${finding.category}`, 14, yPos);
        yPos += 4;
        
        if (finding.responsible_party) {
          doc.text(`Responsible: ${finding.responsible_party}`, 14, yPos);
          yPos += 4;
        }
        
        yPos += 2;
      });
    }
    
    doc.save(`comprehensive-audit-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success("Comprehensive PDF report exported");
  };

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="bg-gradient-to-r from-[#1a2332] to-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div>
              <Label className="text-slate-400 mb-2 block">Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-[#0f1623] border-[#2a3548] text-white hover:bg-[#1a2332]">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a2332] border-[#2a3548]">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-[#0f1623] border-[#2a3548] text-white hover:bg-[#1a2332]">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a2332] border-[#2a3548]">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {dateRange.from && dateRange.to && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDateRange({ from: null, to: null })}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Clear dates
                </Button>
              )}
            </div>

            {/* Audit Types */}
            <div>
              <Label className="text-slate-400 mb-2 block">Audit Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {auditTypes.map(type => (
                  <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <Checkbox
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                    />
                    <label className="text-sm text-white capitalize cursor-pointer" onClick={() => toggleType(type)}>
                      {type}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTypes(auditTypes)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Select all
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTypes([])}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Clear all
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2a3548]">
            <div className="text-sm text-slate-400">
              Report includes <span className="text-white font-semibold">{filteredData.audits.length}</span> audits 
              and <span className="text-white font-semibold">{filteredData.findings.length}</span> findings
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={exportToCSV}
                disabled={filteredData.audits.length === 0}
                variant="outline" 
                className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                onClick={exportToPDF}
                disabled={filteredData.audits.length === 0}
                className="gap-2 bg-rose-600 hover:bg-rose-700"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {filteredData.audits.length > 0 && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <div className="text-2xl font-bold text-white">{metrics.total}</div>
                </div>
                <div className="text-xs text-slate-400">Total Audits</div>
                <div className="text-xs text-blue-400 mt-1">{metrics.completionRate}% completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div className="text-2xl font-bold text-white">{metrics.completed}</div>
                </div>
                <div className="text-xs text-slate-400">Completed</div>
                <div className="text-xs text-emerald-400 mt-1">{metrics.inProgress} in progress</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <div className="text-2xl font-bold text-white">{metrics.totalFindings}</div>
                </div>
                <div className="text-xs text-slate-400">Total Findings</div>
                <div className="text-xs text-amber-400 mt-1">{metrics.openFindings} open</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <div className="text-2xl font-bold text-white">{metrics.critical}</div>
                </div>
                <div className="text-xs text-slate-400">Critical</div>
                <div className="text-xs text-rose-400 mt-1">{metrics.high} high severity</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Findings by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={findingsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {findingsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a2332', 
                        border: '1px solid #2a3548',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Audit Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={auditStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a2332', 
                        border: '1px solid #2a3548',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Audits by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={auditTypeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a2332', 
                        border: '1px solid #2a3548',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Audit List */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Detailed Audit List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {filteredData.audits.map(audit => {
                    const auditFindings = filteredData.findings.filter(f => f.audit_id === audit.id);
                    const criticalCount = auditFindings.filter(f => f.severity === 'critical').length;
                    const highCount = auditFindings.filter(f => f.severity === 'high').length;
                    
                    return (
                      <div key={audit.id} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{audit.title}</h4>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                            {audit.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                          <span className="capitalize">{audit.type}</span>
                          {audit.start_date && <span>{format(new Date(audit.start_date), 'MMM d, yyyy')}</span>}
                          {audit.auditor && <span>Auditor: {audit.auditor}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-xs">
                            {auditFindings.length} findings
                          </Badge>
                          {criticalCount > 0 && (
                            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                              {criticalCount} critical
                            </Badge>
                          )}
                          {highCount > 0 && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              {highCount} high
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}