import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Import, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Seme } from "@/lib/db-types";

type ImportExportButtonsProps = {
  semes: Seme[];
  onImport: (importedSemes: any[]) => Promise<void>;
};

export function ImportExportButtons({ semes, onImport }: ImportExportButtonsProps) {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    // Create a JSON file for download
    const dataStr = JSON.stringify(semes, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `contract-semes-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => handleFileSelect(e as any);
    input.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      // Validate the imported data
      if (!Array.isArray(importedData)) {
        throw new Error('Imported data must be an array');
      }
      
      // Check if each item has the required fields
      const isValid = importedData.every(item => 
        typeof item.seme === 'string' && 
        item.seme.startsWith('+') &&
        typeof item.category === 'string' &&
        typeof item.description === 'string'
      );
      
      if (!isValid) {
        throw new Error('Some items in the imported data are missing required fields or have invalid format');
      }
      
      await onImport(importedData);
      
      toast({
        title: "Import successful",
        description: `Imported ${importedData.length} semes`,
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "There was an error importing the file",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset the file input if we're using a ref
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
        {isImporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Import className="mr-2 h-4 w-4" />
            Import
          </>
        )}
      </Button>
      <Button variant="outline" onClick={handleExport} disabled={semes.length === 0}>
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        accept=".json"
        onChange={handleFileSelect}
      />
    </div>
  );
}