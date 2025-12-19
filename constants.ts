
import { Job, UserProfile } from "./types";

export const INITIAL_PROFILE: UserProfile = {
  personal_info: {
    name: "Diluksha Perera",
    email: "dilukshakaushal@gmail.com",
    phone: "077 - 1916256",
    location: "Borupana, Ratmalana",
    portfolio: "Link provided in CV",
    cv_name: "DPerera_CV.pdf"
  },
  desired_roles: [
    "Data Engineer", 
    "Associate Data Engineer", 
    "Junior Data Engineer"
  ],
  skills: {
    must_have: [
      "Python", 
      "Azure Data Factory", 
      "Azure Synapse", 
      "Power BI", 
      "SQL", 
      "Machine Learning", 
      "Deep Learning", 
      "PySpark"
    ],
    nice_to_have: [
      "TensorFlow", 
      "Keras", 
      "Hugging Face", 
      "ServiceNow API", 
      "Power Platform", 
      "R", 
      "Generative AI"
    ]
  },
  preferences: {
    locations: ["Remote", "Colombo", "Sri Lanka", "Hybrid"],
    salary_min: 150000,
    currency: "LKR",
    work_mode: 'remote',
    ai_provider: 'gemini',
    api_tokens: {
      hf_token: "",
      openrouter_token: ""
    },
    gas_url: "" // User will provide this from Google Apps Script
  }
};

export const MOCK_JOBS: Job[] = [
  {
    id: "job-demo-applied",
    title: "Data Systems Architect",
    company: "GlobalStream AI",
    location: "Remote (Global)",
    source: "LinkedIn",
    postedDate: "2024-05-22",
    description: "Looking for an expert to design our next-gen data platform using Spark and Synapse.",
    status: "applied",
    url: "https://linkedin.com/jobs/view/demo",
    matchScore: 94,
    matchReasoning: "Exceptional alignment with Azure Synapse and PySpark expertise.",
    applicationDetails: {
      emailBody: `Dear Hiring Team,

I am writing to formally express my strong interest in the Data Systems Architect position at GlobalStream AI, as advertised on LinkedIn. With a deep background in designing complex data architectures and a specialized focus on Azure Data Factory and Spark, I am confident that I can significantly contribute to the scalability and efficiency of your next-generation data platform.

My experience in building robust, end-to-end data pipelines aligns perfectly with GlobalStream AI's mission to push the boundaries of AI-driven streaming. I look forward to the possibility of discussing how my technical stack and architectural philosophy can help drive your engineering goals forward.

Sincerely,

Diluksha Perera`,
      coverLetter: `To the Hiring Committee at GlobalStream AI,

I am thrilled to submit my application for the Data Systems Architect role. Throughout my career as a Data Engineer, I have mastered the art of building scalable, high-performance data pipelines that serve as the backbone for advanced analytical systems. My expertise in Azure Synapse and PySpark has allowed me to design architectures that handle massive datasets with minimal latency—a requirement I understand is critical for the streaming solutions GlobalStream AI is currently developing.

In my previous roles, I have led several migration projects where legacy on-premise systems were transitioned into highly available cloud-native architectures. This involved not only the technical implementation using tools like Azure Data Factory but also a strategic rethinking of data governance and security protocols. GlobalStream AI’s commitment to high-performance ML architectures resonates deeply with my professional ambition to implement data systems that are not just functional, but truly transformative.

I am particularly impressed by your recent work in real-time processing and would be honored to bring my experience in distributed computing to your team. Thank you for your time and consideration. I am eager to demonstrate how my background in Data Engineering and my passion for AI systems can help GlobalStream AI reach its architectural milestones.

Sincerely,

Diluksha Perera`,
      sentAt: "Today, 10:30 AM",
      trackingId: "TRK-X92B7LZ",
      status: "delivered",
      attachments: ["DPerera_CV.pdf", "Cover_Letter_GlobalStream_AI.pdf"]
    }
  },
  {
    id: "job-101",
    title: "Senior Data Engineer",
    company: "TechFlow Solutions",
    location: "Remote",
    source: "LinkedIn",
    postedDate: "2024-05-20",
    description: "We are looking for a Senior Data Engineer to join our growing team. You will be responsible for building scalable data pipelines using Python and Spark. Salary: $5000 - $7000 per month.",
    status: "discovered",
    url: "https://linkedin.com/jobs/view/123",
    matchScore: 0
  }
];
