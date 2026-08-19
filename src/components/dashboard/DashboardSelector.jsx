import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutDashboard } from "lucide-react";

export default function DashboardSelector({ dashboards, selected, onSelect }) {
  const safeDashboards = Array.isArray(dashboards) ? dashboards.filter(d => d) : [];
  
  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-[200px] bg-[#1a2332] border-[#2a3548] text-white">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <SelectValue placeholder="Select view" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
        <SelectItem value="default" className="text-white hover:bg-[#2a3548]">
          Default View
        </SelectItem>
        {safeDashboards.map(dashboard => (
          <SelectItem 
            key={dashboard.id} 
            value={dashboard.id}
            className="text-white hover:bg-[#2a3548]"
          >
            {dashboard.name.replace('Dashboard: ', '')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}