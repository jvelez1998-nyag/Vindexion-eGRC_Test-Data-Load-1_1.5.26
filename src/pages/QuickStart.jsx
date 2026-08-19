import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Rocket, 
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Zap,
  Shield,
  Database,
  Video,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const QuickActionCards = lazy(() => import("@/components/quickstart/QuickActionCards"));
const SetupChecklist = lazy(() => import("@/components/quickstart/SetupChecklist"));
const ModuleWalkthroughs = lazy(() => import("@/components/quickstart/ModuleWalkthroughs"));
const VideoTutorials = lazy(() => import("@/components/quickstart/VideoTutorials"));
const SampleDataGenerator = lazy(() => import("@/components/quickstart/SampleDataGenerator"));

export default function QuickStart() {
  const [userProgress, setUserProgress] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    retry: 1
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-created_date', 10),
    staleTime: 1800000,
    gcTime: 3600000
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-created_date', 10),
    staleTime: 1800000,
    gcTime: 3600000
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-created_date', 10),
    staleTime: 1800000,
    gcTime: 3600000
  });

  useEffect(() => {
    if (user) {
      const progress = {
        setup_complete: risks.length > 0 || controls.length > 0 || compliance.length > 0,
        first_risk_created: risks.length > 0,
        first_control_created: controls.length > 0,
        first_compliance_added: compliance.length > 0,
        completion_percentage: calculateProgress()
      };
      setUserProgress(progress);
    }
  }, [user, risks, controls, compliance]);

  const calculateProgress = () => {
    let completed = 0;
    let total = 8;
    
    if (risks.length > 0) completed++;
    if (controls.length > 0) completed++;
    if (compliance.length > 0) completed++;
    if (risks.length >= 5) completed++;
    if (controls.length >= 3) completed++;
    if (user) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const progressItems = [
    { label: "Profile Setup", done: true },
    { label: "First Risk", done: userProgress?.first_risk_created },
    { label: "First Control", done: userProgress?.first_control_created },
    { label: "Compliance", done: userProgress?.first_compliance_added }
  ];

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)] animate-pulse" style={{ animationDuration: '4s' }} />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div 
              className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 mb-6"
              animate={{ 
                boxShadow: ["0 20px 60px rgba(168,85,247,0.4)", "0 25px 70px rgba(99,102,241,0.6)", "0 20px 60px rgba(168,85,247,0.4)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Rocket className="h-12 w-12 text-white" />
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                Welcome to Vindexion eGRC
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Your journey to comprehensive governance, risk, and compliance starts here
            </p>

            <motion.div 
              className="max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Onboarding Progress</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {userProgress?.completion_percentage || 0}%
                </span>
              </div>
              <Progress value={userProgress?.completion_percentage || 0} className="h-3 mb-4" />
              <div className="flex items-center justify-center gap-2">
                {progressItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                    )}
                    <span className={`text-xs ${item.done ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {[
              { icon: CheckCircle2, label: "Setup Checklist", desc: "10 steps to success", color: "emerald", gradient: "from-emerald-500/20 to-teal-500/20" },
              { icon: Zap, label: "Quick Actions", desc: "8 instant shortcuts", color: "blue", gradient: "from-blue-500/20 to-cyan-500/20" },
              { icon: PlayCircle, label: "Walkthroughs", desc: "6 guided tours", color: "purple", gradient: "from-purple-500/20 to-pink-500/20" },
              { icon: Video, label: "Video Library", desc: "12 tutorials", color: "rose", gradient: "from-rose-500/20 to-orange-500/20" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className={`bg-gradient-to-br ${item.gradient} border-${item.color}-500/30 cursor-pointer h-full backdrop-blur-sm`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl bg-${item.color}-500/20 border border-${item.color}-500/30`}>
                        <item.icon className={`h-5 w-5 text-${item.color}-400`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">

        <Tabs defaultValue="checklist" className="space-y-8">
          <TabsList className="bg-[#1a2332]/50 backdrop-blur-xl border border-[#2a3548] p-1.5 rounded-2xl">
            <TabsTrigger 
              value="checklist" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 rounded-xl data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Setup Checklist
            </TabsTrigger>
            <TabsTrigger 
              value="actions" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400 rounded-xl data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20"
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Actions
            </TabsTrigger>
            <TabsTrigger 
              value="walkthroughs" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 rounded-xl data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Walkthroughs
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400 rounded-xl data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/20"
            >
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="sample-data" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-amber-400 rounded-xl data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20"
            >
              <Database className="h-4 w-4 mr-2" />
              Sample Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SetupChecklist userProgress={userProgress} />
              </motion.div>
            </Suspense>
          </TabsContent>

          <TabsContent value="actions">
            <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <QuickActionCards />
              </motion.div>
            </Suspense>
          </TabsContent>

          <TabsContent value="walkthroughs">
            <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ModuleWalkthroughs />
              </motion.div>
            </Suspense>
          </TabsContent>

          <TabsContent value="videos">
            <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VideoTutorials />
              </motion.div>
            </Suspense>
          </TabsContent>

          <TabsContent value="sample-data">
            <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SampleDataGenerator />
              </motion.div>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}