import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Grid3x3, List, Hash, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QuestionCard from "@/components/questionbank/QuestionCard";
import { toast } from "sonner";
import { usePagination } from "@/components/ui/use-pagination";
import { Pagination } from "@/components/ui/pagination";

const FRAMEWORKS = [
  "All", "SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", 
  "HIPAA", "NIST", "COBIT", "FFIEC", "DORA",
  "EU_AI_ACT", "CCPA", "NYDFS", "DSA"
];

export default function QuestionBankBrowser({ questions, isLoading, onEdit, onDelete }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFramework, setFilterFramework] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterModule, setFilterModule] = useState("All");
  const [tagFilter, setTagFilter] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !searchQuery || 
      q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.framework?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFramework = filterFramework === "All" || q.framework === filterFramework;
    const matchesDifficulty = filterDifficulty === "All" || q.difficulty === filterDifficulty;
    const matchesType = filterType === "All" || q.question_type === filterType;
    const matchesModule = filterModule === "All" || q.source_module === filterModule;
    const matchesTags = tagFilter.length === 0 || tagFilter.every(tag => (q.tags || []).includes(tag));

    return matchesSearch && matchesFramework && matchesDifficulty && matchesType && matchesModule && matchesTags;
  });

  const modules = ["All", ...new Set(questions.map(q => q.source_module).filter(Boolean))];
  const allTags = [...new Set(questions.flatMap(q => q.tags || []))].sort();

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredQuestions, 25);

  const exportQuestions = () => {
    const dataStr = JSON.stringify(filteredQuestions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-bank-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Questions exported successfully");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 bg-[#1a2332]" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 bg-[#1a2332]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search questions, tags, frameworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 h-11"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            <Select value={filterFramework} onValueChange={setFilterFramework}>
              <SelectTrigger className="w-[180px] bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {FRAMEWORKS.map(fw => (
                  <SelectItem key={fw} value={fw} className="text-white hover:bg-[#2a3548]">
                    {fw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[180px] bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="All" className="text-white hover:bg-[#2a3548]">All Difficulty</SelectItem>
                <SelectItem value="beginner" className="text-white hover:bg-[#2a3548]">Beginner</SelectItem>
                <SelectItem value="intermediate" className="text-white hover:bg-[#2a3548]">Intermediate</SelectItem>
                <SelectItem value="advanced" className="text-white hover:bg-[#2a3548]">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="All" className="text-white hover:bg-[#2a3548]">All Types</SelectItem>
                <SelectItem value="scenario" className="text-white hover:bg-[#2a3548]">Scenario</SelectItem>
                <SelectItem value="definition" className="text-white hover:bg-[#2a3548]">Definition</SelectItem>
                <SelectItem value="technical" className="text-white hover:bg-[#2a3548]">Technical</SelectItem>
                <SelectItem value="conceptual" className="text-white hover:bg-[#2a3548]">Conceptual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-[180px] bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {modules.map(mod => (
                  <SelectItem key={mod} value={mod} className="text-white hover:bg-[#2a3548]">
                    {mod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tagFilter[0] || "All"} onValueChange={(v) => setTagFilter(v === "All" ? [] : [v])}>
              <SelectTrigger className="w-[180px] bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="All" className="text-white hover:bg-[#2a3548]">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag} className="text-white hover:bg-[#2a3548]">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      {tag}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <div className="flex items-center gap-2 border border-[#2a3548] rounded-lg p-1 bg-[#151d2e]">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={exportQuestions}
              variant="outline"
              className="border-[#2a3548] hover:bg-[#2a3548]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Results */}
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">
              {totalItems} results
            </Badge>
            {searchQuery && (
              <Badge className="bg-slate-700 text-slate-300">
                Search: "{searchQuery}"
              </Badge>
            )}
            {filterFramework !== "All" && (
              <Badge className="bg-blue-500/10 text-blue-400">
                {filterFramework}
              </Badge>
            )}
            {tagFilter.length > 0 && tagFilter.map(tag => (
              <Badge key={tag} className="bg-violet-500/20 text-violet-400 gap-1">
                <Hash className="h-3 w-3" />
                {tag}
                <button onClick={() => setTagFilter([])} className="hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Question List */}
      {totalItems === 0 ? (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No questions found</h3>
          <p className="text-slate-400">
            {questions.length === 0 
              ? "The question bank is empty. Add questions to get started."
              : "Try adjusting your filters or search terms"}
          </p>
        </Card>
      ) : (
        <Card className="bg-[#1a2332] border-[#2a3548] overflow-hidden">
          <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 p-4' : 'space-y-4 p-4'}>
            {paginatedItems.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={() => onEdit(question)}
                onDelete={() => onDelete(question)}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </Card>
      )}
    </div>
  );
}