import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VendorRiskAutomation() {
  const queryClient = useQueryClient();
  const [lastProcessed, setLastProcessed] = useState({});

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list('-created_date', 100)
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['vendor-documents-all'],
    queryFn: () => base44.entities.VendorDocument.list('-created_date', 100)
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorOnboardingTask.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] })
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vendor.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] })
  });

  // Get admin users for escalation
  const adminUsers = users.filter(u => u.role === 'admin');
  const riskOwner = adminUsers[0]?.email || users[0]?.email;

  useEffect(() => {
    if (assessments.length === 0 || vendors.length === 0) return;

    assessments.forEach(assessment => {
      const processKey = `assessment-${assessment.id}`;
      if (lastProcessed[processKey]) return;

      const vendor = vendors.find(v => v.id === assessment.vendor_id);
      if (!vendor) return;

      // Process high/critical risk assessments
      if (['high', 'critical'].includes(assessment.risk_rating)) {
        handleHighRiskAssessment(assessment, vendor);
        setLastProcessed(prev => ({ ...prev, [processKey]: true }));
      }

      // Check for compliance gaps
      if (assessment.compliance_score < 60) {
        handleComplianceGap(assessment, vendor);
        setLastProcessed(prev => ({ ...prev, [processKey]: true }));
      }

      // Check for low security scores
      if (assessment.security_controls_score < 50 || assessment.overall_score < 60) {
        handleLowSecurityScore(assessment, vendor);
        setLastProcessed(prev => ({ ...prev, [processKey]: true }));
      }
    });
  }, [assessments, vendors]);

  useEffect(() => {
    if (documents.length === 0 || vendors.length === 0) return;

    documents.forEach(doc => {
      const processKey = `document-${doc.id}`;
      if (lastProcessed[processKey]) return;

      const vendor = vendors.find(v => v.id === doc.vendor_id);
      if (!vendor) return;

      // Process documents with identified risks
      if (doc.ai_risks_identified && doc.ai_risks_identified.length > 0) {
        handleDocumentRisks(doc, vendor);
        setLastProcessed(prev => ({ ...prev, [processKey]: true }));
      }

      // Check for expiring documents
      if (doc.expiration_date) {
        const daysUntilExpiry = Math.floor((new Date(doc.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
          handleExpiringDocument(doc, vendor);
          setLastProcessed(prev => ({ ...prev, [processKey]: true }));
        }
      }
    });
  }, [documents, vendors]);

  const handleHighRiskAssessment = async (assessment, vendor) => {
    try {
      // Create escalation task
      await createTaskMutation.mutateAsync({
        vendor_id: vendor.id,
        task_title: `URGENT: High Risk Vendor - ${vendor.vendor_name}`,
        description: `Vendor ${vendor.vendor_name} received a ${assessment.risk_rating.toUpperCase()} risk rating (score: ${assessment.overall_score}/100). Immediate review required.`,
        priority: 'critical',
        status: 'not_started',
        onboarding_stage: 'assessment',
        auto_generated: true,
        notes: `Assessment Date: ${assessment.assessment_date}\nSecurity Score: ${assessment.security_controls_score}\nCompliance Score: ${assessment.compliance_score}`
      });

      // Notify all admins
      for (const admin of adminUsers) {
        await createNotificationMutation.mutateAsync({
          user_email: admin.email,
          type: 'vendor_risk_change',
          title: `Critical: High Risk Vendor Detected`,
          message: `${vendor.vendor_name} has been flagged as ${assessment.risk_rating.toUpperCase()} risk. Overall score: ${assessment.overall_score}/100. Immediate action required.`,
          priority: 'critical',
          entity_type: 'Vendor',
          entity_id: vendor.id
        });
      }

      // Update vendor status if critical
      if (assessment.risk_rating === 'critical' && vendor.status === 'active') {
        await updateVendorMutation.mutateAsync({
          id: vendor.id,
          data: { status: 'under_review' }
        });
      }

      // Create remediation tasks based on low scores
      if (assessment.security_controls_score < 50) {
        await createTaskMutation.mutateAsync({
          vendor_id: vendor.id,
          task_title: 'Review Security Controls',
          description: `Security controls score is critically low (${assessment.security_controls_score}/100). Conduct thorough review of vendor security measures.`,
          priority: 'high',
          status: 'not_started',
          onboarding_stage: 'assessment',
          auto_generated: true
        });
      }

      if (assessment.data_protection_score < 50) {
        await createTaskMutation.mutateAsync({
          vendor_id: vendor.id,
          task_title: 'Data Protection Assessment Required',
          description: `Data protection score is ${assessment.data_protection_score}/100. Review vendor data handling practices and DPA requirements.`,
          priority: 'high',
          status: 'not_started',
          onboarding_stage: 'assessment',
          auto_generated: true
        });
      }

    } catch (error) {
      console.error('Error handling high risk assessment:', error);
    }
  };

  const handleComplianceGap = async (assessment, vendor) => {
    try {
      await createTaskMutation.mutateAsync({
        vendor_id: vendor.id,
        task_title: 'Compliance Gap Remediation',
        description: `${vendor.vendor_name} has a compliance score of ${assessment.compliance_score}/100. Review and address compliance deficiencies.`,
        priority: 'high',
        status: 'not_started',
        onboarding_stage: 'assessment',
        auto_generated: true,
        notes: 'Automated task created due to low compliance score'
      });

      // Notify risk owner
      if (riskOwner) {
        await createNotificationMutation.mutateAsync({
          user_email: riskOwner,
          type: 'vendor_risk_change',
          title: 'Vendor Compliance Gap Identified',
          message: `${vendor.vendor_name} has significant compliance gaps (score: ${assessment.compliance_score}/100). Review required.`,
          priority: 'high',
          entity_type: 'Vendor',
          entity_id: vendor.id
        });
      }
    } catch (error) {
      console.error('Error handling compliance gap:', error);
    }
  };

  const handleLowSecurityScore = async (assessment, vendor) => {
    try {
      await createTaskMutation.mutateAsync({
        vendor_id: vendor.id,
        task_title: 'Security Posture Review',
        description: `${vendor.vendor_name} has insufficient security controls (overall: ${assessment.overall_score}/100). Conduct security review and request improvements.`,
        priority: 'high',
        status: 'not_started',
        onboarding_stage: 'assessment',
        auto_generated: true
      });
    } catch (error) {
      console.error('Error handling low security score:', error);
    }
  };

  const handleDocumentRisks = async (doc, vendor) => {
    try {
      const riskSummary = doc.ai_risks_identified.slice(0, 3).join('; ');
      
      await createTaskMutation.mutateAsync({
        vendor_id: vendor.id,
        task_title: `Review Document Risks - ${doc.document_name}`,
        description: `AI identified ${doc.ai_risks_identified.length} risk(s) in ${doc.document_name}: ${riskSummary}`,
        priority: doc.ai_risks_identified.length > 3 ? 'high' : 'medium',
        status: 'not_started',
        onboarding_stage: 'document_collection',
        auto_generated: true,
        notes: `Document Type: ${doc.document_type}\nFull Risks:\n${doc.ai_risks_identified.join('\n')}`
      });

      // Notify if high number of risks
      if (doc.ai_risks_identified.length >= 3 && riskOwner) {
        await createNotificationMutation.mutateAsync({
          user_email: riskOwner,
          type: 'vendor_risk_change',
          title: 'Multiple Risks in Vendor Document',
          message: `${doc.ai_risks_identified.length} risks identified in ${vendor.vendor_name}'s ${doc.document_type}: ${doc.document_name}`,
          priority: 'high',
          entity_type: 'Vendor',
          entity_id: vendor.id
        });
      }
    } catch (error) {
      console.error('Error handling document risks:', error);
    }
  };

  const handleExpiringDocument = async (doc, vendor) => {
    try {
      const daysUntilExpiry = Math.floor((new Date(doc.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
      
      await createTaskMutation.mutateAsync({
        vendor_id: vendor.id,
        task_title: `Renew Expiring Document - ${doc.document_name}`,
        description: `${doc.document_type} "${doc.document_name}" expires in ${daysUntilExpiry} days. Request updated document from ${vendor.vendor_name}.`,
        priority: daysUntilExpiry <= 7 ? 'critical' : 'high',
        status: 'not_started',
        onboarding_stage: 'document_collection',
        auto_generated: true,
        notes: `Expiration Date: ${doc.expiration_date}`
      });

      if (riskOwner) {
        await createNotificationMutation.mutateAsync({
          user_email: riskOwner,
          type: 'vendor_contract_expiring',
          title: 'Vendor Document Expiring Soon',
          message: `${vendor.vendor_name}'s ${doc.document_type} expires in ${daysUntilExpiry} days. Renewal required.`,
          priority: daysUntilExpiry <= 7 ? 'critical' : 'high',
          entity_type: 'Vendor',
          entity_id: vendor.id
        });
      }
    } catch (error) {
      console.error('Error handling expiring document:', error);
    }
  };

  return null; // Background automation component
}