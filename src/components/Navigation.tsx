import { Home, FileText, ListCheck, Mail, Menu, Wrench, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PHONE_NUMBER, PHONE_NUMBER_RAW } from "@/constants/contactInfo";

const Navigation = () => {
  const isMobile = useIsMobile();

  const NavLinks = () => (
    <>
      <Button variant="ghost" asChild className="hover:bg-blue-50 transition-colors">
        <Link to="/" className="flex items-center gap-2 text-slate-700 hover:text-[#0EA5E9]">
          <Home className="h-[18px] w-[18px] stroke-[1.5px]" />
          <span className="font-medium">Home</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild className="hover:bg-blue-50 transition-colors">
        <Link to="/services" className="flex items-center gap-2 text-slate-700 hover:text-[#0EA5E9]">
          <ListCheck className="h-[18px] w-[18px] stroke-[1.5px]" />
          <span className="font-medium">Services</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild className="hover:bg-blue-50 transition-colors">
        <Link to="/tools" className="flex items-center gap-2 text-slate-700 hover:text-[#0EA5E9]">
          <Wrench className="h-[18px] w-[18px] stroke-[1.5px]" />
          <span className="font-medium">Tools</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild className="hover:bg-blue-50 transition-colors">
        <Link to="/blog" className="flex items-center gap-2 text-slate-700 hover:text-[#0EA5E9]">
          <FileText className="h-[18px] w-[18px] stroke-[1.5px]" />
          <span className="font-medium">Blog</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild className="hover:bg-blue-50 transition-colors">
        <Link to="/contact" className="flex items-center gap-2 text-slate-700 hover:text-[#0EA5E9]">
          <Mail className="h-[18px] w-[18px] stroke-[1.5px]" />
          <span className="font-medium">Contact</span>
        </Link>
      </Button>
    </>
  );

  return (
    <nav className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="MD Homecare Logo" className="h-9 w-9" />
                <span className="text-2xl font-bold text-[#0EA5E9] hover:text-[#0c8bc7] tracking-tight">MD Homecare</span>
              </div>
              <span className="text-xs font-medium text-slate-500 ml-11 -mt-1">Empowering Independence</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLinks />
            <Button 
              variant="default" 
              size="lg" 
              className="ml-4 bg-[#0EA5E9] hover:bg-[#0c8bc7] text-white font-medium px-6 rounded-md transition-colors duration-200" 
              asChild
            >
              <a href={`tel:${PHONE_NUMBER_RAW}`} className="flex items-center gap-2">
                <Phone className="h-[18px] w-[18px] stroke-[1.5px]" />
                <span className="font-semibold tracking-wide">{PHONE_NUMBER}</span>
              </a>
            </Button>
          </div>
          
          {/* Mobile Navigation - Hamburger Menu */}
          <div className="md:hidden flex items-center gap-4">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-[#0EA5E9] hover:bg-[#0c8bc7] text-white font-medium rounded-md transition-colors duration-200 w-10 h-10" 
              asChild
            >
              <a href={`tel:${PHONE_NUMBER_RAW}`} aria-label="Call us" className="flex items-center justify-center">
                <Phone className="h-[18px] w-[18px] stroke-[1.5px]" />
              </a>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                  <Menu className="h-6 w-6 text-slate-700" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:max-w-none">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                  <Button 
                    variant="default" 
                    className="mt-6 bg-[#0EA5E9] hover:bg-[#0c8bc7] text-white font-medium transition-colors duration-200 rounded-md" 
                    asChild
                  >
                    <a href={`tel:${PHONE_NUMBER_RAW}`} className="flex items-center gap-2 justify-center">
                      <Phone className="h-[18px] w-[18px] stroke-[1.5px]" />
                      <span className="font-semibold tracking-wide">{PHONE_NUMBER}</span>
                    </a>
                  </Button>
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
