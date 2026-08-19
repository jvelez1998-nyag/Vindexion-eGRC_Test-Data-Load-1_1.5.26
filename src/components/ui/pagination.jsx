import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange 
}) {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1a2332] border-t border-[#2a3548]">
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-400">
          Showing <span className="text-white font-medium">{startItem}</span> to{" "}
          <span className="text-white font-medium">{endItem}</span> of{" "}
          <span className="text-white font-medium">{totalItems}</span> results
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Show:</span>
          <Select value={String(itemsPerPage)} onValueChange={(v) => onItemsPerPageChange(Number(v))}>
            <SelectTrigger className="w-[70px] h-8 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="10" className="text-white">10</SelectItem>
              <SelectItem value="25" className="text-white">25</SelectItem>
              <SelectItem value="50" className="text-white">50</SelectItem>
              <SelectItem value="100" className="text-white">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548] disabled:opacity-50"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548] disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              className="h-8 min-w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]"
            >
              1
            </Button>
            {startPage > 2 && <span className="text-slate-600 px-1">...</span>}
          </>
        )}

        {pages.map(page => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={page === currentPage 
              ? "h-8 min-w-8 bg-indigo-600 hover:bg-indigo-700 text-white"
              : "h-8 min-w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]"
            }
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-slate-600 px-1">...</span>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="h-8 min-w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548] disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548] disabled:opacity-50"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}