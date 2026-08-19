import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, Check, CheckCheck, Trash2, AlertTriangle, Calendar, 
  FileText, Shield, RefreshCw, Settings, Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const typeIcons = {
  audit_upcoming: Calendar,
  risk_overdue: AlertTriangle,
  guidance_update: FileText,
  risk_status_change: AlertTriangle,
  compliance_status_change: Shield,
  control_review_due: Shield,
  assessment_review_due: RefreshCw
};

const priorityColors = {
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

export default function NotificationCenter({ open, onOpenChange, userEmail }) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail && open,
    staleTime: 300000,
    refetchInterval: false
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const safeNotifications = Array.isArray(notifications) ? notifications.filter(n => n) : [];

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = safeNotifications.filter(n => !n.read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = safeNotifications.filter(n => !n.read).length;
  const unreadNotifications = safeNotifications.filter(n => !n.read);
  const readNotifications = safeNotifications.filter(n => n.read);

  const NotificationItem = ({ notification }) => {
    const Icon = typeIcons[notification.type] || Bell;
    
    return (
      <div 
        className={`p-4 border-b border-[#2a3548] hover:bg-[#151d2e] transition-colors ${
          !notification.read ? 'bg-indigo-500/5' : ''
        }`}
      >
        <div className="flex gap-3">
          <div className={`p-2 rounded-lg h-fit ${
            notification.priority === 'critical' ? 'bg-rose-500/10' :
            notification.priority === 'high' ? 'bg-amber-500/10' :
            'bg-indigo-500/10'
          }`}>
            <Icon className={`h-4 w-4 ${
              notification.priority === 'critical' ? 'text-rose-400' :
              notification.priority === 'high' ? 'text-amber-400' :
              'text-indigo-400'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-500 hover:text-white"
                    onClick={() => markReadMutation.mutate(notification.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-500 hover:text-rose-400"
                  onClick={() => deleteMutation.mutate(notification.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-[9px] border ${priorityColors[notification.priority]}`}>
                {notification.priority}
              </Badge>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
              </span>
            </div>
            {notification.action_url && (
              <Link
                to={notification.action_url}
                onClick={() => {
                  if (!notification.read) markReadMutation.mutate(notification.id);
                  onOpenChange(false);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
              >
                View Details →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 bg-[#0f1623] border-[#2a3548]">
        <SheetHeader className="p-4 border-b border-[#2a3548] bg-[#151d2e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Bell className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <SheetTitle className="text-base text-white">Notifications</SheetTitle>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Link to={createPageUrl('NotificationSettings')}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  onClick={() => onOpenChange(false)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="unread" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="unread" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                All ({safeNotifications.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <TabsContent value="unread" className="mt-0">
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No unread notifications</p>
                </div>
              ) : (
                unreadNotifications.map(n => <NotificationItem key={n.id} notification={n} />)
              )}
            </TabsContent>
            <TabsContent value="all" className="mt-0">
              {safeNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                safeNotifications.map(n => <NotificationItem key={n.id} notification={n} />)
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}