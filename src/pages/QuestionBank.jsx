import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Sparkles, BarChart3, Grid3x3, List, Brain, Layers, Download, LineChart, Edit3, FolderTree } from "lucide-react";
import QuestionBankDashboard from "@/components/questionbank/QuestionBankDashboard";
import QuestionBankBrowser from "@/components/questionbank/QuestionBankBrowser";
import QuestionBankCategories from "@/components/questionbank/QuestionBankCategories";
import QuestionBankModuleView from "@/components/questionbank/QuestionBankModuleView";
import QuestionBankAIHub from "@/components/questionbank/QuestionBankAIHub";
import QuestionBankAnalytics from "@/components/questionbank/QuestionBankAnalytics";
import QuestionForm from "@/components/questionbank/QuestionForm";
import QuestionBankImporter from "@/components/questionbank/QuestionBankImporter";
import QuestionBulkEditor from "@/components/questionbank/QuestionBulkEditor";
import QuestionCategoryManager from "@/components/questionbank/QuestionCategoryManager";
import { toast } from "sonner";

export default function QuestionBank() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [importerOpen, setImporterOpen] = useState(false);
  const [bulkEditorOpen, setBulkEditorOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['question-bank'],
    queryFn: async () => {
      const data = await base44.entities.QuestionBank.list('-created_date', 200);
      return data || [];
    },
    staleTime: 300000
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.QuestionBank.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      setShowForm(false);
      setEditingQuestion(null);
      toast.success("Question added successfully");
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.QuestionBank.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      setShowForm(false);
      setEditingQuestion(null);
      toast.success("Question updated successfully");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.QuestionBank.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      toast.success("Question deleted");
    },
  });

  const handleSubmit = (data) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = (question) => {
    if (confirm(`Delete question: "${question.question_text?.substring(0, 50)}..."?`)) {
      deleteQuestionMutation.mutate(question.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-xl shadow-violet-500/10">
              <BookOpen className="h-7 w-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                Question Bank Hub
              </h1>
              <p className="text-slate-400 text-sm mt-1">Centralized question repository • AI-powered generation • Multi-module integration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 text-sm px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <span className="font-bold text-violet-400">{questions.length}</span>
              <span className="text-slate-400">Questions</span>
            </div>
            <Button 
              onClick={() => setImporterOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              onClick={() => setBulkEditorOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Bulk Edit
            </Button>
            <Button 
              onClick={() => { setEditingQuestion(null); setShowForm(true); }}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="browse" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Browse All
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400">
              <Layers className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400">
              <List className="h-4 w-4 mr-2" />
              By Module
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400">
              <Brain className="h-4 w-4 mr-2" />
              AI Hub
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400">
              <LineChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="organize" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-400">
              <FolderTree className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <QuestionBankDashboard
              questions={questions}
              isLoading={isLoading}
              onAddNew={() => { setEditingQuestion(null); setShowForm(true); }}
              onQuestionClick={handleEdit}
            />
          </TabsContent>

          <TabsContent value="browse">
            <QuestionBankBrowser
              questions={questions}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="categories">
            <QuestionBankCategories
              questions={questions}
              isLoading={isLoading}
              onQuestionClick={handleEdit}
            />
          </TabsContent>

          <TabsContent value="modules">
            <QuestionBankModuleView
              questions={questions}
              isLoading={isLoading}
              onQuestionClick={handleEdit}
            />
          </TabsContent>

          <TabsContent value="ai">
            <QuestionBankAIHub
              questions={questions}
              onGenerate={(data) => createQuestionMutation.mutate(data)}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <QuestionBankAnalytics
              questions={questions}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="organize">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <QuestionCategoryManager
                questions={questions}
                onCategorySelect={(category, subcategory) => {
                  setCategoryFilter({ category, subcategory });
                  toast.info(`Filtered by: ${subcategory || category}`);
                }}
              />
              <div className="lg:col-span-2">
                <QuestionBankBrowser
                  questions={categoryFilter ? questions.filter(q => {
                    const tags = q.tags || [];
                    const catLower = categoryFilter.category.toLowerCase();
                    const subLower = categoryFilter.subcategory?.toLowerCase();
                    if (categoryFilter.subcategory) {
                      return tags.some(t => t.includes(subLower) || t.includes(catLower));
                    }
                    return tags.some(t => t.includes(catLower));
                  }) : questions}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Question Form Dialog */}
        {showForm && (
          <QuestionForm
            question={editingQuestion}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingQuestion(null);
            }}
          />
        )}

        {/* Import Dialog */}
        {importerOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1623] rounded-xl border border-[#2a3548] max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-[#2a3548] flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Import Questions from Platform Modules</h2>
                <Button variant="ghost" onClick={() => setImporterOpen(false)} className="text-slate-400 hover:text-white">
                  ×
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <QuestionBankImporter 
                  onImportComplete={() => {
                    setImporterOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['question-bank'] });
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bulk Editor */}
        {bulkEditorOpen && (
          <QuestionBulkEditor
            questions={questions}
            onClose={() => setBulkEditorOpen(false)}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['question-bank'] });
              toast.success("Questions updated successfully");
            }}
          />
        )}
      </div>
    </div>
  );
}