import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const SecurityContext = createContext();

export function SecurityProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    initializeSecurity();
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const updateActivity = () => setLastActivity(Date.now());
    events.forEach(e => window.addEventListener(e, updateActivity));
    return () => events.forEach(e => window.removeEventListener(e, updateActivity));
  }, []);

  // Auto-logout on inactivity (30 minutes)
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      if (Date.now() - lastActivity > 30 * 60 * 1000) {
        handleAutoLogout();
      }
    }, 60000);
    return () => clearInterval(checkInactivity);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActivity]);

  async function initializeSecurity() {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      calculateSecurityScore(currentUser);
      
      // Initialize session tracking
      setSessionInfo({
        id: generateSessionId(),
        startTime: Date.now(),
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
        location: await getApproximateLocation()
      });
    } catch (error) {
      console.error("Security initialization failed:", error);
    }
  }

  async function checkSession() {
    try {
      await base44.auth.me();
      // Session valid
    } catch (error) {
      // Session expired - Base44 will handle re-authentication automatically
      console.log("Session check failed:", error);
    }
  }

  function calculateSecurityScore(user) {
    let score = 0;
    if (user?.email) score += 20;
    if (user?.role) score += 20;
    if (localStorage.getItem('mfa_enabled')) score += 30;
    if (sessionInfo?.ipAddress) score += 15;
    if (user?.last_password_change && (Date.now() - new Date(user.last_password_change).getTime()) < 90 * 24 * 60 * 60 * 1000) score += 15;
    setSecurityScore(score);
  }

  function handleAutoLogout() {
    toast.error("Auto-logout due to inactivity");
    base44.auth.logout();
  }

  function generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async function getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  async function getApproximateLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.country_name}`;
    } catch {
      return 'unknown';
    }
  }

  async function logSecurityEvent(eventType, details) {
    try {
      await base44.entities.SecurityEvent.create({
        event_type: eventType,
        user_email: user?.email,
        session_id: sessionInfo?.id,
        ip_address: sessionInfo?.ipAddress,
        user_agent: sessionInfo?.userAgent,
        details: JSON.stringify(details),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  const value = {
    user,
    sessionInfo,
    mfaRequired,
    securityScore,
    lastActivity,
    logSecurityEvent,
    checkSession
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within SecurityProvider");
  }
  return context;
}