import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sliders, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const riskCategories = [
  "operational", "financial", "strategic", "compliance", 
  "cybersecurity", "reputational", "third_party", "technology"
];

const controlDomains = [
  "access_control", "data_protection", "network_security", 
  "change_management", "incident_response", "business_continuity",
  "vendor_management", "physical_security", "hr_security", "asset_management"
];

const questionTypes = [
  { value: "scenario", label: "Scenario-Based", description: "Real-world situations requiring analysis" },
  { value: "definition", label: "Definition-Based", description: "Knowledge recall and terminology" },
  { value: "technical", label: "Technical", description: "Implementation and technical details" },
  { value: "conceptual", label: "Conceptual", description: "High-level understanding and principles" }
];

export default function CustomExamBuilder({ onGenerate, loading }) {
  const [numQuestions, setNumQuestions] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [selectedRiskCategories, setSelectedRiskCategories] = useState([]);
  const [selectedControlDomains, setSelectedControlDomains] = useState([]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [difficulty, setDifficulty] = useState("intermediate");

  const toggleRiskCategory = (category) => {
    setSelectedRiskCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleControlDomain = (domain) => {
    setSelectedControlDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const toggleQuestionType = (type) => {
    setSelectedQuestionTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleGenerate = () => {
    onGenerate({
      numQuestions,
      riskCategories: selectedRiskCategories,
      controlDomains: selectedControlDomains,
      questionTypes: selectedQuestionTypes,
      passingScore,
      difficulty
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-400" />
          Exam Configuration
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Number of Questions</Label>
              <Input
                type="number"
                min="5"
                max="50"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 15)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2 block">Passing Score (%)</Label>
              <Input
                type="number"
                min="50"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">
              Question Types 
              <span className="text-xs text-slate-500 ml-2">(optional - select specific types)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {questionTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleQuestionType(type.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedQuestionTypes.includes(type.value)
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                      : 'bg-[#151d2e] border-[#2a3548] text-slate-400 hover:border-[#3a4558]'
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs opacity-75 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
            {selectedQuestionTypes.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">All question types will be included</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Focus on Risk Categories 
          <span className="text-xs text-slate-500 ml-2 font-normal">(optional - select to focus exam)</span>
        </h3>
        <ScrollArea className="h-40 border border-[#2a3548] rounded-lg p-3 bg-[#151d2e]">
          <div className="flex flex-wrap gap-2">
            {riskCategories.map(category => (
              <Badge
                key={category}
                onClick={() => toggleRiskCategory(category)}
                className={`cursor-pointer transition-all ${
                  selectedRiskCategories.includes(category)
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {category.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </ScrollArea>
        {selectedRiskCategories.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500">{selectedRiskCategories.length} selected</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRiskCategories([])}
              className="text-xs text-slate-400 hover:text-white h-6"
            >
              Clear
            </Button>
          </div>
        )}
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Focus on Control Domains 
          <span className="text-xs text-slate-500 ml-2 font-normal">(optional - select to focus exam)</span>
        </h3>
        <ScrollArea className="h-40 border border-[#2a3548] rounded-lg p-3 bg-[#151d2e]">
          <div className="flex flex-wrap gap-2">
            {controlDomains.map(domain => (
              <Badge
                key={domain}
                onClick={() => toggleControlDomain(domain)}
                className={`cursor-pointer transition-all ${
                  selectedControlDomains.includes(domain)
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {domain.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </ScrollArea>
        {selectedControlDomains.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500">{selectedControlDomains.length} selected</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedControlDomains([])}
              className="text-xs text-slate-400 hover:text-white h-6"
            >
              Clear
            </Button>
          </div>
        )}
      </Card>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Custom Exam
      </Button>
    </div>
  );
}