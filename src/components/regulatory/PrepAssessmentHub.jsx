import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Shield } from "lucide-react";
import PrepQuestionnaireBuilder from "./PrepQuestionnaireBuilder";

const frameworks = [
  "SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", "HIPAA", 
  "NIST", "COBIT", "FFIEC", "DORA", "EU_AI_ACT", "CCPA"
];

export default function PrepAssessmentHub({ userEmail }) {
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  if (showQuestionnaire && selectedFramework) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => {
            setShowQuestionnaire(false);
            setSelectedFramework(null);
          }}
          className="text-slate-400 hover:text-white"
        >
          ← Back to Framework Selection
        </Button>
        <PrepQuestionnaireBuilder
          framework={selectedFramework}
          onComplete={() => {
            setShowQuestionnaire(false);
            setSelectedFramework(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 p-8 text-center">
        <Target className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Readiness Assessment</h2>
        <p className="text-slate-300 max-w-2xl mx-auto mb-6">
          Take a comprehensive 15-question assessment to evaluate your current knowledge, identify gaps, 
          and receive a personalized AI-powered study plan with precise recommendations.
        </p>
      </Card>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {frameworks.map(fw => (
          <Button
            key={fw}
            onClick={() => {
              setSelectedFramework(fw);
              setShowQuestionnaire(true);
            }}
            className="h-32 bg-[#1a2332] border border-[#2a3548] hover:border-emerald-500/50 hover:bg-emerald-500/5 flex flex-col items-center justify-center gap-3"
          >
            <Shield className="h-8 w-8 text-emerald-400" />
            <span className="text-white font-semibold">{fw}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}