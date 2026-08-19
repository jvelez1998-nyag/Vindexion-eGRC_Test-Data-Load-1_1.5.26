import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  LayoutDashboard, AlertTriangle, FileCheck, Shield, 
  ClipboardCheck, FileText, Users, Brain, TrendingUp,
  ChevronRight, CheckCircle2
} from "lucide-react";

export default function ModuleDocumentation({ searchTerm = '' }) {
  const [selectedModule, setSelectedModule] = useState('dashboard');

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'blue', screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
    { id: 'insights', name: 'Advanced Insights', icon: TrendingUp, color: 'violet', screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop' },
    { id: 'risk', name: 'Risk Management', icon: AlertTriangle, color: 'rose', screenshot: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop' },
    { id: 'assessments', name: 'Risk Assessments', icon: ClipboardCheck, color: 'orange', screenshot: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop' },
    { id: 'incidents', name: 'Incident Management', icon: AlertTriangle, color: 'red', screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
    { id: 'controls', name: 'Controls', icon: Shield, color: 'indigo', screenshot: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop' },
    { id: 'compliance', name: 'Policy Compliance', icon: FileCheck, color: 'emerald', screenshot: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop' },
    { id: 'frameworks', name: 'Framework Compliance', icon: Shield, color: 'teal', screenshot: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop' },
    { id: 'crosswalk', name: 'Cross-Walk Mapping', icon: TrendingUp, color: 'purple', screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
    { id: 'audits', name: 'Audits', icon: ClipboardCheck, color: 'purple', screenshot: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop' },
    { id: 'regexam', name: 'Regulatory Exams', icon: FileText, color: 'amber', screenshot: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop' },
    { id: 'questionbank', name: 'Question Bank', icon: FileText, color: 'blue', screenshot: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop' },
    { id: 'vendors', name: 'Vendor Risk', icon: Users, color: 'cyan', screenshot: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop' },
    { id: 'clients', name: 'Client Management', icon: Users, color: 'pink', screenshot: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop' },
    { id: 'privacy', name: 'Privacy Assessment', icon: Shield, color: 'green', screenshot: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop' },
    { id: 'threats', name: 'Threat & Vulnerabilities', icon: AlertTriangle, color: 'red', screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
    { id: 'reports', name: 'Reports', icon: FileText, color: 'amber', screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop' },
    { id: 'guidance', name: 'Guidance Library', icon: FileText, color: 'blue', screenshot: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop' },
    { id: 'knowledge', name: 'AI Knowledge Base', icon: Brain, color: 'violet', screenshot: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop' },
    { id: 'assistant', name: 'AI Assistant', icon: Brain, color: 'indigo', screenshot: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop' },
    { id: 'workflow', name: 'Workflow Automation', icon: TrendingUp, color: 'purple', screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
    { id: 'integrations', name: 'External Integrations', icon: TrendingUp, color: 'cyan', screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
    { id: 'assessment-config', name: 'Assessment Config', icon: ClipboardCheck, color: 'orange', screenshot: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop' },
    { id: 'notifications', name: 'Notification Settings', icon: TrendingUp, color: 'blue', screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
    { id: 'users', name: 'User Administration', icon: Users, color: 'indigo', screenshot: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop' },
    { id: 'roles', name: 'Role Management', icon: Shield, color: 'purple', screenshot: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop' }
  ];

  const documentation = {
    dashboard: {
      overview: "The Dashboard provides a real-time overview of your organization's GRC posture with key metrics, visualizations, AI-powered insights, and personalized recommendations.",
      features: [
        { title: 'Stats Cards', description: 'Quick view of critical metrics including open risks, compliance rate, control effectiveness, and audit findings' },
        { title: 'Risk Heat Map', description: 'Visual representation of risks by likelihood and impact for prioritization' },
        { title: 'Compliance Performance', description: 'Framework-specific compliance tracking with interactive charts' },
        { title: 'AI Insights Panel', description: 'AI-generated recommendations based on your GRC data' },
        { title: 'Trend Analysis', description: 'Historical trends for key metrics over time with forecasting' },
        { title: 'Intelligence Feed', description: 'Recent activities and notifications' },
        { title: 'Personalized Suggestions', description: 'AI-driven recommendations tailored to your role and activities' }
      ],
      howTo: [
        'Click any stat card to drill down into detailed views',
        'Hover over chart elements for additional information',
        'Use filters to customize your dashboard view',
        'Interact with AI suggestions for quick actions',
        'Export visualizations for presentations'
      ]
    },
    insights: {
      overview: "Advanced Insights Dashboard offers predictive analytics, anomaly detection, risk correlation analysis, and strategic intelligence for proactive GRC management.",
      features: [
        { title: 'Predictive Risk Analytics', description: 'Forecast risk trends and identify emerging threats using ML models' },
        { title: 'Anomaly Detection', description: 'Automatically identify unusual patterns in GRC data' },
        { title: 'Risk Correlation Matrix', description: 'Visualize interdependencies between risks' },
        { title: 'Control Failure Prediction', description: 'Predict which controls are at risk of failure' },
        { title: 'Vendor Risk Forecasting', description: 'Anticipate vendor-related risks before they materialize' },
        { title: 'Compliance Gap Prediction', description: 'Identify future compliance gaps based on trends' },
        { title: 'Strategic Intelligence', description: 'Executive-level insights and prioritized recommendations' }
      ],
      howTo: [
        'Run predictive models to forecast future trends',
        'Review anomaly alerts and investigate root causes',
        'Analyze risk correlations to understand systemic risks',
        'Act on early warning indicators',
        'Export strategic intelligence reports for leadership'
      ]
    },
    risk: {
      overview: "Comprehensive risk management module for identifying, assessing, treating, and monitoring organizational risks throughout their lifecycle with AI-powered analysis and prediction.",
      features: [
        { title: 'Risk Register', description: 'Centralized repository of all risks with inherent and residual scoring' },
        { title: 'AI Risk Analysis Engine', description: 'Describe scenarios and let AI identify potential risks automatically' },
        { title: 'Risk Treatment Workflow', description: 'Document mitigation strategies with accept/mitigate/transfer/avoid options' },
        { title: 'Risk Libraries', description: 'Pre-built risk libraries including OWASP Top 10 and MITRE ATT&CK' },
        { title: 'External Risk Feeds', description: 'Integration with threat intelligence sources for emerging risks' },
        { title: 'Risk Heat Maps', description: 'Interactive visualizations for risk prioritization' },
        { title: 'Scenario Simulation', description: 'AI-powered risk scenario modeling and impact analysis' },
        { title: 'Automated Monitoring', description: 'Continuous risk monitoring with threshold alerts' }
      ],
      howTo: [
        'Add new risks manually or use AI Risk Analyzer',
        'Score inherent and residual risks using likelihood (1-5) and impact (1-5)',
        'Link controls to demonstrate risk mitigation',
        'Import risks from OWASP or MITRE libraries',
        'Set up automated monitoring and alerts',
        'Generate risk reports and heat maps'
      ]
    },
    assessments: {
      overview: "Risk assessment module for conducting structured risk and control self-assessments (RCSA) with customizable templates and workflows.",
      features: [
        { title: 'Assessment Templates', description: 'Customizable questionnaire templates for different assessment types' },
        { title: 'RCSA Workflows', description: 'Risk and control self-assessment lifecycle management' },
        { title: 'Risk Scoring Engine', description: 'Automated scoring based on questionnaire responses' },
        { title: 'AI Risk Assessor', description: 'AI-powered risk identification from assessment data' },
        { title: 'Approval Workflows', description: 'Multi-stage approval chains for assessment sign-offs' },
        { title: 'Recurring Assessments', description: 'Schedule automated recurring assessments' },
        { title: 'Risk Mapping Hub', description: 'Visual mapping of risks to controls and compliance' }
      ],
      howTo: [
        'Create custom assessment templates or use pre-built ones',
        'Launch assessments for specific teams or processes',
        'Complete questionnaires and score risks',
        'Link identified risks to controls',
        'Route assessments through approval workflows',
        'Schedule recurring assessments for continuous monitoring'
      ]
    },
    incidents: {
      overview: "End-to-end incident management from detection through resolution with automated workflows and AI-powered analysis.",
      features: [
        { title: 'Incident Register', description: 'Track all incidents with categorization by type and severity' },
        { title: 'Response Playbooks', description: 'Pre-defined response procedures for common incident types' },
        { title: 'Root Cause Analysis', description: 'Structured tools for identifying incident root causes' },
        { title: 'AI Incident Analyzer', description: 'AI-powered pattern detection and similar incident identification' },
        { title: 'Timeline Tracking', description: 'Detailed incident timeline with all actions and communications' },
        { title: 'Automated Workflows', description: 'Auto-triage, assignment, and escalation based on severity' },
        { title: 'Threat Intelligence', description: 'Enrich incidents with external threat intelligence data' },
        { title: 'Post-Incident Reviews', description: 'Capture lessons learned and improvement actions' }
      ],
      howTo: [
        'Log incidents with type, severity, and description',
        'Use playbooks to guide response actions',
        'Conduct root cause analysis',
        'Link incidents to related risks and controls',
        'Track remediation actions and deadlines',
        'Generate incident reports and metrics'
      ]
    },
    compliance: {
      overview: "Track and manage policy compliance requirements across multiple regulatory frameworks with evidence management, AI gap analysis, and automated monitoring.",
      features: [
        { title: 'Multi-Framework Support', description: 'SOX, SOC2, ISO27001, GDPR, HIPAA, PCI-DSS, NIST, FFIEC, and 30+ more frameworks' },
        { title: 'AI Gap Analysis', description: 'Automatically identify compliance gaps and missing controls' },
        { title: 'Evidence Management', description: 'Centralized repository for compliance evidence with version control' },
        { title: 'Status Tracking', description: 'Monitor implementation and verification progress' },
        { title: 'AI Policy Generator', description: 'Generate compliance policies aligned to frameworks' },
        { title: 'Attestation Management', description: 'Track policy acknowledgments and sign-offs' },
        { title: 'Automated Alerts', description: 'Deadline monitoring and compliance change notifications' }
      ],
      howTo: [
        'Import framework requirements from pre-built templates',
        'Assign owners and due dates to requirements',
        'Upload and link evidence documents',
        'Run AI gap analysis to identify missing items',
        'Use AI to generate policy documents',
        'Generate compliance status reports and dashboards'
      ]
    },
    frameworks: {
      overview: "Manage compliance across multiple regulatory and industry frameworks with real-time status tracking and performance monitoring.",
      features: [
        { title: 'Framework Library', description: 'Support for 30+ compliance frameworks and standards' },
        { title: 'Real-time Dashboards', description: 'Framework-specific compliance status and metrics' },
        { title: 'Compliance Scoring', description: 'Automated scoring based on requirement status' },
        { title: 'Gap Identification', description: 'Identify and prioritize compliance gaps' },
        { title: 'Evidence Linking', description: 'Link evidence to specific framework requirements' },
        { title: 'Multi-view Analytics', description: 'Pie charts, bar charts, and radar visualizations' },
        { title: 'AI Executive Summaries', description: 'AI-generated compliance posture summaries' }
      ],
      howTo: [
        'Select applicable frameworks for your organization',
        'Import or create framework-specific requirements',
        'Track compliance status for each requirement',
        'Upload and link supporting evidence',
        'Review compliance dashboards and analytics',
        'Generate framework-specific reports'
      ]
    },
    crosswalk: {
      overview: "Intelligent cross-framework mapping to identify overlaps, reduce redundancy, and optimize control coverage across multiple regulatory requirements.",
      features: [
        { title: 'Automated Mapping', description: 'AI-powered framework-to-framework requirement mapping' },
        { title: 'Gap Analysis', description: 'Identify coverage gaps across frameworks' },
        { title: 'Overlap Detection', description: 'Find redundant controls and consolidate efforts' },
        { title: 'Custom Mappings', description: 'Create and save custom mapping rules' },
        { title: 'AI Control Suggestions', description: 'Get recommendations for controls that satisfy multiple frameworks' },
        { title: 'Export Documentation', description: 'Generate mapping documentation for auditors' },
        { title: 'Mapping Validation', description: 'Quality checks and validation of mappings' }
      ],
      howTo: [
        'Select source and target frameworks to map',
        'Review AI-generated mapping suggestions',
        'Validate and adjust mappings as needed',
        'Identify controls that satisfy multiple frameworks',
        'Export mapping documentation',
        'Use insights to optimize control implementation'
      ]
    },
    controls: {
      overview: "Comprehensive control lifecycle management from design through testing with AI-powered optimization, automated testing schedules, and effectiveness tracking.",
      features: [
        { title: 'Control Libraries', description: 'Pre-built NIST 800-53, CIS Controls, and ITGC libraries' },
        { title: 'Control Design Engine', description: 'Structured control design with objectives and procedures' },
        { title: 'Automated Testing', description: 'Scheduled control testing with evidence collection' },
        { title: 'AI Control Advisor', description: 'Get AI recommendations for control improvements' },
        { title: 'AI Control Testing', description: 'AI-generated test procedures and sample selection' },
        { title: 'AI Gap Analysis', description: 'Identify control gaps and receive mitigation recommendations' },
        { title: 'Control Workflows', description: 'Approval workflows for design, implementation, and changes' },
        { title: 'Effectiveness Dashboard', description: 'Real-time control effectiveness metrics and analytics' },
        { title: 'Framework Mapping', description: 'Map controls to COSO, COBIT, ISO27001, NIST, SOX' }
      ],
      howTo: [
        'Import controls from NIST, CIS, or ITGC libraries',
        'Design custom controls with AI assistance',
        'Link controls to risks and compliance requirements',
        'Configure automated testing schedules',
        'Execute tests and rate effectiveness (1-5)',
        'Use AI to identify and remediate control gaps',
        'Generate control effectiveness reports'
      ]
    },
    audits: {
      overview: "End-to-end audit lifecycle management from planning through remediation with AI-powered program building, fieldwork assistance, and automated reporting.",
      features: [
        { title: 'Audit Planning', description: 'Risk-based audit planning with universe management' },
        { title: 'AI Audit Program Builder', description: 'AI-generated audit programs with test procedures' },
        { title: 'AI Scope Generator', description: 'Generate comprehensive audit scopes based on risk profiles' },
        { title: 'Audit Program Library', description: 'Reusable audit program templates by type' },
        { title: 'Workpaper Management', description: 'Organized evidence collection and documentation' },
        { title: 'Finding Tracker', description: 'Document, classify, and track audit findings' },
        { title: 'AI Finding Analysis', description: 'AI-powered root cause and impact analysis' },
        { title: 'AI Remediation Planner', description: 'Generate intelligent remediation plans' },
        { title: 'Automated Reporting', description: 'Auto-generate audit reports with AI insights' }
      ],
      howTo: [
        'Create audit plans using risk-based prioritization',
        'Generate audit programs with AI assistance',
        'Execute fieldwork and collect evidence in workpapers',
        'Document findings with severity and category',
        'Use AI to analyze findings and plan remediation',
        'Track remediation progress and completion',
        'Generate comprehensive audit reports'
      ]
    },
    regexam: {
      overview: "Regulatory examination simulation platform for preparing teams for FFIEC, OCC, FDIC, SEC, and other regulatory exams with AI-powered scenarios and adaptive difficulty.",
      features: [
        { title: 'Multi-Framework Exams', description: 'Simulations for FFIEC, OCC, FDIC, SEC, NCUA, and more' },
        { title: 'AI Question Generator', description: 'Generate realistic exam questions based on frameworks' },
        { title: 'Examiner Simulator', description: 'AI-powered examiner interaction training' },
        { title: 'Adaptive Difficulty', description: 'Questions adapt to user performance for optimal learning' },
        { title: 'Exam Day Mode', description: 'Pressure simulation with time limits and scoring' },
        { title: 'Study Guides', description: 'Framework-specific study materials and learning paths' },
        { title: 'Performance Analytics', description: 'Track progress and identify knowledge gaps' },
        { title: 'Workflow Automation', description: 'Pre-exam prep, scheduling, and post-exam reviews' }
      ],
      howTo: [
        'Select regulatory framework for exam simulation',
        'Complete pre-exam readiness questionnaire',
        'Take AI-generated exams with adaptive difficulty',
        'Practice examiner interactions with AI personas',
        'Review performance analytics and gap reports',
        'Use study guides to address weak areas',
        'Schedule mock exams with exam day pressure mode'
      ]
    },
    questionbank: {
      overview: "Centralized repository of assessment questions for audits, exams, assessments, and training with AI generation and categorization.",
      features: [
        { title: 'Question Library', description: 'Searchable repository of questions by framework and topic' },
        { title: 'AI Question Generator', description: 'Generate questions based on framework requirements' },
        { title: 'Categorization', description: 'Organize by framework, domain, difficulty, and tags' },
        { title: 'Bulk Editor', description: 'Edit multiple questions simultaneously' },
        { title: 'Import/Export', description: 'Import questions from Excel or export for external use' },
        { title: 'Usage Analytics', description: 'Track question effectiveness and usage' },
        { title: 'Version Control', description: 'Maintain question history and revisions' }
      ],
      howTo: [
        'Browse existing questions by category or framework',
        'Use AI to generate new questions on specific topics',
        'Edit and refine question wording and answers',
        'Organize with tags and difficulty ratings',
        'Bulk import questions from templates',
        'Track which questions are most effective',
        'Export question sets for exams or assessments'
      ]
    },
    vendors: {
      overview: "End-to-end third-party risk management with automated workflows, AI-powered risk scoring, continuous monitoring, and vendor portal integration.",
      features: [
        { title: 'Vendor Registry', description: 'Centralized database with tiering and criticality ratings' },
        { title: 'AI Vendor Risk Scoring', description: 'Automated risk assessment with ML-based scoring' },
        { title: 'Onboarding Workflows', description: 'Automated vendor onboarding with AI-generated checklists' },
        { title: 'Security Assessments', description: 'Questionnaire-based security evaluations' },
        { title: 'Vendor Audits', description: 'Dedicated audit workflows with task management' },
        { title: 'Performance Management', description: 'KPI tracking, SLA monitoring, and scorecards' },
        { title: 'AI Failure Prediction', description: 'Predict vendor performance issues before they occur' },
        { title: 'Continuous Monitoring', description: 'Automated alerts for contracts, reviews, and risks' },
        { title: 'Vendor Portal', description: 'Self-service portal for vendors to submit documents' },
        { title: 'AI Data Enrichment', description: 'Auto-enhance vendor records with external data' }
      ],
      howTo: [
        'Add vendors with classification, tier, and criticality',
        'Complete onboarding with AI-generated checklists',
        'Launch security assessments and questionnaires',
        'Set up KPIs and SLA monitoring',
        'Schedule periodic vendor reviews',
        'Conduct vendor audits with task assignment',
        'Use AI to predict and prevent vendor issues',
        'Generate vendor risk reports and scorecards'
      ]
    },
    clients: {
      overview: "Client portfolio management for consulting firms and service providers managing multiple client GRC programs with risk scoring and reporting.",
      features: [
        { title: 'Client Portfolio', description: 'Manage multiple client profiles and engagements' },
        { title: 'Client Risk Scoring', description: 'Assess and track client-specific risks' },
        { title: 'Client Dashboards', description: 'Customized dashboards for each client' },
        { title: 'Assessment Engine', description: 'Conduct client assessments with custom questionnaires' },
        { title: 'AI Comprehensive Risk Engine', description: 'AI-powered client risk analysis' },
        { title: 'Client Scorecards', description: 'Performance and compliance scorecards per client' },
        { title: 'AI Churn Prediction', description: 'Predict client churn risk' },
        { title: 'Client Reporting', description: 'Generate client-specific reports and summaries' },
        { title: 'Onboarding/Offboarding', description: 'Guided wizards for client lifecycle' }
      ],
      howTo: [
        'Add client profiles with industry and type',
        'Conduct initial client risk assessments',
        'Set up client-specific compliance frameworks',
        'Monitor client GRC metrics on dashboards',
        'Generate client scorecards and reports',
        'Use AI to identify at-risk clients',
        'Manage client document repositories'
      ]
    },
    privacy: {
      overview: "Comprehensive privacy assessment and management platform supporting GDPR, CCPA, HIPAA, PIPEDA, and other data protection regulations with AI-powered tools.",
      features: [
        { title: 'Privacy Assessment Builder', description: 'AI-generated privacy assessment questionnaires' },
        { title: 'Multi-Regulation Support', description: 'GDPR, CCPA, HIPAA, PIPEDA, LGPD, PDPA coverage' },
        { title: 'Scenario Simulator', description: 'AI-powered privacy scenario training (breaches, DSARs, consent)' },
        { title: 'Regulation Library', description: 'Comprehensive privacy regulation reference' },
        { title: 'Privacy Workflows', description: 'Automated DSAR, PIA, breach response workflows' },
        { title: 'Privacy Dashboard', description: 'Real-time privacy maturity and compliance metrics' },
        { title: 'Risk & Control Linking', description: 'Privacy-specific risk and control management' },
        { title: 'Prioritization Engine', description: 'AI-driven privacy issue prioritization' }
      ],
      howTo: [
        'Create custom privacy assessments with AI',
        'Map assessment questions to regulations',
        'Conduct privacy scenario simulations for training',
        'Set up automated DSAR and breach workflows',
        'Track privacy risks and link controls',
        'Monitor privacy maturity across frameworks',
        'Generate privacy compliance reports'
      ]
    },
    threats: {
      overview: "Threat intelligence and vulnerability management with CVE integration, threat hunting, threat modeling, and automated risk creation from critical vulnerabilities.",
      features: [
        { title: 'CVE Feed Integration', description: 'Real-time CVE database synchronization' },
        { title: 'Threat Intelligence Feeds', description: 'MITRE ATT&CK, AlienVault, CISA integrations' },
        { title: 'Threat Hunting Engine', description: 'Proactive threat hunting capabilities' },
        { title: 'Vulnerability Register', description: 'Track and prioritize vulnerabilities' },
        { title: 'Threat Modeling Canvas', description: 'Visual threat modeling tools' },
        { title: 'AI Threat Assessment', description: 'AI-powered threat analysis and prioritization' },
        { title: 'Automated Risk Creation', description: 'Auto-create risks from critical CVEs' },
        { title: 'Resiliency Playbooks', description: 'Response playbooks for common threats' }
      ],
      howTo: [
        'Enable CVE and threat intelligence feeds',
        'Review incoming threat intelligence',
        'Conduct threat hunting exercises',
        'Create threat models for critical assets',
        'Link threats to risks and vulnerabilities',
        'Use AI to assess and prioritize threats',
        'Generate threat intelligence reports'
      ]
    },
    reports: {
      overview: "Comprehensive reporting and analytics platform with AI-powered generation, predictive analytics, anomaly detection, and custom report building.",
      features: [
        { title: 'Reporting Dashboard', description: 'Real-time GRC metrics with interactive visualizations' },
        { title: 'Canned Report Templates', description: 'Pre-built professional report templates' },
        { title: 'AI Report Generator', description: 'AI-generated reports with analysis and recommendations' },
        { title: 'Predictive Analytics', description: 'Forecast risk trends, compliance gaps, and control failures' },
        { title: 'Anomaly Detection', description: 'Identify unusual patterns and emerging threats' },
        { title: 'Custom AI Report Builder', description: 'Build tailored reports with date ranges and focus areas' },
        { title: 'Advanced Visualizations', description: 'Heat maps, radar charts, trend lines, and network graphs' },
        { title: 'Scheduled Reports', description: 'Automate report generation and email distribution' },
        { title: 'Quick Action Panels', description: 'Convert report insights into actionable tasks' }
      ],
      howTo: [
        'Access reporting dashboard for overview',
        'Select canned templates for quick reports',
        'Use AI generator for custom analysis',
        'Run predictive analytics for forecasting',
        'Detect anomalies in your GRC data',
        'Build custom AI reports with specific requirements',
        'Schedule automated report delivery',
        'Export reports in PDF, Excel, or CSV'
      ]
    },
    guidance: {
      overview: "Searchable library of regulatory guidance, best practices, and implementation tips for major compliance frameworks.",
      features: [
        { title: 'Multi-Framework Coverage', description: 'SOX, SOC2, ISO27001, GDPR, PCI-DSS, HIPAA, NIST, FFIEC, DORA, and more' },
        { title: 'AI-Powered Search', description: 'Natural language search across all guidance' },
        { title: 'Implementation Tips', description: 'Practical guidance for implementing requirements' },
        { title: 'Evidence Examples', description: 'Sample evidence documentation' },
        { title: 'Control Suggestions', description: 'Related controls for each requirement' },
        { title: 'AI Summarization', description: 'AI-generated summaries of complex regulations' },
        { title: 'Custom Guidance', description: 'Add organization-specific guidance' }
      ],
      howTo: [
        'Search for guidance by framework or keyword',
        'Review implementation tips and examples',
        'Link guidance to compliance requirements',
        'Use AI to summarize complex regulations',
        'Add custom guidance for your organization',
        'Export guidance documentation'
      ]
    },
    knowledge: {
      overview: "AI-powered knowledge base with intelligent search, proactive suggestions, and automatic content organization.",
      features: [
        { title: 'AI-Powered Search', description: 'Semantic search across all documents and knowledge' },
        { title: 'Automatic Categorization', description: 'AI organizes content by topic and relevance' },
        { title: 'Proactive Suggestions', description: 'AI recommends relevant knowledge based on context' },
        { title: 'Version Control', description: 'Track document history and changes' },
        { title: 'Knowledge Gap Identification', description: 'AI identifies missing documentation' },
        { title: 'Collaboration Tools', description: 'Comments and feedback on knowledge articles' },
        { title: 'Analytics', description: 'Track knowledge usage and effectiveness' }
      ],
      howTo: [
        'Upload documents and knowledge articles',
        'Let AI automatically categorize and tag content',
        'Search using natural language queries',
        'Review AI-recommended articles for your tasks',
        'Collaborate with comments and edits',
        'Identify and fill knowledge gaps',
        'Track knowledge base usage analytics'
      ]
    },
    assistant: {
      overview: "AI Compliance Assistant provides conversational AI interface for compliance questions, framework interpretation, and guided workflows.",
      features: [
        { title: 'Natural Language Queries', description: 'Ask compliance questions in plain language' },
        { title: 'Framework Interpretation', description: 'Get explanations of complex requirements' },
        { title: 'Gap Identification', description: 'AI identifies compliance gaps in conversation' },
        { title: 'Compliance Recommendations', description: 'Get tailored compliance advice' },
        { title: 'Multi-Framework Knowledge', description: 'Trained on 30+ compliance frameworks' },
        { title: 'Guided Workflows', description: 'Step-by-step guidance for compliance tasks' },
        { title: 'Context-Aware', description: 'Understands your organization\'s context' }
      ],
      howTo: [
        'Ask questions about compliance requirements',
        'Request interpretation of specific regulations',
        'Get guidance on implementation approaches',
        'Identify gaps in your compliance program',
        'Follow AI-guided workflows for tasks',
        'Use conversational interface for quick answers'
      ]
    },
    workflow: {
      overview: "Intelligent workflow automation engine with rule builder, trigger-based automation, and integration capabilities.",
      features: [
        { title: 'Workflow Templates', description: 'Pre-built workflows for common GRC processes' },
        { title: 'Custom Workflow Builder', description: 'Drag-and-drop workflow designer' },
        { title: 'Trigger-Based Automation', description: 'Auto-trigger workflows on events' },
        { title: 'Conditional Logic', description: 'If-then-else branching in workflows' },
        { title: 'Task Automation', description: 'Auto-create and assign tasks' },
        { title: 'Escalation Management', description: 'Automated escalation rules' },
        { title: 'Approval Workflows', description: 'Multi-stage approval chains' },
        { title: 'AI Automation Rules', description: 'AI-recommended automation opportunities' },
        { title: 'External Integration', description: 'Connect with Slack, Jira, email, and more' }
      ],
      howTo: [
        'Browse workflow templates or create custom',
        'Configure triggers and conditions',
        'Define actions and task assignments',
        'Set up approval chains',
        'Configure escalation rules',
        'Integrate with external systems',
        'Monitor workflow execution and metrics',
        'Optimize workflows based on AI suggestions'
      ]
    },
    integrations: {
      overview: "External system integrations for threat intelligence, regulatory monitoring, financial data, and HR systems.",
      features: [
        { title: 'Threat Intelligence', description: 'MITRE ATT&CK, CVE databases, AlienVault, Recorded Future' },
        { title: 'Regulatory Monitoring', description: 'Federal Register, EUR-Lex, FCA Handbook, APRA updates' },
        { title: 'Financial Data', description: 'Bloomberg, Reuters, FRED economic indicators' },
        { title: 'HR Systems', description: 'Workday, BambooHR, ADP, SAP SuccessFactors' },
        { title: 'Communication Tools', description: 'Slack, email notifications' },
        { title: 'Ticketing Systems', description: 'Jira, ServiceNow integration' },
        { title: 'Data Enrichment', description: 'Automatic data enhancement from external sources' }
      ],
      howTo: [
        'Configure integration credentials and settings',
        'Enable desired data feeds',
        'Set up sync schedules',
        'Configure alert thresholds',
        'Map external data to GRC entities',
        'Monitor integration health and status'
      ]
    },
    'assessment-config': {
      overview: "Configure custom assessment templates with questionnaires, scoring methodologies, workflows, and approval chains.",
      features: [
        { title: 'Template Builder', description: 'Create custom assessment templates' },
        { title: 'Questionnaire Designer', description: 'Design custom questions with multiple types' },
        { title: 'Scoring Configuration', description: 'Define custom scoring rules and thresholds' },
        { title: 'Workflow Stages', description: 'Configure assessment lifecycle stages' },
        { title: 'Approval Chains', description: 'Set up multi-level approval processes' },
        { title: 'Schedule Configuration', description: 'Configure recurring assessment schedules' },
        { title: 'Usage Analytics', description: 'Track template effectiveness' }
      ],
      howTo: [
        'Create new assessment template',
        'Design questionnaire with scoring rules',
        'Configure workflow stages and transitions',
        'Set up approval chain',
        'Configure recurring schedule if needed',
        'Test template before deployment',
        'Monitor template usage and effectiveness'
      ]
    },
    notifications: {
      overview: "Customizable notification preferences for all GRC activities with multi-channel delivery and intelligent filtering.",
      features: [
        { title: 'Custom Preferences', description: 'Configure notification types and frequencies' },
        { title: 'Multi-Channel', description: 'In-app notifications and email alerts' },
        { title: 'Priority-Based', description: 'Critical, high, medium, low priority levels' },
        { title: 'Digest Mode', description: 'Daily or weekly notification digests' },
        { title: 'Smart Filtering', description: 'AI-powered relevance filtering' },
        { title: 'Escalation Alerts', description: 'Automatic escalation notifications' },
        { title: 'Deadline Monitoring', description: 'Configurable deadline reminders' }
      ],
      howTo: [
        'Access notification settings',
        'Configure preferences per notification type',
        'Set digest frequency',
        'Configure email notification timing',
        'Set up escalation preferences',
        'Customize deadline reminder periods',
        'Test notification delivery'
      ]
    },
    users: {
      overview: "User administration with invitation management, role assignment, activity monitoring, and access control.",
      features: [
        { title: 'User Provisioning', description: 'Invite and onboard users' },
        { title: 'Role Assignment', description: 'Assign admin, user, or custom roles' },
        { title: 'Access Control', description: 'Granular permission management' },
        { title: 'Activity Monitoring', description: 'Track user actions and logins' },
        { title: 'SSO Integration', description: 'Single sign-on support' },
        { title: 'MFA Support', description: 'Multi-factor authentication' },
        { title: 'Bulk Operations', description: 'Bulk user import and role assignment' }
      ],
      howTo: [
        'Invite users via email',
        'Assign appropriate roles',
        'Configure user permissions',
        'Monitor user activity logs',
        'Set up SSO if available',
        'Enable MFA for security',
        'Perform periodic access reviews'
      ]
    },
    roles: {
      overview: "Advanced role-based access control with custom roles, permission matrices, role templates, and audit logging.",
      features: [
        { title: 'Custom Roles', description: 'Create organization-specific roles' },
        { title: 'Permission Matrix', description: 'Granular permission configuration' },
        { title: 'Role Templates', description: 'Pre-built role templates for common positions' },
        { title: 'Bulk Assignment', description: 'Assign roles to multiple users at once' },
        { title: 'Permission Inheritance', description: 'Hierarchical role permissions' },
        { title: 'Access Reviews', description: 'Periodic access review workflows' },
        { title: 'Audit Logging', description: 'Complete audit trail of role changes' },
        { title: 'Delegation', description: 'Temporary delegation of authority' }
      ],
      howTo: [
        'Define custom roles with permissions',
        'Use templates for standard roles',
        'Configure permission matrix',
        'Assign roles to users or groups',
        'Set up access review schedules',
        'Monitor role usage and changes',
        'Review audit logs regularly'
      ]
    }
  };

  const currentDoc = documentation[selectedModule];
  if (!currentDoc) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Module Navigation */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      selectedModule === module.id
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:bg-[#151d2e] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {module.name}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Module Documentation */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center gap-3">
              {modules.find(m => m.id === selectedModule) && (() => {
                const module = modules.find(m => m.id === selectedModule);
                const Icon = module.icon;
                return (
                  <>
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <CardTitle className="text-xl">{module.name}</CardTitle>
                  </>
                );
              })()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">{currentDoc.overview}</p>
            {/* Module Screenshot */}
            {modules.find(m => m.id === selectedModule)?.screenshot && (
              <div className="rounded-lg overflow-hidden border border-[#2a3548] shadow-xl">
                <img 
                  src={modules.find(m => m.id === selectedModule).screenshot} 
                  alt={`${modules.find(m => m.id === selectedModule).name} interface`}
                  className="w-full h-auto"
                />
                <div className="bg-[#151d2e] px-4 py-2 border-t border-[#2a3548]">
                  <p className="text-xs text-slate-500">
                    {modules.find(m => m.id === selectedModule).name} Module Interface
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentDoc.features.map((feature, idx) => (
                <div key={idx} className="flex gap-3 p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How To Use */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentDoc.howTo.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-400">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}