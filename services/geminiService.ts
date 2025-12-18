import { GoogleGenAI, Type } from "@google/genai";
import { Job, UserProfile } from "../types";
import { convertToLKR } from "./currencyService";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeJobRequirements = async (jobDescription: string) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract detailed technical requirements, salary, and benefits from this job description. 
      Focus heavily on:
      - Tools/Languages (e.g., Python, SQL, Azure, Spark)
      - Experience level required
      - Specific salary figures or ranges (average them for the 'amount' field)
      
      Job Description:
      "${jobDescription}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            must_have: { type: Type.ARRAY, items: { type: Type.STRING } },
            nice_to_have: { type: Type.ARRAY, items: { type: Type.STRING } },
            salary: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                currency: { type: Type.STRING }
              }
            },
            role_type: { type: Type.STRING, description: "e.g. Contract, Full-time" }
          },
          required: ["must_have", "nice_to_have"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    if (result.salary && result.salary.amount && result.salary.currency) {
      result.salary.converted_lkr = convertToLKR(result.salary.amount, result.salary.currency);
    }
    
    return result;
  } catch (error) {
    console.error("Error analyzing job:", error);
    throw error;
  }
};

export const generateApplicationMaterials = async (job: Job, profile: UserProfile) => {
  try {
    const ai = getAIClient();
    const prompt = `
      Act as a high-end Career Coach. Create application materials for:
      Job: ${job.title} at ${job.company}
      Candidate: ${profile.personal_info.name}
      Key Skills: ${profile.skills.must_have.join(", ")}
      
      CRITICAL FORMATTING RULES:
      1. Use double newlines (\\n\\n) between every paragraph.
      2. The signature (e.g., "Sincerely,\\n\\n${profile.personal_info.name}") MUST be at the very end.
      3. Ensure "Sincerely," is preceded by TWO newlines.
      4. Never leave the signature or closing on the same line as the final sentence.
      5. 'emailBody' should be concise and professional.
      6. 'coverLetter' should be a full 3-paragraph narrative.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emailBody: { type: Type.STRING, description: "Formatted email text with \\n\\n for paragraphs" },
            coverLetter: { type: Type.STRING, description: "Formatted letter text with \\n\\n for paragraphs and signature" }
          },
          required: ["emailBody", "coverLetter"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating materials:", error);
    return { 
      emailBody: `Dear Hiring Team,\n\nI am interested in the ${job.title} position.\n\nSincerely,\n\n${profile.personal_info.name}`,
      coverLetter: `To Whom It May Concern,\n\nI have the skills for ${job.title}...\n\nSincerely,\n\n${profile.personal_info.name}`
    };
  }
};

export const matchJobToProfile = async (job: Job, profile: UserProfile) => {
  try {
    const ai = getAIClient();
    const prompt = `
      Act as a Lead Technical Recruiter. Perform a deep reasoning match.
      Candidate Profile: ${JSON.stringify(profile, null, 2)}
      Job: ${job.title} at ${job.company}
      
      Compare technical stack, location preferences, and seniority.
      Output JSON with 'score' (0-100) and 'reasoning' (max 2 sentences).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error matching job:", error);
    throw error;
  }
};

export const discoverJobs = async (profile: UserProfile): Promise<Job[]> => {
  try {
    const ai = getAIClient();
    const rolesQuery = profile.desired_roles.join(", ");
    const instruction = `Find real, current job openings for: ${rolesQuery}. 
    Focus on companies in Sri Lanka and major remote platforms. 
    Use Google Search to find actual job listings from late 2024 or 2025.
    
    CRITICAL: Extract actual JOB TITLES and COMPANY NAMES.
    Return a JSON array of exactly 8 job objects.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: instruction,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The specific job title" },
              company: { type: Type.STRING, description: "Name of the hiring company" },
              location: { type: Type.STRING, description: "City or 'Remote'" },
              source: { type: Type.STRING, description: "The website where the job was found" },
              url: { type: Type.STRING, description: "Direct link to the job post" },
              description: { type: Type.STRING, description: "A brief summary of the role" }
            },
            required: ["title", "company", "url"]
          }
        },
        systemInstruction: "You are a professional job crawler. You excel at finding real-world job details including exact titles and company names.",
      },
    });

    let text = response.text || "[]";
    const rawJobs = JSON.parse(text);
    
    return rawJobs.map((j: any, index: number) => ({
      id: `discovered-${Date.now()}-${index}`,
      title: j.title || "Untitled Position",
      company: j.company || "Stealth Startup",
      location: j.location || "Remote",
      source: j.source || "Google Search",
      postedDate: new Date().toLocaleDateString(),
      description: j.description || "Detailed requirements available upon extraction.",
      status: 'discovered',
      url: j.url || "#",
      matchScore: 0
    }));
  } catch (error) {
    console.error("Discovery error:", error);
    return [];
  }
};

export const generateDailyDigest = async (newJobs: Job[], userName: string) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Briefing for ${userName} about ${newJobs.length} new roles found today.`,
    });
    return response.text;
  } catch (error) {
    return "Failed to generate briefing.";
  }
};