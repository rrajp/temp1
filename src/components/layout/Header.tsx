import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Database, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";

export function Header() {
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();

  const handleLogout = async () => {
    await fine.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Database className="h-6 w-6" />
          <span className="text-xl">Contract Semes Taxonomy</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link to="/">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/add-seme">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Seme
            </Link>
          </Button>
          {session?.user && (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}