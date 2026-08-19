import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Shield, AlertTriangle, Target, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ASSESSMENT_TYPES = [
  { value: "application", label: "Application Security Assessment" },
  { value: "infrastructure", label: "Infrastructure Assessment" },
  { value: "cloud", label: "Cloud Security Assessment" },
  { value: "api", label: "API Security Assessment" },
  { value: "mobile", label: "Mobile App Assessment" }
];

export default function AIThreatVulnAssessment() {
  const [assessmentType, setAssessmentType] = useState("");
  const [targetDetails, setTargetDetails] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAssessment = async () => {
    if (!assessmentType || !targetDetails) {
      toast.error("Please provide assessment type and target details");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const selectedType = ASSESSMENT_TYPES.find(t => t.value === assessmentType);
      
      const prompt = `Conduct a comprehensive ${selectedType.label} with AI-powered analysis.

TARGET DETAILS:
${targetDetails}

Provide a detailed assessment report with the following structure:

## Executive Summary
High-level overview of security posture and critical findings.

## Vulnerability Assessment
### Critical Vulnerabilities
List and describe critical security issues found.

### High-Risk Vulnerabilities
Medium to high severity issues.

### Information Gathering Findings
Reconnaissance and enumeration results.

## Threat Analysis
### STRIDE Threat Model
Apply STRIDE categories to identify threats:
- Spoofing
- Tampering
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

### Attack Surface Analysis
Identify exposed attack surfaces and entry points.

### Exploitation Scenarios
Describe realistic attack scenarios.

## Risk Scoring & Prioritization
Assign CVSS scores and prioritize vulnerabilities based on:
- Exploitability
- Impact
- Business context
- Likelihood

## Remediation Roadmap
### Immediate Actions (0-7 days)
Critical fixes needed right away.

### Short-term (1-30 days)
Important security improvements.

### Long-term (30+ days)
Strategic security enhancements.

## Security Recommendations
### Technical Controls
Specific technical controls to implement.

### Process Improvements
Security process enhancements.

### Policy Updates
Required policy changes.

## Compliance Considerations
Relevant compliance frameworks and requirements.

## Metrics & KPIs
Key security metrics to track post-remediation.

Provide actionable, specific guidance based on industry best practices.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setResults(response);
      toast.success("Assessment completed");
    } catch (error) {
      console.error(error);
      toast.error("Assessment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            AI-Powered Vulnerability Assessment
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Comprehensive security assessment with AI-driven threat analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Assessment Type</label>
            <Select value={assessmentType} onValueChange={setAssessmentType}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Select assessment type..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {ASSESSMENT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-white">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Target Details</label>
            <Textarea
              value={targetDetails}
              onChange={(e) => setTargetDetails(e.target.value)}
              placeholder="Describe the target system, application, or infrastructure to assess. Include technologies, frameworks, architecture, etc."
              className="bg-[#151d2e] border-[#2a3548] text-white min-h-[150px]"
            />
          </div>

          <Button
            onClick={runAssessment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Assessment...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run AI Assessment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactMarkdown
              className="prose prose-invert prose-sm max-w-none"
              components={{
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-white mt-6 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-400" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-white mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-slate-300 mb-3 leading-relaxed text-sm">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1 mb-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-slate-300 flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
                code: ({ inline, children }) => inline ? (
                  <code className="px-1.5 py-0.5 rounded bg-[#151d2e] text-indigo-400 text-xs">
                    {children}
                  </code>
                ) : (
                  <code className="block px-3 py-2 rounded bg-[#151d2e] text-slate-300 text-xs my-2 overflow-x-auto">
                    {children}
                  </code>
                )
              }}
            >
              {results}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}