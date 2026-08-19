import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_HIERARCHY = {
  "Risk Management": {
    icon: "🎯",
    subcategories: ["Risk Assessment", "Risk Treatment", "Risk Monitoring", "Risk Reporting"]
  },
  "Compliance": {
    icon: "✅",
    subcategories: ["Regulatory Requirements", "Policy Management", "Compliance Testing", "Audit Preparation"]
  },
  "Information Security": {
    icon: "🔒",
    subcategories: ["Access Control", "Encryption", "Network Security", "Incident Response", "Security Monitoring"]
  },
  "Controls": {
    icon: "⚙️",
    subcategories: ["Preventive Controls", "Detective Controls", "Corrective Controls", "IT Controls", "Business Controls"]
  },
  "Governance": {
    icon: "👥",
    subcategories: ["Board Oversight", "Policy Framework", "Risk Appetite", "Strategic Planning"]
  },
  "Data Protection": {
    icon: "🛡️",
    subcategories: ["Privacy", "Data Classification", "Data Retention", "Data Breach Response"]
  },
  "Third Party": {
    icon: "🤝",
    subcategories: ["Vendor Assessment", "Contract Management", "Ongoing Monitoring", "Offboarding"]
  },
  "Business Continuity": {
    icon: "🔄",
    subcategories: ["BCP Planning", "Disaster Recovery", "Crisis Management", "Testing & Exercises"]
  }
};

export default function QuestionCategoryManager({ questions, onCategorySelect }) {
  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryCount = (category, subcategory = null) => {
    return questions.filter(q => {
      const tags = q.tags || [];
      const catLower = category.toLowerCase();
      const subLower = subcategory?.toLowerCase();

      if (subcategory) {
        return tags.some(t => t.includes(subLower) || t.includes(catLower));
      }
      return tags.some(t => t.includes(catLower));
    }).length;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
          <Folder className="h-4 w-4 text-violet-400" />
          Question Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Object.entries(CATEGORY_HIERARCHY).map(([category, data]) => {
            const isExpanded = expandedCategories.includes(category);
            const count = getCategoryCount(category);

            return (
              <div key={category}>
                <button
                  onClick={() => {
                    toggleCategory(category);
                    onCategorySelect(category, null);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#151d2e] transition-colors text-left",
                    isExpanded && "bg-[#151d2e]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className={cn(
                      "h-4 w-4 text-slate-400 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                    <span className="text-xl">{data.icon}</span>
                    <span className="text-sm text-white font-medium">{category}</span>
                  </div>
                  <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">
                    {count}
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {data.subcategories.map(sub => {
                      const subCount = getCategoryCount(category, sub);
                      return (
                        <button
                          key={sub}
                          onClick={() => onCategorySelect(category, sub)}
                          className="w-full flex items-center justify-between p-2 pl-4 rounded-lg hover:bg-[#151d2e] transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-300">{sub}</span>
                          </div>
                          <Badge className="bg-slate-500/20 text-slate-400 text-[9px]">
                            {subCount}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}