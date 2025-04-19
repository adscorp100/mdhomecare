import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle, AlertCircle, AlertTriangle, ArrowLeft, HelpCircle, ChevronRight, Phone, MessageSquare, Calendar } from "lucide-react";
import { Helmet } from "react-helmet";

// Define interface for Schema
interface SchemaData {
  "@context": string;
  "@type": string;
  mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: {
      "@type": string;
      text: string;
    };
  }>;
}

// Define interfaces for the tool and questions
interface ToolData {
  title: string;
  slug: string;
  description: string;
  image?: string;
  category: string;
  schema?: SchemaData;
  questions?: Question[];
  metaInfo?: {
    keywords: string[];
  };
  seoContent?: {
    introduction: string;
    tableOfContents: Array<{ id: string; text: string }>;
    keyFacts: string[];
    requirements: Array<{ title: string; description: string }>;
    disabilityTypes: Array<{ type: string; examples: string; considerations: string }>;
    adhdNote: string;
    earlyInterventionPoints: string[];
    nextSteps: Array<{ title: string; description: string }>;
    ctaTitle: string;
    ctaDescription: string;
  };
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
}

interface Option {
  value: string;
  label: string;
  nextQuestion?: string;
  result?: Result;
}

interface Result {
  eligible: "yes" | "no" | "likely" | "unlikely" | "maybe";
  title: string;
  message: string;
  nextSteps: string;
}

// Eligibility tool component
const NDISEligibilityChecker = ({ questions }: { questions: Question[] }) => {
  const navigate = useNavigate();
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [email, setEmail] = useState<string>("");
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [questionProgress, setQuestionProgress] = useState<number>(0);
  
  const { toast } = useToast();
  
  // Initialize the first question
  useEffect(() => {
    if (questions && questions.length > 0) {
      const firstQuestion = questions[0];
      setCurrentQuestionId(firstQuestion.id);
      setCurrentQuestion(firstQuestion);
      setQuestionProgress(1);
    }
  }, [questions]);
  
  // Update the current question when currentQuestionId changes
  useEffect(() => {
    if (currentQuestionId && questions) {
      const question = questions.find(q => q.id === currentQuestionId);
      setCurrentQuestion(question || null);
      
      // Update progress
      if (question) {
        const index = questions.findIndex(q => q.id === question.id);
        setQuestionProgress(index + 1);
      }
    }
  }, [currentQuestionId, questions]);
  
  // Handle selection of an option
  const handleOptionSelect = (value: string) => {
    if (!currentQuestion) return;
    
    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
    
    // Find the selected option
    const selectedOption = currentQuestion.options.find(opt => opt.value === value);
    
    if (selectedOption) {
      if (selectedOption.result) {
        // We have a result, show it
        setResult(selectedOption.result);
        
        // For "likely" or "maybe" eligible results, show email form
        if (selectedOption.result.eligible === "likely" || 
            selectedOption.result.eligible === "maybe") {
          setShowEmailForm(true);
        }
      } else if (selectedOption.nextQuestion) {
        // Move to the next question
        setCurrentQuestionId(selectedOption.nextQuestion);
      }
    }
  };
  
  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, you would send the email and results to your backend
    console.log("Email submitted:", email, "Answers:", answers);
    
    // Show success message
    toast({
      title: "Email Submitted",
      description: "Thank you! Your personalized eligibility checklist has been sent to your email.",
      variant: "default"
    });
    
    setFormSubmitted(true);
  };
  
  // Reset the checker
  const handleReset = () => {
    const firstQuestion = questions[0];
    setCurrentQuestionId(firstQuestion.id);
    setCurrentQuestion(firstQuestion);
    setAnswers({});
    setResult(null);
    setEmail("");
    setShowEmailForm(false);
    setFormSubmitted(false);
    setQuestionProgress(1);
  };
  
  // Show loading state if no current question
  if (!currentQuestion && !result) {
    return <div className="text-center py-8">Loading eligibility checker...</div>;
  }
  
  // Result icon based on eligibility status
  const getResultIcon = () => {
    if (!result) return null;
    
    switch (result.eligible) {
      case "yes":
      case "likely":
        return <CheckCircle className="h-16 w-16 text-green-500 mb-4" />;
      case "no":
        return <AlertCircle className="h-16 w-16 text-red-500 mb-4" />;
      case "maybe":
        return <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />;
      case "unlikely":
        return <Info className="h-16 w-16 text-blue-500 mb-4" />;
      default:
        return null;
    }
  };
  
  // Get background color based on result
  const getResultBackground = () => {
    if (!result) return "";
    
    switch (result.eligible) {
      case "yes":
      case "likely":
        return "from-green-600 to-green-700";
      case "no":
        return "from-red-600 to-red-700";
      case "maybe":
        return "from-amber-600 to-amber-700";
      case "unlikely":
        return "from-blue-600 to-blue-700";
      default:
        return "from-blue-600 to-blue-700";
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Show result if available */}
      {result ? (
        <>
          <Card className="w-full border-0 shadow-lg overflow-hidden">
            {/* Result header with background gradient */}
            <div className={`p-8 bg-gradient-to-r ${getResultBackground()} text-white text-center`}>
              <div className="flex justify-center">{getResultIcon()}</div>
              <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
              <p className="text-white/90 max-w-xl mx-auto">{result.message}</p>
            </div>
            
            <CardContent className="p-8 space-y-6">
              <div 
                className="text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-md"
                dangerouslySetInnerHTML={{ __html: result.nextSteps }}
              />
              
              {/* Email capture form for likely/maybe eligible results */}
              {showEmailForm && !formSubmitted && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Get Your Personalized Eligibility Checklist</h3>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Send Me My Checklist
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      We'll email you a detailed checklist based on your answers and additional resources to help you with the NDIS application process.
                    </p>
                  </form>
                </div>
              )}
              
              {/* Thank you message after submission */}
              {formSubmitted && (
                <Alert className="mt-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Thank You!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your personalized eligibility checklist has been sent to your email.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Contextual CTA box similar to ServiceDetail */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">Need help with your NDIS journey?</h2>
                    <p className="mb-4 text-blue-100">Our experts can guide you through the application process and help you access the support you deserve.</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-200" />
                        <span className="text-sm">Personalized NDIS guidance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-200" />
                        <span className="text-sm">Help with paperwork and documentation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-200" />
                        <span className="text-sm">Ongoing support throughout the process</span>
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
              
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={handleReset} className="px-6">
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional resources section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Helpful NDIS Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">NDIS Application Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">A comprehensive step-by-step guide to applying for the NDIS.</p>
                  <Link 
                    to="/blog/apply-for-funding" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    Read more <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">NDIS vs NDIA: What's the Difference?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Understanding the key differences between the NDIS and NDIA.</p>
                  <Link 
                    to="/blog/ndis-vs-ndia" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    Read more <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        // Show question if no result yet
        <Card className="w-full border-0 shadow-lg overflow-hidden">
          {/* Question header with background gradient */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">NDIS Eligibility Checker</h2>
              <div className="flex items-center gap-1 text-sm bg-blue-500 px-3 py-1 rounded-full">
                <span>Question {questionProgress}/{questions.length}</span>
              </div>
            </div>
            <p className="text-blue-100 mt-1">
              Answer a few simple questions to check your potential eligibility for the NDIS
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-blue-600 h-1 transition-all duration-300" 
              style={{ width: `${(questionProgress / questions.length) * 100}%` }}
            ></div>
          </div>
          
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                <h3 className="text-xl font-medium text-gray-800">{currentQuestion.text}</h3>
              </div>
              
              <RadioGroup 
                value={answers[currentQuestion.id] || ""} 
                onValueChange={handleOptionSelect}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div 
                    className="border rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer"
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="text-lg cursor-pointer w-full"
                      >
                        {option.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {/* Help box */}
            <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Why we're asking</h4>
                  <p className="text-sm text-blue-700">
                    This information helps us determine if you meet the NDIS eligibility criteria. 
                    Your answers will be used to provide you with accurate guidance.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

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
                {seoContent.requirements.map((req, index) => (
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
                      {seoContent.disabilityTypes.map((type, index) => (
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
                  {seoContent.earlyInterventionPoints.map((point, index) => (
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
        
        {/* SEO Content Section */}
        {renderSeoSection()}
        
        {/* In the future, add more tool-specific components here based on slug */}
      </div>
    </Layout>
  );
};

export default ToolDetail; 