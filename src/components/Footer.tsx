import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";
import { PHONE_NUMBER, PHONE_NUMBER_RAW, ADDRESS } from "@/constants/contactInfo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="flex-shrink-0 text-[#0EA5E9]" />
                <span className="text-gray-300">{ADDRESS}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="flex-shrink-0 text-[#0EA5E9]" />
                <a href={`tel:${PHONE_NUMBER_RAW}`} className="text-gray-300 hover:text-[#0EA5E9] transition-colors">{PHONE_NUMBER}</a>
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