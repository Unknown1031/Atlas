import React from "react";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  Calculator, 
  TrendingUp, 
  CheckCircle,
  Circle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Subject, Task, Mistake, StudyLog, University } from "../types";
import Timer from "./Timer";

interface DashboardHomeProps {
  subjects: Subject[];
  tasks: Task[];
  mistakes: Mistake[];
  studyLogs: StudyLog[];
  universities: University[];
  activeTimerSection: string | null;
  activeTimerMinutes: number;
  timerRunning: boolean;
  onAddStudyLog: (log: Omit<StudyLog, "id" | "date">) => void;
  onTimerStateChange?: (state: { section: string | null; minutes: number; running: boolean }) => void;
  setActivePage: (page: string) => void;
  setSelectedSubjectId: (id: string | null) => void;
  onToggleTask: (taskId: string) => void;
  userProfile?: {
    name: string;
    nickname: string;
    grade: string;
    avatarUrl: string;
    email: string;
  };
}

const FUNNY_QUOTES = [
  "Track coursework, master mistakes, and survive this academic clusterfuck.",
  "You're doing great, or at least that's what we'll tell the examiners. Log your damn study sessions.",
  "Ah, another glorious day of questioning your life decisions. Let's get this shit done.",
  "Just a friendly reminder: your Extended Essay won't write itself, no matter how long you stare at it.",
  "Coffee is just a temporary fix for IB-induced existential dread, but let's drink it anyway."
];

export default function DashboardHome({
  subjects,
  tasks,
  mistakes,
  studyLogs,
  universities,
  activeTimerSection,
  activeTimerMinutes,
  timerRunning,
  onAddStudyLog,
  onTimerStateChange,
  setActivePage,
  setSelectedSubjectId,
  onToggleTask,
  userProfile
}: DashboardHomeProps) {
  const greetingQuote = React.useMemo(() => {
    const nick = userProfile?.nickname || "student";
    const code = nick.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FUNNY_QUOTES[code % FUNNY_QUOTES.length];
  }, [userProfile?.nickname]);
  
  // Pending deadlines
  const pendingTasks = tasks.filter((t) => !t.completed);
  const urgentTasks = [...pendingTasks]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Total study stats
  const totalStudyMinutes = studyLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Unresolved mistakes count
  const activeMistakesCount = mistakes.filter((m) => m.reviewStatus !== "Mastered").length;

  const handleSubjectClick = (subId: string) => {
    setSelectedSubjectId(subId);
    setActivePage("subject_detail");
  };

  // Recharts: Data for Daily Study Hours over past 5 days
  const dailyChartData = React.useMemo(() => {
    const dates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return dates.map((dateStr) => {
      const logsForDate = studyLogs.filter((l) => l.date === dateStr);
      const mins = logsForDate.reduce((sum, l) => sum + l.duration, 0);
      const displayDate = new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      return {
        name: displayDate,
        "Hours Studied": parseFloat((mins / 60).toFixed(1)),
      };
    });
  }, [studyLogs]);

  // Recharts: Data for Subject Distribution (Minutes spent per Subject/Section)
  const subjectDistributionData = React.useMemo(() => {
    const dataMap: { [key: string]: number } = {};
    studyLogs.forEach((log) => {
      const label = log.subjectId.replace("_HL", "").replace("_SL", "").replace("MATH_AI", "Math");
      dataMap[label] = (dataMap[label] || 0) + log.duration;
    });

    const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#64748b", "#8b5cf6"];
    return Object.entries(dataMap).map(([name, mins], idx) => ({
      name,
      value: Math.round(mins),
      color: colors[idx % colors.length]
    }));
  }, [studyLogs]);

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-home-view">
      
      {/* Dynamic Welcome and Notification banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="home-title-section">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-zinc-100">
            Welcome back, {userProfile?.nickname || "student"}.
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            {greetingQuote}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3.5 py-2 rounded-2xl text-xs font-semibold" id="ai-quick-badge">
          <Sparkles size={14} className="text-orange-500 animate-pulse" />
          <span>Year 2 IA milestones due soon. Run AI Mentor report for tips!</span>
        </div>
      </div>

      {/* Grid: Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="home-metric-widgets">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-none flex items-center space-x-4">
          <div className="p-3 bg-orange-500/10 text-orange-400 border border-orange-500/25 rounded-2xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Study Hours</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">{totalStudyHours}h</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-none flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-2xl">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Deadlines</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">{pendingTasks.length} active</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-none flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-2xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Active Mistakes</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">{activeMistakesCount} unresolved</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-none flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-2xl">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Finished Tasks</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">
              {tasks.filter((t) => t.completed).length} items
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1 & 2: Interactive Timer and Subject Navigation */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Integrated Session-Style Timer */}
          <div id="home-timer-widget">
            <Timer subjects={subjects} onAddStudyLog={onAddStudyLog} onTimerStateChange={onTimerStateChange} />
          </div>

          {/* Interactive Subject Grid (shows total hours and tasks for that subject) */}
          <div className="space-y-4" id="home-subjects-hub">
            <h2 className="font-display font-bold text-zinc-100 text-base">Your IB Coursework Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => {
                const subTasks = pendingTasks.filter((t) => t.subjectId === sub.id);
                const subMins = studyLogs.filter((l) => l.subjectId === sub.id).reduce((sum, l) => sum + l.duration, 0);
                const hrs = (subMins / 60).toFixed(1);
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSubjectClick(sub.id)}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-orange-500/50 cursor-pointer shadow-none transition-all flex flex-col justify-between group h-36"
                    id={`home-subject-card-${sub.id}`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          sub.level === "HL" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                        }`}>
                          {sub.level} Course
                        </span>
                        <ChevronRight size={14} className="text-zinc-500 group-hover:text-orange-400 transition" />
                      </div>
                      <h3 className="font-display font-bold text-zinc-100 text-xs mt-2.5 leading-snug line-clamp-1 group-hover:text-orange-400 transition">
                        {sub.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-3 border-t border-zinc-800 mt-2 text-zinc-500">
                      <span className="font-semibold">{subTasks.length} pending tasks</span>
                      <span className="font-mono">{hrs}h focus</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graphical Analytics charts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-6" id="home-analytics">
            <h2 className="font-display font-bold text-zinc-100 text-base">Focus Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Daily Bar Chart */}
              <div className="md:col-span-3 h-64 space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Focus Hours Past 5 Days</span>
                <ResponsiveContainer width="100%" height="90%">
                  <ReBarChart data={dailyChartData}>
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid #27272a", backgroundColor: "#18181b", color: "#f4f4f5" }} />
                    <Bar dataKey="Hours Studied" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>

              {/* Subject Distribution */}
              <div className="md:col-span-2 h-64 space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Subject Time Allocation (mins)</span>
                {subjectDistributionData.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-12 text-center">Use the study timer to build focus logs.</p>
                ) : (
                  <div className="space-y-3 pt-3">
                    {subjectDistributionData.slice(0, 4).map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-300">{item.name}</span>
                          <span className="text-zinc-500 font-mono">{item.value}m</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (item.value / totalStudyMinutes) * 100)}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* COLUMN 3: Deadlines & Quick actions */}
        <div className="space-y-8">
          
          {/* Urgent Upcoming Deadlines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-4" id="home-upcoming-deadlines">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-zinc-100 text-sm flex items-center gap-1.5">
                <Calendar size={16} className="text-zinc-400" />
                Urgent Deadlines
              </h2>
              <button 
                onClick={() => setActivePage("ia_ee_cas")}
                className="text-[10px] font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
              >
                <span>View Core</span>
                <ArrowRight size={10} />
              </button>
            </div>

            {urgentTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">No active deadlines due. Excellent preparation!</p>
            ) : (
              <div className="space-y-3" id="home-urgent-tasks-list">
                {urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-start justify-between hover:border-orange-500/30 transition-all"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] font-mono bg-zinc-850 text-zinc-400 border border-zinc-800 px-1.5 py-0.2 rounded">
                          {task.subjectId.replace("_HL", "").replace("_SL", "").replace("MATH_AI", "Math")}
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1 rounded-full border ${
                          task.priority === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-100 truncate leading-snug">{task.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                        <Calendar size={10} />
                        Due: {task.deadline}
                      </p>
                    </div>

                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-zinc-500 hover:text-orange-400 p-0.5 ml-2"
                      title="Mark complete"
                    >
                      <Circle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IPMAT Prep Overview Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-4" id="home-ipmat-summary">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-zinc-100 text-sm flex items-center gap-1.5">
                <Calculator size={16} className="text-zinc-400" />
                IPMAT Prep Target
              </h2>
              <button 
                onClick={() => setActivePage("ipmat")}
                className="text-[10px] font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
              >
                <span>Prep Panel</span>
                <ArrowRight size={10} />
              </button>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-semibold">Latest Mock Percentile:</span>
                <span className="font-mono font-bold text-emerald-400">98.1%le</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-850">
                <span className="text-zinc-400 font-semibold">Prep Tasks Done:</span>
                <span className="font-bold text-zinc-100">
                  {tasks.filter((t) => t.subjectId === "IPMAT" && t.completed).length} logged
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                IPMAT Quant speed drills and Verbal Reading Comprehensions are integrated with the main Study Timer! Select &apos;IPMAT Prep&apos; before starting the timer.
              </p>
            </div>
          </div>

          {/* Recent study logs list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-4" id="home-recent-logs">
            <h2 className="font-display font-bold text-zinc-100 text-sm">Recent Focus History</h2>
            {studyLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No study logs registered yet.</p>
            ) : (
              <div className="space-y-2">
                {[...studyLogs].reverse().slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-zinc-300 block">
                        {log.subjectId.replace("_HL", " HL").replace("_SL", " SL").replace("MATH_AI", "Math")}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {log.date} • {log.mode} mode
                      </span>
                    </div>
                    <span className="font-mono font-bold text-orange-400 text-xs bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-lg">
                      +{log.duration}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
