import Layout from "@/components/Layout";
import { Phone, MessageSquare, Calendar, CheckCircle } from "lucide-react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { PHONE_NUMBER, PHONE_NUMBER_RAW } from "@/constants/contactInfo";

const Contact = () => {
  useDocumentTitle('Contact');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">We're here to support you every step of the way</p>
        </div>

        {/* Primary Call CTA - styled similar to ServiceDetail */}
        <div className="mb-10 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Need assistance with our services?</h2>
              <p className="mb-4 text-blue-100">Our team is ready to help you get the support you need. Reach out today!</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200" />
                  <span className="text-sm">Quick response within 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200" />
                  <span className="text-sm">NDIS registered provider</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200" />
                  <span className="text-sm">Experienced, qualified staff</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-6">
              <a 
                href={`tel:${PHONE_NUMBER_RAW}`}
                className="block w-full md:w-auto px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-center"
              >
                Call {PHONE_NUMBER}
              </a>
              <div className="flex items-center justify-center gap-4 mt-3 text-sm text-blue-100">
                <a href={`tel:${PHONE_NUMBER_RAW}`} className="flex items-center gap-1 hover:text-white">
                  <Phone className="h-3 w-3" /> Call Now
                </a>
                <a href="#contact-form" className="flex items-center gap-1 hover:text-white">
                  <MessageSquare className="h-3 w-3" /> Message Us
                </a>
                <a href="#contact-form" className="flex items-center gap-1 hover:text-white">
                  <Calendar className="h-3 w-3" /> Schedule
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form in full width */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden" id="contact-form">
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
        
        {/* Additional information box */}
        <div className="mt-10 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">When to expect our response</h2>
          <p className="text-gray-700 mb-4">
            We aim to respond to all inquiries within 24 hours during business days. For urgent matters, 
            please call us directly at <a href={`tel:${PHONE_NUMBER_RAW}`} className="text-blue-600 hover:underline">{PHONE_NUMBER}</a>.
          </p>
          <p className="text-gray-700">
            Our office hours are Monday to Friday, 9am to 5pm AEST. We look forward to assisting you with your needs.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact; 