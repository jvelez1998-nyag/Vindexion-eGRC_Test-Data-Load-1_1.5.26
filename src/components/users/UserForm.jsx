import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function UserForm({ open, onOpenChange, user, onSubmit, isSubmitting, currentUserId }) {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "user"
  });

  useEffect(() => {
    if (open && user) {
      setFormData({
        full_name: user.full_name || "",
        role: user.role || "user"
      });
    } else if (open) {
      setFormData({
        full_name: "",
        role: "user"
      });
    }
  }, [open, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditingSelf = user?.id === currentUserId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit User Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {isEditingSelf && (
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300 text-sm">
                You are editing your own account. Be careful when changing your role.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={user?.email || ""} 
              disabled
              className="bg-[#151d2e] border-[#2a3548] text-slate-500"
            />
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input 
              id="full_name" 
              value={formData.full_name} 
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Enter full name"
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={formData.role} onValueChange={(v) => handleChange("role", v)}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="user" className="text-white hover:bg-[#2a3548]">
                  Standard User
                </SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-[#2a3548]">
                  Administrator
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {formData.role === 'admin' 
                ? 'Full access to all features and user management' 
                : 'Standard access with limited permissions'}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}