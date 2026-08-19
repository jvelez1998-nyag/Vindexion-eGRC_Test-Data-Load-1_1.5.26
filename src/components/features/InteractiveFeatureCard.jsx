import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link as LinkIcon, Shield, ChevronDown, ChevronUp, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractiveFeatureCard({ feature, onFavorite, isFavorite }) {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);

  const categoryColors = {
    risk: "from-rose-500/20 to-orange-500/20 border-rose-500/30",
    compliance: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    audit: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    vendor: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    privacy: "from-violet-500/20 to-indigo-500/20 border-violet-500/30",
    analytics: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
    automation: "from-amber-500/20 to-orange-500/20 border-amber-500/30"
  };

  const categoryIcons = {
    risk: "🎯",
    compliance: "✅",
    audit: "📋",
    vendor: "🤝",
    privacy: "🔒",
    analytics: "📊",
    automation: "⚡"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Card className={`bg-gradient-to-br ${categoryColors[feature.category] || categoryColors.analytics} border hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
        {hovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"
          />
        )}

        <CardHeader className="relative">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{categoryIcons[feature.category] || "📦"}</span>
                  <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                    {feature.module}
                  </Badge>
                  {feature.capabilities.length > 10 && (
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{feature.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFavorite?.(feature)}
                className={`${isFavorite ? 'text-amber-400' : 'text-slate-400'} hover:text-amber-400 transition-colors`}
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </Button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{feature.description}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="text-xs bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
                {feature.capabilities.length} Capabilities
              </Badge>
              {feature.integrations?.length > 0 && (
                <Badge className="text-xs bg-blue-500/20 text-blue-400">
                  {feature.integrations.length} Integrations
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-indigo-400 hover:from-indigo-500/20 hover:to-purple-500/20"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  More
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Key Capabilities
                  </h4>
                  <div className="grid gap-2">
                    {feature.capabilities.slice(0, 8).map((capability, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded bg-[#0f1623] border border-[#2a3548] hover:border-indigo-500/30 transition-colors"
                      >
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{capability}</span>
                      </motion.div>
                    ))}
                    {feature.capabilities.length > 8 && (
                      <p className="text-xs text-slate-500 pl-4">
                        +{feature.capabilities.length - 8} more capabilities
                      </p>
                    )}
                  </div>
                </div>

                {feature.integrations && feature.integrations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" />
                      Integrations
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {feature.integrations.map((integration, idx) => (
                        <Badge key={idx} className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-default">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {feature.compliance && feature.compliance.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Compliance Support
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {feature.compliance.map((framework, idx) => (
                        <Badge key={idx} className="text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors cursor-default">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}