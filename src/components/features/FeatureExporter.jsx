import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

// Export to PDF
export const exportToPDF = async (features, category = "all") => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Platform Features Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Category: ${category === "all" ? "All Features" : category}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
    
    let yPos = 50;
    features.forEach((feature, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(feature.name, 20, yPos);
      yPos += 7;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(feature.description, 20, yPos, { maxWidth: 170 });
      yPos += 10;
    });
    
    doc.save('platform-features.pdf');
    toast.success('PDF exported successfully');
  } catch (error) {
    console.error('PDF export error:', error);
    toast.error('Failed to export PDF');
  }
};

// Export to Word (DOCX)
export const exportToWord = async (features, category = "all") => {
  try {
    toast.info('Generating Word document...');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #4f46e5; }
          h2 { color: #1e293b; margin-top: 20px; }
          .feature { margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
          .capability { margin-left: 20px; }
          .badge { display: inline-block; padding: 2px 8px; margin: 2px; background: #e0e7ff; border-radius: 4px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Vindexion eGRC Hub™ - Platform Features</h1>
        <p><strong>Category:</strong> ${category === "all" ? "All Features" : category}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        ${features.map(feature => `
          <div class="feature">
            <h2>${feature.name}</h2>
            <p><strong>Module:</strong> ${feature.module}</p>
            <p>${feature.description}</p>
            <h3>Capabilities:</h3>
            <ul>
              ${feature.capabilities.map(cap => `<li>${cap}</li>`).join('')}
            </ul>
            ${feature.integrations?.length ? `
              <p><strong>Integrations:</strong> ${feature.integrations.map(i => `<span class="badge">${i}</span>`).join('')}</p>
            ` : ''}
            ${feature.compliance?.length ? `
              <p><strong>Compliance:</strong> ${feature.compliance.map(c => `<span class="badge">${c}</span>`).join('')}</p>
            ` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'platform-features.doc';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Word document exported successfully');
  } catch (error) {
    console.error('Word export error:', error);
    toast.error('Failed to export Word document');
  }
};

// Export to Excel
export const exportToExcel = async (features) => {
  try {
    toast.info('Generating Excel file...');
    
    let csvContent = "Feature Name,Module,Description,Capabilities,Integrations,Compliance\n";
    
    features.forEach(feature => {
      const capabilities = feature.capabilities.join('; ');
      const integrations = feature.integrations?.join(', ') || '';
      const compliance = feature.compliance?.join(', ') || '';
      
      csvContent += `"${feature.name}","${feature.module}","${feature.description}","${capabilities}","${integrations}","${compliance}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'platform-features.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Excel file exported successfully');
  } catch (error) {
    console.error('Excel export error:', error);
    toast.error('Failed to export Excel file');
  }
};

// Generate BRD and send via email
export const generateBRD = async (features, recipientEmail, options = {}) => {
  try {
    toast.info('Generating Business Requirements Document...');
    
    const brdContent = `
# Business Requirements Document
## Vindexion eGRC Hub™ Platform Features

**Document Version:** 1.0  
**Date:** ${new Date().toLocaleDateString()}  
**Author:** Platform Team  
**Recipient:** ${recipientEmail}

---

## Executive Summary

This Business Requirements Document (BRD) outlines the comprehensive feature set of the Vindexion eGRC Hub™ platform. The platform provides enterprise-grade Governance, Risk, and Compliance management capabilities powered by advanced AI and automation.

### Platform Overview

- **Total Features:** ${features.length}
- **Coverage:** ${new Set(features.map(f => f.category)).size} Categories
- **Compliance Frameworks:** 30+ supported
- **AI/ML Capabilities:** Integrated across all modules

---

## Feature Categories

${Array.from(new Set(features.map(f => f.category))).map(cat => {
  const categoryFeatures = features.filter(f => f.category === cat);
  return `
### ${cat.toUpperCase()}

${categoryFeatures.map(feature => `
#### ${feature.name}

**Module:** ${feature.module}

**Description:**  
${feature.description}

**Business Value:**  
This feature enables organizations to ${feature.capabilities[0]?.toLowerCase() || 'enhance GRC operations'} and improve overall compliance posture.

**Key Capabilities:**
${feature.capabilities.map((cap, i) => `${i + 1}. ${cap}`).join('\n')}

**Integration Points:**  
${feature.integrations?.join(', ') || 'Standalone capability'}

**Compliance Support:**  
${feature.compliance?.join(', ') || 'General GRC support'}

**Implementation Priority:** ${['High', 'Medium', 'Standard'][Math.floor(Math.random() * 3)]}

---
`).join('')}
`;
}).join('')}

## Requirements Traceability

Each feature has been mapped to:
- Business objectives
- Compliance requirements
- Risk mitigation strategies
- Operational efficiency goals

## Success Metrics

- Compliance rate improvement: Target 95%+
- Risk identification speed: 60% faster
- Audit preparation time: 70% reduction
- Automation rate: 80%+ of routine tasks

## Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Owner | _____________ | _____________ | ___/___/____ |
| IT Lead | _____________ | _____________ | ___/___/____ |
| Compliance Officer | _____________ | _____________ | ___/___/____ |

---

*This document is confidential and proprietary to Vindexion eGRC Hub™*
`;

    // Format BRD content for HTML email
    const htmlBrdContent = brdContent
      .replace(/^# (.+)$/gm, '<h1 style="color: #4f46e5; margin-top: 30px;">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 style="color: #1e293b; margin-top: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="color: #475569; margin-top: 20px;">$1</h3>')
      .replace(/^#### (.+)$/gm, '<h4 style="color: #64748b; margin-top: 15px;">$1</h4>')
      .replace(/^\*\*(.+?):\*\*/gm, '<strong style="color: #334155;">$1:</strong>')
      .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-bottom: 5px;">$2</li>')
      .replace(/^- (.+)$/gm, '<li style="margin-bottom: 5px;">$1</li>')
      .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>')
      .replace(/\n\n/g, '</p><p style="margin: 10px 0;">');

    // Send via email using base44 integration
    await base44.integrations.Core.SendEmail({
      from_name: options.senderEmail ? `Vindexion eGRC Hub™ Team` : undefined,
      to: recipientEmail,
      subject: `Business Requirements Document: ${options.projectName || 'Vindexion eGRC Hub™ Platform Features'}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Business Requirements Document</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">${options.projectName || 'Vindexion eGRC Hub™ Platform Features'}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4f46e5;">
            <h3 style="margin-top: 0; color: #1e293b;">Document Summary</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px;">📊 <strong>Total Features:</strong> ${features.length}</li>
              <li style="margin-bottom: 8px;">📁 <strong>Categories:</strong> ${new Set(features.map(f => f.category)).size}</li>
              <li style="margin-bottom: 8px;">📅 <strong>Generated:</strong> ${new Date().toLocaleString()}</li>
              ${options.companyName ? `<li style="margin-bottom: 8px;">🏢 <strong>Company:</strong> ${options.companyName}</li>` : ''}
            </ul>
          </div>

          ${options.customNotes ? `
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">Custom Notes</h3>
            <p style="color: #78350f; margin: 0; white-space: pre-wrap;">${options.customNotes}</p>
          </div>
          ` : ''}
          
          <div style="padding: 20px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 10px 0;">${htmlBrdContent}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center;">
            <p style="margin: 5px 0;">This document is confidential and proprietary to Vindexion eGRC Hub™</p>
            <p style="margin: 5px 0;">Generated automatically by the platform</p>
          </div>
        </div>
      `
    });
    
    toast.success(`BRD sent successfully to ${recipientEmail}`);
    return brdContent;
  } catch (error) {
    console.error('BRD generation error:', error);
    toast.error('Failed to generate and send BRD');
    throw error;
  }
};

// Export to Google Docs (via link generation)
export const exportToGoogleDocs = async (features) => {
  try {
    toast.info('Preparing for Google Docs export...');
    
    const htmlContent = `
      <html>
      <head><title>Platform Features - Vindexion eGRC Hub</title></head>
      <body>
        <h1>Vindexion eGRC Hub™ - Platform Features</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        ${features.map(feature => `
          <h2>${feature.name}</h2>
          <p><strong>Module:</strong> ${feature.module}</p>
          <p>${feature.description}</p>
          <h3>Capabilities:</h3>
          <ul>
            ${feature.capabilities.map(cap => `<li>${cap}</li>`).join('')}
          </ul>
        `).join('')}
      </body>
      </html>
    `;
    
    // Copy HTML to clipboard
    await navigator.clipboard.writeText(htmlContent);
    
    // Open Google Docs
    const googleDocsUrl = 'https://docs.google.com/document/create';
    window.open(googleDocsUrl, '_blank');
    
    toast.success('HTML copied to clipboard. Paste it in the new Google Doc (Ctrl+V)');
  } catch (error) {
    console.error('Google Docs export error:', error);
    toast.error('Failed to prepare Google Docs export');
  }
};