import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, ExternalLink, Target } from "lucide-react";

const SETUP_STEPS = [
  {
    id: "profile",
    title: "Complete Your Profile",
    description: "Set up your user profile and preferences",
    page: "UserAdministration",
    category: "Setup",
    priority: "High"
  },
  {
    id: "first_risk",
    title: "Create Your First Risk",
    description: "Add a risk to your risk register to start tracking threats",
    page: "RiskManagement",
    category: "Risk",
    priority: "High"
  },
  {
    id: "first_control",
    title: "Add Your First Control",
    description: "Implement a security control to mitigate risks",
    page: "Controls",
    category: "Controls",
    priority: "High"
  },
  {
    id: "compliance_framework",
    title: "Select Compliance Framework",
    description: "Choose frameworks you need to comply with (SOX, GDPR, ISO27001)",
    page: "ComplianceFrameworks",
    category: "Compliance",
    priority: "Medium"
  },
  {
    id: "risk_assessment",
    title: "Run a Risk Assessment",
    description: "Perform your first comprehensive risk assessment",
    page: "RiskAssessments",
    category: "Risk",
    priority: "Medium"
  },
  {
    id: "audit_program",
    title: "Create Audit Program",
    description: "Set up your audit planning and execution framework",
    page: "Audits",
    category: "Audits",
    priority: "Medium"
  },
  {
    id: "vendor_risk",
    title: "Assess Vendor Risk",
    description: "Add and evaluate third-party vendor risks",
    page: "ThirdPartyRiskManagement",
    category: "Vendors",
    priority: "Low"
  },
  {
    id: "privacy_assessment",
    title: "Privacy Impact Assessment",
    description: "Conduct a DPIA if you process personal data (GDPR)",
    page: "PrivacyAssessment",
    category: "Privacy",
    priority: "Low"
  },
  {
    id: "notifications",
    title: "Configure Notifications",
    description: "Set up alerts for risks, audits, and compliance deadlines",
    page: "NotificationSettings",
    category: "Setup",
    priority: "Low"
  },
  {
    id: "reports",
    title: "Generate Your First Report",
    description: "Create executive summaries and compliance reports",
    page: "Reports",
    category: "Reporting",
    priority: "Low"
  }
];

export default function SetupChecklist({ userProgress }) {
  const [expandedCategory, setExpandedCategory] = useState("Setup");

  const categories = [...new Set(SETUP_STEPS.map(step => step.category))];

  const isStepComplete = (stepId) => {
    if (!userProgress) return false;
    
    switch (stepId) {
      case "first_risk":
        return userProgress.first_risk_created;
      case "first_control":
        return userProgress.first_control_created;
      case "compliance_framework":
        return userProgress.first_compliance_added;
      default:
        return false;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "Medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getCategoryProgress = (category) => {
    const categorySteps = SETUP_STEPS.filter(step => step.category === category);
    const completed = categorySteps.filter(step => isStepComplete(step.id)).length;
    return { completed, total: categorySteps.length };
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-4"
        >
          <Target className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-300">
            {SETUP_STEPS.filter(step => isStepComplete(step.id)).length} of {SETUP_STEPS.length} Complete
          </span>
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Setup Checklist</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Follow these essential steps to configure your GRC environment and unlock the platform's full potential
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {categories.map((category) => {
          const progress = getCategoryProgress(category);
          const isActive = expandedCategory === category;
          
          const categoryColors = {
            "Setup": { bg: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30", text: "text-indigo-400", hover: "hover:border-indigo-500/50" },
            "Risk": { bg: "from-rose-500/20 to-orange-500/20", border: "border-rose-500/30", text: "text-rose-400", hover: "hover:border-rose-500/50" },
            "Controls": { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-400", hover: "hover:border-blue-500/50" },
            "Compliance": { bg: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", text: "text-emerald-400", hover: "hover:border-emerald-500/50" },
            "Audits": { bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", text: "text-purple-400", hover: "hover:border-purple-500/50" },
            "Vendors": { bg: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/30", text: "text-amber-400", hover: "hover:border-amber-500/50" },
            "Privacy": { bg: "from-violet-500/20 to-fuchsia-500/20", border: "border-violet-500/30", text: "text-violet-400", hover: "hover:border-violet-500/50" },
            "Reporting": { bg: "from-teal-500/20 to-cyan-500/20", border: "border-teal-500/30", text: "text-teal-400", hover: "hover:border-teal-500/50" }
          };
          
          const colors = categoryColors[category] || categoryColors["Setup"];
          
          return (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpandedCategory(category)}
              className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} border-2 ${
                isActive ? colors.border : "border-transparent"
              } ${colors.hover} transition-all text-left`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${colors.text}`}>{category}</span>
                <Badge className={`${colors.bg} ${colors.text} border ${colors.border} text-xs px-1.5 py-0.5`}>
                  {progress.completed}/{progress.total}
                </Badge>
              </div>
              <div className="h-1.5 bg-[#0f1623]/60 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-500`}
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="space-y-4">
        {SETUP_STEPS.filter(step => step.category === expandedCategory).map((step, idx) => {
          const completed = isStepComplete(step.id);
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={`bg-gradient-to-br border-2 transition-all group ${
                  completed 
                    ? "from-emerald-500/10 to-teal-500/10 border-emerald-500/40" 
                    : "from-[#1a2332] to-[#1a2332] border-[#2a3548] hover:border-indigo-500/40 hover:from-indigo-500/5 hover:to-purple-500/5"
                }`}
              >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {completed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-base font-semibold text-white mb-1">{step.title}</h4>
                        <p className="text-sm text-slate-400">{step.description}</p>
                      </div>
                      <Badge className={getPriorityColor(step.priority)}>
                        {step.priority}
                      </Badge>
                    </div>

                    {!completed && (
                      <div className="flex gap-2 mt-3">
                        <Link to={createPageUrl(step.page)}>
                          <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Start Task
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 text-blue-400 hover:from-blue-500/20 hover:to-cyan-500/20"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    )}

                    {completed && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mt-2">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}