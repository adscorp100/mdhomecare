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
  
  // If we have at least two parts, check if the last part is a known suburb
  if (parts.length >= 2) {
    const potentialSuburb = parts[parts.length - 1];
    const suburbs = await getSuburbsData();
    
    // Only treat as suburb if it's in our list
    if (suburbs[potentialSuburb.toLowerCase()]) {
      const serviceParts = parts.slice(0, -1);
      const baseSlug = serviceParts.join('-');
      
      return { 
        baseSlug,
        suburb: potentialSuburb.toLowerCase()
      };
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

export function localizeContent(content: string, suburb: string, region: string, state: string): string {
  // Replace instances of "Sydney" with the suburb name (preserving case)
  const capitalizedSuburb = suburb.charAt(0).toUpperCase() + suburb.slice(1);
  
  // Replace whole words of "Sydney" with the suburb name
  let localizedContent = content.replace(/\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Hobart|Darwin|Canberra)\b/g, capitalizedSuburb);
  
  // Replace references to regions
  if (region) {
    localizedContent = localizedContent.replace(/(?:Greater Sydney|Greater Melbourne|Greater Brisbane|Greater Perth|Greater Adelaide|Greater Hobart|Top End|Capital Region)/g, region);
  }
  
  return localizedContent;
} 