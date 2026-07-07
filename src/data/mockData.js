// Static mock data for the Vindexion eGRC lite UI prototype.
// No backend — everything here is illustrative sample data.

export const kpis = {
  totalRisks: 128,
  criticalRisks: 9,
  complianceScore: 87,
  openFindings: 23,
  activeIncidents: 6,
  controlsEffective: 91,
};

export const riskTrend = [
  { month: 'Jan', score: 62 },
  { month: 'Feb', score: 58 },
  { month: 'Mar', score: 64 },
  { month: 'Apr', score: 55 },
  { month: 'May', score: 49 },
  { month: 'Jun', score: 45 },
  { month: 'Jul', score: 41 },
];

export const complianceTrend = [
  { month: 'Jan', score: 78 },
  { month: 'Feb', score: 80 },
  { month: 'Mar', score: 79 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 84 },
  { month: 'Jun', score: 85 },
  { month: 'Jul', score: 87 },
];

export const riskByCategory = [
  { name: 'Cyber', value: 34 },
  { name: 'Operational', value: 28 },
  { name: 'Financial', value: 18 },
  { name: 'Third-Party', value: 22 },
  { name: 'Regulatory', value: 15 },
];

// 5x5 likelihood/impact heatmap grid, values = number of risks in that cell
export const riskHeatmap = [
  [1, 2, 3, 2, 1],
  [2, 3, 4, 3, 2],
  [1, 4, 6, 5, 3],
  [0, 2, 5, 7, 4],
  [0, 1, 3, 6, 8],
];

export const frameworks = [
  { name: 'ISO 27001:2022', score: 92, controls: 114, met: 105 },
  { name: 'NIST CSF 2.0', score: 85, controls: 108, met: 92 },
  { name: 'SOC 2 Type II', score: 88, controls: 64, met: 56 },
  { name: 'PCI DSS 4.0', score: 79, controls: 78, met: 62 },
  { name: 'GDPR', score: 90, controls: 42, met: 38 },
  { name: 'HIPAA', score: 74, controls: 54, met: 40 },
];

export const risks = [
  { id: 'RSK-1042', title: 'Unpatched vulnerabilities in customer-facing API gateway', category: 'Cyber', owner: 'M. Alvarez', likelihood: 4, impact: 5, status: 'Open', severity: 'Critical', updated: '2026-07-05' },
  { id: 'RSK-1039', title: 'Vendor SOC 2 report expired for payment processor', category: 'Third-Party', owner: 'J. Kim', likelihood: 3, impact: 4, status: 'In Remediation', severity: 'High', updated: '2026-07-03' },
  { id: 'RSK-1035', title: 'Manual reconciliation process prone to error in GL close', category: 'Financial', owner: 'R. Chen', likelihood: 3, impact: 3, status: 'Open', severity: 'Medium', updated: '2026-07-01' },
  { id: 'RSK-1031', title: 'Single point of failure in disaster recovery site', category: 'Operational', owner: 'T. Osei', likelihood: 2, impact: 5, status: 'Open', severity: 'High', updated: '2026-06-29' },
  { id: 'RSK-1028', title: 'Data retention policy not aligned with new state privacy law', category: 'Regulatory', owner: 'S. Patel', likelihood: 3, impact: 4, status: 'In Remediation', severity: 'High', updated: '2026-06-27' },
  { id: 'RSK-1022', title: 'Excessive standing privileged access in production', category: 'Cyber', owner: 'M. Alvarez', likelihood: 4, impact: 4, status: 'Open', severity: 'Critical', updated: '2026-06-24' },
  { id: 'RSK-1018', title: 'Third-party vendor lacking MFA on admin console', category: 'Third-Party', owner: 'J. Kim', likelihood: 3, impact: 3, status: 'Closed', severity: 'Medium', updated: '2026-06-20' },
  { id: 'RSK-1011', title: 'Change management approvals bypassed under deadline pressure', category: 'Operational', owner: 'T. Osei', likelihood: 2, impact: 3, status: 'Open', severity: 'Low', updated: '2026-06-15' },
];

export const controls = [
  { id: 'CTL-201', name: 'Multi-factor authentication for privileged accounts', framework: 'ISO 27001', type: 'Preventive', effectiveness: 'Effective', lastTested: '2026-06-15', owner: 'Security Ops' },
  { id: 'CTL-198', name: 'Quarterly access recertification', framework: 'SOC 2', type: 'Detective', effectiveness: 'Effective', lastTested: '2026-06-01', owner: 'IAM Team' },
  { id: 'CTL-187', name: 'Encrypted backups with offsite replication', framework: 'NIST CSF', type: 'Preventive', effectiveness: 'Needs Improvement', lastTested: '2026-05-20', owner: 'Infrastructure' },
  { id: 'CTL-176', name: 'Vendor due diligence questionnaire refresh', framework: 'Third-Party', type: 'Preventive', effectiveness: 'Effective', lastTested: '2026-05-10', owner: 'Vendor Mgmt' },
  { id: 'CTL-164', name: 'Automated vulnerability scanning', framework: 'PCI DSS', type: 'Detective', effectiveness: 'Effective', lastTested: '2026-06-28', owner: 'Security Ops' },
  { id: 'CTL-152', name: 'Segregation of duties in financial close', framework: 'SOX', type: 'Preventive', effectiveness: 'Ineffective', lastTested: '2026-04-30', owner: 'Finance' },
  { id: 'CTL-141', name: 'Incident response tabletop exercise', framework: 'ISO 27001', type: 'Corrective', effectiveness: 'Effective', lastTested: '2026-05-15', owner: 'Security Ops' },
];

export const incidents = [
  { id: 'INC-3301', title: 'Phishing campaign targeting finance team', severity: 'High', status: 'Contained', category: 'Cyber', reported: '2026-07-04', owner: 'SOC Team' },
  { id: 'INC-3298', title: 'Unauthorized access attempt on VPN gateway', severity: 'Critical', status: 'Investigating', category: 'Cyber', reported: '2026-07-02', owner: 'SOC Team' },
  { id: 'INC-3290', title: 'Vendor data processing outside contracted region', severity: 'Medium', status: 'Resolved', category: 'Third-Party', reported: '2026-06-28', owner: 'J. Kim' },
  { id: 'INC-3284', title: 'Payment gateway outage during peak hours', severity: 'High', status: 'Resolved', category: 'Operational', reported: '2026-06-22', owner: 'T. Osei' },
  { id: 'INC-3271', title: 'Misconfigured S3 bucket exposed internally', severity: 'Medium', status: 'Contained', category: 'Cyber', reported: '2026-06-18', owner: 'SOC Team' },
  { id: 'INC-3260', title: 'Delayed regulatory filing due to data quality issue', severity: 'Low', status: 'Resolved', category: 'Regulatory', reported: '2026-06-10', owner: 'S. Patel' },
];

export const vendors = [
  { name: 'Cloudline Payments Inc.', tier: 'Critical', riskScore: 72, status: 'Under Review', lastAssessed: '2026-05-01', contract: '2027-01-15' },
  { name: 'Northgate Data Services', tier: 'High', riskScore: 58, status: 'Approved', lastAssessed: '2026-04-12', contract: '2026-11-30' },
  { name: 'Aurelius Legal Partners', tier: 'Medium', riskScore: 34, status: 'Approved', lastAssessed: '2026-03-20', contract: '2026-09-01' },
  { name: 'Vertex Cloud Hosting', tier: 'Critical', riskScore: 65, status: 'Approved', lastAssessed: '2026-06-02', contract: '2027-06-01' },
  { name: 'Meridian HR Solutions', tier: 'Low', riskScore: 21, status: 'Approved', lastAssessed: '2026-02-14', contract: '2026-12-31' },
  { name: 'Sable Analytics Group', tier: 'High', riskScore: 61, status: 'Remediation Required', lastAssessed: '2026-05-28', contract: '2026-10-15' },
];

export const recentActivity = [
  { id: 1, text: 'M. Alvarez escalated RSK-1042 to Critical severity', time: '2h ago', type: 'risk' },
  { id: 2, text: 'Control CTL-164 passed automated quarterly test', time: '5h ago', type: 'control' },
  { id: 3, text: 'New incident INC-3301 reported by SOC Team', time: '1d ago', type: 'incident' },
  { id: 4, text: 'ISO 27001:2022 framework score updated to 92%', time: '1d ago', type: 'compliance' },
  { id: 5, text: 'Vendor Sable Analytics Group flagged for remediation', time: '2d ago', type: 'vendor' },
  { id: 6, text: 'Audit finding AUD-0091 closed by internal audit', time: '3d ago', type: 'audit' },
];

export const severityColor = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

export const statusColor = {
  Open: 'text-red-400 bg-red-500/10 border-red-500/30',
  'In Remediation': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Closed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Contained: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Investigating: 'text-red-400 bg-red-500/10 border-red-500/30',
  Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Under Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Remediation Required': 'text-red-400 bg-red-500/10 border-red-500/30',
};

export const effectivenessColor = {
  Effective: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Needs Improvement': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Ineffective: 'text-red-400 bg-red-500/10 border-red-500/30',
};
