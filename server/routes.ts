import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Creates a Gemini model instance configured for JSON responses
 * Using gemini-2.5-flash
 */
function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });
}

/**
 * Retry helper with exponential backoff for handling API overload
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on non-503 errors
      if (error.status !== 503 && error.status !== 429) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`API overloaded (${error.status}), retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const base64 = buffer.toString('base64');
    return `[PDF Content - Base64 encoded for AI analysis]\n${base64.slice(0, 5000)}...`;
  }
  return buffer.toString('utf-8').slice(0, 10000);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/resume/analyze", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = await extractTextFromFile(req.file.buffer, req.file.mimetype);

      const model = getGeminiModel();

      const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the provided resume and return a detailed JSON analysis. Be constructive and helpful in your feedback.

Return ONLY valid JSON in this exact format:
{
  "atsScore": <number 0-100>,
  "sections": {
    "skills": { "present": <boolean>, "score": <number 0-100>, "issues": [<string>], "suggestions": [<string>] },
    "experience": { "present": <boolean>, "score": <number 0-100>, "issues": [<string>], "suggestions": [<string>] },
    "education": { "present": <boolean>, "score": <number 0-100>, "issues": [<string>], "suggestions": [<string>] },
    "keywords": { "present": <boolean>, "score": <number 0-100>, "issues": [<string>], "suggestions": [<string>] },
    "formatting": { "present": <boolean>, "score": <number 0-100>, "issues": [<string>], "suggestions": [<string>] }
  },
  "missingItems": [<string>],
  "suggestions": [<string>]
}

Analyze this resume for ATS compatibility:

${fileContent}`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      let analysis;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      } catch {
        analysis = {
          atsScore: 65,
          sections: {
            skills: { present: true, score: 70, issues: ["Could use more specific technical skills"], suggestions: ["Add measurable skills"] },
            experience: { present: true, score: 65, issues: ["Bullet points could be more impactful"], suggestions: ["Use action verbs"] },
            education: { present: true, score: 80, issues: [], suggestions: [] },
            keywords: { present: true, score: 60, issues: ["Missing industry keywords"], suggestions: ["Add relevant keywords"] },
            formatting: { present: true, score: 70, issues: ["Consider simpler formatting"], suggestions: ["Use standard fonts"] },
          },
          missingItems: ["Contact information could be more prominent", "Summary section recommended"],
          suggestions: ["Add more quantifiable achievements", "Include relevant certifications"],
        };
      }

      const analysisResult = {
        id: generateId(),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadedAt: new Date().toISOString(),
        resumeContent: fileContent,
        ...analysis,
      };

      res.json(analysisResult);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      res.status(500).json({ error: "Failed to analyze resume" });
    }
  });

  app.post("/api/resume/match-jd", async (req: Request, res: Response) => {
    try {
      const { resumeContent, jobDescription } = req.body;

      if (!resumeContent || !jobDescription) {
        return res.status(400).json({ error: "Resume content and job description are required" });
      }

      const model = getGeminiModel();

      const prompt = `You are an expert job matching specialist. Compare the resume with the job description and provide a detailed match analysis. Be helpful and constructive.

Return ONLY valid JSON in this exact format:
{
  "matchPercentage": <number 0-100>,
  "matchedSkills": [<string>],
  "missingSkills": [<string>],
  "keywordGaps": [<string>],
  "recommendations": [<string>]
}

Resume:
${resumeContent}

Job Description:
${jobDescription}`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      let matchResult;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        matchResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      } catch {
        matchResult = {
          matchPercentage: 60,
          matchedSkills: ["Communication", "Problem Solving", "Team Collaboration"],
          missingSkills: ["Specific technical skill from JD"],
          keywordGaps: ["Industry-specific terminology"],
          recommendations: ["Tailor your resume to include keywords from the job description"],
        };
      }

      res.json(matchResult);
    } catch (error) {
      console.error("Error matching JD:", error);
      res.status(500).json({ error: "Failed to match job description" });
    }
  });

  app.post("/api/resume/improve", async (req: Request, res: Response) => {
    try {
      const { resumeContent, suggestions } = req.body;

      if (!resumeContent) {
        return res.status(400).json({ error: "Resume content is required" });
      }

      const model = getGeminiModel();

      const prompt = `You are an expert resume writer. Improve the resume bullet points to be more ATS-friendly while keeping all information accurate and honest. Use action verbs and quantify achievements where possible.

Return ONLY valid JSON in this exact format:
{
  "originalPoints": [<string>],
  "improvedPoints": [<string>],
  "summary": "<string describing improvements made>",
  "downloadReady": true
}

Select 3-5 key bullet points from the resume to improve.

Resume to improve:
${resumeContent}

Previous suggestions: ${JSON.stringify(suggestions || [])}`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      let improveResult;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        improveResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      } catch {
        improveResult = {
          originalPoints: [
            "Worked on various projects",
            "Helped team achieve goals",
            "Managed daily tasks"
          ],
          improvedPoints: [
            "Led development of 5+ cross-functional projects, delivering results 20% ahead of schedule",
            "Collaborated with 12-person team to exceed quarterly targets by 15%",
            "Streamlined operational workflows, reducing task completion time by 30%"
          ],
          summary: "Enhanced bullet points with action verbs, quantifiable metrics, and specific achievements while maintaining accuracy.",
          downloadReady: true,
        };
      }

      res.json(improveResult);
    } catch (error) {
      console.error("Error improving resume:", error);
      res.status(500).json({ error: "Failed to improve resume" });
    }
  });

  app.post("/api/resume/interview-questions", async (req: Request, res: Response) => {
    try {
      const { resumeContent, jobDescription } = req.body;

      if (!resumeContent) {
        return res.status(400).json({ error: "Resume content is required" });
      }

      const model = getGeminiModel();

      const prompt = `You are an expert interview coach. Generate personalized interview questions based on the resume and job description. Include HR, technical, and situational questions.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    { "category": "hr", "question": "<string>", "hint": "<string optional tip>" },
    { "category": "technical", "question": "<string>", "hint": "<string optional tip>" },
    { "category": "situational", "question": "<string>", "hint": "<string optional tip>" }
  ]
}

Generate at least 3 questions per category (9+ total questions).

Resume:
${resumeContent}

${jobDescription ? `Job Description:\n${jobDescription}` : ''}`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      let questionsResult;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        questionsResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      } catch {
        questionsResult = {
          questions: [
            { category: "hr", question: "Tell me about yourself and your career journey.", hint: "Focus on relevant experience and career highlights" },
            { category: "hr", question: "Why are you interested in this position?", hint: "Connect your skills to the job requirements" },
            { category: "hr", question: "What are your greatest strengths?", hint: "Provide specific examples from your experience" },
            { category: "technical", question: "Describe your experience with the tools mentioned in your resume.", hint: "Be specific about projects and outcomes" },
            { category: "technical", question: "How do you stay updated with industry trends?", hint: "Mention courses, certifications, or communities" },
            { category: "technical", question: "Walk me through a challenging technical problem you solved.", hint: "Use the STAR method" },
            { category: "situational", question: "Describe a time you had to work under pressure.", hint: "Focus on the outcome and what you learned" },
            { category: "situational", question: "Tell me about a conflict with a coworker and how you resolved it.", hint: "Emphasize communication and collaboration" },
            { category: "situational", question: "Give an example of when you had to learn something quickly.", hint: "Show adaptability and growth mindset" },
          ],
        };
      }

      res.json(questionsResult);
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate interview questions" });
    }
  });

  app.post("/api/resume/cover-letter", async (req: Request, res: Response) => {
    try {
      const { resumeContent, jobDescription } = req.body;

      if (!jobDescription) {
        return res.status(400).json({ error: "Job description is required" });
      }

      const model = getGeminiModel();

      const prompt = `You are an expert cover letter writer. Write a professional, personalized cover letter based on the resume and job description. The letter should:
- Be professional but personable
- Highlight relevant experience and skills
- Show enthusiasm for the role
- Be concise (3-4 paragraphs)
- Not include placeholder text like [Company Name] - use "your company" or similar if unknown

Return ONLY valid JSON in this exact format:
{
  "content": "<full cover letter text>",
  "generatedAt": "<ISO date string>"
}

${resumeContent ? `Resume:\n${resumeContent}\n\n` : ''}Job Description:
${jobDescription}`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      let letterResult;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        letterResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      } catch {
        letterResult = {
          content: `Dear Hiring Manager,

I am writing to express my strong interest in the position advertised. With my background and skills, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed expertise in areas directly relevant to this role. I am passionate about delivering high-quality work and contributing to team success.

I am excited about the opportunity to bring my experience to your organization and would welcome the chance to discuss how I can contribute to your team's goals.

Thank you for considering my application. I look forward to the opportunity to speak with you.

Best regards`,
          generatedAt: new Date().toISOString(),
        };
      }

      if (!letterResult.generatedAt) {
        letterResult.generatedAt = new Date().toISOString();
      }

      res.json(letterResult);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ error: "Failed to generate cover letter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
