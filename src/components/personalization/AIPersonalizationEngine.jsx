import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export function useAIPersonalization(userEmail, data) {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    loadPreferences();
  }, [userEmail]);

  const loadPreferences = async () => {
    try {
      const prefs = await base44.entities.UserDashboardPreference.filter({ user_email: userEmail }, null, 1);
      if (prefs.length > 0) {
        setPreferences(prefs[0]);
      } else {
        const hasData = data && (
          (data.risks && data.risks.length > 0) ||
          (data.controls && data.controls.length > 0) ||
          (data.incidents && data.incidents.length > 0)
        );
        if (hasData) {
          await analyzeAndCreatePreferences();
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackInteraction = async (type, category, severity, entityId) => {
    if (!userEmail || !preferences) return;

    const interaction = {
      type,
      category,
      severity,
      entityId,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...(preferences.interaction_history || []), interaction].slice(-100);

    try {
      await base44.entities.UserDashboardPreference.update(preferences.id, {
        interaction_history: updatedHistory
      });
      
      if (updatedHistory.length % 50 === 0) {
        analyzeAndUpdatePreferences();
      }
    } catch (error) {
      console.error("Error tracking interaction:", error);
    }
  };

  const analyzeAndCreatePreferences = async () => {
    if (!data || !userEmail) return;

    try {
      const prompt = `Analyze this user's GRC platform data and create initial personalization preferences:

USER ROLE/CONTEXT:
- Email: ${userEmail}

AVAILABLE DATA:
- Risks: ${(data.risks || []).length} (${(data.risks || []).filter(r => r.severity === 'critical' || r.severity === 'high').length} high/critical)
- Controls: ${(data.controls || []).length}
- Incidents: ${(data.incidents || []).length}
- Compliance: ${(data.compliance || []).length}
- Audits: ${(data.audits || []).length}
- Vendors: ${(data.vendors || []).length}

Based on typical GRC user roles and the data distribution, suggest:
1. Focus areas (3-5 areas the user should prioritize)
2. Priority categories (risk types, compliance frameworks, control domains)
3. Recommended severity filter (critical/high/all based on data volume)
4. Initial AI suggestions (3-5 actionable items)

Response as JSON:
{
  "focus_areas": ["area1", "area2", "area3"],
  "priority_categories": ["category1", "category2"],
  "severity_preference": "high",
  "ai_suggestions": [
    {"type": "alert", "title": "...", "description": "...", "priority": "high", "action": "..."}
  ],
  "reasoning": "brief explanation of recommendations"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            focus_areas: { type: "array", items: { type: "string" } },
            priority_categories: { type: "array", items: { type: "string" } },
            severity_preference: { type: "string" },
            ai_suggestions: { type: "array" },
            reasoning: { type: "string" }
          }
        }
      });

      const newPrefs = await base44.entities.UserDashboardPreference.create({
        user_email: userEmail,
        focus_areas: response.focus_areas,
        priority_categories: response.priority_categories,
        severity_preference: response.severity_preference,
        ai_suggestions: response.ai_suggestions,
        interaction_history: [],
        last_analyzed: new Date().toISOString()
      });

      setPreferences(newPrefs);
      toast.success("AI personalization initialized");
    } catch (error) {
      console.error("Error creating preferences:", error);
    }
  };

  const analyzeAndUpdatePreferences = async () => {
    if (!preferences || !data) return;

    try {
      const interactions = preferences.interaction_history || [];
      const recentInteractions = interactions.slice(-50);

      const interactionSummary = {
        risk_interactions: recentInteractions.filter(i => i.type === 'risk').length,
        control_interactions: recentInteractions.filter(i => i.type === 'control').length,
        compliance_interactions: recentInteractions.filter(i => i.type === 'compliance').length,
        incident_interactions: recentInteractions.filter(i => i.type === 'incident').length,
        critical_focus: recentInteractions.filter(i => i.severity === 'critical').length,
        high_focus: recentInteractions.filter(i => i.severity === 'high').length,
        categories: [...new Set(recentInteractions.map(i => i.category).filter(Boolean))]
      };

      const prompt = `Analyze user behavior patterns and update dashboard personalization:

CURRENT PREFERENCES:
${JSON.stringify({
  focus_areas: preferences.focus_areas,
  priority_categories: preferences.priority_categories,
  severity_preference: preferences.severity_preference
})}

RECENT INTERACTION PATTERNS (Last 50 interactions):
${JSON.stringify(interactionSummary)}

CURRENT DATA STATE:
- Risks: ${(data.risks || []).length} (${(data.risks || []).filter(r => r.severity === 'critical').length} critical, ${(data.risks || []).filter(r => r.severity === 'high').length} high)
- Controls: ${(data.controls || []).length}
- Incidents: ${(data.incidents || []).length}
- Compliance: ${(data.compliance || []).length}

Based on user behavior, provide updated personalization:
1. Updated focus areas reflecting actual usage
2. Priority categories based on interaction patterns
3. Adjusted severity preference
4. New AI suggestions (5-7 actionable, personalized recommendations)
5. Widget priority order

Response as JSON:
{
  "focus_areas": ["area1", "area2", "area3"],
  "priority_categories": ["category1", "category2"],
  "severity_preference": "critical/high/all",
  "ai_suggestions": [
    {"type": "alert/task/insight", "title": "...", "description": "...", "priority": "critical/high/medium", "action": "...", "entity_type": "risk/control/etc"}
  ],
  "widget_order": ["widget1", "widget2", "widget3"],
  "insights": "brief summary of behavior patterns detected"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            focus_areas: { type: "array" },
            priority_categories: { type: "array" },
            severity_preference: { type: "string" },
            ai_suggestions: { type: "array" },
            widget_order: { type: "array" },
            insights: { type: "string" }
          }
        }
      });

      await base44.entities.UserDashboardPreference.update(preferences.id, {
        focus_areas: response.focus_areas,
        priority_categories: response.priority_categories,
        severity_preference: response.severity_preference,
        ai_suggestions: response.ai_suggestions,
        widget_order: response.widget_order,
        last_analyzed: new Date().toISOString()
      });

      setPreferences({
        ...preferences,
        ...response,
        last_analyzed: new Date().toISOString()
      });

      toast.success("Dashboard personalized based on your activity");
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  const getPrioritizedData = (dataArray, type) => {
    if (!preferences || !dataArray) return dataArray;

    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const userSeverityPref = preferences.severity_preference;

    let filtered = dataArray;

    if (userSeverityPref !== 'all') {
      filtered = dataArray.filter(item => {
        const itemSeverity = item.severity || item.criticality || item.priority;
        if (userSeverityPref === 'critical') return itemSeverity === 'critical';
        if (userSeverityPref === 'high') return itemSeverity === 'critical' || itemSeverity === 'high';
        return true;
      });
    }

    const priorityCategories = preferences.priority_categories || [];
    
    return filtered.sort((a, b) => {
      const aCategory = a.category || a.risk_category || a.type || '';
      const bCategory = b.category || b.risk_category || b.type || '';
      
      const aPriority = priorityCategories.includes(aCategory) ? 1 : 0;
      const bPriority = priorityCategories.includes(bCategory) ? 1 : 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;

      const aSeverity = severityOrder[a.severity || a.criticality || a.priority] || 0;
      const bSeverity = severityOrder[b.severity || b.criticality || b.priority] || 0;
      
      return bSeverity - aSeverity;
    });
  };

  return {
    preferences,
    loading,
    trackInteraction,
    analyzeAndUpdatePreferences,
    getPrioritizedData
  };
}