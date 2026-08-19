import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, CheckCircle2, Clock, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TaskManagement({ tasks, onUpdateTask }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Statuses</SelectItem>
                <SelectItem value="pending" className="text-white">Pending</SelectItem>
                <SelectItem value="assigned" className="text-white">Assigned</SelectItem>
                <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                <SelectItem value="completed" className="text-white">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Priorities</SelectItem>
                <SelectItem value="critical" className="text-white">Critical</SelectItem>
                <SelectItem value="high" className="text-white">High</SelectItem>
                <SelectItem value="medium" className="text-white">Medium</SelectItem>
                <SelectItem value="low" className="text-white">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {filteredTasks.length === 0 ? (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                <p className="text-slate-400">Try adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map(task => (
              <Card key={task.id} className="bg-[#1a2332] border-[#2a3548] hover:border-purple-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold text-white">{task.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                          {task.task_type?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-xs capitalize">
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{task.description?.substring(0, 200)}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {task.trigger_source?.replace(/_/g, ' ')}
                        </span>
                        {task.assigned_to && (
                          <span className="flex items-center gap-1">
                            👤 {task.assigned_to}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Select
                      value={task.status}
                      onValueChange={(status) => onUpdateTask(task.id, { status })}
                    >
                      <SelectTrigger className="w-36 bg-[#0f1623] border-[#2a3548] text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="pending" className="text-white text-xs">Pending</SelectItem>
                        <SelectItem value="assigned" className="text-white text-xs">Assigned</SelectItem>
                        <SelectItem value="in_progress" className="text-white text-xs">In Progress</SelectItem>
                        <SelectItem value="completed" className="text-white text-xs">Completed</SelectItem>
                        <SelectItem value="cancelled" className="text-white text-xs">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}