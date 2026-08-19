import { usePermissions } from "./PermissionProvider";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PermissionGuard({ resource, action, children, fallback = null, showError = false }) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return <div className="animate-pulse bg-[#1a2332] h-20 rounded-lg" />;
  }

  const hasAccess = hasPermission(resource, action);

  if (!hasAccess) {
    if (showError) {
      return (
        <Card className="bg-[#1a2332] border-rose-500/20">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
            <p className="text-sm text-slate-400">
              You don't have permission to {action} {resource}.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Contact your administrator to request access.
            </p>
          </CardContent>
        </Card>
      );
    }
    return fallback;
  }

  return children;
}