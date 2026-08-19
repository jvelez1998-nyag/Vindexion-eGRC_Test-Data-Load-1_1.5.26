import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InviteUserDialog({ open, onOpenChange }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Note: In a real implementation, this would call an API endpoint to send the invite
    // For now, we'll just show a success message
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail("");
      setRole("user");
      onOpenChange(false);
    }, 2000);
  };

  const handleClose = (isOpen) => {
    if (!isOpen) {
      setSent(false);
      setEmail("");
      setRole("user");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400" />
            Invite New User
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Send an invitation email to add a new user to the platform
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">Invitation Sent!</h3>
                <p className="text-sm text-slate-400">The user will receive an email with instructions to join.</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <Alert className="bg-blue-500/10 border-blue-500/20">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300 text-sm">
                Users must be invited via the platform's invite system. They cannot be created directly.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={role} onValueChange={setRole}>
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
                {role === 'admin' 
                  ? 'Administrators have full access to all features' 
                  : 'Standard users have limited permissions'}
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)} className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}