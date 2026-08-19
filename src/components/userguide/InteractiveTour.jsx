import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle2 } from "lucide-react";

export default function InteractiveTour({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Interactive Platform Tour</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <p className="text-slate-300">
              Take a guided tour through the platform to learn key features and workflows. 
              This interactive experience will help you get started quickly and efficiently.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Dashboard Overview', duration: '2 min', completed: false },
              { title: 'Adding Your First Risk', duration: '3 min', completed: false },
              { title: 'Setting Up Compliance', duration: '4 min', completed: false },
              { title: 'Creating Controls', duration: '3 min', completed: false },
              { title: 'Using AI Features', duration: '5 min', completed: false }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-400">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    <Badge className="bg-slate-500/10 text-slate-400 text-xs mt-1">{step.duration}</Badge>
                  </div>
                </div>
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Button variant="outline" size="sm" className="border-[#2a3548]">
                    <Play className="h-3 w-3 mr-2" />
                    Start
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1 border-[#2a3548]">
              Skip for Now
            </Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              <Play className="h-4 w-4 mr-2" />
              Start Tour
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}