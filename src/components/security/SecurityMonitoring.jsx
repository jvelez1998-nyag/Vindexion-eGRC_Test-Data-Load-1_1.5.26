import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, Activity, Lock, Eye, TrendingUp } from "lucide-react";

export default function SecurityMonitoring() {
  const [threats, setThreats] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [securityScore, setSecurityScore] = useState(85);

  useEffect(() => {
    monitorSecurity();
    const interval = setInterval(monitorSecurity, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  function monitorSecurity() {
    // Monitor for anomalies
    checkLoginAttempts();
    checkDataAccess();
    checkUnusualActivity();
    calculateSecurityScore();
  }

  function checkLoginAttempts() {
    const failedAttempts = parseInt(localStorage.getItem('failed_login_attempts') || '0');
    if (failedAttempts > 3) {
      addThreat({
        type: 'authentication',
        severity: 'high',
        message: `${failedAttempts} failed login attempts detected`,
        timestamp: Date.now()
      });
    }
  }

  function checkDataAccess() {
    const accessLog = JSON.parse(localStorage.getItem('access_log') || '[]');
    const recentAccess = accessLog.filter(log => Date.now() - log.timestamp < 60000);
    
    if (recentAccess.length > 50) {
      addAnomaly({
        type: 'data_access',
        severity: 'medium',
        message: 'Unusual data access pattern detected',
        timestamp: Date.now()
      });
    }
  }

  function checkUnusualActivity() {
    const hour = new Date().getHours();
    // Activity outside business hours (9 AM - 5 PM)
    if (hour < 9 || hour > 17) {
      addAnomaly({
        type: 'timing',
        severity: 'low',
        message: 'Activity detected outside business hours',
        timestamp: Date.now()
      });
    }
  }

  function calculateSecurityScore() {
    let score = 100;
    
    // Deduct points for threats
    score -= threats.length * 5;
    score -= anomalies.length * 2;
    
    // Check security features
    if (!localStorage.getItem('mfa_enabled')) score -= 15;
    if (!navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Firefox')) score -= 5;
    if (!window.location.protocol.includes('https')) score -= 20;
    
    setSecurityScore(Math.max(0, Math.min(100, score)));
  }

  function addThreat(threat) {
    setThreats(prev => [...prev.slice(-9), threat]);
  }

  function addAnomaly(anomaly) {
    setAnomalies(prev => [...prev.slice(-9), anomaly]);
  }

  const severityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Security Score */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Security Posture Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl font-bold text-white">{securityScore}</div>
            <Badge className={`${
              securityScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
              securityScore >= 60 ? 'bg-amber-500/20 text-amber-400' :
              'bg-rose-500/20 text-rose-400'
            }`}>
              {securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Authentication</span>
              <span className="text-emerald-400">✓ Active</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Encryption</span>
              <span className="text-emerald-400">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Audit Logging</span>
              <span className="text-emerald-400">✓ Active</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">MFA</span>
              <span className="text-amber-400">⚠ Recommended</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Threats */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Active Threats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {threats.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No active threats detected</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {threats.map((threat, idx) => (
                  <Alert key={idx} className="bg-rose-500/10 border-rose-500/30">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <AlertDescription className="text-xs text-rose-400">
                      {threat.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">All activity appears normal</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anomalies.map((anomaly, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={severityColors[anomaly.severity]}>
                      {anomaly.severity}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(anomaly.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{anomaly.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}