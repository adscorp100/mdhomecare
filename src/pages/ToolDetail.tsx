import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet";
import { ToolData } from "@/components/tools/types"; 
import NDISEligibilityChecker from "@/components/tools/NDISEligibilityChecker";
import NDISBudgetCalculator from "@/components/tools/NDISBudgetCalculator";

// Main ToolDetail component
const ToolDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [toolData, setToolData] = useState<ToolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set document title based on tool title
  useDocumentTitle(toolData ? toolData.title : "Tool");
  
  // Fetch tool data
  useEffect(() => {
    if (!slug) return;
    
    // First check if the tool exists in the index
    fetch('/data/tools/tools.json')
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch tools index");
        return response.json();
      })
      .then((toolsIndex: ToolData[]) => {
        // Find the tool in the index
        const toolInfo = toolsIndex.find(tool => tool.slug === slug);
        
        if (!toolInfo) {
          throw new Error("Tool not found");
        }
        
        // Now fetch the detailed tool data
        return fetch(`/data/tools/${slug}.json`);
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch tool data");
        return response.json();
      })
      .then((data: ToolData) => {
        setToolData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading tool data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);
  
  // Inject structured data for SEO if available
  useEffect(() => {
    if (toolData?.schema) {
      // Remove any existing schema
      const existingScript = document.getElementById('tool-schema');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new schema
      const script = document.createElement('script');
      script.id = 'tool-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(toolData.schema);
      document.head.appendChild(script);
      
      // Clean up
      return () => {
        const scriptToRemove = document.getElementById('tool-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [toolData]);
  
  // Add meta keywords for SEO
  useEffect(() => {
    if (toolData?.metaInfo?.keywords) {
      // Create or update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', toolData.metaInfo.keywords.join(', '));
      
      // Create or update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', toolData.description);
      
      return () => {
        // Optional cleanup - you might want to keep these meta tags
      };
    }
  }, [toolData]);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Update the renderSeoSection function to use the data from JSON
  const renderSeoSection = () => {
    if (slug !== 'ndis-eligibility-checker' || !toolData?.seoContent) return null;
    
    const { seoContent } = toolData;
    
    const TableOfContents = () => (
      <div className="bg-white rounded-lg border border-gray-100 p-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 className="text-base font-semibold">On This Page</h2>
        </div>
        <ul className="space-y-1.5">
          {seoContent.tableOfContents.map((item) => (
            <li key={item.id} className="text-sm">
              <a 
                href={`#${item.id}`} 
                className="flex items-center text-gray-700 hover:text-blue-600"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 20,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                <ChevronRight className="w-3 h-3 mr-1.5 flex-shrink-0 text-gray-400" />
                <span>{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
    
    return (
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Understanding NDIS Eligibility</h2>
        
        <p className="text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
          {seoContent.introduction}
        </p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* TOC on mobile - appears first in the order */}
          <div className="lg:hidden mb-6">
            <TableOfContents />
          </div>
          
          <div className="lg:w-2/3">
            <article className="prose prose-lg max-w-none">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 my-8 rounded-r-md">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Key Facts About NDIS Eligibility</h3>
                <ul className="space-y-2 text-blue-900">
                  {seoContent.keyFacts.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>
              
              <h3 id="ndis-eligibility-requirements" className="text-xl font-bold text-gray-800 mt-10 mb-5">NDIS Eligibility Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-5">
                To be eligible for the NDIS, you must meet specific requirements in several categories. These requirements ensure the scheme supports those who need it most.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                {seoContent.requirements?.map((req, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-3 text-blue-700">{req.title}</h4>
                    <p className="text-gray-700">{req.description}</p>
                  </div>
                ))}
              </div>
              
              <h3 id="ndis-and-conditions" className="text-xl font-bold text-gray-800 mt-10 mb-5">NDIS and Different Conditions</h3>
              <p className="text-gray-700 leading-relaxed mb-5">
                The NDIS supports people with various disabilities and conditions. Eligibility depends on how your condition affects your life, not just the diagnosis itself.
              </p>
              
              <div className="mb-8">
                <div className="overflow-hidden rounded-xl shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disability Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examples</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Considerations</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {seoContent.disabilityTypes?.map((type, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{type.examples}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{type.considerations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="my-10 bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-md">
                <h4 className="text-lg font-semibold text-amber-800 mb-2">Important Note About ADHD and the NDIS</h4>
                <p className="text-amber-900">
                  {seoContent.adhdNote}
                </p>
              </div>
              
              <h3 id="early-intervention" className="text-xl font-bold text-gray-800 mt-10 mb-5">Early Intervention Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-5">
                The NDIS also provides early intervention support. This pathway focuses on providing timely support to reduce long-term needs.
              </p>
              
              <div className="bg-green-50 p-6 rounded-lg my-8">
                <h4 className="text-lg font-semibold text-green-800 mb-4">You may qualify for early intervention if:</h4>
                <ul className="space-y-4 text-gray-700">
                  {seoContent.earlyInterventionPoints?.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3 mt-0.5">{index + 1}</div>
                      <p>{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div id="next-steps" className="my-10 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps After Checking Eligibility</h3>
                <p className="text-gray-700 mb-4">
                  Using our NDIS eligibility checker can help you understand if you might qualify for the NDIS. This is just a guide - the final determination will be made by the National Disability Insurance Agency (NDIA) when you formally apply.
                </p>
                <div className="grid grid-cols-1 gap-4 mt-6">
                  {seoContent.nextSteps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4 bg-white">
                      <h4 className="font-medium text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="my-10 p-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white">
                <h3 className="text-xl font-bold mb-4">{seoContent.ctaTitle}</h3>
                <p className="mb-6 text-blue-100">
                  {seoContent.ctaDescription}
                </p>
                <Link 
                  to="/contact" 
                  className="inline-block px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Contact Our NDIS Specialists
                </Link>
              </div>
            </article>
          </div>
          
          {/* TOC on desktop - appears on the side */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="lg:sticky lg:top-6">
              <TableOfContents />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Add a new function to render SEO content for the Budget Calculator
  const renderBudgetCalculatorSeoSection = () => {
    if (slug !== 'ndis-budget-calculator' || !toolData?.seoContent) return null;
    
    const { seoContent } = toolData;
    
    const TableOfContents = () => (
      <div className="bg-white rounded-lg border border-gray-100 p-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 className="text-base font-semibold">On This Page</h2>
        </div>
        <ul className="space-y-1.5">
          {seoContent.tableOfContents.map((item) => (
            <li key={item.id} className="text-sm">
              <a 
                href={`#${item.id}`} 
                className="flex items-center text-gray-700 hover:text-blue-600"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 20,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                <ChevronRight className="w-3 h-3 mr-1.5 flex-shrink-0 text-gray-400" />
                <span>{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
    
    return (
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Understanding NDIS Budgets</h2>
        
        <p className="text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
          {seoContent.introduction}
        </p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* TOC on mobile - appears first in the order */}
          <div className="lg:hidden mb-6">
            <TableOfContents />
          </div>
          
          <div className="lg:w-2/3">
            <article className="prose prose-lg max-w-none">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 my-8 rounded-r-md">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Key Facts About NDIS Budgets</h3>
                <ul className="space-y-2 text-blue-900">
                  {seoContent.keyFacts.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>
              
              <h3 id="reasonable-necessary" className="text-xl font-bold text-gray-800 mt-10 mb-5">Reasonable and Necessary Criteria</h3>
              <p className="text-gray-700 leading-relaxed mb-5">
                {seoContent.reasonableNecessary?.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                {seoContent.reasonableNecessary?.criteria.map((criterion, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2 text-blue-700">{criterion.title}</h4>
                    <p className="text-gray-700">{criterion.description}</p>
                  </div>
                ))}
              </div>
              
              <h3 id="budget-categories" className="text-xl font-bold text-gray-800 mt-10 mb-5">NDIS Budget Categories and Flexibility</h3>
              <p className="text-gray-700 leading-relaxed mb-5">
                The NDIS structures plan budgets into different categories, each with its own purpose and flexibility rules.
              </p>
              
              <div className="mb-8">
                <div className="overflow-hidden rounded-xl shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flexibility</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {seoContent.budgetCategories?.map((category, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{category.flexibility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <h3 id="evidence-requirements" className="text-xl font-bold text-gray-800 mt-10 mb-5">Evidence Requirements for Funding</h3>
              <p className="text-gray-700 leading-relaxed mb-5">
                {seoContent.evidenceSection?.description}
              </p>
              
              <div className="space-y-6 my-8">
                {seoContent.evidenceSection?.examples.map((example, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2 text-blue-700">{example.type}</h4>
                    <p className="text-gray-700">{example.description}</p>
                  </div>
                ))}
              </div>
              
              <h3 id="planning-process" className="text-xl font-bold text-gray-800 mt-10 mb-5">The NDIS Planning Process</h3>
              <p className="text-gray-700 leading-relaxed mb-5">
                {seoContent.planningProcess?.description}
              </p>
              
              <div className="relative mt-8 mb-8">
                {/* Process Steps */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-200"></div>
                <div className="space-y-8">
                  {seoContent.planningProcess?.steps.map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 relative">
                        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-8 bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex-grow">
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">{step.title}</h4>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div id="next-steps" className="my-10 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What to Do Next</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {seoContent.nextSteps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4 bg-white">
                      <h4 className="font-medium text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="my-10 p-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white">
                <h3 className="text-xl font-bold mb-4">{seoContent.ctaTitle}</h3>
                <p className="mb-6 text-blue-100">
                  {seoContent.ctaDescription}
                </p>
                <Link 
                  to="/contact" 
                  className="inline-block px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Contact Our NDIS Specialists
                </Link>
              </div>
            </article>
          </div>
          
          {/* TOC on desktop - appears on the side */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="lg:sticky lg:top-6">
              <TableOfContents />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-64 bg-gray-200 rounded w-full max-w-3xl mx-auto"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !toolData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/tools" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p>{error || "Tool not found"}</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {toolData && (
        <Helmet>
          <title>{toolData.title}</title>
          <meta name="description" content={toolData.description} />
          {toolData.metaInfo?.keywords && (
            <meta name="keywords" content={toolData.metaInfo.keywords.join(', ')} />
          )}
        </Helmet>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/tools" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Link>
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{toolData.title}</h1>
          <p className="max-w-2xl mx-auto text-gray-600">{toolData.description}</p>
        </div>
        
        {/* Render NDIS Eligibility Checker if that's the current tool */}
        {slug === 'ndis-eligibility-checker' && toolData.questions && (
          <NDISEligibilityChecker questions={toolData.questions} />
        )}
        
        {/* Render NDIS Budget Calculator if that's the current tool */}
        {slug === 'ndis-budget-calculator' && toolData.budgetExplorer && (
          <NDISBudgetCalculator budgetExplorer={toolData.budgetExplorer} />
        )}
        
        {/* SEO Content Section */}
        {slug === 'ndis-eligibility-checker' ? renderSeoSection() : null}
        {slug === 'ndis-budget-calculator' ? renderBudgetCalculatorSeoSection() : null}
        
        {/* In the future, add more tool-specific components here based on slug */}
      </div>
    </Layout>
  );
};

export default ToolDetail; 