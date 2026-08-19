import { Button } from "@/components/ui/button";
import { usePermissions } from "./PermissionProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

export default function SecureActionButton({ 
  resource, 
  action, 
  children, 
  onClick, 
  variant = "default",
  className = "",
  size = "default",
  ...props 
}) {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(resource, action);

  if (!allowed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <Button 
                variant={variant}
                size={size}
                className={`${className} opacity-50 cursor-not-allowed`}
                disabled
                {...props}
              >
                <Lock className="h-3 w-3 mr-1" />
                {children}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-[#0f1623] border-rose-500/30">
            <p className="text-xs text-rose-400">Insufficient permissions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button 
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
}