import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Upload,
  Loader2,
  Download,
  Trash2,
  Eye,
  Calendar,
  Tag,
  FileCheck,
  Brain,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function VendorDocumentManager({ vendor }) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("contract");
  const [expirationDate, setExpirationDate] = useState("");
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['vendor-documents', vendor?.id],
    queryFn: () => base44.entities.VendorDocument.filter({ vendor_id: vendor.id }, '-created_date'),
    enabled: !!vendor?.id
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VendorDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-documents'] });
      toast.success("Document deleted");
    }
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      // Upload file
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResult.file_url;

      // AI Analysis - categorize and extract information
      toast.info("Analyzing document with AI...");
      
      const aiPrompt = `Analyze this ${documentType} document and provide:

1. **Category** (choose one): legal, security, compliance, operational, financial
2. **Tags** (5-8 relevant tags): Keywords that describe this document
3. **Summary** (2-3 sentences): Brief overview of document contents
4. **Key Points** (5-7 points): Most important information in the document
5. **Risks Identified** (3-5 risks): Any potential risks, concerns, or red flags mentioned
6. **Expiration Detection**: If this document has an expiration or renewal date, extract it

Document Type: ${documentType}
Document Name: ${file.name}
Vendor: ${vendor.vendor_name}

Provide detailed, actionable analysis based on the document content.`;

      const aiAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
        file_urls: [fileUrl],
        response_json_schema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["legal", "security", "compliance", "operational", "financial"]
            },
            tags: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" },
            key_points: {
              type: "array",
              items: { type: "string" }
            },
            risks_identified: {
              type: "array",
              items: { type: "string" }
            },
            detected_expiration_date: { type: "string" }
          }
        }
      });

      // Create document record with AI analysis
      await base44.entities.VendorDocument.create({
        vendor_id: vendor.id,
        document_name: file.name,
        document_type: documentType,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type || file.name.split('.').pop(),
        category: aiAnalysis.category,
        tags: aiAnalysis.tags,
        expiration_date: expirationDate || aiAnalysis.detected_expiration_date || null,
        version: version || "1.0",
        status: "active",
        ai_summary: aiAnalysis.summary,
        ai_key_points: aiAnalysis.key_points,
        ai_risks_identified: aiAnalysis.risks_identified,
        uploaded_by: user?.email,
        notes
      });

      queryClient.invalidateQueries({ queryKey: ['vendor-documents'] });
      toast.success("Document uploaded and analyzed");
      
      // Reset form
      setFile(null);
      setDocumentType("contract");
      setExpirationDate("");
      setVersion("");
      setNotes("");
      setUploadDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = filterType === "all" 
    ? documents 
    : documents.filter(d => d.document_type === filterType);

  const documentTypeColors = {
    contract: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    certification: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    audit_report: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    security_policy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    privacy_policy: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    sla: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    insurance: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    compliance_report: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    assessment_report: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    other: "bg-slate-500/20 text-slate-400 border-slate-500/30"
  };

  const categoryColors = {
    legal: "bg-indigo-500/10 text-indigo-400",
    security: "bg-rose-500/10 text-rose-400",
    compliance: "bg-emerald-500/10 text-emerald-400",
    operational: "bg-blue-500/10 text-blue-400",
    financial: "bg-amber-500/10 text-amber-400"
  };

  const isExpiringSoon = (doc) => {
    if (!doc.expiration_date) return false;
    const daysUntilExpiry = Math.floor((new Date(doc.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (doc) => {
    if (!doc.expiration_date) return false;
    return new Date(doc.expiration_date) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="contract">Contracts</SelectItem>
              <SelectItem value="certification">Certifications</SelectItem>
              <SelectItem value="audit_report">Audit Reports</SelectItem>
              <SelectItem value="security_policy">Security Policies</SelectItem>
              <SelectItem value="sla">SLAs</SelectItem>
              <SelectItem value="compliance_report">Compliance Reports</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="bg-slate-500/10 text-slate-400">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="bg-[#151d2e] border-[#2a3548] p-12 text-center">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-slate-400 mb-4">Upload contracts, certifications, and reports</p>
          <Button onClick={() => setUploadDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload First Document
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <h4 className="font-semibold text-white text-sm line-clamp-1">{doc.document_name}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge className={documentTypeColors[doc.document_type]}>
                        {doc.document_type.replace('_', ' ')}
                      </Badge>
                      {doc.category && (
                        <Badge className={categoryColors[doc.category]}>
                          {doc.category}
                        </Badge>
                      )}
                      {doc.version && (
                        <Badge className="bg-slate-500/10 text-slate-400 text-xs">v{doc.version}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {doc.ai_summary && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{doc.ai_summary}</p>
                )}

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.slice(0, 4).map((tag, i) => (
                      <Badge key={i} className="bg-purple-500/10 text-purple-400 text-xs border-purple-500/20">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 4 && (
                      <Badge className="bg-slate-500/10 text-slate-400 text-xs">
                        +{doc.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {doc.ai_risks_identified && doc.ai_risks_identified.length > 0 && (
                  <div className="mb-3 p-2 rounded bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-3 w-3 text-rose-400" />
                      <span className="text-xs font-medium text-rose-400">Risks Identified</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {doc.ai_risks_identified[0]}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>Uploaded {format(new Date(doc.created_date), 'MMM d, yyyy')}</span>
                  {doc.expiration_date && (
                    <div className={`flex items-center gap-1 ${
                      isExpired(doc) ? 'text-rose-400' :
                      isExpiringSoon(doc) ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      <Calendar className="h-3 w-3" />
                      <span>Expires {format(new Date(doc.expiration_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setViewDialogOpen(true);
                    }}
                    className="flex-1 border-[#2a3548] hover:bg-[#2a3548]"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="flex-1 border-[#2a3548] hover:bg-[#2a3548]"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this document?')) {
                        deleteMutation.mutate(doc.id);
                      }
                    }}
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Upload Document with AI Analysis
            </DialogTitle>
            <p className="text-sm text-slate-400">
              AI will automatically categorize, tag, and extract key information from your document
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="audit_report">Audit Report</SelectItem>
                  <SelectItem value="security_policy">Security Policy</SelectItem>
                  <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
                  <SelectItem value="sla">Service Level Agreement</SelectItem>
                  <SelectItem value="insurance">Insurance Document</SelectItem>
                  <SelectItem value="compliance_report">Compliance Report</SelectItem>
                  <SelectItem value="assessment_report">Assessment Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Select File *</Label>
              <Input
                type="file"
                onChange={handleFileSelect}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                accept=".pdf,.doc,.docx,.txt"
              />
              {file && (
                <p className="text-xs text-slate-400 mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Version (Optional)</Label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g., 1.0, 2.1"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={3}
              />
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">AI Analysis Included</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Automatic categorization and tagging</li>
                <li>• Content summary and key points extraction</li>
                <li>• Risk identification and red flags detection</li>
                <li>• Expiration date detection</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
              className="border-[#2a3548] hover:bg-[#2a3548]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Upload & Analyze</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-400" />
              {selectedDoc?.document_name}
            </DialogTitle>
          </DialogHeader>

          {selectedDoc && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Metadata */}
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-sm">Document Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Type</div>
                        <Badge className={documentTypeColors[selectedDoc.document_type]}>
                          {selectedDoc.document_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Category</div>
                        <Badge className={categoryColors[selectedDoc.category]}>
                          {selectedDoc.category}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Uploaded</div>
                        <div className="text-white">{format(new Date(selectedDoc.created_date), 'MMMM d, yyyy')}</div>
                      </div>
                      {selectedDoc.expiration_date && (
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Expires</div>
                          <div className={`${
                            isExpired(selectedDoc) ? 'text-rose-400' :
                            isExpiringSoon(selectedDoc) ? 'text-amber-400' : 'text-white'
                          }`}>
                            {format(new Date(selectedDoc.expiration_date), 'MMMM d, yyyy')}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Summary */}
                {selectedDoc.ai_summary && (
                  <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-400" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedDoc.ai_summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-400" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoc.tags.map((tag, i) => (
                          <Badge key={i} className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Key Points */}
                {selectedDoc.ai_key_points && selectedDoc.ai_key_points.length > 0 && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-400" />
                        Key Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedDoc.ai_key_points.map((point, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Risks */}
                {selectedDoc.ai_risks_identified && selectedDoc.ai_risks_identified.length > 0 && (
                  <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        Risks Identified
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedDoc.ai_risks_identified.map((risk, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-rose-400 mt-1">⚠</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {selectedDoc.notes && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-sm">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300">{selectedDoc.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}