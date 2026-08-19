import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function MFASetup({ open, onOpenChange, onComplete }) {
  const [step, setStep] = useState(1);
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    setStep(2);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success("Backup codes copied to clipboard");
  };

  const verifyMFA = () => {
    if (verificationCode.length === 6) {
      localStorage.setItem('mfa_enabled', 'true');
      toast.success("MFA enabled successfully");
      if (onComplete) onComplete();
      onOpenChange(false);
    } else {
      toast.error("Invalid verification code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Enable Multi-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Add an extra layer of security to your account. You'll need to enter a code from your authenticator app when signing in.
            </p>
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white">Benefits:</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>✓ Protect against unauthorized access</li>
                    <li>✓ Secure sensitive data</li>
                    <li>✓ Comply with security policies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Button onClick={generateBackupCodes} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Save these backup codes in a secure location. You can use them to access your account if you lose your device.
            </p>
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="text-emerald-400">{code}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button onClick={copyBackupCodes} variant="outline" className="flex-1 border-[#2a3548]">
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Enter a verification code from your authenticator app to complete setup.
            </p>
            <Input
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="bg-[#0f1623] border-[#2a3548] text-center text-2xl tracking-widest"
              maxLength={6}
            />
            <Button onClick={verifyMFA} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={verificationCode.length !== 6}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Enable MFA
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}