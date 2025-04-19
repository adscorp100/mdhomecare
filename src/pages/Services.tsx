import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Define the Service interface
interface Service {
  title: string;
  slug: string;
  description: string;
  image?: string;
  category: string;
}

interface SuburbInfo {
  state: string;
  region: string;
}

interface SuburbItem {
  slug: string;
  name: string;
  state: string;
  region: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [suburbs, setSuburbs] = useState<Record<string, SuburbInfo>>({});
  const [suburbsList, setSuburbsList] = useState<SuburbItem[]>([]);
  const [selectedSuburb, setSelectedSuburb] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Create a formatted suburb name for display
  const formattedSuburbName = selectedSuburb && selectedSuburb !== "all" 
    ? selectedSuburb.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : "Australia";
  
  // Replace {suburb} placeholder with the selected suburb name
  const replaceSuburbPlaceholder = (text: string): string => {
    if (selectedSuburb && selectedSuburb !== "all") {
      // Properly capitalize the suburb name (each word if hyphenated)
      const capitalizedSuburb = selectedSuburb.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return text.replace(/\{suburb\}/g, capitalizedSuburb);
    }
    // Default to Australia if no suburb selected
    return text.replace(/\{suburb\}/g, "Australia");
  };
  
  // Set document title based on selected suburb
  const documentTitle = 
    selectedSuburb && selectedSuburb !== "all"
      ? `Services in ${formattedSuburbName}`
      : 'Services';
  
  useDocumentTitle(documentTitle);
  
  useEffect(() => {
    // Fetch the services index
    fetch('/data/services/services.json')
      .then(response => response.json())
      .then((data: Service[]) => {
        setServices(data);
        
        // Extract unique categories and ensure they're strings
        const categorySet = new Set<string>();
        data.forEach(service => categorySet.add(service.category));
        const uniqueCategories = ["All", ...Array.from(categorySet)];
        setCategories(uniqueCategories);
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading services:', error);
        setLoading(false);
      });
      
    // Fetch the suburbs
    fetch('/data/australian-suburbs.json')
      .then(response => response.json())
      .then((data: Record<string, SuburbInfo>) => {
        setSuburbs(data);
        
        // Create a flat list of suburbs with their details
        const suburbItems: SuburbItem[] = Object.entries(data).map(([slug, info]) => {
          const { state, region } = info;
          
          // Format the suburb name for display
          const name = slug.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return { slug, name, state, region };
        });
        
        // Sort alphabetically by name
        suburbItems.sort((a, b) => a.name.localeCompare(b.name));
        
        setSuburbsList(suburbItems);
      })
      .catch(error => {
        console.error('Error loading suburbs:', error);
      });
  }, []);

  // Filter services by category
  const filteredServices = activeCategory === "All" 
    ? services 
    : services.filter(service => service.category === activeCategory);
    
  // Generate the service URL based on selected suburb
  const getServiceUrl = (slug: string) => {
    if (selectedSuburb && selectedSuburb !== "all") {
      // Handle legacy URLs
      if (slug === "support-workers") {
        return `/services/support-workers-${selectedSuburb}`;
      }
      return `/services/${slug}-${selectedSuburb}`;
    }
    return `/services/${slug}`;
  };

  // Filter suburbs based on search term
  const filteredSuburbs = searchTerm 
    ? suburbsList.filter(suburb => {
        const searchLower = searchTerm.toLowerCase();
        return suburb.name.toLowerCase().includes(searchLower) || 
               suburb.state.toLowerCase().includes(searchLower) || 
               suburb.region.toLowerCase().includes(searchLower);
      })
    : suburbsList;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>Loading services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">Comprehensive disability support services tailored to your needs</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Suburb selector with search */}
          <div className="w-full md:w-64">
            <Select value={selectedSuburb} onValueChange={setSelectedSuburb}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {/* Search input */}
                <div className="p-2 sticky top-0 bg-white z-10 border-b">
                  <Input
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8"
                  />
                </div>
                
                <SelectItem value="all">All locations</SelectItem>
                
                {/* Flat list of suburbs */}
                {filteredSuburbs.map(suburb => (
                  <SelectItem 
                    key={suburb.slug} 
                    value={suburb.slug}
                  >
                    {suburb.name} ({suburb.state})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <Link key={service.slug} to={getServiceUrl(service.slug)}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                {service.image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={replaceSuburbPlaceholder(service.title)} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{replaceSuburbPlaceholder(service.title)}</CardTitle>
                  <CardDescription className="text-sm">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {service.category}
                    </span>
                    {selectedSuburb && selectedSuburb !== "all" && (
                      <span className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {selectedSuburb.split('-')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{replaceSuburbPlaceholder(service.description)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Services;
