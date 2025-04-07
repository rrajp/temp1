import { Header } from "@/components/layout/Header";
import { SemeForm } from "@/components/semes/SemeForm";

const AddSeme = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Add New Seme</h1>
          <p className="text-muted-foreground mt-1">
            Create a new semantic primitive for your contract taxonomy
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <SemeForm />
        </div>
      </main>
    </div>
  );
};

export default AddSeme;