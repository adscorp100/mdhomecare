import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle, AlertCircle, AlertTriangle, HelpCircle, ChevronRight, Phone, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Question, Option, Result } from "./types";

interface NDISEligibilityCheckerProps {
  questions: Question[];
}

// ID mapping for inconsistent question IDs
const ID_MAP: Record<string, string> = {
  "q2": "residence"
};

const NDISEligibilityChecker = ({ questions }: NDISEligibilityCheckerProps) => {
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
  
  // Handle currentQuestionId changes - this is the key to fixing the issue
  useEffect(() => {
    if (!currentQuestionId || !questions || questions.length === 0) return;
    
    // Check if we need to map the ID (e.g., q2 → residence)
    const mappedId = ID_MAP[currentQuestionId] || currentQuestionId;
    
    // Find the question with the mapped ID
    const question = questions.find(q => q.id === mappedId);
    
    if (question) {
      setCurrentQuestion(question);
      // Update progress based on index
      const index = questions.findIndex(q => q.id === mappedId);
      setQuestionProgress(index + 1);
    } else {
      // If question not found, try to use the next one in sequence
      const currentIndex = Math.max(0, questions.findIndex(q => q.id === currentQuestionId));
      if (currentIndex < questions.length - 1) {
        const nextQuestion = questions[currentIndex + 1];
        setCurrentQuestion(nextQuestion);
        setQuestionProgress(currentIndex + 2);
      } else {
        // If all else fails, show loading state
        setCurrentQuestion(null);
      }
    }
  }, [currentQuestionId, questions]);
  
  // Handle option selection
  const handleOptionSelect = (value: string) => {
    if (!currentQuestion) return;
    
    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
    
    // Find the selected option
    const selectedOption = currentQuestion.options.find(opt => opt.value === value);
    if (!selectedOption) return;
    
    if (selectedOption.result) {
      // Show result
      setResult(selectedOption.result);
      
      // For "likely" or "maybe" eligible results, show email form
      if (selectedOption.result.eligible === "likely" || 
          selectedOption.result.eligible === "maybe") {
        setShowEmailForm(true);
      }
    } else if (selectedOption.nextQuestion) {
      // Move to the next question (the mapping happens in the useEffect)
      setCurrentQuestionId(selectedOption.nextQuestion);
    }
  };
  
  // Email form handling
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
    if (questions && questions.length > 0) {
      const firstQuestion = questions[0];
      setCurrentQuestionId(firstQuestion.id);
      setCurrentQuestion(firstQuestion);
      setAnswers({});
      setResult(null);
      setEmail("");
      setShowEmailForm(false);
      setFormSubmitted(false);
      setQuestionProgress(1);
    }
  };
  
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
  
  // Function to get question image based on question ID or progress
  const getQuestionImage = () => {
    if (!currentQuestion) return "carer.webp";
    
    // Assign specific images based on question progress
    if (questionProgress === 1) return "elderlyaboriginal.webp";
    if (questionProgress === 2) return "downs.webp";
    if (questionProgress === 3) return "grandma.webp";
    
    return "carer.webp"; // Default fallback
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div 
                  className="text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-md"
                  dangerouslySetInnerHTML={{ __html: result.nextSteps }}
                />
                <div className="hidden md:block">
                  <img 
                    src={`/assets/${result.eligible === "yes" || result.eligible === "likely" ? "physio.webp" : "hero.webp"}`}
                    alt="NDIS Services" 
                    className="rounded-lg shadow-md w-full h-auto object-cover" 
                  />
                </div>
              </div>
              
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
                  <div className="mt-6 md:mt-0 md:ml-6 md:flex-shrink-0">
                    <img 
                      src="/assets/holdinglinen.webp" 
                      alt="NDIS Support Services" 
                      className="rounded-lg shadow-md w-full h-auto max-w-[200px] mx-auto mb-4 object-cover"
                    />
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
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-20 h-20 rounded overflow-hidden shrink-0">
                      <img src="/assets/clinic.webp" alt="NDIS Application Guide" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">NDIS Application Guide</h4>
                      <p className="text-sm text-gray-600 mb-3">A comprehensive step-by-step guide to applying for the NDIS.</p>
                      <Link 
                        to="/blog/apply-for-funding" 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        Read more <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-20 h-20 rounded overflow-hidden shrink-0">
                      <img src="/assets/grandmawhite.webp" alt="NDIS vs NDIA" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">NDIS vs NDIA: What's the Difference?</h4>
                      <p className="text-sm text-gray-600 mb-3">Understanding the key differences between the NDIS and NDIA.</p>
                      <Link 
                        to="/blog/ndis-vs-ndia" 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        Read more <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
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
            {currentQuestion ? (
              <>
                <div className="mb-8">
                  <div className="flex items-start mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                    <h3 className="text-xl font-medium text-gray-800">{currentQuestion.text}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
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
                    <div className="hidden md:block">
                      <img 
                        src={`/assets/${getQuestionImage()}`}
                        alt="NDIS Support" 
                        className="rounded-lg shadow-md w-full h-auto object-cover" 
                      />
                    </div>
                  </div>
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
              </>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p>Loading eligibility checker...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* SEO content - hidden visually but available for search engines */}
      <div className="sr-only">
        <h2>NDIS Eligibility Assessment Tool</h2>
        <p>
          Use our NDIS Eligibility Checker to determine if you or someone you care for may qualify for National Disability Insurance Scheme support.
          This tool helps Australians with disability understand their eligibility for NDIS funding and supports.
        </p>
        <h3>Who is eligible for the NDIS?</h3>
        <p>
          To be eligible for the NDIS, you generally need to:
          - Be under 65 years of age when you apply
          - Be an Australian citizen, permanent resident, or Protected Special Category Visa holder
          - Have a permanent disability that significantly affects your ability to take part in everyday activities
          - Need support now and over your lifetime
        </p>
        <h3>Disability types that may qualify for NDIS</h3>
        <ul>
          <li>Physical disabilities affecting mobility or dexterity</li>
          <li>Intellectual disabilities</li>
          <li>Cognitive disabilities including acquired brain injuries</li>
          <li>Sensory disabilities affecting vision or hearing</li>
          <li>Psychosocial disabilities related to mental health conditions</li>
          <li>Developmental delays in children</li>
        </ul>
      </div>
    </div>
  );
};

export default NDISEligibilityChecker; 