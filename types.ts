export interface UserProfile {
  personal_info: {
    name: string;
    email: string;
    location: string;
    phone?: string;
    portfolio?: string;
    cv_name?: string; // Target CV filename for attachments
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
    attachments: string[]; // List of files sent
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