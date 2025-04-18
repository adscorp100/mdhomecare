import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import "./BlogPost.css"; // Reuse the same CSS for content formatting
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { getSuburbInfo, resolveServiceSlug, localizeContent, getRelatedSuburbs } from "@/lib/localize";

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

interface RelatedSuburb {
  slug: string;
  name: string;
}

// Placeholder patterns
const SUBURB_PLACEHOLDER = "{suburb}";
const REGION_PLACEHOLDER = "{region}";
const STATE_PLACEHOLDER = "{state}";

// Default values for when no suburb is specified
const DEFAULT_SUBURB = "Australia";
const DEFAULT_REGION = "Australia";
const DEFAULT_STATE = "Australia";

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [suburbInfo, setSuburbInfo] = useState<SuburbInfo | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<{ baseSlug: string; suburb: string | null }>({ baseSlug: '', suburb: null });
  const [relatedSuburbs, setRelatedSuburbs] = useState<RelatedSuburb[]>([]);
  
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
            
            // Get related suburbs in the same region
            const related = await getRelatedSuburbs(slugData.suburb, 6);
            setRelatedSuburbs(related);
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

  // Replace placeholders in a string with suburb data
  const replacePlaceholders = (text: string, suburb: string | null = null, region: string | null = null, state: string | null = null): string => {
    const effectiveSuburb = suburb || DEFAULT_SUBURB;
    const effectiveRegion = region || DEFAULT_REGION;
    const effectiveState = state || DEFAULT_STATE;
    
    const capitalizedSuburb = effectiveSuburb.charAt(0).toUpperCase() + effectiveSuburb.slice(1);
    
    let processed = text
      .replace(new RegExp(SUBURB_PLACEHOLDER, 'g'), capitalizedSuburb)
      .replace(new RegExp(REGION_PLACEHOLDER, 'g'), effectiveRegion)
      .replace(new RegExp(STATE_PLACEHOLDER, 'g'), effectiveState);
      
    // Only replace city names if we have a specific suburb
    if (suburb) {
      processed = processed.replace(/\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Hobart|Darwin|Canberra)\b/g, capitalizedSuburb);
    }
    
    return processed;
  };

  // Apply localization to service content if we have suburb info
  const localizedService = useMemo(() => {
    if (!service) return service;
    
    // If we have suburb info, do full localization
    if (suburbInfo && resolvedSlug.suburb) {
      const suburb = resolvedSlug.suburb;
      const { region, state } = suburbInfo;
      
      // Apply placeholder replacements to title and description
      const localizedTitle = replacePlaceholders(service.title, suburb, region, state);
      const localizedDescription = replacePlaceholders(service.description, suburb, region, state);
      
      // Handle content placeholders and other replacements
      const localizedContent = localizeContent(
        service.content,
        suburb,
        region,
        state
      );
      
      return {
        ...service,
        title: localizedTitle,
        description: localizedDescription,
        content: localizedContent
      };
    }
    
    // If no suburb, replace placeholders with default values
    return {
      ...service,
      title: replacePlaceholders(service.title),
      description: replacePlaceholders(service.description),
      content: localizeContent(service.content, null, null, null)
    };
  }, [service, suburbInfo, resolvedSlug]);

  // Generate URL for related suburb
  const getSuburbUrl = (suburbSlug: string) => {
    if (resolvedSlug.baseSlug === 'support-workers') {
      return `/services/support-workers-${suburbSlug}`;
    }
    return `/services/${resolvedSlug.baseSlug}-${suburbSlug}`;
  };

  // Generate page title with suburb
  const getPageTitle = () => {
    if (!localizedService) return '';
    
    if (suburbInfo && resolvedSlug.suburb) {
      const suburbName = resolvedSlug.suburb.charAt(0).toUpperCase() + resolvedSlug.suburb.slice(1);
      // If title already contains suburb name, use as is
      if (localizedService.title.includes(suburbName)) {
        return localizedService.title;
      }
      
      // Otherwise, append suburb name if not already in title
      return `${localizedService.title} in ${suburbName}`;
    }
    
    return localizedService.title;
  };

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{getPageTitle()}</h1>
            <div className="flex gap-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {localizedService.category}
              </span>
              {suburbInfo && (
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> 
                  {resolvedSlug.suburb?.charAt(0).toUpperCase() + resolvedSlug.suburb?.slice(1)}, {suburbInfo.region}
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
          
          {relatedSuburbs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">This Service In Nearby Areas</h3>
              <div className="flex flex-wrap gap-2">
                {relatedSuburbs.map(suburb => (
                  <Link 
                    key={suburb.slug} 
                    to={getSuburbUrl(suburb.slug)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="h-3 w-3" /> {suburb.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
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