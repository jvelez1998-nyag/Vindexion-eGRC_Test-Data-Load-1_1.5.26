import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function ExportButton({ risks, compliance, controls, audits, incidents, assessments }) {
  const [exporting, setExporting] = useState(false);

  const downloadFile = (content, filename, type = 'text/plain') => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  const exportSummary = () => {
    setExporting(true);
    
    try {
    
    const openRisks = risks.filter(r => r.status !== 'closed').length;
    const criticalRisks = risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length;
    const compliantItems = compliance.filter(c => c.status === 'verified' || c.status === 'implemented').length;
    const complianceRate = compliance.length ? Math.round((compliantItems / compliance.length) * 100) : 0;
    const effectiveControls = controls.filter(c => c.status === 'effective').length;
    const totalFindings = audits.reduce((sum, a) => sum + (a.findings_count || 0), 0);

    const content = `GRC EXECUTIVE SUMMARY
Generated: ${new Date().toLocaleString()}

RISK SUMMARY
============
Total Risks: ${risks.length}
Open Risks: ${openRisks}
Critical Risks: ${criticalRisks}

COMPLIANCE STATUS
=================
Total Requirements: ${compliance.length}
Compliance Rate: ${complianceRate}%
Compliant Items: ${compliantItems}

CONTROLS OVERVIEW
=================
Total Controls: ${controls.length}
Effective Controls: ${effectiveControls}

AUDIT SUMMARY
=============
Total Audits: ${audits.length}
Total Findings: ${totalFindings}
Completed: ${audits.filter(a => a.status === 'completed').length}
`;

      downloadFile(content, 'grc-executive-summary.txt');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportCSV = (data, filename, headers) => {
    setExporting(true);
    
    try {
      if (!data || data.length === 0) {
        toast.warning('No data to export');
        setExporting(false);
        return;
      }
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
          const key = h.toLowerCase().replace(/ /g, '_');
          const value = row[key] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');
      
      downloadFile(csvContent, filename, 'text/csv');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('CSV export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    toast.info("Capturing dashboard for PDF...");
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      
      // Find all report cards on the page
      const reportElements = document.querySelectorAll('[data-report-card]');
      
      if (reportElements.length === 0) {
        toast.error("No report cards found on page");
        setExporting(false);
        return;
      }

      let currentY = margin;
      let isFirstPage = true;

      // Add header to first page
      pdf.setFontSize(18);
      pdf.setTextColor(99, 102, 241);
      pdf.text('GRC Platform Report', pageWidth / 2, currentY + 5, { align: 'center' });
      currentY += 12;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      
      // Process each report card
      for (let i = 0; i < reportElements.length; i++) {
        const element = reportElements[i];
        
        toast.info(`Processing card ${i + 1} of ${reportElements.length}...`);
        
        // Capture the element as canvas
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#1a2332',
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if we need a new page
        if (currentY + imgHeight > pageHeight - margin && !isFirstPage) {
          pdf.addPage();
          currentY = margin;
        }
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5;
        isFirstPage = false;
        
        // Add new page if we're close to the bottom
        if (currentY > pageHeight - 30 && i < reportElements.length - 1) {
          pdf.addPage();
          currentY = margin;
        }
      }
      
      // Add page numbers
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      pdf.save(`grc-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={exporting} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
        <DropdownMenuItem onClick={exportToPDF} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
          <FileText className="h-4 w-4 mr-2" />
          PDF Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportSummary} className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
          <FileText className="h-4 w-4 mr-2" />
          Text Summary
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => exportCSV(risks, 'risks.csv', ['Title', 'Category', 'Status', 'Likelihood', 'Impact', 'Owner'])}
          className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]"
        >
          <Table className="h-4 w-4 mr-2" />
          Risks CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => exportCSV(compliance, 'compliance.csv', ['Framework', 'Requirement', 'Status', 'Owner', 'Due_date'])}
          className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]"
        >
          <Table className="h-4 w-4 mr-2" />
          Compliance CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => exportCSV(controls, 'controls.csv', ['Name', 'Category', 'Domain', 'Status', 'Effectiveness'])}
          className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]"
        >
          <Table className="h-4 w-4 mr-2" />
          Controls CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => exportCSV(audits, 'audits.csv', ['Title', 'Type', 'Status', 'Findings_count', 'Critical_findings'])}
          className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]"
        >
          <Table className="h-4 w-4 mr-2" />
          Audits CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}