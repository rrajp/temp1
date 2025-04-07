import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { X, Plus, Loader2 } from "lucide-react";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Seme, SemeFormData } from "@/lib/db-types";

// Predefined categories
const PREDEFINED_CATEGORIES = [
  "Obligation",
  "Right",
  "Risk",
  "Condition",
  "Representation",
  "Warranty",
  "Definition",
  "Other"
];

// Form schema
const semeFormSchema = z.object({
  seme: z.string()
    .min(2, "Seme must be at least 2 characters")
    .refine(val => val.startsWith("+"), {
      message: "Seme must start with '+'"
    }),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  clauses: z.array(z.string()).optional().default([]),
  metadataFields: z.array(z.string()).optional().default([]),
});

type SemeFormProps = {
  initialData?: Seme;
  isEditing?: boolean;
};

export function SemeForm({ initialData, isEditing = false }: SemeFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClause, setNewClause] = useState("");
  const [newMetadataField, setNewMetadataField] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  // Initialize form with schema
  const form = useForm<z.infer<typeof semeFormSchema>>({
    resolver: zodResolver(semeFormSchema),
    defaultValues: {
      seme: initialData?.seme || "+",
      category: initialData?.category || "",
      description: initialData?.description || "",
      clauses: initialData?.clauses || [],
      metadataFields: initialData?.metadataFields || [],
    },
  });

  // Add a new clause
  const addClause = () => {
    if (!newClause.trim()) return;
    
    const currentClauses = form.getValues("clauses") || [];
    form.setValue("clauses", [...currentClauses, newClause.trim()]);
    setNewClause("");
  };

  // Remove a clause
  const removeClause = (index: number) => {
    const currentClauses = form.getValues("clauses") || [];
    form.setValue(
      "clauses",
      currentClauses.filter((_, i) => i !== index)
    );
  };

  // Add a new metadata field
  const addMetadataField = () => {
    if (!newMetadataField.trim()) return;
    
    const currentFields = form.getValues("metadataFields") || [];
    form.setValue("metadataFields", [...currentFields, newMetadataField.trim()]);
    setNewMetadataField("");
  };

  // Remove a metadata field
  const removeMetadataField = (index: number) => {
    const currentFields = form.getValues("metadataFields") || [];
    form.setValue(
      "metadataFields",
      currentFields.filter((_, i) => i !== index)
    );
  };

  // Add custom category
  const addCustomCategory = () => {
    if (!customCategory.trim()) return;
    form.setValue("category", customCategory.trim());
    setCustomCategory("");
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof semeFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      const semeData: SemeFormData = {
        seme: data.seme,
        category: data.category,
        description: data.description,
        clauses: data.clauses || [],
        metadataFields: data.metadataFields || [],
      };

      // Convert arrays to JSON strings for database storage
      const dbData = {
        ...semeData,
        clauses: JSON.stringify(semeData.clauses),
        metadataFields: JSON.stringify(semeData.metadataFields),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing && initialData) {
        // Update existing seme
        await fine.table("semes").update(dbData).eq("id", initialData.id);
        toast({
          title: "Seme updated",
          description: `${data.seme} has been updated successfully.`,
        });
      } else {
        // Create new seme
        await fine.table("semes").insert({
          ...dbData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        });
        toast({
          title: "Seme created",
          description: `${data.seme} has been created successfully.`,
        });
      }
      
      // Navigate back to dashboard
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save seme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="seme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seme</FormLabel>
                <FormControl>
                  <Input placeholder="+payment" {...field} />
                </FormControl>
                <FormDescription>
                  Must start with "+" (e.g., +payment, +termination)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="">Select a category</option>
                      {PREDEFINED_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </div>
                <FormDescription>
                  Select from predefined categories or add a custom one
                </FormDescription>
                <FormMessage />
                
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addCustomCategory}>
                    Add
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of this seme..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="clauses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clauses</FormLabel>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add clause (e.g., Payment Terms)"
                        value={newClause}
                        onChange={(e) => setNewClause(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addClause()}
                      />
                      <Button type="button" variant="outline" onClick={addClause}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((clause, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {clause}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeClause(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <FormDescription>
                  Add one or more clause types this seme is associated with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadataFields"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metadata Fields</FormLabel>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add metadata field (e.g., Net Payment Days)"
                        value={newMetadataField}
                        onChange={(e) => setNewMetadataField(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addMetadataField()}
                      />
                      <Button type="button" variant="outline" onClick={addMetadataField}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((metadataField, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {metadataField}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeMetadataField(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <FormDescription>
                  Add extractable structured fields associated with this seme
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Seme" : "Create Seme"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}