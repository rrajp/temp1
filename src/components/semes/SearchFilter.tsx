import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

type SearchFilterProps = {
  onSearch: (searchTerm: string) => void;
  onCategoryFilter: (category: string) => void;
  categories: string[];
};

export function SearchFilter({ onSearch, onCategoryFilter, categories }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="flex gap-2">
          <Input
            id="search"
            placeholder="Search by seme, description or clause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={clearSearch} disabled={!searchTerm}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
      <div className="w-full md:w-[200px]">
        <Label htmlFor="category-filter">Filter by Category</Label>
        <Select onValueChange={onCategoryFilter}>
          <SelectTrigger id="category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}