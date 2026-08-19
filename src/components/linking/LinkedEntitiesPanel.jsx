import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link2, ExternalLink, AlertTriangle, Shield, FileCheck, FileQuestion } from "lucide-react";

export default function LinkedEntitiesPanel({ 
  links,
  onNavigate 
}) {
  if (!links || Object.values(links).every(arr => !arr || arr.length === 0)) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6 text-center">
          <Link2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No linked entities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="h-5 w-5 text-indigo-400" />
          Linked Entities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="risks">
          <TabsList className="bg-[#151d2e] border border-[#2a3548] mb-4">
            {links.risks?.length > 0 && <TabsTrigger value="risks">Risks ({links.risks.length})</TabsTrigger>}
            {links.controls?.length > 0 && <TabsTrigger value="controls">Controls ({links.controls.length})</TabsTrigger>}
            {links.compliance?.length > 0 && <TabsTrigger value="compliance">Compliance ({links.compliance.length})</TabsTrigger>}
            {links.questions?.length > 0 && <TabsTrigger value="questions">Questions ({links.questions.length})</TabsTrigger>}
          </TabsList>

          {links.risks?.length > 0 && (
            <TabsContent value="risks" className="space-y-2">
              {links.risks.map((id, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate?.('risk', id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-rose-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span className="text-sm text-white">Risk ID: {id}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </div>
              ))}
            </TabsContent>
          )}

          {links.controls?.length > 0 && (
            <TabsContent value="controls" className="space-y-2">
              {links.controls.map((id, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate?.('control', id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-blue-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">Control ID: {id}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </div>
              ))}
            </TabsContent>
          )}

          {links.compliance?.length > 0 && (
            <TabsContent value="compliance" className="space-y-2">
              {links.compliance.map((id, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate?.('compliance', id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-emerald-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white">Requirement ID: {id}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </div>
              ))}
            </TabsContent>
          )}

          {links.questions?.length > 0 && (
            <TabsContent value="questions" className="space-y-2">
              {links.questions.map((id, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate?.('question', id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-purple-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-white">Question ID: {id}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}