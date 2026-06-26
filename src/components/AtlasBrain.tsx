import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Terminal, 
  ShieldAlert, 
  TrendingUp, 
  HelpCircle, 
  X, 
  Brain, 
  Command, 
  Compass, 
  AlertTriangle, 
  Award, 
  Clock, 
  Zap, 
  ChevronRight,
  RefreshCw,
  Search,
  BookOpen
} from "lucide-react";
import { 
  Task, 
  Subject, 
  Mistake, 
  StudyLog, 
  University, 
  IaEeCasStatus, 
  SubjectPerformance,
  VaultResource,
  WeeklyPerformanceReport,
  DecisionLog,
  DailyAccountability,
  JournalEntry,
  TopicHeatmap
} from "../types";

interface AtlasBrainProps {
  tasks: Task[];
  subjects: Subject[];
  mistakes: Mistake[];
  studyLogs: StudyLog[];
  universities: University[];
  coreStatus: IaEeCasStatus | null;
  achievements: any[];
  subjectPerformances: SubjectPerformance[];
  setActivePage: (page: string) => void;
  setSelectedSubjectId: (id: string | null) => void;
  vaultResources: VaultResource[];
  weeklyReportsList: WeeklyPerformanceReport[];
  decisionLogs: DecisionLog[];
  dailyAccountability: DailyAccountability[];
  journalEntries: JournalEntry[];
  topicHeatmaps: TopicHeatmap[];
}

export default function AtlasBrain({
  tasks,
  subjects,
  mistakes,
  studyLogs,
  universities,
  coreStatus,
  achievements,
  subjectPerformances,
  setActivePage,
  setSelectedSubjectId,
  vaultResources,
  weeklyReportsList,
  decisionLogs,
  dailyAccountability,
  journalEntries,
  topicHeatmaps
}: AtlasBrainProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"briefing" | "chat">("briefing");
  
  // Daily Briefing state
  const [dailyBriefingText, setDailyBriefingText] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  const pipelineMessages = [
    "Accessing Academic Records...",
    "Loading Study History...",
    "Analyzing Performance Trends...",
    "Evaluating Deadlines...",
    "Comparing Historical Data...",
    "Generating Strategic Assessment..."
  ];

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "atlas"; text: string; isHtml?: boolean }>>([
    { 
      sender: "atlas", 
      text: "Awaiting instruction. I am Atlas, your Chief of Staff and Operations Director. Ask me anything about your academic strategy, mistakes, subject rankings, or deadlines." 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Command palette state
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  // Pre-load Memory database quick questions
  const preLoadedQuestions = [
    { label: "What is my biggest mistake?", q: "What is my biggest mistake or hardest concept recorded?" },
    { label: "Economics Performance Compare", q: "Compare my Economics HL performance and revision status." },
    { label: "What demonstrates leadership?", q: "What CAS experiences or achievements demonstrate leadership?" },
    { label: "Evaluate my consistency", q: "Analyze my study logs and evaluate my consistency." }
  ];

  // Trigger daily briefing automatically on open
  const triggerDailyBriefing = async () => {
    setBriefingLoading(true);
    setPipelineStep(0);
    setActivePanel("briefing");

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < pipelineMessages.length) {
        setPipelineStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 220);

    try {
      const response = await fetch("/api/atlas/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SYSTEM_GENERATE_DAILY_BRIEFING",
          chatHistory: [],
          tasks,
          subjects,
          mistakes,
          studyLogs,
          universities,
          coreStatus,
          achievements,
          subjectPerformances,
          vaultResources,
          weeklyReportsList,
          decisionLogs,
          dailyAccountability,
          journalEntries,
          topicHeatmaps
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDailyBriefingText(data.answer);
    } catch (err) {
      console.error("Daily briefing generation failed:", err);
      // Fallback
      setDailyBriefingText(`ATLAS\n\nGood Evening Devya.\n\nI've analyzed local records.\n\nToday:\n\n• Finish Economics Macro\n• Business IA risk increasing\n• IPMAT QA improving\n• Hindi untouched for 8 days\n\nRecommendation:\nFocus Economics first.`);
    } finally {
      setTimeout(() => {
        clearInterval(interval);
        setBriefingLoading(false);
      }, 1500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      triggerDailyBriefing();
    }
  }, [isOpen]);

  // Forward legacy command triggers to the unified conversational intelligence
  const handleCommandExecute = (commandText: string) => {
    handleQueryAtlas(commandText);
  };

  // Conversation query utilizing backend Gemini integration with full live state
  const handleQueryAtlas = async (userQ: string) => {
    if (!userQ.trim()) return;
    
    // Switch to Strategy Chat tab immediately to observe the synthesis
    setActivePanel("chat");

    const newMsg = { sender: "user" as const, text: userQ };
    const updatedMessages = [...chatMessages, newMsg];
    
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/atlas/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: userQ,
          chatHistory: updatedMessages.slice(0, -1), // pass previous thread
          tasks,
          subjects,
          mistakes,
          studyLogs,
          universities,
          coreStatus,
          achievements,
          subjectPerformances,
          vaultResources,
          weeklyReportsList,
          decisionLogs,
          dailyAccountability,
          journalEntries,
          topicHeatmaps
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "System failure during strategic synthesis.");

      setChatMessages(prev => [
        ...prev, 
        { sender: "atlas", text: data.answer || "No response received from main terminal." }
      ]);

      // Handle structural action if returned by Gemini!
      if (data.action && data.action.type === "navigate") {
        const { target, subjectId } = data.action;
        if (target === "subject_detail" && subjectId) {
          setSelectedSubjectId(subjectId);
          setActivePage("subject_detail");
          setChatMessages(prev => [
            ...prev,
            { sender: "atlas", text: `[MISSION CONTROL] Navigating to your ${subjects.find(s => s.id === subjectId)?.name || subjectId} detail page.` }
          ]);
        } else if (target) {
          const pageId = (target === "ai_reports" || target === "reports") ? "ai_reports" : target;
          setActivePage(pageId);
          
          // Find nice human-friendly label for the page feedback
          let pageLabel = pageId;
          if (pageId === "deadline_radar") pageLabel = "Deadline Radar";
          else if (pageId === "mistakes") pageLabel = "Mistake Database";
          else if (pageId === "ia_ee_cas") pageLabel = "IA, EE & CAS Manager";
          else if (pageId === "ipmat") pageLabel = "IPMAT Prep Hub";
          else if (pageId === "achievement_vault") pageLabel = "Achievement Vault";
          else if (pageId === "universities") pageLabel = "Target Universities";
          else if (pageId === "ai_reports") pageLabel = "AI Weekly Reports";
          else if (pageId === "subject_performance") pageLabel = "Performance Tracker";
          else if (pageId === "dashboard" || pageId === "home") pageLabel = "Dashboard";

          setChatMessages(prev => [
            ...prev,
            { sender: "atlas", text: `[MISSION CONTROL] Navigating to ${pageLabel}.` }
          ]);
        }
      }
    } catch (e: any) {
      setChatMessages(prev => [
        ...prev,
        { sender: "atlas", text: `[CRITICAL NOTICE] Connection to Atlas Core interrupted. ${e.message}. Fallback: Check your upcoming deadlines on the Deadline Radar and focus on low confidence topics.` }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button (Permanently visible in bottom-right corner) */}
      <div className="fixed bottom-6 right-6 z-50" id="atlas-floating-trigger">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 flex items-center justify-center cursor-pointer transition-all focus:outline-none shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle Atlas Brain"
        >
          {/* Animated Halo outer glow */}
          <span className="absolute inset-0 rounded-full bg-orange-500/10 blur-md group-hover:bg-orange-500/25 transition-all animate-pulse" />
          
          <div className="relative z-10 flex items-center justify-center">
            {isOpen ? (
              <X className="text-orange-500 transition-transform duration-300 rotate-90" size={22} />
            ) : (
              <Brain className="text-orange-500 animate-pulse" size={24} />
            )}
          </div>
          
          {/* Badge indicator */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-zinc-950 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-zinc-950" />
        </motion.button>
      </div>

      {/* Main Atlas Panel (Expanding from bottom right) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[95vw] md:w-[480px] h-[80vh] md:h-[620px] bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
            id="atlas-brain-interface"
          >
            {/* Mission Control Header */}
            <div className="p-4 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between" id="atlas-control-header">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-black border border-zinc-800 flex items-center justify-center shadow-inner">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 text-orange-500" fill="currentColor">
                    <path d="M50,18 C50,18 64,55 80,82 C80,82 66,75 50,40 C34,75 20,82 20,82 C36,55 50,18 50,18 Z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-sm tracking-tight text-zinc-100 uppercase">Atlas</h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 font-mono text-[8px] font-bold">CORE v3.5</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Platform Chief of Staff</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/40 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Tab Navigation inside Mission Control */}
            <div className="flex border-b border-zinc-800/50 bg-zinc-900/20 px-2 pt-1" id="atlas-panel-tabs">
              <button
                onClick={() => setActivePanel("briefing")}
                className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider font-semibold transition-all border-b-2 ${
                  activePanel === "briefing" 
                    ? "border-orange-500 text-orange-400" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Daily Briefing
              </button>
              <button
                onClick={() => setActivePanel("chat")}
                className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider font-semibold transition-all border-b-2 ${
                  activePanel === "chat" 
                    ? "border-orange-500 text-orange-400" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Strategy Chat
              </button>
            </div>

            {/* Active System Panels */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950" id="atlas-panel-content">
              
              {/* TAB 1: EXECUTIVE BRIEFING */}
              {activePanel === "briefing" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3.5"
                >
                  {briefingLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border border-orange-500/20 border-t-orange-500 animate-spin" />
                        <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-orange-500">OPS</span>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-xs font-mono text-zinc-300 font-bold animate-pulse">{pipelineMessages[pipelineStep]}</p>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Compiling tactical metrics...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans text-xs text-zinc-300 leading-relaxed">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Terminal size={12} className="text-orange-500" />
                          <span>Executive Intelligence Pipeline</span>
                        </span>
                        <button 
                          onClick={triggerDailyBriefing}
                          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                          title="Recalculate Briefing"
                        >
                          <RefreshCw size={11} className="hover:animate-spin" />
                        </button>
                      </div>
                      <div className="whitespace-pre-line font-sans text-[13px] tracking-tight text-zinc-200 leading-relaxed bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-xl shadow-inner">
                        {dailyBriefingText || "No active briefing computed."}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: STRATEGY CHAT */}
              {activePanel === "chat" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col h-full space-y-3"
                >
                  {/* Preloaded Memory database quick queries */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Query Permanent Memory Database</span>
                    <div className="flex flex-wrap gap-1.5">
                      {preLoadedQuestions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQueryAtlas(item.q)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/30 rounded-lg text-[10px] text-zinc-300 font-medium cursor-pointer transition-all"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 my-2" />

                  {/* Conversation feed */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[220px] pr-1" id="chat-messages-container">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col space-y-1 max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                      >
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{msg.sender === "user" ? "Command" : "Atlas Chief of Staff"}</span>
                        <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-orange-500 text-zinc-950 font-bold" 
                            : "bg-zinc-900/60 border border-zinc-850 text-zinc-200"
                        }`}>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex flex-col space-y-1 mr-auto items-start">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">Atlas Synthesis...</span>
                        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Universal Conversational Bar */}
            <div className="p-3 bg-zinc-900/80 border-t border-zinc-850/80 space-y-2" id="atlas-command-bar">
              {/* Quick suggestions line for conversation queries */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[9px] font-mono text-zinc-500">
                <Command size={10} className="text-orange-500 shrink-0" />
                <span className="shrink-0 uppercase tracking-wider">Quick Prompts:</span>
                <button onClick={() => handleQueryAtlas("open economics")} className="hover:text-orange-400 bg-black/40 px-1.5 py-0.5 rounded border border-zinc-850 shrink-0">open economics</button>
                <button onClick={() => handleQueryAtlas("what deadlines do I have due this week?")} className="hover:text-orange-400 bg-black/40 px-1.5 py-0.5 rounded border border-zinc-850 shrink-0">what's due this week?</button>
                <button onClick={() => handleQueryAtlas("what should I do today?")} className="hover:text-orange-400 bg-black/40 px-1.5 py-0.5 rounded border border-zinc-850 shrink-0">what should I do today?</button>
                <button onClick={() => handleQueryAtlas("show my mistakes")} className="hover:text-orange-400 bg-black/40 px-1.5 py-0.5 rounded border border-zinc-850 shrink-0">analyze mistakes</button>
              </div>
 
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Terminal className="absolute left-3 top-2.5 text-zinc-600" size={13} />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleQueryAtlas(chatInput);
                      }
                    }}
                    placeholder="Ask Atlas (e.g., 'What should I do today?' or 'Open Economics')..."
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-8.5 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 font-mono"
                  />
                </div>
                
                <button
                  onClick={() => handleQueryAtlas(chatInput)}
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold rounded-xl cursor-pointer transition-all shrink-0 shadow-lg shadow-orange-500/10"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
