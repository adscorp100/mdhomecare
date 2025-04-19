import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Info, Phone, MessageSquare, Calendar } from "lucide-react";
import { BudgetExplorerData, BudgetSection } from "./types";

interface NDISBudgetCalculatorProps {
  budgetExplorer: BudgetExplorerData;
}

const NDISBudgetCalculator = ({ budgetExplorer }: NDISBudgetCalculatorProps) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string>("goals");
  const [showEligibleSupports, setShowEligibleSupports] = useState(false);

  const handleGoalSelection = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const goToNextSection = () => {
    const sections = budgetExplorer.sections;
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
      window.scrollTo(0, 0);
    } else {
      setShowEligibleSupports(true);
    }
  };

  const goToPreviousSection = () => {
    const sections = budgetExplorer.sections;
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };

  // Function to get image for support category based on section ID
  const getSectionImage = (sectionId: string) => {
    switch(sectionId) {
      case "goals":
        return "homecare.webp";
      case "core":
        return "drinkingtea.webp";
      case "capacity":
        return "physio.webp";
      case "capital":
        return "makingbed.webp";
      default:
        return "deceasedestate.webp";
    }
  };

  const renderGoalSelectionSection = (section: BudgetSection) => {
    return (
      <div className="space-y-6">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">{section.title}</h3>
            <p className="text-gray-600">{section.description}</p>
          </div>
          <div className="hidden md:block">
            <img 
              src="/assets/homecare.webp" 
              alt="NDIS Budget Support" 
              className="rounded-lg shadow-md w-full h-auto object-cover"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {section.questions?.map((question) => (
            <div key={question.id} className="border rounded-lg p-5 hover:border-blue-200 transition-colors">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id={question.id}
                    type="checkbox"
                    checked={selectedGoals.includes(question.id)}
                    onChange={() => handleGoalSelection(question.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={question.id} className="font-medium text-gray-700 cursor-pointer text-base">
                    {question.text}
                  </label>
                  <p className="text-gray-500 mt-1">{question.info}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <Button 
            onClick={goToNextSection} 
            className="bg-blue-600"
            disabled={selectedGoals.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderSupportCategorySection = (section: BudgetSection) => {
    // Filter supports based on selected goals
    const hasRelatedGoal = (relatedGoals: string[]) => {
      return relatedGoals.some(goal => selectedGoals.includes(goal));
    };

    return (
      <div className="space-y-6">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">{section.title}</h3>
            <p className="text-gray-600">{section.description}</p>
          </div>
          <div className="hidden md:block">
            <img 
              src={`/assets/${getSectionImage(section.id)}`}
              alt="NDIS Support Categories" 
              className="rounded-lg shadow-md w-full h-auto object-cover"
            />
          </div>
        </div>
        
        {section.subcategories?.map((subcategory, index) => {
          // Filter supports that match selected goals
          const eligibleSupports = subcategory.supports.filter(
            support => hasRelatedGoal(support.relatedGoals)
          );
          
          // Skip subcategories with no eligible supports
          if (eligibleSupports.length === 0 && showEligibleSupports) {
            return null;
          }
          
          return (
            <div key={subcategory.id} className="mb-10">
              <div className="border-l-4 border-blue-500 pl-4 py-2 mb-6">
                <h4 className="text-lg font-semibold text-gray-800">{subcategory.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{subcategory.description}</p>
              </div>
              
              <div className="space-y-4">
                {(showEligibleSupports ? eligibleSupports : subcategory.supports).map((support, supportIdx) => {
                  const isEligible = hasRelatedGoal(support.relatedGoals);
                  
                  // Add an image every 3 supports for visual interest
                  const showImage = supportIdx % 3 === 0 && supportIdx > 0;
                  
                  return (
                    <div 
                      key={support.id}
                      className={`border rounded-lg p-5 transition-shadow hover:shadow-md ${isEligible ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-800">{support.title}</h5>
                          <p className="text-gray-600 mt-1">{support.description}</p>
                        </div>
                        {isEligible && (
                          <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            May be eligible
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500 block">Eligibility Criteria:</span>
                          <p className="text-sm text-gray-700">{support.eligibilityCriteria}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 block">Evidence Required:</span>
                          <p className="text-sm text-gray-700">{support.evidenceRequired}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 block">Budget Category:</span>
                          <p className="text-sm text-gray-700">{support.budgetCategory}</p>
                        </div>
                      </div>
                      
                      {showImage && (
                        <div className="mt-4 hidden md:block">
                          <img 
                            src={`/assets/${index % 2 === 0 ? 'elderlyaboriginal.webp' : 'clinic.webp'}`}
                            alt={`NDIS Support - ${support.title}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="mt-8 flex justify-between space-x-4">
          <Button 
            variant="outline" 
            onClick={goToPreviousSection}
          >
            Back
          </Button>
          
          {activeSection !== budgetExplorer.sections[budgetExplorer.sections.length - 1].id && (
            <Button 
              onClick={goToNextSection} 
              className="bg-blue-600"
            >
              Continue
            </Button>
          )}
          
          {activeSection === budgetExplorer.sections[budgetExplorer.sections.length - 1].id && !showEligibleSupports && (
            <Button 
              onClick={() => setShowEligibleSupports(true)} 
              className="bg-blue-600"
            >
              Show Eligible Supports
            </Button>
          )}
          
          {showEligibleSupports && (
            <Button 
              onClick={() => {
                setShowEligibleSupports(false);
                setActiveSection("goals");
              }} 
              className="bg-blue-600"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
    );
  };

  const currentSection = budgetExplorer.sections.find(s => s.id === activeSection);
  
  if (!currentSection) {
    return <div className="text-center py-8">Loading budget calculator...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="w-full border-0 shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">NDIS Budget Calculator</h2>
            <div className="flex items-center gap-1 text-sm bg-blue-500 px-3 py-1 rounded-full">
              <span>
                {showEligibleSupports ? "Results" : `Step ${budgetExplorer.sections.findIndex(s => s.id === activeSection) + 1}/${budgetExplorer.sections.length}`}
              </span>
            </div>
          </div>
          <p className="text-blue-100 mt-1">
            {budgetExplorer.introText}
          </p>
        </div>
        
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-300" 
            style={{ 
              width: showEligibleSupports 
                ? '100%' 
                : `${((budgetExplorer.sections.findIndex(s => s.id === activeSection) + 1) / budgetExplorer.sections.length) * 100}%` 
            }}
          ></div>
        </div>
        
        <CardContent className="p-8">
          {currentSection.id === "goals" 
            ? renderGoalSelectionSection(currentSection)
            : renderSupportCategorySection(currentSection)}
          
          {/* Help box */}
          {!showEligibleSupports && (
            <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Understanding this tool</h4>
                  <p className="text-sm text-blue-700">
                    This calculator helps you understand what kinds of supports might be included in your NDIS plan based on your goals and needs. 
                    Remember that actual funding decisions are made by the NDIA using the "Reasonable and Necessary" criteria.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {showEligibleSupports && (
        <div className="mt-10 p-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Need help with your NDIS plan?</h2>
              <p className="mb-4 text-blue-100">Our experts can help you navigate the NDIS planning process and advocate for the supports you need.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200" />
                  <span className="text-sm">Expert advice on NDIS budgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200" />
                  <span className="text-sm">Help gathering the right evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200" />
                  <span className="text-sm">Support with plan reviews and appeals</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-6 md:flex-shrink-0">
              <img 
                src="/assets/grandma.webp" 
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
      )}
      
      {/* SEO content - hidden visually but available for search engines */}
      <div className="sr-only">
        <h2>NDIS Budget Calculator and Funding Planner</h2>
        <p>
          Our NDIS Budget Calculator helps participants understand what types of supports might be included in their NDIS plan based on their specific goals and needs.
          Plan your NDIS funding with our interactive tool designed to provide personalized guidance.
        </p>
        <h3>NDIS Budget Categories</h3>
        <p>The NDIS provides funding across three main budget categories:</p>
        <ul>
          <li>
            <strong>Core Supports:</strong> Everyday activities, consumables, assistance with daily living, social and community participation, and transport.
          </li>
          <li>
            <strong>Capacity Building Supports:</strong> Helps build independence and skills, including support coordination, improved daily living, employment support, and therapy services.
          </li>
          <li>
            <strong>Capital Supports:</strong> Assistive technologies, equipment, home and vehicle modifications, and specialized disability accommodation.
          </li>
        </ul>
        <h3>The NDIS Planning Process</h3>
        <p>
          NDIS planning involves identifying your goals, determining necessary supports, and developing a budget that meets the "reasonable and necessary" criteria.
          Evidence requirements can include assessments from health professionals, quotes for equipment, and documentation of your support needs.
        </p>
      </div>
    </div>
  );
};

export default NDISBudgetCalculator; 