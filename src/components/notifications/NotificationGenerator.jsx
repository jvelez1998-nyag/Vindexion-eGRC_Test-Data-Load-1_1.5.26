import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { addDays, isBefore, isAfter, parseISO } from "date-fns";
import CriticalEventMonitor from "./CriticalEventMonitor";
import EmailDigestService from "./EmailDigestService";

export default function NotificationGenerator({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', userEmail],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
      return prefs[0] || { 
        audit_upcoming: true, 
        audit_upcoming_days: 7,
        risk_overdue: true,
        risk_review_due: true,
        risk_review_days: 14,
        control_review_due: true,
        control_implementation_due: true,
        control_due_days: 14,
        assessment_review_due: true
      };
    },
    enabled: !!userEmail
  });

  const { data: existingNotifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 100),
    enabled: !!userEmail,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000 // 15 minutes
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-created_date', 50),
    enabled: !!userEmail && preferences?.audit_upcoming,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 100),
    enabled: !!userEmail && preferences?.risk_overdue,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100),
    enabled: !!userEmail && preferences?.control_review_due,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.RiskAssessment.list('-updated_date', 50),
    enabled: !!userEmail && preferences?.assessment_review_due,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-updated_date', 50),
    enabled: !!userEmail && (preferences?.vendor_review_due || preferences?.vendor_contract_expiring),
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const { data: vendorAudits = [] } = useQuery({
    queryKey: ['vendor-audits'],
    queryFn: () => base44.entities.VendorAudit.list('-created_date', 50),
    enabled: !!userEmail && preferences?.audit_upcoming,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const { data: vendorAuditTasks = [] } = useQuery({
    queryKey: ['vendor-audit-tasks'],
    queryFn: () => base44.entities.VendorAuditTask.list('-due_date', 50),
    enabled: !!userEmail,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const { data: onboardingTasks = [] } = useQuery({
    queryKey: ['vendor-onboarding-tasks'],
    queryFn: () => base44.entities.VendorOnboardingTask.list('-due_date', 50),
    enabled: !!userEmail,
    refetchInterval: false,
    staleTime: 600000, // 10 minutes
    gcTime: 900000
  });

  const createNotification = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  useEffect(() => {
    if (!userEmail || !preferences) return;
    
    // Debounce execution - only run every 10 minutes
    const lastRun = localStorage.getItem('notificationGeneratorLastRun');
    const now = Date.now();
    if (lastRun && (now - parseInt(lastRun)) < 600000) { // 10 minutes
      return;
    }
    localStorage.setItem('notificationGeneratorLastRun', now.toString());

    const today = new Date();
    const safeNotifications = Array.isArray(existingNotifications) ? existingNotifications.filter(n => n) : [];
    const existingKeys = new Set(safeNotifications.map(n => `${n.type}-${n.entity_id}`));

    // Check upcoming audits
    if (preferences.audit_upcoming) {
      const upcomingDays = preferences.audit_upcoming_days || 7;
      const threshold = addDays(today, upcomingDays);
      
      const safeAudits = Array.isArray(audits) ? audits.filter(a => a) : [];
      safeAudits
        .filter(a => a.status === 'planned' && a.start_date)
        .forEach(audit => {
          const startDate = parseISO(audit.start_date);
          const key = `audit_upcoming-${audit.id}`;
          
          if (isAfter(startDate, today) && isBefore(startDate, threshold) && !existingKeys.has(key)) {
            createNotification.mutate({
              user_email: userEmail,
              type: 'audit_upcoming',
              title: 'Upcoming Audit',
              message: `"${audit.title}" is scheduled to start soon`,
              priority: 'high',
              entity_type: 'Audit',
              entity_id: audit.id,
              action_url: '/Audits'
            });
          }
        });
    }

    // Check overdue risk treatments
    if (preferences.risk_overdue) {
      const safeRisks = Array.isArray(risks) ? risks.filter(r => r) : [];
      safeRisks
        .filter(r => r.status !== 'closed' && r.due_date)
        .forEach(risk => {
          const dueDate = parseISO(risk.due_date);
          const key = `risk_overdue-${risk.id}`;
          
          if (isBefore(dueDate, today) && !existingKeys.has(key)) {
            const score = (risk.likelihood || 0) * (risk.impact || 0);
            createNotification.mutate({
              user_email: userEmail,
              type: 'risk_overdue',
              title: 'Overdue Risk Treatment',
              message: `"${risk.title}" treatment is past due`,
              priority: score >= 16 ? 'critical' : score >= 9 ? 'high' : 'medium',
              entity_type: 'Risk',
              entity_id: risk.id,
              action_url: '/Risks'
            });
          }
        });
    }

    // Check control reviews due
    if (preferences.control_review_due) {
      const reviewThreshold = addDays(today, 14);
      
      const safeControls = Array.isArray(controls) ? controls.filter(c => c) : [];
      safeControls
        .filter(c => c.status !== 'retired' && c.last_tested_date)
        .forEach(control => {
          let nextReview;
          const lastTested = parseISO(control.last_tested_date);
          
          switch (control.review_frequency) {
            case 'monthly': nextReview = addDays(lastTested, 30); break;
            case 'quarterly': nextReview = addDays(lastTested, 90); break;
            case 'semi_annually': nextReview = addDays(lastTested, 180); break;
            case 'annually': nextReview = addDays(lastTested, 365); break;
            default: return;
          }
          
          const key = `control_review_due-${control.id}`;
          if (isBefore(nextReview, reviewThreshold) && !existingKeys.has(key)) {
            createNotification.mutate({
              user_email: userEmail,
              type: 'control_review_due',
              title: 'Control Review Due',
              message: `"${control.name}" is due for testing`,
              priority: isBefore(nextReview, today) ? 'high' : 'medium',
              entity_type: 'Control',
              entity_id: control.id,
              action_url: '/Controls'
            });
          }
        });
    }

    // Check assessment reviews due
    if (preferences.assessment_review_due) {
      const safeAssessments = Array.isArray(assessments) ? assessments.filter(a => a) : [];
      safeAssessments
        .filter(a => a.lifecycle_status !== 'archived' && a.next_review_date)
        .forEach(assessment => {
          const reviewDate = parseISO(assessment.next_review_date);
          const threshold = addDays(today, 14);
          const key = `assessment_review_due-${assessment.id}`;
          
          if (isBefore(reviewDate, threshold) && !existingKeys.has(key)) {
            createNotification.mutate({
              user_email: userEmail,
              type: 'assessment_review_due',
              title: 'Assessment Review Due',
              message: `"${assessment.title}" needs review`,
              priority: isBefore(reviewDate, today) ? 'high' : 'medium',
              entity_type: 'RiskAssessment',
              entity_id: assessment.id,
              action_url: '/RiskAssessments'
            });
          }
        });
    }

    // Check control implementation deadlines
    if (preferences.control_implementation_due) {
      const dueThreshold = addDays(today, preferences.control_due_days || 14);
      
      const safeControlsImpl = Array.isArray(controls) ? controls.filter(c => c) : [];
      safeControlsImpl
        .filter(c => c.status === 'planned' && c.implementation_date)
        .forEach(control => {
          const implDate = parseISO(control.implementation_date);
          const key = `control_implementation_due-${control.id}`;
          
          if (isAfter(implDate, today) && isBefore(implDate, dueThreshold) && !existingKeys.has(key)) {
            createNotification.mutate({
              user_email: userEmail,
              type: 'control_implementation_due',
              title: 'Control Implementation Due',
              message: `"${control.name}" implementation deadline approaching`,
              priority: 'medium',
              entity_type: 'Control',
              entity_id: control.id,
              action_url: '/Controls'
            });
          }
        });
    }

    // Check risk reviews due
    if (preferences.risk_review_due) {
      const reviewThreshold = addDays(today, preferences.risk_review_days || 14);
      
      const safeRisksReview = Array.isArray(risks) ? risks.filter(r => r) : [];
      safeRisksReview
        .filter(r => r.status !== 'closed' && r.next_review_date)
        .forEach(risk => {
          const reviewDate = parseISO(risk.next_review_date);
          const key = `risk_review_due-${risk.id}`;
          
          if (isAfter(reviewDate, today) && isBefore(reviewDate, reviewThreshold) && !existingKeys.has(key)) {
            createNotification.mutate({
              user_email: userEmail,
              type: 'risk_review_due',
              title: 'Risk Review Due',
              message: `"${risk.title}" is due for review`,
              priority: 'medium',
              entity_type: 'Risk',
              entity_id: risk.id,
              action_url: '/Risks'
            });
          }
        });
    }

    // Check vendor reviews due
    if (preferences.vendor_review_due) {
      const reviewThreshold = addDays(today, 30);
      
      const safeVendors = Array.isArray(vendors) ? vendors.filter(v => v) : [];
      safeVendors
        .filter(v => v.status === 'active' && v.next_review_date)
        .forEach(vendor => {
          const reviewDate = parseISO(vendor.next_review_date);
          const key = `vendor_review_due-${vendor.id}`;
          
          if (isAfter(reviewDate, today) && isBefore(reviewDate, reviewThreshold) && !existingKeys.has(key)) {
            createNotification.mutate({
              user_email: userEmail,
              type: 'vendor_review_due',
              title: 'Vendor Review Due',
              message: `"${vendor.vendor_name}" is due for review`,
              priority: vendor.criticality === 'critical' ? 'high' : 'medium',
              entity_type: 'Vendor',
              entity_id: vendor.id,
              action_url: '/ThirdPartyRiskManagement'
            });
          }
        });
    }

    // Check vendor contract expiration
    if (preferences.vendor_contract_expiring) {
      const contractThreshold = addDays(today, preferences.vendor_contract_days || 60);
      
      const safeVendorsContract = Array.isArray(vendors) ? vendors.filter(v => v) : [];
      safeVendorsContract
        .filter(v => v.status === 'active' && v.contract_end_date)
        .forEach(vendor => {
          const endDate = parseISO(vendor.contract_end_date);
          const key = `vendor_contract_expiring-${vendor.id}`;
          
          if (isAfter(endDate, today) && isBefore(endDate, contractThreshold) && !existingKeys.has(key)) {
            const daysUntil = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
            createNotification.mutate({
              user_email: userEmail,
              type: 'vendor_contract_expiring',
              title: 'Vendor Contract Expiring',
              message: `"${vendor.vendor_name}" contract expires in ${daysUntil} days`,
              priority: daysUntil <= 30 ? 'high' : 'medium',
              entity_type: 'Vendor',
              entity_id: vendor.id,
              action_url: '/ThirdPartyRiskManagement'
            });
          }
        });
    }

    // Check vendor audit deadlines
    if (preferences.audit_upcoming) {
      const auditThreshold = addDays(today, 7);
      
      const safeVendorAudits = Array.isArray(vendorAudits) ? vendorAudits.filter(a => a) : [];
      safeVendorAudits
        .filter(a => ['planned', 'in_progress'].includes(a.status) && a.due_date)
        .forEach(audit => {
          const dueDate = parseISO(audit.due_date);
          const key = `vendor_audit_due-${audit.id}`;
          
          if (isAfter(dueDate, today) && isBefore(dueDate, auditThreshold) && !existingKeys.has(key)) {
            createNotification.mutate({
              user_email: userEmail,
              type: 'audit_upcoming',
              title: 'Vendor Audit Deadline Approaching',
              message: `"${audit.audit_title}" is due soon`,
              priority: isBefore(dueDate, addDays(today, 3)) ? 'high' : 'medium',
              entity_type: 'VendorAudit',
              entity_id: audit.id,
              action_url: '/ThirdPartyRiskManagement'
            });
          }
        });
    }

    // Check overdue vendor audit tasks
    const safeVendorAuditTasks = Array.isArray(vendorAuditTasks) ? vendorAuditTasks.filter(t => t) : [];
    safeVendorAuditTasks
      .filter(t => !['completed', 'cancelled'].includes(t.status) && t.due_date)
      .forEach(task => {
        const dueDate = parseISO(task.due_date);
        const key = `vendor_audit_task_overdue-${task.id}`;
        
        if (isBefore(dueDate, today) && !existingKeys.has(key)) {
          const actionUrl = task.assigned_to_vendor ? '/ThirdPartyRiskManagement' : '/ThirdPartyRiskManagement';
          createNotification.mutate({
            user_email: task.assigned_to,
            type: 'audit_upcoming',
            title: task.assigned_to_vendor ? 'Vendor Task Overdue' : 'Audit Task Overdue',
            message: `"${task.task_title}" is past due`,
            priority: 'high',
            entity_type: 'VendorAuditTask',
            entity_id: task.id,
            action_url: actionUrl
          });
        }
      });

    // Check upcoming vendor task deadlines (3 days warning)
    const safeVendorAuditTasksUpcoming = Array.isArray(vendorAuditTasks) ? vendorAuditTasks.filter(t => t) : [];
    safeVendorAuditTasksUpcoming
      .filter(t => t.assigned_to_vendor && !['completed'].includes(t.status) && t.due_date)
      .forEach(task => {
        const dueDate = parseISO(task.due_date);
        const warningDate = addDays(today, 3);
        const key = `vendor_task_due_soon-${task.id}`;
        
        if (isAfter(dueDate, today) && isBefore(dueDate, warningDate) && !existingKeys.has(key)) {
          createNotification.mutate({
            user_email: task.assigned_to,
            type: 'audit_upcoming',
            title: 'Vendor Task Due Soon',
            message: `"${task.task_title}" is due in ${Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))} days`,
            priority: 'medium',
            entity_type: 'VendorAuditTask',
            entity_id: task.id,
            action_url: '/ThirdPartyRiskManagement'
          });
        }
      });

    // Check overdue onboarding tasks
    const safeOnboardingTasks = Array.isArray(onboardingTasks) ? onboardingTasks.filter(t => t) : [];
    safeOnboardingTasks
      .filter(t => t.status !== 'completed' && t.due_date)
      .forEach(task => {
        const dueDate = parseISO(task.due_date);
        const key = `onboarding_task_overdue-${task.id}`;
        
        if (isBefore(dueDate, today) && !existingKeys.has(key)) {
          createNotification.mutate({
            user_email: task.assigned_to || userEmail,
            type: 'audit_upcoming',
            title: 'Vendor Onboarding Task Overdue',
            message: `"${task.task_title}" is past due`,
            priority: 'high',
            entity_type: 'VendorOnboardingTask',
            entity_id: task.id,
            action_url: '/ThirdPartyRiskManagement'
          });
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, preferences, audits, risks, controls, assessments, vendors, vendorAudits, vendorAuditTasks, onboardingTasks, existingNotifications]);

  return (
    <>
      <CriticalEventMonitor userEmail={userEmail} />
      <EmailDigestService userEmail={userEmail} />
    </>
  );
}