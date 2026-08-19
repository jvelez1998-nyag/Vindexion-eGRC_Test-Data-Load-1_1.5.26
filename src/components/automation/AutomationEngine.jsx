import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AutomationEngine() {
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.AutomationRule.list()
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-tasks'] });
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AutomationRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    }
  });

  const executeAutomation = async (ruleId, triggerData, triggerType) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || !rule.is_enabled) return;

    try {
      // Create automation task
      const taskData = {
        title: `${rule.action_type.replace(/_/g, ' ')}: ${triggerData.title || triggerData.item || 'Auto-generated'}`,
        description: `Automatically created by rule: ${rule.name}\n\nTrigger: ${triggerType}\n\nDetails: ${JSON.stringify(triggerData, null, 2)}`,
        task_type: mapActionToTaskType(rule.action_type),
        trigger_source: triggerType,
        trigger_data: triggerData,
        priority: rule.priority_level,
        status: rule.auto_assign_to ? 'assigned' : 'pending',
        assigned_to: rule.auto_assign_to,
        automation_rule_id: ruleId,
        due_date: calculateDueDate(rule.priority_level)
      };

      await createTaskMutation.mutateAsync(taskData);

      // Update rule execution stats
      await updateRuleMutation.mutateAsync({
        id: ruleId,
        data: {
          execution_count: (rule.execution_count || 0) + 1,
          last_executed: new Date().toISOString()
        }
      });

      toast.success(`Automation triggered: ${rule.name}`);
    } catch (error) {
      console.error('Automation execution failed:', error);
    }
  };

  const mapActionToTaskType = (actionType) => {
    const mapping = {
      'create_task': 'documentation_creation',
      'initiate_assessment': 'risk_assessment',
      'assign_review': 'control_review',
      'create_documentation_request': 'documentation_creation',
      'send_notification': 'compliance_check'
    };
    return mapping[actionType] || 'documentation_creation';
  };

  const calculateDueDate = (priority) => {
    const days = {
      critical: 3,
      high: 7,
      medium: 14,
      low: 30
    };
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (days[priority] || 14));
    return dueDate.toISOString().split('T')[0];
  };

  // Expose executeAutomation globally for other components to use
  useEffect(() => {
    window.executeAutomation = executeAutomation;
    return () => {
      delete window.executeAutomation;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules]);

  return null; // This is a background service component
}