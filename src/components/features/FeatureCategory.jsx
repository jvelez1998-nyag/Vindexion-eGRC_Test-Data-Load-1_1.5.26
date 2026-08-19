import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Link as LinkIcon, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function FeatureCategory({ feature }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30 transition-all">
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Badge className="bg-indigo-500/20 text-indigo-400 mb-2 text-xs">
                  {feature.module}
                </Badge>
                <CardTitle className="text-lg text-white">{feature.name}</CardTitle>
              </div>
            </div>
            <p className="text-sm text-slate-400">{feature.description}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Capabilities
            </h4>
            <div className="grid gap-2">
              {feature.capabilities.map((capability, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded bg-[#0f1623] border border-[#2a3548]">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{capability}</span>
                </div>
              ))}
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
                  <Badge key={idx} className="text-xs bg-blue-500/20 text-blue-400">
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
                  <Badge key={idx} className="text-xs bg-purple-500/20 text-purple-400">
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}