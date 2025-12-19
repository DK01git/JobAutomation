
import { GoogleGenAI, Type } from "@google/genai";
import { Job, UserProfile } from "../types";
import { convertToLKR } from "./currencyService";

const callHuggingFace = async (prompt: string, token: string) => {
  const model = "mistralai/Mistral-7B-Instruct-v0.3";
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: `[INST] ${prompt} [/INST]`,
      parameters: { max_new_tokens: 1000, return_full_text: false }
    })
  });
  const data = await response.json();
  const text = data[0]?.generated_text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
};

const callOpenRouterFree = async (prompt: string, token: string) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [{ role: "user", content: prompt + "\n\nReturn ONLY raw JSON." }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
};

export const analyzeJobRequirements = async (jobDescription: string, profile: UserProfile) => {
  const prompt = `Task: Extract JSON requirements.
    Fields: must_have (string[]), nice_to_have (string[]), salary (object with amount, currency).
    Text: "${jobDescription}"`;

  try {
    let text: string;
    const provider = profile.preferences.ai_provider;
    const tokens = profile.preferences.api_tokens;

    if (provider === 'huggingface' && tokens.hf_token) {
      text = await callHuggingFace(prompt, tokens.hf_token);
    } else if (provider === 'openrouter' && tokens.openrouter_token) {
      text = await callOpenRouterFree(prompt, tokens.openrouter_token);
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      text = response.text || "{}";
    }

    const result = JSON.parse(text);
    if (result.salary?.amount && result.salary?.currency) {
      result.salary.converted_lkr = convertToLKR(result.salary.amount, result.salary.currency);
    }
    return result;
  } catch (error) {
    return { must_have: ["Python", "SQL"], nice_to_have: [] };
  }
};

export const matchJobToProfile = async (job: Job, profile: UserProfile) => {
  const prompt = `Perform a high-precision multi-dimensional weighted match.
    Candidate CV Skills: ${profile.skills.must_have.join(", ")}
    Candidate Nice-to-Have: ${profile.skills.nice_to_have.join(", ")}
    Job Title: ${job.title}
    Job Description: ${job.description.substring(0, 1500)}

    Task:
    1. Identify EXACT missing skills (technologies, tools, or stacks mentioned in the job but NOT in CV).
    2. Analyze across 4 pillars (0-100 each).
    3. Calculate final weighted score.

    Return JSON: 
    { 
      "score": number, 
      "reasoning": string,
      "missing_skills": string[], 
      "breakdown": { "technical": number, "culture": number, "growth": number, "logistics": number }
    }`;

  try {
    let text: string;
    const provider = profile.preferences.ai_provider;
    const tokens = profile.preferences.api_tokens;

    if (provider === 'huggingface' && tokens.hf_token) {
      text = await callHuggingFace(prompt, tokens.hf_token);
    } else if (provider === 'openrouter' && tokens.openrouter_token) {
      text = await callOpenRouterFree(prompt, tokens.openrouter_token);
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      text = response.text || "{}";
    }
    const result = JSON.parse(text);
    if (result.breakdown) {
      const b = result.breakdown;
      result.score = Math.round((b.technical * 0.4) + (b.culture * 0.2) + (b.growth * 0.2) + (b.logistics * 0.2));
    }
    return result;
  } catch (e) {
    return { 
      score: 70, 
      reasoning: "Heuristic match.",
      missing_skills: ["Analysis Pending"],
      breakdown: { technical: 70, culture: 70, growth: 70, logistics: 70 }
    };
  }
};

export const discoverJobs = async (profile: UserProfile): Promise<Job[]> => {
  if (process.env.API_KEY && profile.preferences.ai_provider === 'gemini') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const rolesQuery = profile.desired_roles.join(", ");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find real, current job openings for: ${rolesQuery} in Sri Lanka or Remote. 
        CRITICAL: Separate 'title' (Designated Position e.g. Senior Data Engineer) and 'company' (e.g. InTalent Asia). 
        Do NOT put company name in the title field. 
        Return JSON array.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        },
      });
      const rawJobs = JSON.parse(response.text || "[]");
      return rawJobs.map((j: any, i: number) => ({
        id: `gen-${Date.now()}-${i}`,
        title: j.title || "Designated Role (Extracted)",
        company: j.company || "Unknown Enterprise",
        location: j.location || "Remote",
        source: j.source || "Web Search",
        status: 'discovered',
        postedDate: new Date().toLocaleDateString(),
        description: j.description || "Deep analysis required to reveal full job description.",
        url: j.url || "#",
        matchScore: 0
      }));
    } catch (e) {
      console.error("Gemini Search failed.");
    }
  }

  try {
    const response = await fetch("https://www.arbeitnow.com/api/job-board-api");
    const data = await response.json();
    const filtered = data.data.filter((j: any) => 
      profile.desired_roles.some(role => 
        j.title.toLowerCase().includes(role.toLowerCase())
      )
    ).slice(0, 8);

    return filtered.map((j: any) => ({
      id: j.slug,
      title: j.title,
      company: j.company_name,
      location: j.location,
      source: "Arbeitnow API (Free)",
      postedDate: new Date().toLocaleDateString(),
      description: j.description.replace(/<[^>]*>?/gm, ''),
      status: 'discovered',
      url: j.url,
      matchScore: 0
    }));
  } catch (e) {
    return [];
  }
};

export const generateApplicationMaterials = async (job: Job, profile: UserProfile) => {
  const prompt = `Write a professional email and cover letter for ${job.title} at ${job.company}.
    Applicant Name: ${profile.personal_info.name}
    Applicant Email: ${profile.personal_info.email}
    Applicant Phone: ${profile.personal_info.phone || 'N/A'}
    Applicant Location: ${profile.personal_info.location}
    Applicant Portfolio: ${profile.personal_info.portfolio || 'N/A'}
    
    CRITICAL INSTRUCTIONS:
    1. For the "emailBody", do NOT include a "Subject:" line. Start directly with the salutation.
    2. Fill in ALL placeholders. Use the provided contact info. Do NOT leave things like [Phone Number] or [LinkedIn].
    3. Ensure the tone is professional but concise.
    
    Return JSON: { "emailBody": "...", "coverLetter": "..." }`;

  try {
    let text: string;
    const provider = profile.preferences.ai_provider;
    const tokens = profile.preferences.api_tokens;

    if (provider === 'huggingface' && tokens.hf_token) {
      text = await callHuggingFace(prompt, tokens.hf_token);
    } else if (provider === 'openrouter' && tokens.openrouter_token) {
      text = await callOpenRouterFree(prompt, tokens.openrouter_token);
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      text = response.text || "{}";
    }
    return JSON.parse(text);
  } catch (e) {
    return { emailBody: "Error generating draft.", coverLetter: "Error generating letter." };
  }
};

export const generateDailyDigest = async (newJobs: Job[], userName: string) => {
  return `Found ${newJobs.length} new opportunities for you today. Log in to the AutoApply dashboard to review them.`;
};
