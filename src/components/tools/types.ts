// Common types for NDIS tools

// Schema for structured data
export interface SchemaData {
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

// Tool data structure
export interface ToolData {
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
    requirements?: Array<{ title: string; description: string }>;
    disabilityTypes?: Array<{ type: string; examples: string; considerations: string }>;
    adhdNote?: string;
    earlyInterventionPoints?: string[];
    budgetCategories?: Array<{ 
      title: string; 
      description: string; 
      subcategories: string;
      flexibility: string;
    }>;
    reasonableNecessary?: {
      description: string;
      criteria: Array<{ title: string; description: string }>;
    };
    evidenceSection?: {
      description: string;
      examples: Array<{ type: string; description: string }>;
    };
    planningProcess?: {
      description: string;
      steps: Array<{ title: string; description: string }>;
    };
    nextSteps: Array<{ title: string; description: string }>;
    ctaTitle: string;
    ctaDescription: string;
  };
  budgetExplorer?: BudgetExplorerData;
}

// Eligibility checker types
export interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
  image?: string;
}

export interface Option {
  value: string;
  label: string;
  nextQuestion?: string;
  result?: Result;
}

export interface Result {
  eligible: "yes" | "no" | "likely" | "unlikely" | "maybe";
  title: string;
  message: string;
  nextSteps: string;
  image?: string;
}

// Budget calculator types
export interface BudgetExplorerData {
  introText: string;
  sections: BudgetSection[];
  headerImage?: string;
}

export interface BudgetSection {
  id: string;
  title: string;
  description: string;
  image?: string;
  questions?: {
    id: string;
    text: string;
    type: string;
    info: string;
  }[];
  subcategories?: {
    id: string;
    title: string;
    description: string;
    image?: string;
    supports: {
      id: string;
      title: string;
      description: string;
      eligibilityCriteria: string;
      evidenceRequired: string;
      relatedGoals: string[];
      budgetCategory: string;
      image?: string;
    }[];
  }[];
} 