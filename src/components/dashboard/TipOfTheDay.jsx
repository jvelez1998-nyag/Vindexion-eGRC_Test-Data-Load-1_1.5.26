import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const tips = [
  { category: "Risk Management", tip: "Schedule quarterly risk reviews to identify emerging threats before they materialize." },
  { category: "Compliance", tip: "Document your compliance decision-making process - it's as important as the outcome." },
  { category: "Audit", tip: "Start collecting evidence continuously rather than scrambling before an audit." },
  { category: "Vendor Risk", tip: "Set calendar reminders for vendor contract renewals 90 days in advance." },
  { category: "Controls", tip: "Test your critical controls monthly, not just annually - catch failures early." },
  { category: "Incident Response", tip: "Run tabletop exercises quarterly to keep your IR team sharp." },
  { category: "Privacy", tip: "Maintain a data inventory - you can't protect what you don't know you have." },
  { category: "Training", tip: "Microlearning (5-10 min sessions) is more effective than annual compliance marathons." }
];

export default function TipOfTheDay() {
  const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * (tips.length - 2)));
  const displayedTips = [tips[currentIndex], tips[currentIndex + 1], tips[currentIndex + 2] || tips[0]];

  const nextTips = () => {
    setCurrentIndex((prev) => (prev + 3) % tips.length);
  };

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            GRC Tips of the Day
          </CardTitle>
          <Button size="sm" onClick={nextTips} className="h-7 w-7 p-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            <RefreshCw className="h-3 w-3 text-white" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedTips.map((tip, idx) => (
            <div key={idx} className="pb-3 border-b border-amber-500/10 last:border-0 last:pb-0">
              <p className="text-xs text-amber-400 font-medium mb-1">{tip.category}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}