import Layout from "@/components/Layout";
import { MapPin, Phone } from "lucide-react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const Contact = () => {
  useDocumentTitle('Contact');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLSezT6XKZq1kDIJa1G3k2HDgur_E7gMhZ2JdAjy5ermn8wvRyA/viewform?embedded=true" 
                width="100%" 
                height="800" 
                frameBorder="0" 
                marginHeight={0} 
                marginWidth={0}
                title="Contact Form"
                className="min-h-[800px] w-full"
                style={{ display: 'block' }}
              >
                Loading…
              </iframe>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Our Location</h2>
              <div className="flex items-start space-x-3 mb-6">
                <MapPin className="h-5 w-5 text-[#0EA5E9] flex-shrink-0 mt-1" />
                <p className="text-gray-700">6/11 York St Sydney, Australia</p>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Number</h2>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#0EA5E9] flex-shrink-0" />
                <a href="tel:+61405429512" className="text-gray-700 hover:text-[#0EA5E9] transition-colors">
                  +61 405 429 512
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact; 