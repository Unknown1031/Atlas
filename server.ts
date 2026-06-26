import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const USERS_FILE = path.join(process.cwd(), "users.json");

interface UserAccount {
  email: string;
  passwordHash: string;
  state: any;
}

function loadUsers(): Record<string, UserAccount> {
  if (!fs.existsSync(USERS_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveUsers(users: Record<string, UserAccount>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save users:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Global Auth Endpoints
  app.post("/api/auth/register", (req, res) => {
    try {
      const { email, password, state } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const users = loadUsers();
      const normalizedEmail = email.toLowerCase().trim();
      if (users[normalizedEmail]) {
        return res.status(400).json({ error: "Account with this email already exists" });
      }
      users[normalizedEmail] = {
        email: normalizedEmail,
        passwordHash: password,
        state: state || {}
      };
      saveUsers(users);
      res.json({ status: "success", email: normalizedEmail });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const users = loadUsers();
      const normalizedEmail = email.toLowerCase().trim();
      const user = users[normalizedEmail];
      if (!user || user.passwordHash !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      res.json({ status: "success", email: normalizedEmail, state: user.state });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/sync-push", (req, res) => {
    try {
      const { email, password, state } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required for syncing" });
      }
      const users = loadUsers();
      const normalizedEmail = email.toLowerCase().trim();
      const user = users[normalizedEmail];
      if (!user || user.passwordHash !== password) {
        return res.status(401).json({ error: "Authentication failed during sync" });
      }
      user.state = state;
      users[normalizedEmail] = user;
      saveUsers(users);
      res.json({ status: "success" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ATLAS Brain Query Endpoint
  app.post("/api/atlas/query", async (req, res) => {
    try {
      const { 
        query,
        chatHistory = [],
        tasks = [], 
        subjects = [], 
        mistakes = [], 
        studyLogs = [], 
        universities = [], 
        coreStatus = null, 
        achievements = [], 
        subjectPerformances = [],
        vaultResources = [],
        weeklyReportsList = [],
        decisionLogs = [],
        dailyAccountability = [],
        journalEntries = [],
        topicHeatmaps = []
      } = req.body;

      const aiInstance = getAi();

      const formattedHistory = chatHistory.map((m: any) => {
        const speaker = m.sender === "user" ? "User" : "Atlas (Chief of Staff)";
        return `${speaker}: ${m.text}`;
      }).join("\n");

      const isDailyBriefing = query === "SYSTEM_GENERATE_DAILY_BRIEFING";
      let systemContext = "";

      if (isDailyBriefing) {
        const totalCount = 
          tasks.length + 
          studyLogs.length + 
          mistakes.length + 
          universities.length + 
          achievements.length + 
          subjectPerformances.length + 
          weeklyReportsList.length + 
          decisionLogs.length + 
          dailyAccountability.length + 
          journalEntries.length + 
          topicHeatmaps.length + 
          vaultResources.length + 
          (coreStatus ? (coreStatus.casExperiences.length + coreStatus.eeMilestones.length) : 0);

        systemContext = `
You are ATLAS, the central intelligence layer, Chief of Staff, Operations Director, and Strategic Advisor of this elite academic student platform.
Generate a concise, high-impact Daily Briefing report for the user, Devya.

FORMAT INSTRUCTIONS:
You MUST respond with a structured plain text response of this EXACT format:

ATLAS

Good [Morning/Afternoon/Evening] Devya.

I've analyzed ${totalCount} records.

Today:

• [Topic 1: Specific high-priority task, e.g. 'Finish Economics Macro' or 'Revise Math AI HL matrices']
• [Topic 2: EE or IA milestone risk, e.g. 'Business IA risk increasing' or 'Extended Essay draft compliance review']
• [Topic 3: Specific study log or subject trend, e.g. 'IPMAT QA improving' or 'ESS SL Pomodoro minutes needed']
• [Topic 4: Untouched/Weak area, e.g. 'Hindi untouched for 8 days' or '12 active bugs in Mistake Database']

Recommendation:
[1 sentence strategic action highlight, e.g. 'Focus Economics first.']

GUIDELINES:
1. Base the points strictly on REAL data from the live context below. Look for actual gaps, untouched subjects, low confidence, upcoming deadlines, or mistakes.
2. Maintain an authoritative, professional, minimal, objective, and analytical tone.
3. Absolutely DO NOT use emojis, motivational clichés, apologies, or conversational fluff. Keep it humble, literal, and highly impactful.

Live Platform Data Context:
- Enrolled Subjects & Syllabi: ${JSON.stringify(subjects)}
- Subject Performance Metrics: ${JSON.stringify(subjectPerformances)}
- Core Status (EE, IA, CAS): ${JSON.stringify(coreStatus)}
- Task List (Deadlines & Assignments): ${JSON.stringify(tasks)}
- Study Logs (Time tracked): ${JSON.stringify(studyLogs)}
- Mistake Database (Conceptual bugs): ${JSON.stringify(mistakes)}
- University Target List: ${JSON.stringify(universities)}
- Achievements & Evidence Vault: ${JSON.stringify(achievements)}
- Resource Vault files: ${JSON.stringify(vaultResources)}
- Weekly Performance Reports (History): ${JSON.stringify(weeklyReportsList)}
- Decision Logs: ${JSON.stringify(decisionLogs)}
- Daily Accountability logs: ${JSON.stringify(dailyAccountability)}
- Journal Entries: ${JSON.stringify(journalEntries)}
- Topic Heatmaps: ${JSON.stringify(topicHeatmaps)}
`;
      } else {
        systemContext = `
You are ATLAS, the central intelligence layer, Chief of Staff, Operations Director, and Strategic Advisor of this elite academic student platform.
You are authoritative, strategic, highly analytical, objective, and deeply committed to the student's success (IBDP 40+ scores, IPMAT preparation, Ivy-tier applications).
You speak like an Operations Director or Chief of Staff, never like a virtual generic chatbot. Keep your tone professional, strategic, structured, and direct.

GUIDELINES FOR RESPONSE:
1. CONTEXT AWARENESS: You have full access to the live platform databases (see Live Platform Data Context below). Always cross-reference their actual metrics, study logs, mistakes, target universities, and deadlines in your responses.
2. TOOL/ACTION NAVIGATION: Decide when the user's intent implies navigating to a specific screen or resource, and include a structured action object in your JSON output.
   - For example:
     * User says "open economics", "take me to econ" -> set action target to "subject_detail" with subjectId "ECON_HL".
     * User says "show deadlines", "what's due?" -> set action target to "deadline_radar".
     * User says "show weaknesses", "my mistakes" -> set action target to "mistakes".
     * User says "where are my reports?", "strategy log" -> set action target to "ai_reports".
     * User says "take me to business IA", "show CAS log" -> set action target to "ia_ee_cas".
     * User says "open my achievements" -> set action target to "achievement_vault".
   - If no navigation is implied, set "action" to null.
3. MEMORY: Always review the preceding Conversation History. Standard context must carry over. If the user asks a follow-up question like "Why?", evaluate it based on the previous context (e.g., if the previous answer was about ESS SL being their weakest subject, "Why?" is asking why ESS SL has low confidence).
4. PROACTIVE REASONING: If the user asks "What should I do today?" or similar open-ended planning queries, you must synthesize and evaluate:
   - Deadlines: Which critical tasks are coming up on the Deadline Radar?
   - Weak topics: Which subjects/topics have confidence scores below 6/10?
   - Revision gaps: Which subject has not been studied in over 10 days?
   - Recent performance: Look at recent daily accountability integrity scores.
   - IPMAT prep: Has IPMAT received sufficient Pomodoro minutes?
   Then present 3-5 highly prioritized, concrete, and actionable tactical recommendations for today.
5. FALLBACK BEHAVIOR: Never respond with "I do not understand" or generic non-answers. If a user query is ambiguous, infer their logical intent based on their active state, ask strategic clarifying questions, and provide the best-possible strategic path.

Live Platform Data Context:
- Enrolled Subjects & Syllabi: ${JSON.stringify(subjects)}
- Subject Performance Metrics: ${JSON.stringify(subjectPerformances)}
- Core Status (EE, IA, CAS): ${JSON.stringify(coreStatus)}
- Task List (Deadlines & Assignments): ${JSON.stringify(tasks)}
- Study Logs (Time tracked): ${JSON.stringify(studyLogs)}
- Mistake Database (Conceptual bugs): ${JSON.stringify(mistakes)}
- University Target List: ${JSON.stringify(universities)}
- Achievements & Evidence Vault: ${JSON.stringify(achievements)}
- Resource Vault files: ${JSON.stringify(vaultResources)}
- Weekly Performance Reports (History): ${JSON.stringify(weeklyReportsList)}
- Decision Logs: ${JSON.stringify(decisionLogs)}
- Daily Accountability logs: ${JSON.stringify(dailyAccountability)}
- Journal Entries: ${JSON.stringify(journalEntries)}
- Topic Heatmaps (Detailed performance analytics): ${JSON.stringify(topicHeatmaps)}

Conversation History (for context and memory):
${formattedHistory}

Latest User Message to respond to: "${query}"

Return a structured JSON object strictly conforming to the requested schema. Use markdown inside the 'answer' text to render tables, bold texts, or bullet points cleanly.
`;
      }

      const response = await aiInstance.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemContext,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: "The strategic, analytical, conversational response from Atlas (Chief of Staff). Can include markdown formatting."
              },
              action: {
                type: Type.OBJECT,
                description: "Optional navigation action if inferred or requested.",
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "The type of action. Always 'navigate'."
                  },
                  target: {
                    type: Type.STRING,
                    description: "The target view page ID. Allowed values: 'dashboard', 'achievement_vault', 'subject_performance', 'ia_ee_cas', 'ipmat', 'deadline_radar', 'universities', 'mistakes', 'ai_reports', 'subject_detail'."
                  },
                  subjectId: {
                    type: Type.STRING,
                    description: "The subject ID if target is 'subject_detail'. Allowed values: 'MATH_AI_HL', 'ECON_HL', 'BM_HL', 'HINDI_SL', 'ENGLISH_SL', 'ESS_SL'."
                  }
                }
              }
            },
            required: ["answer"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText.trim());
      res.json(parsed);
    } catch (error: any) {
      console.error("Atlas AI query failed:", error);
      res.status(500).json({ error: error.message || "Failed to query Atlas brain" });
    }
  });

  // Lazy initialize Gemini AI client
  let aiClient: GoogleGenAI | null = null;
  function getAi() {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel in AI Studio.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  app.post("/api/generate-weekly-report", async (req, res) => {
    try {
      const { logs, mistakes, subjects, ipmat, targetUnis } = req.body;
      const aiInstance = getAi();
      
      const prompt = `You are an elite academic mentor specializing in the International Baccalaureate Diploma Programme (IBDP) Year 2 and the IPMAT (Integrated Program in Management Aptitude Test) preparation. 
      Analyze the following student data and generate a comprehensive, highly motivational, and actionable Weekly Progress & Mistake Report.
      
      STUDENT DATA:
      - Subjects: ${JSON.stringify(subjects)}
      - Recent Study Logs: ${JSON.stringify(logs)}
      - Mistake Database Entries: ${JSON.stringify(mistakes)}
      - IPMAT Section Status: ${JSON.stringify(ipmat)}
      - University Application Targets: ${JSON.stringify(targetUnis)}
      
      Please structure the response as a beautiful, clean HTML string (wrapped inside a <div class="space-y-6"> with custom styling, utilizing standard elements like h2, h3, p, ul, li, strong, etc.).
      Do NOT include markdown block markers (like \`\`\`html) in your response, just return the raw HTML string itself so it can be rendered directly with dangerouslySetInnerHTML.
      
      Use nice tailwind-compatible classes if you want (e.g. text-2xl, font-bold, text-slate-800, mt-4, border-l-4, border-slate-500, pl-4, etc.) to make the design match a high-end personal dashboard.
      
      Sections to include:
      1. Executive Summary (overview of the week, logged hours, focus metrics, and a warm mentor's review).
      2. Mistake Pattern Identification (critical conceptual bugs spotted in the Mistake Database, with specific corrections).
      3. Subject Strategy Adjustments (individual tips for MATH AI HL, ECON HL, BM HL, HINDI SL, ENGLISH SL, ESS SL based on their state and study logs).
      4. IPMAT Tactical Advice (Verbal/Quant recommendations).
      5. Core IB Priorities (EE, CAS, and IA guidance).
      6. Strategic Targets for the Coming Week (3-5 highly actionable and specific items).
      
      Ensure your suggestions are realistic but ambitious, acknowledging the intensity of IBDP Year 2!`;

      const response = await aiInstance.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      
      res.json({ report: response.text });
    } catch (error: any) {
      console.error("Gemini report generation failed:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI report" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
