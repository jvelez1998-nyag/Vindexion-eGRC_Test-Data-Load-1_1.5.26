import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

export default function AuditArtifacts({ audit }) {
  const [artifacts, setArtifacts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const artifact = {
        id: Date.now(),
        name: file.name,
        url: file_url,
        size: file.size,
        type: file.type,
        uploaded_date: new Date().toISOString(),
        uploaded_by: "current_user@example.com"
      };

      setArtifacts([...artifacts, artifact]);
      toast.success("Artifact uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload artifact");
    } finally {
      setUploading(false);
    }
  };

  const deleteArtifact = (artifactId) => {
    setArtifacts(artifacts.filter(a => a.id !== artifactId));
    toast.success("Artifact deleted");
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeColor = (type) => {
    if (type.includes('pdf')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (type.includes('word') || type.includes('document')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (type.includes('image')) return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-violet-400" />
          Audit Artifacts & Evidence
        </h3>
        <Label htmlFor="file-upload">
          <Button as="span" size="sm" disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </Label>
      </div>

      <div className="space-y-3">
        {artifacts.length === 0 ? (
          <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
            <Upload className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">No artifacts uploaded</h4>
            <p className="text-slate-400 mb-4">Upload audit workpapers, evidence, and supporting documentation</p>
          </Card>
        ) : (
          artifacts.map(artifact => (
            <Card key={artifact.id} className="bg-[#151d2e] border-[#2a3548] p-4 hover:border-[#3a4558] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-[#1a2332]">
                    <FileText className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{artifact.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{formatFileSize(artifact.size)}</span>
                      <span>•</span>
                      <span>{new Date(artifact.uploaded_date).toLocaleDateString()}</span>
                      <Badge className={`text-[10px] border ${getFileTypeColor(artifact.type)}`}>
                        {artifact.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    as="a"
                    href={artifact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteArtifact(artifact.id)}
                    className="h-8 w-8 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-[#151d2e] border-[#2a3548] p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Artifact Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{artifacts.length}</div>
            <div className="text-xs text-slate-500">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {formatFileSize(artifacts.reduce((sum, a) => sum + a.size, 0))}
            </div>
            <div className="text-xs text-slate-500">Total Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-400">
              {new Set(artifacts.map(a => a.type.split('/')[0])).size}
            </div>
            <div className="text-xs text-slate-500">File Types</div>
          </div>
        </div>
      </Card>
    </div>
  );
}