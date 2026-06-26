import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Loader2,
  Bookmark,
  FileText,
  UserCheck
} from "lucide-react";
import { Subject, Mistake, StudyLog, University } from "../types";

interface WeeklyReportsProps {
  subjects: Subject[];
  mistakes: Mistake[];
  studyLogs: StudyLog[];
  targetUnis: University[];
}

interface SavedReport {
  id: string;
  date: string;
  content: string;
}

export default function WeeklyReports({
  subjects,
  mistakes,
  studyLogs,
  targetUnis
}: WeeklyReportsProps) {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);

  // Load saved reports from LocalStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("student_os_weekly_reports");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSavedReports(parsed);
        if (parsed.length > 0) {
          setActiveReport(parsed[0].content);
        }
      } catch (e) {
        console.error("Failed to parse reports", e);
      }
    }
  }, []);

  // Save to LocalStorage helper
  const saveReportsToCache = (newReports: SavedReport[]) => {
    setSavedReports(newReports);
    localStorage.setItem("student_os_weekly_reports", JSON.stringify(newReports));
  };

  // Reassuring messages during compilation
  const loadingMessages = [
    "Compiling weekly study logs & Pomodoro outputs...",
    "Scanning the Mistake Database for recurring conceptual slip-ups...",
    "Assessing Extended Essay (EE) draft compliance & IA milestone stages...",
    "Retrieving target score profiles for Singapore and UK university entries...",
    "Formulating optimal subject study guidelines via the elite AI academic mentor..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setLoadingStep(0);
    try {
      const response = await fetch("/api/generate-weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: studyLogs.slice(-15), // Last 15 logs
          mistakes: mistakes,
          subjects: subjects.map((s) => s.name),
          targetUnis: targetUnis.map((u) => ({ name: u.name, tier: u.tier, offer: u.typicalOffer, status: u.status })),
          ipmat: { studyMins: studyLogs.filter((l) => l.subjectId === "IPMAT").reduce((sum, l) => sum + l.duration, 0) }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive feedback from the AI academic mentor.");
      }

      const data = await response.json();
      if (data.report) {
        const newReport: SavedReport = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          content: data.report
        };

        const updated = [newReport, ...savedReports];
        saveReportsToCache(updated);
        setActiveReport(data.report);
      }
    } catch (e: any) {
      alert(e.message || "Failed to generate report. Make sure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="weekly-reports-panel">
      
      {/* Top Banner Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-zinc-100 relative overflow-hidden shadow-none" id="ai-reports-header">
        <div className="z-10 space-y-2 relative">
          <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            Powered by Gemini AI 2.5
          </span>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-2 flex items-center gap-2">
            <Sparkles className="text-orange-400 animate-pulse" size={24} />
            AI Weekly Mentor Reports
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            Generate an elite, personalized academic diagnostic. By scanning your study hours, mistakes history, IA milestones, and university target requirements, our mentor compiles customized study trajectories.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: Report Archive */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-4" id="reports-sidebar">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-orange-500 text-black rounded-xl font-bold text-xs hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition shadow-sm"
              id="generate-report-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate New Report</span>
                </>
              )}
            </button>

            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Bookmark size={12} className="text-zinc-500" />
                Historical Feedback
              </h3>
              
              {savedReports.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No historical reports compiled yet. Click the button above to generate your first weekly mentoring session.</p>
              ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {savedReports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveReport(r.content)}
                      className={`w-full flex items-center justify-between text-left p-3 rounded-xl border text-xs font-medium transition ${
                        activeReport === r.content
                          ? "bg-zinc-950 text-orange-400 border-orange-500/30"
                          : "bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:bg-zinc-850 hover:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText size={12} className="text-zinc-500" />
                        <span className="truncate">{r.date}</span>
                      </div>
                      <ChevronRight size={12} className="text-zinc-550 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Report Viewer */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6 h-96 shadow-none animate-pulse" id="report-loader">
              <Loader2 className="animate-spin text-orange-400" size={40} />
              <div className="space-y-2 max-w-sm">
                <h3 className="font-display font-bold text-zinc-200 text-sm">Compiling Mentor Insights</h3>
                <p className="text-xs font-mono text-orange-400 h-8 font-semibold">
                  {loadingMessages[loadingStep]}
                </p>
                <p className="text-[10px] text-zinc-500">This takes about 15-25 seconds as Gemini processes your academic database.</p>
              </div>
            </div>
          ) : activeReport ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-none space-y-6" id="report-content-card">
              
              {/* Report Header Info */}
              <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
                <div className="bg-zinc-950 text-orange-400 p-2.5 rounded-2xl border border-zinc-850">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-zinc-200 text-sm">Weekly Academic Diagnostic</h2>
                  <p className="text-[10px] text-zinc-500 font-mono">Personal Mentorship Report • Active File</p>
                </div>
              </div>

              {/* Dangerous Render of generated report */}
              <div 
                className="prose prose-invert prose-orange prose-xs max-w-none text-zinc-300 leading-relaxed space-y-4 font-sans text-xs md:text-sm"
                dangerouslySetInnerHTML={{ __html: activeReport }}
                id="ai-report-html"
              />

              <div className="pt-6 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500 font-mono">
                <span>Subject targets: Math AI HL, Econ HL, BM HL, Hindi SL, English SL, ESS SL</span>
                <span>Mentor: Gemini-Academic-Engine</span>
              </div>

            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 h-96 shadow-none" id="empty-report-view">
              <Sparkles size={36} className="text-zinc-650" />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-zinc-300 text-sm">Unlock AI-Powered Mentorship</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">Click &quot;Generate New Report&quot; on the left to compile your logs, analyze your mistakes, and get custom feedback.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
