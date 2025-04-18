
import { Home, FileText, ListCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-[#0EA5E9] hover:text-[#0c8bc7]">
              MD Homecare
            </Link>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/services" className="flex items-center gap-2">
                <ListCheck className="h-4 w-4" />
                Services
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/blog" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
