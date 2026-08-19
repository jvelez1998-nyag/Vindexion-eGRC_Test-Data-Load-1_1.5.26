import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Download, CheckCircle2, XCircle, Loader2, AlertTriangle, FileSpreadsheet, Link2 } from "lucide-react";
import { toast } from "sonner";
import NotificationHelper from "@/components/notifications/NotificationHelper";

export default function BulkImportDialog({ open, onOpenChange, entityType, onImportComplete }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Validate, 4: Import
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [validationResults, setValidationResults] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [importMethod, setImportMethod] = useState("file"); // file, api, url

  // Entity field definitions
  const entityFields = {
    risk: [
      { name: "title", label: "Risk Title", required: true },
      { name: "description", label: "Description", required: false },
      { name: "category", label: "Category", required: true },
      { name: "likelihood", label: "Likelihood (1-5)", required: false, type: "number" },
      { name: "impact", label: "Impact (1-5)", required: false, type: "number" },
      { name: "status", label: "Status", required: false },
      { name: "owner", label: "Owner Email", required: false },
      { name: "mitigation_plan", label: "Mitigation Plan", required: false }
    ],
    control: [
      { name: "name", label: "Control Name", required: true },
      { name: "description", label: "Description", required: false },
      { name: "category", label: "Category", required: true },
      { name: "domain", label: "Domain", required: true },
      { name: "control_procedures", label: "Procedures", required: false },
      { name: "status", label: "Status", required: false },
      { name: "owner", label: "Owner Email", required: false },
      { name: "effectiveness", label: "Effectiveness (1-5)", required: false, type: "number" }
    ]
  };

  const fields = entityFields[entityType] || [];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      parseCSV(text);
    };

    reader.readAsText(uploadedFile);
  };

  const parseCSV = (text) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast.error("CSV must contain headers and at least one data row");
        return;
      }

      // Enhanced CSV parsing with quoted field support
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
      
      if (headers.length === 0) {
        toast.error("No headers found in CSV");
        return;
      }

      const data = [];
      const parseErrors = [];
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
          
          if (values.length !== headers.length) {
            parseErrors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
            continue;
          }
          
          const row = headers.reduce((obj, header, idx) => {
            obj[header] = values[idx] || '';
            return obj;
          }, {});
          
          data.push(row);
        } catch (error) {
          parseErrors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      if (data.length === 0) {
        toast.error("No valid data rows found in CSV");
        return;
      }

      if (parseErrors.length > 0) {
        toast.warning(`Parsed ${data.length} rows with ${parseErrors.length} errors`);
        console.warn("CSV parsing errors:", parseErrors);
      }

      setParsedData(data);
      
      // Enhanced auto-detect field mapping
      const autoMapping = {};
      headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const matchedField = fields.find(f => {
          const normalizedFieldName = f.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const normalizedFieldLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
          return normalizedFieldName === normalizedHeader ||
                 normalizedFieldLabel === normalizedHeader ||
                 normalizedHeader.includes(normalizedFieldName) ||
                 normalizedFieldName.includes(normalizedHeader);
        });
        
        if (matchedField) {
          autoMapping[header] = matchedField.name;
        }
      });
      
      setFieldMapping(autoMapping);
      setStep(2);
      toast.success(`Successfully parsed ${data.length} rows from CSV`);
      
    } catch (error) {
      console.error("CSV parsing error:", error);
      toast.error(`Failed to parse CSV: ${error.message}`);
    }
  };

  const handleURLImport = async (url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      parseCSV(text);
    } catch (error) {
      toast.error("Failed to fetch data from URL");
    }
  };

  const validateData = () => {
    const errors = [];
    const warnings = [];
    const duplicates = new Map();

    // Check if all required fields are mapped
    const mappedFields = new Set(Object.values(fieldMapping).filter(v => v !== '__skip__'));
    const requiredFields = fields.filter(f => f.required);
    
    requiredFields.forEach(field => {
      if (!mappedFields.has(field.name)) {
        errors.push({
          row: 0,
          field: field.label,
          message: `Required field "${field.label}" is not mapped to any column`
        });
      }
    });

    parsedData.forEach((row, index) => {
      // Check required fields
      fields.filter(f => f.required).forEach(field => {
        const sourceColumn = Object.keys(fieldMapping).find(k => fieldMapping[k] === field.name);
        if (!sourceColumn || !row[sourceColumn] || row[sourceColumn].trim() === '') {
          errors.push({
            row: index + 1,
            field: field.label,
            message: `Missing or empty required field: ${field.label}`
          });
        }
      });

      // Validate data types
      fields.filter(f => f.type === 'number').forEach(field => {
        const sourceColumn = Object.keys(fieldMapping).find(k => fieldMapping[k] === field.name);
        if (sourceColumn && row[sourceColumn]) {
          const rawValue = row[sourceColumn].toString().trim();
          if (rawValue === '') return;
          
          const value = parseFloat(rawValue);
          if (isNaN(value)) {
            errors.push({
              row: index + 1,
              field: field.label,
              message: `Invalid number format: "${rawValue}"`
            });
          } else if (field.name === 'likelihood' || field.name === 'impact') {
            if (value < 1 || value > 5) {
              warnings.push({
                row: index + 1,
                field: field.label,
                message: `Value ${value} should be between 1 and 5`
              });
            }
          }
        }
      });

      // Check for duplicate names (if name field exists)
      const nameColumn = Object.keys(fieldMapping).find(k => 
        fieldMapping[k] === 'name' || fieldMapping[k] === 'risk_name'
      );
      if (nameColumn && row[nameColumn]) {
        const name = row[nameColumn].trim().toLowerCase();
        if (duplicates.has(name)) {
          warnings.push({
            row: index + 1,
            field: 'Name',
            message: `Duplicate name found: "${row[nameColumn]}" (also in row ${duplicates.get(name)})`
          });
        } else {
          duplicates.set(name, index + 1);
        }
      }

      // Validate enum fields
      const categoryColumn = Object.keys(fieldMapping).find(k => 
        fieldMapping[k] === 'category' || fieldMapping[k] === 'risk_category'
      );
      if (categoryColumn && row[categoryColumn]) {
        const validCategories = ['operational', 'financial', 'strategic', 'compliance', 'cybersecurity', 'reputational'];
        const category = row[categoryColumn].toLowerCase();
        if (!validCategories.includes(category)) {
          warnings.push({
            row: index + 1,
            field: 'Category',
            message: `Unrecognized category: "${row[categoryColumn]}". Expected one of: ${validCategories.join(', ')}`
          });
        }
      }
    });

    setValidationResults({ errors, warnings, valid: errors.length === 0 });
    setStep(3);
    
    if (errors.length > 0) {
      toast.error(`Found ${errors.length} validation errors`);
    } else if (warnings.length > 0) {
      toast.warning(`Validation passed with ${warnings.length} warnings`);
    } else {
      toast.success("All validations passed!");
    }
  };

  const performImport = async () => {
    if (!validationResults?.valid) {
      toast.error("Please fix validation errors before importing");
      return;
    }

    setImporting(true);
    setStep(4);

    try {
      const transformedData = parsedData.map((row, idx) => {
        const mapped = {};
        
        Object.keys(fieldMapping).forEach(sourceCol => {
          const targetField = fieldMapping[sourceCol];
          if (targetField === '__skip__') return;
          
          let value = row[sourceCol];
          
          // Clean and transform values
          if (typeof value === 'string') {
            value = value.trim();
          }
          
          const fieldDef = fields.find(f => f.name === targetField);
          
          // Type conversions with error handling
          if (fieldDef?.type === 'number') {
            const numValue = parseFloat(value);
            mapped[targetField] = !isNaN(numValue) ? numValue : null;
          } else if (value !== '') {
            mapped[targetField] = value;
          }
        });
        
        // Only return if has required fields
        const hasRequiredFields = fields
          .filter(f => f.required)
          .every(f => mapped[f.name] && mapped[f.name] !== '');
          
        return hasRequiredFields ? mapped : null;
      }).filter(Boolean);

      if (transformedData.length === 0) {
        toast.error("No valid records to import after transformation");
        setImporting(false);
        return;
      }

      const entityName = entityType === 'risk' ? 'Risk' : 'Control';
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < transformedData.length; i += batchSize) {
        batches.push(transformedData.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < batches.length; i++) {
        try {
          await base44.entities[entityName].bulkCreate(batches[i]);
          successCount += batches[i].length;
          setProgress(Math.round(((i + 1) / batches.length) * 100));
        } catch (error) {
          console.error(`Batch ${i + 1} import error:`, error);
          errorCount += batches[i].length;
          errors.push({ 
            batch: i + 1, 
            message: error.message || 'Unknown error',
            records: batches[i].length 
          });
        }
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportResults({
        success: successCount,
        failed: errorCount,
        errors
      });

      // Send notifications
      try {
        const user = await base44.auth.me();
        if (successCount > 0) {
          await NotificationHelper.notifyImportSuccess(
            user.email,
            entityType,
            successCount,
            { source: importMethod }
          );
          toast.success(`Successfully imported ${successCount} records`);
          onImportComplete?.();
        }
        
        if (errorCount > 0) {
          await NotificationHelper.notifyImportFailed(
            user.email,
            entityType,
            `${errorCount} records failed`
          );
          toast.error(`Failed to import ${errorCount} records`);
        }
      } catch (e) {
        console.error('Failed to create notification:', e);
        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} records`);
          onImportComplete?.();
        }
        if (errorCount > 0) {
          toast.error(`Failed to import ${errorCount} records`);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(`Import failed: ${error.message || 'Unknown error'}`);
      setImportResults({
        success: 0,
        failed: parsedData.length,
        errors: [{ batch: 'all', message: error.message || 'Unknown error' }]
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = fields.map(f => f.label).join(',');
    const example = fields.map(f => {
      if (f.type === 'number') return '3';
      return `Example ${f.label}`;
    }).join(',');
    
    const csv = `${headers}\n${example}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_import_template.csv`;
    a.click();
  };

  const downloadSampleData = () => {
    const sampleData = entityType === 'risk' ? [
      ['Cloud Infrastructure Outage', 'Critical cloud service provider experiencing extended downtime affecting core business applications', 'operational', '3', '5', 'mitigating', 'cto@company.com', 'Implement multi-cloud strategy and automated failover procedures'],
      ['Ransomware Attack', 'Sophisticated ransomware targeting enterprise systems through phishing campaigns', 'cybersecurity', '4', '5', 'mitigating', 'ciso@company.com', 'Deploy EDR, implement zero-trust architecture, conduct security training'],
      ['GDPR Compliance Failure', 'Inability to fulfill data subject access requests within regulatory timeline', 'compliance', '4', '4', 'assessing', 'dpo@company.com', 'Deploy data discovery tools, centralize personal data inventory'],
      ['Third-Party Vendor Breach', 'Critical vendor with access to customer PII experiences security breach', 'operational', '3', '5', 'monitoring', 'ciso@company.com', 'Enhanced vendor security assessments and continuous monitoring'],
      ['Liquidity Crisis', 'Insufficient cash reserves to meet short-term obligations', 'financial', '3', '5', 'mitigating', 'cfo@company.com', 'Establish credit facility and improve AR collection processes']
    ] : [
      ['Access Control Review', 'Quarterly review of user access rights and permissions', 'preventive', 'access_control', 'Review and validate user access across all systems', 'effective', 'security@company.com', '4'],
      ['Data Backup Verification', 'Daily automated backup verification and testing', 'detective', 'data_protection', 'Automated backup integrity checks and restoration tests', 'effective', 'it@company.com', '5'],
      ['Incident Response Plan', 'Documented and tested incident response procedures', 'corrective', 'incident_response', 'Maintain and test IR plan quarterly', 'implemented', 'ciso@company.com', '4'],
      ['Vendor Security Assessment', 'Annual security assessment of critical vendors', 'preventive', 'vendor_management', 'Security questionnaires and audits for high-risk vendors', 'implemented', 'procurement@company.com', '3'],
      ['Employee Security Training', 'Mandatory annual security awareness training', 'directive', 'hr_security', 'Annual training with phishing simulations', 'effective', 'hr@company.com', '4']
    ];

    const headers = fields.map(f => f.label).join(',');
    const rows = sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_sample_data.csv`;
    a.click();
    toast.success('Sample data downloaded');
  };

  const resetImport = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setFieldMapping({});
    setValidationResults(null);
    setImportResults(null);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-400" />
            Bulk Import {entityType === 'risk' ? 'Risks' : 'Controls'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Upload' },
              { num: 2, label: 'Map Fields' },
              { num: 3, label: 'Validate' },
              { num: 4, label: 'Import' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step >= s.num ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-600 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <span className={`ml-2 text-sm ${step >= s.num ? 'text-white' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                {i < 3 && <div className={`w-16 h-0.5 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-slate-600'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <Tabs value={importMethod} onValueChange={setImportMethod}>
                <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                  <TabsTrigger value="file">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <Link2 className="h-4 w-4 mr-2" />
                    From URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <Card className="bg-[#151d2e] border-[#2a3548] border-dashed">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">Upload CSV or Excel file</p>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </span>
                        </Button>
                      </Label>
                      {file && (
                        <Badge className="mt-4 bg-emerald-500/20 text-emerald-400">
                          {file.name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label>CSV URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/data.csv"
                        className="bg-[#151d2e] border-[#2a3548] text-white"
                        id="url-input"
                      />
                      <Button
                        onClick={() => {
                          const url = document.getElementById('url-input').value;
                          if (url) handleURLImport(url);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Fetch
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Download className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-slate-300">
                  Don't have a file ready?{' '}
                  <button onClick={downloadTemplate} className="text-blue-400 underline hover:text-blue-300">
                    Download template
                  </button>
                  {' '}or{' '}
                  <button onClick={downloadSampleData} className="text-emerald-400 underline hover:text-emerald-300">
                    Download sample data
                  </button>
                  {' '}to test the import.
                </AlertDescription>
              </Alert>

              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Expected Fields:</h4>
                <div className="space-y-1">
                  {fields.map(f => (
                    <div key={f.name} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {f.label}
                      </Badge>
                      {f.required && <span className="text-rose-400">*required</span>}
                      {f.type && <span className="text-slate-500">({f.type})</span>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <Alert className="bg-emerald-500/10 border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-slate-300">
                  Loaded {parsedData.length} rows. Map your CSV columns to {entityType} fields.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {Object.keys(parsedData[0] || {}).map(column => (
                    <Card key={column} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label className="text-xs text-slate-400">CSV Column</Label>
                          <div className="font-semibold text-white">{column}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Sample: {parsedData[0][column]}
                          </div>
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-slate-400">Maps to</Label>
                          <Select
                            value={fieldMapping[column] || ""}
                            onValueChange={(value) => setFieldMapping(prev => ({ ...prev, [column]: value }))}
                          >
                            <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                              <SelectItem value="__skip__">Skip this column</SelectItem>
                              {fields.map(f => (
                                <SelectItem key={f.name} value={f.name}>
                                  {f.label} {f.required && <span className="text-rose-400">*</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="border-[#2a3548]">
                  Back
                </Button>
                <Button onClick={validateData} className="bg-blue-600 hover:bg-blue-700">
                  Next: Validate
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Validation */}
          {step === 3 && validationResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
                  <div className="text-2xl font-bold text-emerald-400">{parsedData.length}</div>
                  <div className="text-sm text-slate-400">Total Rows</div>
                </Card>
                <Card className="bg-rose-500/10 border-rose-500/30 p-4">
                  <div className="text-2xl font-bold text-rose-400">{validationResults.errors.length}</div>
                  <div className="text-sm text-slate-400">Errors</div>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/30 p-4">
                  <div className="text-2xl font-bold text-amber-400">{validationResults.warnings.length}</div>
                  <div className="text-sm text-slate-400">Warnings</div>
                </Card>
              </div>

              {validationResults.errors.length > 0 && (
                <Card className="bg-rose-500/5 border-rose-500/30 p-4">
                  <h4 className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Validation Errors
                  </h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {validationResults.errors.slice(0, 50).map((err, i) => (
                        <div key={i} className="text-xs text-slate-300">
                          Row {err.row}: {err.message} ({err.field})
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}

              {validationResults.warnings.length > 0 && (
                <Card className="bg-amber-500/5 border-amber-500/30 p-4">
                  <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </h4>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {validationResults.warnings.slice(0, 50).map((warn, i) => (
                        <div key={i} className="text-xs text-slate-300">
                          Row {warn.row}: {warn.message} ({warn.field})
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}

              {validationResults.valid && (
                <Alert className="bg-emerald-500/10 border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <AlertDescription className="text-slate-300">
                    All validations passed! Ready to import {parsedData.length} records.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="border-[#2a3548]">
                  Back to Mapping
                </Button>
                <Button
                  onClick={performImport}
                  disabled={!validationResults.valid}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Start Import
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Import Progress */}
          {step === 4 && (
            <div className="space-y-4">
              {importing ? (
                <>
                  <Card className="bg-[#151d2e] border-[#2a3548] p-6">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Importing Data...</h3>
                      <Progress value={progress} className="h-2 mb-2" />
                      <p className="text-sm text-slate-400">{progress}% complete</p>
                    </div>
                  </Card>
                </>
              ) : importResults && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-emerald-500/10 border-emerald-500/30 p-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-emerald-400">{importResults.success}</div>
                      <div className="text-sm text-slate-400">Successfully Imported</div>
                    </Card>
                    <Card className="bg-rose-500/10 border-rose-500/30 p-6 text-center">
                      <XCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-rose-400">{importResults.failed}</div>
                      <div className="text-sm text-slate-400">Failed</div>
                    </Card>
                  </div>

                  {importResults.errors.length > 0 && (
                    <Card className="bg-rose-500/5 border-rose-500/30 p-4">
                      <h4 className="text-sm font-semibold text-rose-400 mb-2">Import Errors</h4>
                      <ScrollArea className="h-[150px]">
                        <div className="space-y-2">
                          {importResults.errors.map((err, i) => (
                            <div key={i} className="text-xs text-slate-300">
                              Batch {err.batch}: {err.message}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetImport} className="border-[#2a3548]">
                      Import More
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="bg-blue-600 hover:bg-blue-700">
                      Done
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}