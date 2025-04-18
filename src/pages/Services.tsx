import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const Services = () => {
  useDocumentTitle('Services');
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [suburbs, setSuburbs] = useState<Record<string, SuburbInfo>>({});
  const [selectedSuburb, setSelectedSuburb] = useState<string>("all");
  
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
          
          {/* Suburb selector */}
          <div className="w-full md:w-64">
            <Select value={selectedSuburb} onValueChange={setSelectedSuburb}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {Object.entries(suburbs).map(([slug, info]) => (
                  <SelectItem key={slug} value={slug}>
                    {slug.charAt(0).toUpperCase() + slug.slice(1)} ({info.region})
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
                      alt={service.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-sm">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {service.category}
                    </span>
                    {selectedSuburb && selectedSuburb !== "all" && (
                      <span className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {selectedSuburb.charAt(0).toUpperCase() + selectedSuburb.slice(1)}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
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
