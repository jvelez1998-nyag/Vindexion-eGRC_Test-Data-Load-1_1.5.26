import Layout from "./Layout.jsx";

import AIRiskAssessment from "./AIRiskAssessment";

import AITraining from "./AITraining";

import AIWorkflowAutomation from "./AIWorkflowAutomation";

import AdvancedInsightsDashboard from "./AdvancedInsightsDashboard";

import AssessmentConfiguration from "./AssessmentConfiguration";

import Audits from "./Audits";

import ClientProfile from "./ClientProfile";

import Compliance from "./Compliance";

import ComplianceAssistant from "./ComplianceAssistant";

import ComplianceFrameworks from "./ComplianceFrameworks";

import Controls from "./Controls";

import CrossWalkMapping from "./CrossWalkMapping";

import Dashboard from "./Dashboard";

import ExternalIntegrations from "./ExternalIntegrations";

import GRCKnowledgeHub from "./GRCKnowledgeHub";

import Guidance from "./Guidance";

import Home from "./Home";

import Incidents from "./Incidents";

import KRIDashboard from "./KRIDashboard";

import KnowledgeBase from "./KnowledgeBase";

import NotificationSettings from "./NotificationSettings";

import PlatformAdministration from "./PlatformAdministration";

import PlatformFeatures from "./PlatformFeatures";

import PrivacyAssessment from "./PrivacyAssessment";

import QuestionBank from "./QuestionBank";

import QuickStart from "./QuickStart";

import RegulatoryExamSimulation from "./RegulatoryExamSimulation";

import Reports from "./Reports";

import RiskAssessments from "./RiskAssessments";

import RiskManagement from "./RiskManagement";

import Risks from "./Risks";

import RoleManagement from "./RoleManagement";

import SecurityDashboard from "./SecurityDashboard";

import ThirdPartyRiskManagement from "./ThirdPartyRiskManagement";

import ThreatVulnerabilityManagement from "./ThreatVulnerabilityManagement";

import UserAdministration from "./UserAdministration";

import UserGuide from "./UserGuide";

import VendorManagement from "./VendorManagement";

import VendorPortal from "./VendorPortal";

import WorkflowAutomation from "./WorkflowAutomation";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AIRiskAssessment: AIRiskAssessment,
    
    AITraining: AITraining,
    
    AIWorkflowAutomation: AIWorkflowAutomation,
    
    AdvancedInsightsDashboard: AdvancedInsightsDashboard,
    
    AssessmentConfiguration: AssessmentConfiguration,
    
    Audits: Audits,
    
    ClientProfile: ClientProfile,
    
    Compliance: Compliance,
    
    ComplianceAssistant: ComplianceAssistant,
    
    ComplianceFrameworks: ComplianceFrameworks,
    
    Controls: Controls,
    
    CrossWalkMapping: CrossWalkMapping,
    
    Dashboard: Dashboard,
    
    ExternalIntegrations: ExternalIntegrations,
    
    GRCKnowledgeHub: GRCKnowledgeHub,
    
    Guidance: Guidance,
    
    Home: Home,
    
    Incidents: Incidents,
    
    KRIDashboard: KRIDashboard,
    
    KnowledgeBase: KnowledgeBase,
    
    NotificationSettings: NotificationSettings,
    
    PlatformAdministration: PlatformAdministration,
    
    PlatformFeatures: PlatformFeatures,
    
    PrivacyAssessment: PrivacyAssessment,
    
    QuestionBank: QuestionBank,
    
    QuickStart: QuickStart,
    
    RegulatoryExamSimulation: RegulatoryExamSimulation,
    
    Reports: Reports,
    
    RiskAssessments: RiskAssessments,
    
    RiskManagement: RiskManagement,
    
    Risks: Risks,
    
    RoleManagement: RoleManagement,
    
    SecurityDashboard: SecurityDashboard,
    
    ThirdPartyRiskManagement: ThirdPartyRiskManagement,
    
    ThreatVulnerabilityManagement: ThreatVulnerabilityManagement,
    
    UserAdministration: UserAdministration,
    
    UserGuide: UserGuide,
    
    VendorManagement: VendorManagement,
    
    VendorPortal: VendorPortal,
    
    WorkflowAutomation: WorkflowAutomation,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AIRiskAssessment />} />
                
                
                <Route path="/AIRiskAssessment" element={<AIRiskAssessment />} />
                
                <Route path="/AITraining" element={<AITraining />} />
                
                <Route path="/AIWorkflowAutomation" element={<AIWorkflowAutomation />} />
                
                <Route path="/AdvancedInsightsDashboard" element={<AdvancedInsightsDashboard />} />
                
                <Route path="/AssessmentConfiguration" element={<AssessmentConfiguration />} />
                
                <Route path="/Audits" element={<Audits />} />
                
                <Route path="/ClientProfile" element={<ClientProfile />} />
                
                <Route path="/Compliance" element={<Compliance />} />
                
                <Route path="/ComplianceAssistant" element={<ComplianceAssistant />} />
                
                <Route path="/ComplianceFrameworks" element={<ComplianceFrameworks />} />
                
                <Route path="/Controls" element={<Controls />} />
                
                <Route path="/CrossWalkMapping" element={<CrossWalkMapping />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ExternalIntegrations" element={<ExternalIntegrations />} />
                
                <Route path="/GRCKnowledgeHub" element={<GRCKnowledgeHub />} />
                
                <Route path="/Guidance" element={<Guidance />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Incidents" element={<Incidents />} />
                
                <Route path="/KRIDashboard" element={<KRIDashboard />} />
                
                <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
                
                <Route path="/NotificationSettings" element={<NotificationSettings />} />
                
                <Route path="/PlatformAdministration" element={<PlatformAdministration />} />
                
                <Route path="/PlatformFeatures" element={<PlatformFeatures />} />
                
                <Route path="/PrivacyAssessment" element={<PrivacyAssessment />} />
                
                <Route path="/QuestionBank" element={<QuestionBank />} />
                
                <Route path="/QuickStart" element={<QuickStart />} />
                
                <Route path="/RegulatoryExamSimulation" element={<RegulatoryExamSimulation />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/RiskAssessments" element={<RiskAssessments />} />
                
                <Route path="/RiskManagement" element={<RiskManagement />} />
                
                <Route path="/Risks" element={<Risks />} />
                
                <Route path="/RoleManagement" element={<RoleManagement />} />
                
                <Route path="/SecurityDashboard" element={<SecurityDashboard />} />
                
                <Route path="/ThirdPartyRiskManagement" element={<ThirdPartyRiskManagement />} />
                
                <Route path="/ThreatVulnerabilityManagement" element={<ThreatVulnerabilityManagement />} />
                
                <Route path="/UserAdministration" element={<UserAdministration />} />
                
                <Route path="/UserGuide" element={<UserGuide />} />
                
                <Route path="/VendorManagement" element={<VendorManagement />} />
                
                <Route path="/VendorPortal" element={<VendorPortal />} />
                
                <Route path="/WorkflowAutomation" element={<WorkflowAutomation />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}