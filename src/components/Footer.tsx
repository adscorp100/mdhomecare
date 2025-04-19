import { Link } from "react-router-dom";
import { Phone, MapPin, Wrench } from "lucide-react";
import { PHONE_NUMBER, PHONE_NUMBER_RAW, ADDRESS } from "@/constants/contactInfo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img src="/logo.svg" alt="MD Homecare Logo" className="h-6 mr-2" />
              <h3 className="text-xl font-semibold text-[#0EA5E9]">MD Homecare</h3>
            </div>
            <p className="mb-4 text-gray-300">Providing compassionate and professional home care services to enhance the quality of life for our clients.</p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#0EA5E9] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-[#0EA5E9] transition-colors">Services</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-[#0EA5E9] transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-[#0EA5E9] transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          {/* Tools */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#0EA5E9]" />
              Tools
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tools/ndis-eligibility-checker" className="text-gray-300 hover:text-[#0EA5E9] transition-colors">
                  NDIS Eligibility Checker
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-gray-300 hover:text-[#0EA5E9] transition-colors">
                  All Tools
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone size={20} className="flex-shrink-0 text-[#0EA5E9]" />
                <a href={`tel:${PHONE_NUMBER_RAW}`} className="text-gray-300 hover:text-[#0EA5E9] transition-colors">{PHONE_NUMBER}</a>
              </li>
              <li className="mt-4">
                <Link to="/contact" className="inline-block px-4 py-2 bg-[#0EA5E9] text-white rounded hover:bg-[#0c8bc7] transition-colors">
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>© {currentYear} MD Homecare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 