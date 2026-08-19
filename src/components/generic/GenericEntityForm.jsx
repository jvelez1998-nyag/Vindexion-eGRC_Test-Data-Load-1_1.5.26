import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GenericEntityForm({ 
  entity, 
  config,
  onSubmit, 
  onCancel 
}) {
  const [formData, setFormData] = useState(config.defaultValues || {});

  useEffect(() => {
    if (entity) {
      setFormData(entity);
    }
  }, [entity]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field) => {
    const value = formData[field.key];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <Input
            type={field.type}
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            className="bg-[#151d2e] border-[#2a3548] text-white"
            required={field.required}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            className="bg-[#151d2e] border-[#2a3548] text-white"
            rows={field.rows || 3}
            required={field.required}
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <Select 
            value={value || field.defaultValue} 
            onValueChange={(val) => setFormData({ ...formData, [field.key]: val })}
          >
            <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              {field.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={value || false}
              onCheckedChange={(checked) => setFormData({ ...formData, [field.key]: checked })}
            />
            <Label htmlFor={field.key} className="text-sm cursor-pointer">
              {field.checkboxLabel}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>
            {entity ? `Edit ${config.entityName}` : `Add ${config.entityName}`}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {config.fields.map((field, idx) => (
              <div key={idx} className={field.fullWidth ? 'col-span-2' : ''}>
                <Label className="text-slate-300 mb-2 block">
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-1">*</span>}
                </Label>
                {renderField(field)}
                {field.helpText && (
                  <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-4 border-t border-[#2a3548]">
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {entity ? 'Update' : 'Create'} {config.entityName}
              </Button>
              <Button type="button" onClick={onCancel} variant="outline" className="border-[#2a3548]">
                Cancel
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}