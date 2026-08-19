import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CriticalEventMonitor({ userEmail }) {
  const queryClient = useQueryClient();

  // Fetch critical data with optimized refresh rate
  const { data: risks = [] } = useQuery({
    queryKey: ['risks-critical'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 50),
    enabled: !!userEmail,
    refetchInterval: 300000, // Check every 5 minutes
    staleTime: 240000 // 4 minutes
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance-critical'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 50),
    enabled: !!userEmail,
    refetchInterval: 300000, // Check every 5 minutes
    staleTime: 240000
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list('-test_date', 50),
    enabled: !!userEmail,
    refetchInterval: 600000, // Check every 10 minutes
    staleTime: 480000 // 8 minutes
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents-critical'],
    queryFn: () => base44.entities.Incident.list('-reported_date', 50),
    enabled: !!userEmail,
    refetchInterval: 300000, // Check every 5 minutes
    staleTime: 240000
  });

  const { data: existingNotifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 100),
    enabled: !!userEmail,
    staleTime: 300000,
    refetchInterval: false
  });

  const createNotification = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  useEffect(() => {
    if (!userEmail) return;

    const safeNotifications = Array.isArray(existingNotifications) ? existingNotifications.filter(n => n) : [];
    const existingKeys = new Set(safeNotifications.map(n => `${n.type}-${n.entity_id}`));
    const today = new Date();

    // Monitor CRITICAL RISKS (score >= 16)
    const safeRisks = Array.isArray(risks) ? risks.filter(r => r) : [];
    safeRisks
      .filter(r => {
        const score = (r.likelihood || 0) * (r.impact || 0);
        return score >= 16 && r.status !== 'closed';
      })
      .forEach(risk => {
        const key = `critical_risk-${risk.id}`;
        if (!existingKeys.has(key)) {
          const score = (risk.likelihood || 0) * (risk.impact || 0);
          createNotification.mutate({
            user_email: userEmail,
            type: 'risk_overdue',
            title: '🚨 Critical Risk Detected',
            message: `${risk.title} has a critical risk score of ${score}/25`,
            priority: 'critical',
            entity_type: 'Risk',
            entity_id: risk.id,
            action_url: '/Risks',
            metadata: { score, category: risk.category }
          });
        }
      });

    // Monitor NON-COMPLIANT ITEMS
    const safeCompliance = Array.isArray(compliance) ? compliance.filter(c => c) : [];
    safeCompliance
      .filter(c => c.status === 'non_compliant')
      .forEach(item => {
        const key = `non_compliant-${item.id}`;
        if (!existingKeys.has(key)) {
          createNotification.mutate({
            user_email: userEmail,
            type: 'compliance_status_change',
            title: '⚠️ Non-Compliance Detected',
            message: `${item.framework}: ${item.requirement} is non-compliant`,
            priority: 'high',
            entity_type: 'Compliance',
            entity_id: item.id,
            action_url: '/Compliance',
            metadata: { framework: item.framework }
          });
        }
      });

    // Monitor FAILED CONTROL TESTS
    const safeControlTests = Array.isArray(controlTests) ? controlTests.filter(test => test) : [];
    const recentFailedTests = safeControlTests.filter(test => {
      if (test.status !== 'failed') return false;
      const testDate = new Date(test.test_date || test.created_date);
      const hoursSinceTest = (today - testDate) / (1000 * 60 * 60);
      return hoursSinceTest <= 24; // Failed in last 24 hours
    });

    recentFailedTests.forEach(test => {
      const key = `control_test_failed-${test.id}`;
      if (!existingKeys.has(key)) {
        createNotification.mutate({
          user_email: userEmail,
          type: 'control_review_due',
          title: '❌ Control Test Failed',
          message: `Control test for "${test.control_id}" has failed`,
          priority: 'high',
          entity_type: 'ControlTest',
          entity_id: test.id,
          action_url: '/Controls',
          metadata: { test_type: test.test_type }
        });
      }
    });

    // Monitor CRITICAL INCIDENTS
    const safeIncidents = Array.isArray(incidents) ? incidents.filter(i => i) : [];
    safeIncidents
      .filter(i => i.severity === 'critical' && i.status !== 'closed')
      .forEach(incident => {
        const key = `critical_incident-${incident.id}`;
        if (!existingKeys.has(key)) {
          createNotification.mutate({
            user_email: userEmail,
            type: 'risk_overdue',
            title: '🔴 Critical Incident',
            message: `${incident.title} - ${incident.incident_type}`,
            priority: 'critical',
            entity_type: 'Incident',
            entity_id: incident.id,
            action_url: '/Incidents',
            metadata: { 
              incident_type: incident.incident_type,
              severity: incident.severity
            }
          });
        }
      });

    // Monitor HIGH SEVERITY INCIDENTS (not yet handled)
    const safeIncidentsHigh = Array.isArray(incidents) ? incidents.filter(i => i) : [];
    safeIncidentsHigh
      .filter(i => i.severity === 'high' && ['reported', 'triaging'].includes(i.status))
      .forEach(incident => {
        const key = `high_incident-${incident.id}`;
        if (!existingKeys.has(key)) {
          createNotification.mutate({
            user_email: userEmail,
            type: 'risk_overdue',
            title: '🟠 High Severity Incident',
            message: `${incident.title} requires immediate attention`,
            priority: 'high',
            entity_type: 'Incident',
            entity_id: incident.id,
            action_url: '/Incidents',
            metadata: { 
              incident_type: incident.incident_type,
              severity: incident.severity,
              status: incident.status
            }
          });
        }
      });

  }, [userEmail, risks, compliance, controlTests, incidents, existingNotifications]);

  return null; // Background monitoring component
}