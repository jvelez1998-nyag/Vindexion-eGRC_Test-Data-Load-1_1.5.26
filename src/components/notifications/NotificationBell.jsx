import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail && open, // Only fetch when bell is opened
    refetchInterval: false,
    staleTime: 300000, // 5 minutes
    gcTime: 600000 // 10 minutes
  });

  const safeNotifications = Array.isArray(notifications) ? notifications.filter(n => n) : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-slate-400 hover:text-white hover:bg-[#1a2332] relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-indigo-500 text-white rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationCenter 
        open={open} 
        onOpenChange={setOpen} 
        userEmail={userEmail}
      />
    </>
  );
}