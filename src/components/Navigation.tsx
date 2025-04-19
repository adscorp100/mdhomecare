import { Home, FileText, ListCheck, Mail, Menu, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const isMobile = useIsMobile();

  const NavLinks = () => (
    <>
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
        <Link to="/tools" className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Tools
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/blog" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Blog
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/contact" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Contact
        </Link>
      </Button>
    </>
  );

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[#0EA5E9] hover:text-[#0c8bc7]">
              <img src="/logo.svg" alt="MD Homecare Logo" className="h-8 w-8" />
              MD Homecare
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <NavLinks />
          </div>
          
          {/* Mobile Navigation - Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:max-w-none">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
