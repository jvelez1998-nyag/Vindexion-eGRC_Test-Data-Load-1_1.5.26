import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export async function enrichEntity(entityType, entity, relatedData = {}) {
  try {
    const missingFields = identifyMissingFields(entityType, entity);
    
    if (missingFields.length === 0) {
      return { hasEnrichments: false, suggestions: [] };
    }

    const prompt = buildEnrichmentPrompt(entityType, entity, missingFields, relatedData);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          enrichments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                suggested_value: {},
                confidence: { type: "string" },
                reasoning: { type: "string" },
                source: { type: "string" }
              }
            }
          },
          threat_intelligence: { type: "object" },
          related_entities: { type: "array" }
        }
      }
    });

    return {
      hasEnrichments: true,
      suggestions: response.enrichments || [],
      threatIntel: response.threat_intelligence,
      relatedEntities: response.related_entities
    };
  } catch (error) {
    console.error("Enrichment error:", error);
    return { hasEnrichments: false, suggestions: [] };
  }
}

function identifyMissingFields(entityType, entity) {
  const fieldRequirements = {
    risk: ['threat_actor', 'attack_vector', 'mitre_attack_techniques', 'data_classification', 'regulatory_impact'],
    control: ['implementation_guidance', 'testing_procedures', 'evidence_requirements', 'automation_opportunity'],
    incident: ['threat_actor', 'attack_vector', 'indicators_of_compromise', 'lessons_learned', 'related_cves'],
    vendor: ['industry_sector', 'data_processing_locations', 'security_certifications', 'breach_history']
  };

  const required = fieldRequirements[entityType.toLowerCase()] || [];
  return required.filter(field => !entity[field] || entity[field] === '' || (Array.isArray(entity[field]) && entity[field].length === 0));
}

function buildEnrichmentPrompt(entityType, entity, missingFields, relatedData) {
  const entityInfo = JSON.stringify({
    title: entity.risk_title || entity.control_name || entity.incident_title || entity.vendor_name,
    description: entity.description || entity.incident_description,
    category: entity.category || entity.risk_category || entity.vendor_type,
    severity: entity.severity || entity.criticality,
    current_data: entity
  }, null, 2);

  const relatedInfo = JSON.stringify({
    related_risks: (relatedData.risks || []).slice(0, 5),
    related_controls: (relatedData.controls || []).slice(0, 5),
    related_incidents: (relatedData.incidents || []).slice(0, 3)
  }, null, 2);

  return `You are a cybersecurity and GRC data enrichment AI. Analyze this ${entityType} and suggest values for missing fields using threat intelligence, industry knowledge, and contextual analysis.

ENTITY DATA:
${entityInfo}

RELATED ORGANIZATIONAL DATA:
${relatedInfo}

MISSING FIELDS TO ENRICH: ${missingFields.join(', ')}

For each missing field, provide:
1. suggested_value: The recommended value (string, array, or object as appropriate)
2. confidence: "high", "medium", or "low"
3. reasoning: Brief explanation of why this value is suggested
4. source: Where the information comes from (e.g., "MITRE ATT&CK", "NIST", "Threat Intelligence", "Contextual Analysis")

SPECIFIC GUIDANCE:
- threat_actor: Identify likely threat actor groups based on attack patterns (APT groups, ransomware gangs, etc.)
- attack_vector: Common attack vectors (phishing, RCE, credential theft, supply chain, etc.)
- mitre_attack_techniques: MITRE ATT&CK technique IDs (e.g., T1566.001, T1078)
- related_cves: Relevant CVE IDs if applicable
- indicators_of_compromise: IP addresses, file hashes, domains (if incident)
- automation_opportunity: Whether control can be automated and how
- security_certifications: Common certifications (SOC 2, ISO 27001, etc.)
- breach_history: Known security incidents involving entity

Also provide:
- threat_intelligence: Current threat landscape context
- related_entities: Suggested links to other risks, controls, or frameworks

Return structured JSON with enrichments array.`;
}

export function useDataEnrichment() {
  const [enriching, setEnriching] = useState(false);

  const enrichBatch = async (entityType, entities, relatedData) => {
    setEnriching(true);
    const results = [];

    try {
      for (const entity of entities.slice(0, 10)) {
        const result = await enrichEntity(entityType, entity, relatedData);
        if (result.hasEnrichments) {
          results.push({ entity, ...result });
        }
      }

      if (results.length > 0) {
        toast.success(`Found enrichment suggestions for ${results.length} items`);
      } else {
        toast.info("No enrichment opportunities found");
      }

      return results;
    } catch (error) {
      console.error("Batch enrichment error:", error);
      toast.error("Enrichment failed");
      return [];
    } finally {
      setEnriching(false);
    }
  };

  return { enrichBatch, enriching };
}