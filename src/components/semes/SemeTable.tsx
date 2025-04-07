import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import type { Seme } from "@/lib/db-types";

type SemeTableProps = {
  semes: Seme[];
  onSemeDeleted: () => void;
};

export function SemeTable({ semes, onSemeDeleted }: SemeTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deletingSemeId, setDeletingSemeId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingSemeId(id);
    try {
      await fine.table("semes").delete().eq("id", id);
      toast({
        title: "Seme deleted",
        description: "The seme has been successfully deleted.",
      });
      onSemeDeleted();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the seme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingSemeId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Seme</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden lg:table-cell">Clauses</TableHead>
            <TableHead className="hidden xl:table-cell">Metadata Fields</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {semes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No semes found. Add your first seme to get started.
              </TableCell>
            </TableRow>
          ) : (
            semes.map((seme) => (
              <TableRow key={seme.id}>
                <TableCell className="font-medium">{seme.seme}</TableCell>
                <TableCell>
                  <Badge variant="outline">{seme.category}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                  {seme.description}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {seme.clauses.map((clause, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {clause}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {seme.metadataFields.map((field, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/edit-seme/${seme.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <DeleteConfirmDialog
                      semeName={seme.seme}
                      onDelete={() => handleDelete(seme.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}