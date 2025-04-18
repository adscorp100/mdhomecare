interface SuburbInfo {
  state: string;
  region: string;
}

interface Suburbs {
  [key: string]: SuburbInfo;
}

interface ServiceMapping {
  baseSlug: string;
  defaultLocation: string;
}

interface ServiceMappings {
  [key: string]: ServiceMapping;
}

// Cache the suburbs data to avoid multiple fetches
let cachedSuburbs: Suburbs | null = null;
let cachedMappings: ServiceMappings | null = null;

async function getSuburbsData(): Promise<Suburbs> {
  if (cachedSuburbs) {
    return cachedSuburbs;
  }
  
  try {
    const response = await fetch('/data/australian-suburbs.json');
    cachedSuburbs = await response.json();
    return cachedSuburbs;
  } catch (error) {
    console.error('Error loading suburbs data:', error);
    return {};
  }
}

async function getServiceMappings(): Promise<ServiceMappings> {
  if (cachedMappings) {
    return cachedMappings;
  }
  
  try {
    const response = await fetch('/data/service-mappings.json');
    cachedMappings = await response.json();
    return cachedMappings;
  } catch (error) {
    console.error('Error loading service mappings:', error);
    return {};
  }
}

export async function getSuburbInfo(suburb: string): Promise<SuburbInfo | null> {
  try {
    const suburbs = await getSuburbsData();
    return suburbs[suburb.toLowerCase()] || null;
  } catch (error) {
    console.error('Error loading suburb information:', error);
    return null;
  }
}

export async function resolveServiceSlug(requestedSlug: string): Promise<{ baseSlug: string; suburb: string | null }> {
  // First check if this is a direct match to a service with a mapping
  try {
    const mappings = await getServiceMappings();
    
    // If this is a known service with location in the name
    if (mappings[requestedSlug]) {
      const mapping = mappings[requestedSlug];
      // Return the base slug and the default location from the mapping
      return { 
        baseSlug: mapping.baseSlug,
        suburb: mapping.defaultLocation
      };
    }
    
    // Check for support-workers-in-sydney pattern
    if (requestedSlug.startsWith('support-workers-in-')) {
      const suburb = requestedSlug.replace('support-workers-in-', '');
      const suburbs = await getSuburbsData();
      
      if (suburbs[suburb.toLowerCase()]) {
        return {
          baseSlug: 'support-workers',
          suburb: suburb.toLowerCase()
        };
      }
    }
    
    // Otherwise, try to parse the slug for a suburb
    return parseLocalizedSlug(requestedSlug);
  } catch (error) {
    console.error('Error resolving service slug:', error);
    return { baseSlug: requestedSlug, suburb: null };
  }
}

export async function parseLocalizedSlug(slug: string): Promise<{ baseSlug: string; suburb: string | null }> {
  const parts = slug.split('-');
  const suburbs = await getSuburbsData();
  
  // If we have at least two parts, check various possible suburb combinations
  if (parts.length >= 2) {
    // First, try if the last part is a known suburb
    const potentialSuburb = parts[parts.length - 1];
    
    // Only treat as suburb if it's in our list
    if (suburbs[potentialSuburb.toLowerCase()]) {
      const serviceParts = parts.slice(0, -1);
      const baseSlug = serviceParts.join('-');
      
      return { 
        baseSlug,
        suburb: potentialSuburb.toLowerCase()
      };
    }
    
    // Check for hyphenated suburb names like "gold-coast"
    if (parts.length >= 3) {
      // Try the last two parts as a hyphenated suburb name
      const potentialHyphenatedSuburb = `${parts[parts.length - 2]}-${parts[parts.length - 1]}`;
      
      if (suburbs[potentialHyphenatedSuburb.toLowerCase()]) {
        const serviceParts = parts.slice(0, -2);
        const baseSlug = serviceParts.join('-');
        
        return {
          baseSlug,
          suburb: potentialHyphenatedSuburb.toLowerCase()
        };
      }
    }
    
    // Check for support-workers-in-<suburb> pattern
    if (parts.length >= 3 && parts[0] === 'support' && parts[1] === 'workers' && parts[2] === 'in') {
      const inSuburb = parts[3]; // Get the suburb after "in"
      if (suburbs[inSuburb.toLowerCase()]) {
        return {
          baseSlug: 'support-workers',
          suburb: inSuburb.toLowerCase()
        };
      }
      
      // Check for hyphenated suburb after "in" (support-workers-in-gold-coast)
      if (parts.length >= 5) {
        const potentialHyphenatedInSuburb = `${parts[3]}-${parts[4]}`;
        if (suburbs[potentialHyphenatedInSuburb.toLowerCase()]) {
          return {
            baseSlug: 'support-workers',
            suburb: potentialHyphenatedInSuburb.toLowerCase()
          };
        }
      }
    }
  }
  
  // If we don't have a valid suburb in the slug
  return { 
    baseSlug: slug,
    suburb: null
  };
}

// Synchronous version - only for cases where we already have the suburb
export function parseLocalizedSlugSync(slug: string): { service: string; suburb: string | null } {
  // If we don't have a suburb in the slug or no suburbs data yet
  return { 
    service: slug,
    suburb: null
  };
}

// Placeholder patterns
const SUBURB_PLACEHOLDER = "{suburb}";
const REGION_PLACEHOLDER = "{region}";
const STATE_PLACEHOLDER = "{state}";

// Default values for when no suburb is specified
const DEFAULT_SUBURB = "Australia";
const DEFAULT_REGION = "Australia";
const DEFAULT_STATE = "Australia";

export function localizeContent(content: string, suburb: string | null, region: string | null, state: string | null): string {
  // Use default values if parameters are null
  const effectiveSuburb = suburb || DEFAULT_SUBURB;
  const effectiveRegion = region || DEFAULT_REGION;
  const effectiveState = state || DEFAULT_STATE;
  
  // Properly capitalize the suburb name (each word if hyphenated)
  const capitalizedSuburb = effectiveSuburb.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Replace placeholders
  let localizedContent = content
    .replace(new RegExp(SUBURB_PLACEHOLDER, 'g'), capitalizedSuburb)
    .replace(new RegExp(REGION_PLACEHOLDER, 'g'), effectiveRegion)
    .replace(new RegExp(STATE_PLACEHOLDER, 'g'), effectiveState);
  
  // Replace whole words of major city names with the suburb name
  if (suburb) { // Only replace city names if we have a specific suburb
    localizedContent = localizedContent.replace(/\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Hobart|Darwin|Canberra)\b/g, capitalizedSuburb);
  }
  
  // Replace references to regions
  if (region) {
    localizedContent = localizedContent.replace(/(?:Greater Sydney|Greater Melbourne|Greater Brisbane|Greater Perth|Greater Adelaide|Greater Hobart|Top End|Capital Region)/g, effectiveRegion);
  }
  
  return localizedContent;
}

// Get suburbs in the same region as the current suburb
export async function getRelatedSuburbs(currentSuburb: string | null, limit: number = 5): Promise<{slug: string, name: string}[]> {
  if (!currentSuburb) return [];
  
  try {
    const suburbs = await getSuburbsData();
    const current = suburbs[currentSuburb.toLowerCase()];
    
    if (!current) return [];
    
    // Find suburbs in the same region and state
    const relatedSuburbs = Object.entries(suburbs)
      .filter(([slug, info]) => {
        return slug !== currentSuburb.toLowerCase() && 
               info.region === current.region && 
               info.state === current.state;
      })
      .map(([slug, _]) => ({
        slug,
        name: slug.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }))
      .slice(0, limit);
      
    return relatedSuburbs;
  } catch (error) {
    console.error('Error getting related suburbs:', error);
    return [];
  }
} 