import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";

// Define the Tool interface
interface Tool {
  title: string;
  slug: string;
  description: string;
  image?: string;
  category: string;
}

const Tools = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Document title and meta tags
  const pageTitle = categorySlug 
    ? `${categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Tools & Calculators` 
    : "Disability Support Tools & Calculators";
  
  useDocumentTitle(pageTitle);
  
  // Add meta tags for SEO
  useEffect(() => {
    // Create or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    
    const description = "Free online tools and calculators to help with disability support. Includes NDIS eligibility checker, funding calculators, and support planning tools.";
    metaDescription.setAttribute('content', description);
    
    // Create or update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    
    const keywords = "ndis tools, disability calculator, ndis eligibility checker, disability support tools, ndis funding calculator, ndis eligibility, disability services, support planning";
    metaKeywords.setAttribute('content', keywords);
    
    return () => {
      // Optional cleanup - you might want to keep these meta tags
    };
  }, [categorySlug]);
  
  // Parse URL path parameters for SEO-friendly filtering
  useEffect(() => {
    // Handle category from URL path
    if (categorySlug) {
      // Convert category slug back to proper category name
      const categoryName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Check if categories loaded and match
      if (categories.length > 0) {
        const matchedCategory = categories.find(cat => 
          cat.toLowerCase().replace(/\s+/g, '-') === categorySlug || 
          cat === categoryName
        );
        
        if (matchedCategory) {
          setActiveCategory(matchedCategory);
        } else {
          // Store for checking after categories load
          sessionStorage.setItem('pendingCategorySlug', categorySlug);
        }
      } else {
        // Store for checking after categories load
        sessionStorage.setItem('pendingCategorySlug', categorySlug);
      }
    }
  }, [categorySlug, categories]);
  
  // Check for pending category slug after categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const pendingCategorySlug = sessionStorage.getItem('pendingCategorySlug');
      if (pendingCategorySlug) {
        const categoryName = pendingCategorySlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        const matchedCategory = categories.find(cat => 
          cat.toLowerCase().replace(/\s+/g, '-') === pendingCategorySlug || 
          cat === categoryName
        );
        
        if (matchedCategory) {
          setActiveCategory(matchedCategory);
          sessionStorage.removeItem('pendingCategorySlug');
        }
      }
    }
  }, [categories]);
  
  useEffect(() => {
    // Fetch the tools index
    fetch('/data/tools/tools.json')
      .then(response => response.json())
      .then((data: Tool[]) => {
        setTools(data);
        
        // Extract unique categories and ensure they're strings
        const categorySet = new Set<string>();
        data.forEach(tool => categorySet.add(tool.category));
        const uniqueCategories = ["All", ...Array.from(categorySet)];
        setCategories(uniqueCategories);
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading tools:', error);
        setLoading(false);
      });
  }, []);

  // Filter tools by category
  const filteredTools = activeCategory === "All" 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);
  
  // Filter tools by search term
  const searchedTools = searchTerm 
    ? filteredTools.filter(tool => 
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredTools;

  // Handle category selection with SEO-friendly URL
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    if (category !== "All") {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      navigate(`/tools/category/${categorySlug}`, { replace: true });
    } else {
      navigate('/tools', { replace: true });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Loading Tools...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Free online tools and calculators to help with disability support. Includes NDIS eligibility checker, funding calculators, and support planning tools." />
        <meta name="keywords" content="ndis tools, disability calculator, ndis eligibility checker, disability support tools, ndis funding calculator, ndis eligibility, disability services, support planning" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Tools & Calculators</h1>
        <p className="text-center mb-8 max-w-2xl mx-auto">
          Discover our collection of helpful tools and calculators designed to assist you with various aspects of disability support and care.
        </p>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="w-full md:w-1/3">
            <Select onValueChange={handleCategoryChange} value={activeCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <Input 
              placeholder="Search tools..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {searchedTools.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No tools found</h2>
            <p>Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedTools.map((tool) => (
              <Link to={`/tools/${tool.slug}`} key={tool.slug}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  {tool.image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={tool.image} 
                        alt={tool.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription>{tool.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{tool.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tools; 