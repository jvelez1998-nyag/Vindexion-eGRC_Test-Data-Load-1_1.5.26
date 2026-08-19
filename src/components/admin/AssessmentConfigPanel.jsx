import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function AssessmentConfigPanel() {
  const templates = [
    { name: 'IT Risk Assessment', type: 'it', questions: 45 },
    { name: 'Security Assessment', type: 'security', questions: 38 },
    { name: 'Operational Risk', type: 'operational', questions: 52 },
    { name: 'Financial Controls', type: 'financial', questions: 29 }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Assessment Templates
            </CardTitle>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, idx) => (
              <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-white mb-2">{template.name}</h4>
                  <p className="text-sm text-slate-400 mb-3">{template.questions} questions • {template.type} assessment</p>
                  <Button size="sm" variant="outline" className="w-full border-[#2a3548]">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}