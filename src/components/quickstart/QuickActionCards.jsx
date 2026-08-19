import { memo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  ClipboardCheck,
  Users,
  TrendingUp,
  Database,
  Brain,
  ArrowRight,
  Sparkles
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    title: "Create Your First Risk",
    description: "Start building your risk register with a new risk assessment",
    icon: AlertTriangle,
    iconColor: "text-rose-400",
    bgColor: "from-rose-500/10 to-orange-500/10",
    borderColor: "border-rose-500/20",
    page: "RiskManagement",
    difficulty: "Beginner",
    time: "2 min"
  },
  {
    title: "Add a Control",
    description: "Implement security controls to mitigate identified risks",
    icon: Shield,
    iconColor: "text-blue-400",
    bgColor: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/20",
    page: "Controls",
    difficulty: "Beginner",
    time: "3 min"
  },
  {
    title: "Track Compliance",
    description: "Start tracking your compliance requirements and frameworks",
    icon: FileText,
    iconColor: "text-emerald-400",
    bgColor: "from-emerald-500/10 to-teal-500/10",
    borderColor: "border-emerald-500/20",
    page: "Compliance",
    difficulty: "Beginner",
    time: "2 min"
  },
  {
    title: "Run Risk Assessment",
    description: "Perform a comprehensive risk assessment using AI assistance",
    icon: TrendingUp,
    iconColor: "text-purple-400",
    bgColor: "from-purple-500/10 to-violet-500/10",
    borderColor: "border-purple-500/20",
    page: "RiskAssessments",
    difficulty: "Intermediate",
    time: "10 min"
  },
  {
    title: "Schedule an Audit",
    description: "Plan and schedule your first internal or external audit",
    icon: ClipboardCheck,
    iconColor: "text-indigo-400",
    bgColor: "from-indigo-500/10 to-blue-500/10",
    borderColor: "border-indigo-500/20",
    page: "Audits",
    difficulty: "Intermediate",
    time: "5 min"
  },
  {
    title: "Manage Vendors",
    description: "Add vendors and assess their risk to your organization",
    icon: Users,
    iconColor: "text-cyan-400",
    bgColor: "from-cyan-500/10 to-teal-500/10",
    borderColor: "border-cyan-500/20",
    page: "ThirdPartyRiskManagement",
    difficulty: "Intermediate",
    time: "8 min"
  },
  {
    title: "Privacy Assessment",
    description: "Conduct a DPIA or privacy impact assessment (GDPR)",
    icon: Database,
    iconColor: "text-violet-400",
    bgColor: "from-violet-500/10 to-purple-500/10",
    borderColor: "border-violet-500/20",
    page: "PrivacyAssessment",
    difficulty: "Advanced",
    time: "15 min"
  },
  {
    title: "AI Knowledge Hub",
    description: "Ask questions and get instant GRC guidance from AI",
    icon: Brain,
    iconColor: "text-amber-400",
    bgColor: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-500/20",
    page: "GRCKnowledgeHub",
    difficulty: "Beginner",
    time: "1 min"
  }
];

const QuickActionCards = memo(function QuickActionCards() {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Intermediate": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Advanced": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-4"
        >
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">8 Quick Actions Available</span>
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Jump Right In</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Fast-track your GRC journey with these one-click shortcuts to the most common tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -8 }}
          >
            <Link to={createPageUrl(action.page)}>
              <Card className={`bg-gradient-to-br ${action.bgColor} border ${action.borderColor} cursor-pointer h-full group relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-[#1a2332]/80 border ${action.borderColor} group-hover:scale-110 transition-transform`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <ArrowRight className={`h-5 w-5 ${action.iconColor} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-200 group-hover:bg-clip-text">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{action.description}</p>

                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(action.difficulty)}>
                      {action.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-600 bg-slate-900/50">
                      ⏱ {action.time}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export default QuickActionCards;