import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function KRIRealTimeMonitor({ kris, risks, controls, onUpdate }) {
  const [monitoring, setMonitoring] = useState(true);

  useEffect(() => {
    if (!monitoring) return;

    const checkAndUpdate = async () => {
      try {
        for (const kri of kris) {
          if (kri.status !== 'active') continue;

          let newValue = kri.current_value;
          let shouldUpdate = false;

          // Auto-calculate based on linked entities
          if (kri.linked_risks?.length > 0) {
            const linkedRisks = kri.linked_risks
              .map(id => risks.find(r => r.id === id))
              .filter(Boolean);
            
            // Calculate aggregate risk score
            const avgRiskScore = linkedRisks.reduce((sum, r) => 
              sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / linkedRisks.length;
            
            if (kri.indicator_type === 'kri' && avgRiskScore !== newValue) {
              newValue = Math.round(avgRiskScore * 10) / 10;
              shouldUpdate = true;
            }
          }

          if (kri.linked_controls?.length > 0) {
            const linkedControls = kri.linked_controls
              .map(id => controls.find(c => c.id === id))
              .filter(Boolean);
            
            // Calculate average control effectiveness
            const avgEffectiveness = linkedControls.reduce((sum, c) => 
              sum + (c.effectiveness || 0), 0) / linkedControls.length;
            
            if (kri.indicator_type === 'kci' && avgEffectiveness !== newValue) {
              newValue = Math.round(avgEffectiveness * 10) / 10;
              shouldUpdate = true;
            }
          }

          if (shouldUpdate) {
            // Calculate new traffic light status
            const { threshold_green, threshold_amber, direction } = kri;
            let newStatus;
            
            if (direction === "lower_better") {
              if (newValue <= threshold_green) newStatus = "green";
              else if (newValue <= threshold_amber) newStatus = "amber";
              else newStatus = "red";
            } else {
              if (newValue >= threshold_green) newStatus = "green";
              else if (newValue >= threshold_amber) newStatus = "amber";
              else newStatus = "red";
            }

            // Update historical data
            const historicalData = kri.historical_data || [];
            historicalData.push({
              timestamp: new Date().toISOString(),
              value: newValue,
              status: newStatus
            });

            // Keep only last 90 days
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const filteredHistory = historicalData.filter(h => 
              new Date(h.timestamp) > ninetyDaysAgo
            );

            await base44.entities.KeyIndicator.update(kri.id, {
              current_value: newValue,
              traffic_light_status: newStatus,
              historical_data: filteredHistory,
              last_updated: new Date().toISOString()
            });

            toast.success(`${kri.name} updated: ${newValue} (${newStatus})`);
            onUpdate?.();
          }
        }
      } catch (error) {
        console.error("KRI monitoring error:", error);
      }
    };

    // Check immediately and then every 30 seconds
    checkAndUpdate();
    const interval = setInterval(checkAndUpdate, 30000);

    return () => clearInterval(interval);
  }, [monitoring, kris, risks, controls]);

  return null; // This is a monitoring component with no UI
}