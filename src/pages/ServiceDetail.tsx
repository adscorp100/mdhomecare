import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import "./BlogPost.css"; // Reuse the same CSS for content formatting
import useDocumentTitle from "@/hooks/useDocumentTitle";

// Define the Service interface
interface Service {
  title: string;
  slug: string;
  description: string;
  content: string;
  image?: string;
  category: string;
  date: string;
}

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Set the document title with a placeholder while loading
  useDocumentTitle(service ? service.title : 'Service Details');

  useEffect(() => {
    if (slug) {
      // Fetch the specific service
      fetch(`/data/services/${slug}.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Service not found');
          }
          return response.json();
        })
        .then(data => {
          setService(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading service:', error);
          setError(true);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>Loading service details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !service) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/services" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Services
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Service not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/services" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        </div>
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{service.title}</h1>
            <div className="flex gap-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {service.category}
              </span>
            </div>
          </header>
          {service.image && (
            <div className="mb-8">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          <div 
            className="prose prose-lg max-w-none" 
            dangerouslySetInnerHTML={{ __html: service.content }}
          ></div>
          
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started Today</h2>
            <p className="mb-6">Ready to experience our professional services? Contact our team to learn more about how we can help you.</p>
            <div className="flex">
              <Link to="/contact" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default ServiceDetail; 