import { useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, BookOpen, Shield, AlertTriangle, FileCheck, TrendingUp, Users, Database, BookMarked, GraduationCap, Lightbulb, Zap, Settings, FileText, FileSpreadsheet, Mail, Star, CheckSquare } from "lucide-react";
import InteractiveFeatureCard from "@/components/features/InteractiveFeatureCard";
import { exportToPDF, exportToWord, exportToExcel, exportToGoogleDocs } from "@/components/features/FeatureExporter";
import { platformFeatures } from "@/components/features/FeatureData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const QuickReference = lazy(() => import("@/components/features/QuickReference"));
const GlossarySection = lazy(() => import("@/components/features/GlossarySection"));
const TrainingAids = lazy(() => import("@/components/features/TrainingAids"));
const CustomizationSection = lazy(() => import("@/components/features/CustomizationSection"));
const BRDModeDialog = lazy(() => import("@/components/features/BRDModeDialog"));
const FeatureSelectionDialog = lazy(() => import("@/components/features/FeatureSelectionDialog"));
const UATChecklist = lazy(() => import("@/components/features/UATChecklist"));

export default function PlatformFeatures() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("features");
  const [brdDialogOpen, setBrdDialogOpen] = useState(false);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const categories = [
    { id: "all", label: "All Features", icon: BookOpen },
    { id: "risk", label: "Risk Management", icon: AlertTriangle },
    { id: "compliance", label: "Compliance & Frameworks", icon: Shield },
    { id: "audit", label: "Audit & Assessment", icon: FileCheck },
    { id: "vendor", label: "Vendor & Third-Party", icon: Users },
    { id: "privacy", label: "Privacy & Data Protection", icon: Shield },
    { id: "analytics", label: "Analytics & Insights", icon: TrendingUp },
    { id: "automation", label: "Automation & Workflow", icon: Database }
  ];

  const filteredFeatures = platformFeatures.filter(feature => {
    const matchesSearch = search === "" || 
      feature.name.toLowerCase().includes(search.toLowerCase()) ||
      feature.description.toLowerCase().includes(search.toLowerCase()) ||
      feature.capabilities.some(cap => cap.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = activeCategory === "all" || feature.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (feature) => {
    setFavorites(prev => {
      const isFav = prev.some(f => f.name === feature.name);
      if (isFav) {
        return prev.filter(f => f.name !== feature.name);
      } else {
        return [...prev, feature];
      }
    });
  };

  const handleExportSelected = (selectedFeatures, format) => {
    if (format === 'pdf') {
      exportToPDF(selectedFeatures, activeCategory);
    } else if (format === 'word') {
      exportToWord(selectedFeatures, activeCategory);
    } else if (format === 'excel') {
      exportToExcel(selectedFeatures);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-500/20 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                <BookOpen className="h-7 w-7 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  Platform Features & Capabilities
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
                  Comprehensive feature documentation for Vindexion eGRC Hub™ - Explore, test, and customize your enterprise GRC platform
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {platformFeatures.length} Total Features
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {categories.length - 1} Categories
                  </Badge>
                  {favorites.length > 0 && (
                    <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {favorites.length} Favorited
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548] min-w-[200px]">
                  <DropdownMenuItem onClick={() => exportToPDF(filteredFeatures, activeCategory)} className="text-white hover:bg-[#2a3548] cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-rose-400" />
                    PDF Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToWord(filteredFeatures, activeCategory)} className="text-white hover:bg-[#2a3548] cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-blue-400" />
                    Word Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel(filteredFeatures)} className="text-white hover:bg-[#2a3548] cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-400" />
                    Excel Spreadsheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToGoogleDocs(filteredFeatures)} className="text-white hover:bg-[#2a3548] cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-amber-400" />
                    Google Docs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setSelectionDialogOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg text-white">
                <CheckSquare className="h-4 w-4 mr-2" />
                Select & Export
              </Button>
              <Button onClick={() => setBrdDialogOpen(true)} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg text-white">
                <Mail className="h-4 w-4 mr-2" />
                Send BRD
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Navigation Tabs */}
        <div className="sticky top-14 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-[#0f1623]/95 backdrop-blur-xl border-b border-[#2a3548]">
          <div className="overflow-x-auto scrollbar-thin">
            <TabsList className="inline-flex bg-[#1a2332] border border-[#2a3548] p-1 rounded-xl min-w-max">
              <TabsTrigger value="features" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 rounded-lg data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 whitespace-nowrap">
                <BookOpen className="h-4 w-4 mr-2" />
                Feature Catalog
              </TabsTrigger>
              <TabsTrigger value="uat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 rounded-lg data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 whitespace-nowrap">
                <CheckSquare className="h-4 w-4 mr-2" />
                UAT Testing
              </TabsTrigger>
              <TabsTrigger value="quick-ref" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400 rounded-lg data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 whitespace-nowrap">
                <Zap className="h-4 w-4 mr-2" />
                Quick Reference
              </TabsTrigger>
              <TabsTrigger value="glossary" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 rounded-lg data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 whitespace-nowrap">
                <BookMarked className="h-4 w-4 mr-2" />
                Glossary
              </TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400 rounded-lg data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 whitespace-nowrap">
                <GraduationCap className="h-4 w-4 mr-2" />
                Training Aids
              </TabsTrigger>
              <TabsTrigger value="customization" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-fuchsia-500/20 data-[state=active]:text-violet-400 rounded-lg data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 whitespace-nowrap">
                <Settings className="h-4 w-4 mr-2" />
                Customization
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="features" className="space-y-6">
          {/* Search & Filter Section */}
          <div className="space-y-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search features, capabilities, integrations, or modules..."
                    className="pl-11 h-12 bg-[#0f1623] border-[#2a3548] text-white placeholder:text-slate-500 text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Filters */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Filter by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto scrollbar-thin">
                  <div className="flex gap-2 pb-2">
                    {categories.map(cat => {
                      const categoryColors = {
                        "all": { bg: "from-indigo-600 to-purple-600", hover: "from-indigo-700 to-purple-700", shadow: "shadow-indigo-500/20" },
                        "risk": { bg: "from-rose-600 to-orange-600", hover: "from-rose-700 to-orange-700", shadow: "shadow-rose-500/20" },
                        "compliance": { bg: "from-emerald-600 to-teal-600", hover: "from-emerald-700 to-teal-700", shadow: "shadow-emerald-500/20" },
                        "audit": { bg: "from-blue-600 to-cyan-600", hover: "from-blue-700 to-cyan-700", shadow: "shadow-blue-500/20" },
                        "vendor": { bg: "from-amber-600 to-yellow-600", hover: "from-amber-700 to-yellow-700", shadow: "shadow-amber-500/20" },
                        "privacy": { bg: "from-violet-600 to-fuchsia-600", hover: "from-violet-700 to-fuchsia-700", shadow: "shadow-violet-500/20" },
                        "analytics": { bg: "from-cyan-600 to-teal-600", hover: "from-cyan-700 to-teal-700", shadow: "shadow-cyan-500/20" },
                        "automation": { bg: "from-purple-600 to-pink-600", hover: "from-purple-700 to-pink-700", shadow: "shadow-purple-500/20" }
                      };
                      const colors = categoryColors[cat.id] || categoryColors["all"];
                      
                      return (
                        <Button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          size="sm"
                          className={activeCategory === cat.id 
                            ? `bg-gradient-to-r ${colors.bg} hover:${colors.hover} text-white shadow-lg ${colors.shadow} whitespace-nowrap` 
                            : "bg-gradient-to-r from-slate-500/10 to-slate-500/10 border border-slate-500/30 text-slate-300 hover:from-slate-500/20 hover:to-slate-500/20 whitespace-nowrap"}
                        >
                          <cat.icon className="h-4 w-4 mr-2" />
                          {cat.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-[#1a2332] border border-[#2a3548] rounded-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-sm font-medium text-white">
                  <span className="text-indigo-400">{filteredFeatures.length}</span> {filteredFeatures.length === 1 ? 'Feature' : 'Features'} Found
                </div>
                {activeCategory !== "all" && (
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                    Category: {categories.find(c => c.id === activeCategory)?.label}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500">
                Version 1.0 • Updated December 2025
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-4">
            {filteredFeatures.length === 0 ? (
              <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="p-4 rounded-full bg-slate-500/10">
                    <Search className="h-8 w-8 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Features Found</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                  </div>
                  <Button 
                    onClick={() => { setSearch(""); setActiveCategory("all"); }}
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={`${viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "grid gap-4"}`}>
                {filteredFeatures.map((feature, idx) => (
                  <InteractiveFeatureCard 
                    key={idx} 
                    feature={feature}
                    onFavorite={toggleFavorite}
                    isFavorite={favorites.some(f => f.name === feature.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="uat" className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
            <UATChecklist features={filteredFeatures} />
          </Suspense>
        </TabsContent>

        <TabsContent value="quick-ref" className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
            <QuickReference />
          </Suspense>
        </TabsContent>

        <TabsContent value="glossary" className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
            <GlossarySection />
          </Suspense>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
            <TrainingAids />
          </Suspense>
        </TabsContent>

        <TabsContent value="customization" className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full bg-[#1a2332]" />}>
            <CustomizationSection />
          </Suspense>
        </TabsContent>
      </Tabs>

      <Suspense fallback={null}>
        <BRDModeDialog 
          open={brdDialogOpen}
          onOpenChange={setBrdDialogOpen}
          features={filteredFeatures}
        />
      </Suspense>

      <Suspense fallback={null}>
        <FeatureSelectionDialog
          open={selectionDialogOpen}
          onOpenChange={setSelectionDialogOpen}
          features={filteredFeatures}
          onExport={handleExportSelected}
        />
      </Suspense>
    </div>
  );
}