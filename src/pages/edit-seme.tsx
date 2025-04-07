import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { SemeForm } from "@/components/semes/SemeForm";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import type { Seme } from "@/lib/db-types";

const EditSeme = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seme, setSeme] = useState<Seme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeme = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      setIsLoading(true);
      try {
        const result = await fine.table("semes").select().eq("id", id);
        
        if (result && result.length > 0) {
          // Parse JSON strings back to arrays
          const parsedSeme = {
            ...result[0],
            clauses: JSON.parse(result[0].clauses || '[]'),
            metadataFields: JSON.parse(result[0].metadataFields || '[]'),
            createdAt: new Date(result[0].createdAt || Date.now()),
            updatedAt: new Date(result[0].updatedAt || Date.now()),
          };
          
          setSeme(parsedSeme);
        } else {
          toast({
            title: "Error",
            description: "Seme not found",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching seme:", error);
        toast({
          title: "Error",
          description: "Failed to load seme details",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeme();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Seme</h1>
          <p className="text-muted-foreground mt-1">
            Update the details for {seme?.seme}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {seme && <SemeForm initialData={seme} isEditing={true} />}
        </div>
      </main>
    </div>
  );
};

export default EditSeme;