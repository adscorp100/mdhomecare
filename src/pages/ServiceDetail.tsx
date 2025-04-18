import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import "./BlogPost.css"; // Reuse the same CSS for content formatting
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { getSuburbInfo, resolveServiceSlug, localizeContent } from "@/lib/localize";

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

interface SuburbInfo {
  state: string;
  region: string;
}

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [suburbInfo, setSuburbInfo] = useState<SuburbInfo | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<{ baseSlug: string; suburb: string | null }>({ baseSlug: '', suburb: null });
  
  // Set the document title with a placeholder while loading
  useDocumentTitle(service ? service.title : 'Service Details');

  useEffect(() => {
    const loadService = async () => {
      if (slug) {
        try {
          // Use resolveServiceSlug to handle both direct matches and suburb parsing
          const slugData = await resolveServiceSlug(slug);
          setResolvedSlug(slugData);
          
          // Load suburb info if we have a valid suburb
          if (slugData.suburb) {
            const info = await getSuburbInfo(slugData.suburb);
            setSuburbInfo(info);
          }
          
          // Fetch the base service
          const response = await fetch(`/data/services/${slugData.baseSlug}.json`);
          if (!response.ok) {
            throw new Error('Service not found');
          }
          
          const data = await response.json();
          setService(data);
          setLoading(false);
        } catch (error) {
          console.error('Error loading service:', error);
          setError(true);
          setLoading(false);
        }
      }
    };
    
    loadService();
  }, [slug]);

  // Apply localization to service content if we have suburb info
  const localizedService = useMemo(() => {
    if (!service || !suburbInfo || !resolvedSlug.suburb) return service;
    
    const localizedTitle = service.title.replace(/(Sydney|Melbourne|Brisbane|Perth|Adelaide|Hobart|Darwin|Canberra)/g, 
      resolvedSlug.suburb.charAt(0).toUpperCase() + resolvedSlug.suburb.slice(1));
      
    const localizedDescription = service.description.replace(/(Sydney|Melbourne|Brisbane|Perth|Adelaide|Hobart|Darwin|Canberra)/g, 
      resolvedSlug.suburb.charAt(0).toUpperCase() + resolvedSlug.suburb.slice(1));
      
    const localizedContent = localizeContent(
      service.content,
      resolvedSlug.suburb,
      suburbInfo.region,
      suburbInfo.state
    );
    
    return {
      ...service,
      title: localizedTitle,
      description: localizedDescription,
      content: localizedContent
    };
  }, [service, suburbInfo, resolvedSlug]);

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

  if (error || !localizedService) {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{localizedService.title}</h1>
            <div className="flex gap-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {localizedService.category}
              </span>
              {suburbInfo && (
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {suburbInfo.region}, {suburbInfo.state}
                </span>
              )}
            </div>
          </header>
          {localizedService.image && (
            <div className="mb-8">
              <img 
                src={localizedService.image} 
                alt={localizedService.title} 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          <div 
            className="prose prose-lg max-w-none" 
            dangerouslySetInnerHTML={{ __html: localizedService.content }}
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