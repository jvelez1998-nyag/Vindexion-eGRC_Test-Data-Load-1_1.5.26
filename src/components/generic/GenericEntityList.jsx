import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import GenericEntityCard from "./GenericEntityCard";

export default function GenericEntityList({
  entities,
  config,
  onAdd,
  onEdit,
  onDelete,
  onView,
  isLoading,
  emptyMessage = "No items found"
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});

  const filteredEntities = entities.filter(entity => {
    // Search filter
    const searchMatch = !searchQuery || 
      config.searchFields?.some(field => 
        entity[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Custom filters
    const filterMatch = Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true;
      return entity[key] === value;
    });

    return searchMatch && filterMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex flex-wrap gap-4">
          {config.enableSearch && (
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder={`Search ${config.entityName}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>
          )}

          {config.filters?.map((filter, idx) => (
            <Select 
              key={idx}
              value={filters[filter.key] || 'all'} 
              onValueChange={(value) => setFilters({ ...filters, [filter.key]: value })}
            >
              <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All {filter.label}</SelectItem>
                {filter.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {onAdd && (
            <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add {config.entityName}
            </Button>
          )}
        </div>

        <div className="mt-3 text-sm text-slate-400">
          {filteredEntities.length} {config.entityName}(s) found
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <div className="text-slate-400">Loading...</div>
        </Card>
      ) : filteredEntities.length === 0 ? (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <div className="text-slate-400">{emptyMessage}</div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntities.map(entity => (
            <GenericEntityCard
              key={entity.id}
              entity={entity}
              config={config.cardConfig}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}