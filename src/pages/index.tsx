import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { SemeTable } from "@/components/semes/SemeTable";
import { SearchFilter } from "@/components/semes/SearchFilter";
import { ImportExportButtons } from "@/components/semes/ImportExportButtons";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import type { Seme } from "@/lib/db-types";

const Index = () => {
  const [semes, setSemes] = useState<Seme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  // Extract unique categories from semes
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    semes.forEach(seme => {
      if (seme.category) {
        uniqueCategories.add(seme.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [semes]);

  // Fetch semes from the database
  const fetchSemes = async () => {
    setIsLoading(true);
    try {
      const result = await fine.table("semes").select();
      
      if (result) {
        // Parse JSON strings back to arrays
        const parsedSemes = result.map(seme => ({
          ...seme,
          clauses: JSON.parse(seme.clauses || '[]'),
          metadataFields: JSON.parse(seme.metadataFields || '[]'),
          createdAt: new Date(seme.createdAt || Date.now()),
          updatedAt: new Date(seme.updatedAt || Date.now()),
        }));
        
        setSemes(parsedSemes);
      } else {
        setSemes([]);
      }
    } catch (error) {
      console.error("Error fetching semes:", error);
      toast({
        title: "Error",
        description: "Failed to load semes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle import
  const handleImport = async (importedSemes: any[]) => {
    try {
      // Prepare semes for database insertion
      const semesToInsert = importedSemes.map(seme => ({
        id: uuidv4(),
        seme: seme.seme,
        category: seme.category,
        description: seme.description,
        clauses: JSON.stringify(seme.clauses || []),
        metadataFields: JSON.stringify(seme.metadataFields || []),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Insert all semes
      await fine.table("semes").insert(semesToInsert);
      
      // Refresh the semes list
      fetchSemes();
      
    } catch (error) {
      console.error("Error importing semes:", error);
      throw new Error("Failed to import semes");
    }
  };

  // Filter semes based on search term and category
  const filteredSemes = useMemo(() => {
    return semes.filter(seme => {
      const matchesSearch = searchTerm === "" || 
        seme.seme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seme.clauses.some(clause => clause.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || seme.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [semes, searchTerm, categoryFilter]);

  // Load semes on component mount
  useEffect(() => {
    fetchSemes();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contract Semes Taxonomy</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize semantic primitives used in legal contracts
            </p>
          </div>
          <ImportExportButtons semes={semes} onImport={handleImport} />
        </div>
        
        <div className="space-y-6">
          <SearchFilter 
            onSearch={setSearchTerm} 
            onCategoryFilter={setCategoryFilter}
            categories={categories}
          />
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredSemes.length} of {semes.length} semes
                </p>
              </div>
              <SemeTable semes={filteredSemes} onSemeDeleted={fetchSemes} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Index;