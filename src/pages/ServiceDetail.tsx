import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronRight, Globe, Navigation, Map, Phone, Calendar, MessageSquare, CheckCircle } from "lucide-react";
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

// State colors for visual distinction
const STATE_COLORS: Record<string, { bg: string, text: string, hover: string, icon: string }> = {
  'NSW': { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100', icon: 'text-blue-500' },
  'VIC': { bg: 'bg-indigo-50', text: 'text-indigo-700', hover: 'hover:bg-indigo-100', icon: 'text-indigo-500' },
  'QLD': { bg: 'bg-amber-50', text: 'text-amber-700', hover: 'hover:bg-amber-100', icon: 'text-amber-500' },
  'WA': { bg: 'bg-rose-50', text: 'text-rose-700', hover: 'hover:bg-rose-100', icon: 'text-rose-500' },
  'SA': { bg: 'bg-emerald-50', text: 'text-emerald-700', hover: 'hover:bg-emerald-100', icon: 'text-emerald-500' },
  'TAS': { bg: 'bg-cyan-50', text: 'text-cyan-700', hover: 'hover:bg-cyan-100', icon: 'text-cyan-500' },
  'NT': { bg: 'bg-orange-50', text: 'text-orange-700', hover: 'hover:bg-orange-100', icon: 'text-orange-500' },
  'ACT': { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', icon: 'text-purple-500' }
};

// Full state names mapping
const STATE_FULL_NAMES: Record<string, string> = {
  'NSW': 'New South Wales',
  'VIC': 'Victoria',
  'QLD': 'Queensland',
  'WA': 'Western Australia',
  'SA': 'South Australia',
  'TAS': 'Tasmania',
  'NT': 'Northern Territory',
  'ACT': 'Australian Capital Territory'
};

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [suburbInfo, setSuburbInfo] = useState<SuburbInfo | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<{ baseSlug: string; suburb: string | null }>({ baseSlug: '', suburb: null });
  const [relatedSuburbs, setRelatedSuburbs] = useState<RelatedSuburb[]>([]);
  const [allSuburbs, setAllSuburbs] = useState<Record<string, SuburbInfo>>({});
  const [stateSuburbs, setStateSuburbs] = useState<Record<string, RelatedSuburb[]>>({});

  // Effect to scroll to top when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const loadService = async () => {
      if (slug) {
        try {
          // Fetch all suburbs for use when no specific suburb is selected
          const suburbsResponse = await fetch('/data/australian-suburbs.json');
          const suburbsData = await suburbsResponse.json();
          setAllSuburbs(suburbsData);
          
          // Group suburbs by state for SEO interlinking
          const byState: Record<string, RelatedSuburb[]> = {};
          Object.entries(suburbsData).forEach(([suburbSlug, info]) => {
            const { state } = info as SuburbInfo;
            if (!byState[state]) {
              byState[state] = [];
            }
            
            const name = suburbSlug.split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            byState[state].push({ slug: suburbSlug, name });
          });
          
          // Sort suburbs within each state
          Object.keys(byState).forEach(state => {
            byState[state].sort((a, b) => a.name.localeCompare(b.name));
          });
          
          setStateSuburbs(byState);
          
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
    
    const capitalizedSuburb = effectiveSuburb.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
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

  // Generate URL for related suburb and handle navigation
  const getSuburbUrl = (suburbSlug: string) => {
    if (resolvedSlug.baseSlug === 'support-workers') {
      return `/services/support-workers-${suburbSlug}`;
    }
    return `/services/${resolvedSlug.baseSlug}-${suburbSlug}`;
  };
  
  // Handle suburb link click with navigation
  const handleSuburbClick = (suburbSlug: string, event: React.MouseEvent) => {
    event.preventDefault();
    const url = getSuburbUrl(suburbSlug);
    navigate(url);
    window.scrollTo(0, 0);
  };

  // Get full state name from abbreviation
  const getFullStateName = (stateCode: string): string => {
    return STATE_FULL_NAMES[stateCode] || stateCode;
  };

  // Wrap getPageTitle in useCallback
  const getPageTitle = useCallback(() => {
    if (!localizedService) return '';
    
    if (suburbInfo && resolvedSlug.suburb) {
      const suburbName = resolvedSlug.suburb.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      // If title already contains suburb name, use as is
      if (localizedService.title.includes(suburbName)) {
        return localizedService.title;
      }
      
      // Otherwise, append suburb name if not already in title
      return `${localizedService.title} in ${suburbName}`;
    }
    
    return localizedService.title;
  }, [localizedService, suburbInfo, resolvedSlug.suburb]);

  // Calculate document title
  const documentTitle = useMemo(() => {
    if (loading) return 'Loading...';
    if (error || !localizedService) return 'Service Not Found';
    return getPageTitle();
  }, [loading, error, localizedService, getPageTitle]);

  // Set document title
  useDocumentTitle(documentTitle);

  // Remove "in [Location]" from service title if present
  const baseServiceTitle = useMemo(() => {
    if (!localizedService) return '';
    return localizedService.title.replace(/\s+in\s+.+$/, '');
  }, [localizedService]);

  // Get popular suburbs to show when no specific suburb is selected
  const getPopularSuburbs = useMemo(() => {
    if (Object.keys(allSuburbs).length === 0) return [];
    
    // Select first 8 suburbs from major cities for display
    const popularCities = ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'gold-coast', 'canberra', 'newcastle'];
    return popularCities
      .filter(city => allSuburbs[city])
      .map(city => ({
        slug: city,
        name: city.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }));
  }, [allSuburbs]);

  // Get a selection of suburbs from each state for SEO interlinking
  const getInterlinkingSuburbs = useMemo(() => {
    const result: Record<string, RelatedSuburb[]> = {};
    const stateOrder = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
    
    // Take up to 8 suburbs from each state, prioritizing major areas
    stateOrder.forEach(state => {
      if (stateSuburbs[state] && stateSuburbs[state].length > 0) {
        // Take a sampling of suburbs - for SEO we want a mix of large and smaller areas
        // For better visual display, take 8 suburbs per state
        const stateSample = stateSuburbs[state].slice(0, 12);
        result[state] = stateSample;
      }
    });
    
    return result;
  }, [stateSuburbs]);

  // Get a representative emoji for each state (for visual enhancement)
  const getStateEmoji = (state: string): string => {
    const stateEmojis: Record<string, string> = {
      'NSW': '🏙️',
      'VIC': '🏛️',
      'QLD': '🏝️',
      'WA': '🏜️',
      'SA': '🍇',
      'TAS': '⛰️',
      'NT': '🦘',
      'ACT': '🏛️'
    };
    return stateEmojis[state] || '📍';
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

  // Determine which suburbs to show in the bottom chips
  const suburbsToShow = relatedSuburbs.length > 0 ? relatedSuburbs : getPopularSuburbs;

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
                  {resolvedSlug.suburb?.split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}, {suburbInfo.region}
                </span>
              )}
            </div>
          </header>
          
          {/* Contextual CTA box that appears immediately after the header */}
          <div className="mb-10 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Need {baseServiceTitle} in {suburbInfo ? 
                  resolvedSlug.suburb?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
                : 'your area'}?</h2>
                <p className="mb-4 text-blue-100">Get a personalized assessment and expert support today. Our team is ready to help you!</p>
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
                <Link 
                  to="/contact" 
                  className="block w-full md:w-auto px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-center"
                >
                  Contact Us Now
                </Link>
                <div className="flex items-center justify-center gap-4 mt-3 text-sm text-blue-100">
                  <Link to="/contact" className="flex items-center gap-1 hover:text-white">
                    <Phone className="h-3 w-3" /> Call
                  </Link>
                  <Link to="/contact" className="flex items-center gap-1 hover:text-white">
                    <MessageSquare className="h-3 w-3" /> Message
                  </Link>
                  <Link to="/contact" className="flex items-center gap-1 hover:text-white">
                    <Calendar className="h-3 w-3" /> Schedule
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
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
          
          {/* Mid-content CTA - appears after the main content for those who read through */}
          <div className="my-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Ready to get started with our {baseServiceTitle.toLowerCase()}?</h3>
                <p className="text-sm text-gray-600">Our team is available to answer your questions and help you get the support you need.</p>
              </div>
              <Link 
                to="/contact" 
                className="whitespace-nowrap px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
          
          {/* Nearby areas section - shown when we have a specific suburb */}
          {relatedSuburbs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-500" />
                This Service In Nearby Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedSuburbs.map(suburb => (
                  <a 
                    key={suburb.slug} 
                    href={getSuburbUrl(suburb.slug)}
                    onClick={(e) => handleSuburbClick(suburb.slug, e)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <MapPin className="h-3 w-3" /> {suburb.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Comprehensive SEO-optimized suburb interlinking section with enhanced design */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-600" />
              {baseServiceTitle} In All Areas
            </h2>
            
            {Object.keys(getInterlinkingSuburbs).length > 0 ? (
              <div className="grid gap-8">
                {Object.entries(getInterlinkingSuburbs)
                  .map(([state, suburbs]) => {
                    const stateStyles = STATE_COLORS[state] || { bg: 'bg-gray-50', text: 'text-gray-700', hover: 'hover:bg-gray-100', icon: 'text-gray-500' };
                    const fullStateName = getFullStateName(state);
                    
                    return (
                      <div key={state} className={`p-4 rounded-xl ${stateStyles.bg} border shadow-sm`}>
                        <h3 className={`text-lg font-medium ${stateStyles.text} mb-3 flex items-center gap-2`}>
                          <span className="text-xl">{getStateEmoji(state)}</span>
                          {baseServiceTitle} in {fullStateName}
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-3">
                          {suburbs.map(suburb => (
                            <a
                              key={suburb.slug}
                              href={getSuburbUrl(suburb.slug)}
                              onClick={(e) => handleSuburbClick(suburb.slug, e)}
                              className={`${stateStyles.text} ${stateStyles.hover} text-sm py-1 px-2 rounded-md truncate hover:shadow-sm transition-all flex items-center gap-1`}
                              title={`${baseServiceTitle} in ${suburb.name}`}
                            >
                              <MapPin className={`h-3 w-3 ${stateStyles.icon}`} />
                              {suburb.name}
                            </a>
                          ))}
                          
                          {state === "NSW" && (
                            <a 
                              href={`/services/${resolvedSlug.baseSlug}-locations-${state.toLowerCase()}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/services/${resolvedSlug.baseSlug}-locations-${state.toLowerCase()}`);
                                window.scrollTo(0, 0);
                              }}
                              className={`${stateStyles.text} font-medium text-sm flex items-center gap-1 ml-1`}
                            >
                              See all in {fullStateName} <ChevronRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {getPopularSuburbs.map(suburb => (
                  <a 
                    key={suburb.slug} 
                    href={getSuburbUrl(suburb.slug)}
                    onClick={(e) => handleSuburbClick(suburb.slug, e)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <MapPin className="h-3 w-3" /> {suburb.name}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* Final CTA at the bottom - still keep this for users who've read everything */}
          <div className="mt-12 p-8 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Experience Our {baseServiceTitle} Today</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">Join the hundreds of clients who trust us with their care needs. Our professional team is ready to provide you with exceptional service.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                Get Started
              </Link>
              <Link to="/services" className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Explore More Services
              </Link>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default ServiceDetail; 