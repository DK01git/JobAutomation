
export interface UserProfile {
  personal_info: {
    name: string;
    email: string;
    location: string;
    phone?: string;
    portfolio?: string;
    cv_name?: string;
  };
  desired_roles: string[];
  skills: {
    must_have: string[];
    nice_to_have: string[];
  };
  preferences: {
    locations: string[];
    salary_min: number;
    currency: string;
    work_mode: 'remote' | 'hybrid' | 'onsite' | 'any';
    ai_provider: 'gemini' | 'openrouter' | 'huggingface';
    api_tokens: {
      hf_token?: string;
      openrouter_token?: string;
    };
    gas_url?: string; // Google Apps Script Web App URL
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  postedDate: string;
  description: string;
  status: 'discovered' | 'extracted' | 'matched' | 'applied' | 'rejected';
  matchScore?: number;
  matchReasoning?: string;
  missingSkills?: string[]; 
  matchBreakdown?: {
    technical: number; 
    culture: number;   
    growth: number;    
    logistics: number; 
  };
  extractedRequirements?: {
    must_have: string[];
    nice_to_have: string[];
    salary?: {
      amount: number;
      currency: string;
      converted_lkr?: number;
    };
  };
  url: string;
  applicationDetails?: {
    emailBody: string;
    coverLetter: string;
    sentAt: string;
    trackingId: string;
    status: 'delivered' | 'read' | 'pending';
    attachments: string[];
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: 'ORCHESTRATOR' | 'DISCOVERY' | 'EXTRACTION' | 'MATCHING' | 'SUBMISSION' | 'SCHEDULER';
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

export type ViewState = 'dashboard' | 'jobs' | 'profile' | 'logs' | 'outbox';
