import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingUp as TrendingStable, // We can reuse or map custom icons
  ArrowRight, 
  Edit2, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  X,
  SlidersHorizontal
} from "lucide-react";
import { Subject, SubjectPerformance, StudyLog, Task } from "../types";

interface SubjectPerformanceTrackerProps {
  subjects: Subject[];
  studyLogs: StudyLog[];
  subjectPerformances: SubjectPerformance[];
  onUpdatePerformance: (performances: SubjectPerformance[]) => void;
  tasks: Task[];
}

export default function SubjectPerformanceTracker({
  subjects,
  studyLogs,
  subjectPerformances,
  onUpdatePerformance,
  tasks
}: SubjectPerformanceTrackerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"priority" | "lowest_completion" | "lowest_confidence" | "study_hours" | "alphabetical">("priority");
  
  // Form edit states
  const [editCompletion, setEditCompletion] = useState(0);
  const [editConfidence, setEditConfidence] = useState(5);
  const [editAvgTestScore, setEditAvgTestScore] = useState(80);
  const [editCurrentGrade, setEditCurrentGrade] = useState("6");
  const [editTargetGrade, setEditTargetGrade] = useState("7");
  const [editTrend, setEditTrend] = useState<"improving" | "stable" | "declining">("stable");
  const [editRevisionDate, setEditRevisionDate] = useState("");

  // Map of subject hours logged
  const subjectHoursMap = useMemo(() => {
    const hours: { [key: string]: number } = {};
    // Seed and dynamic calculation
    subjects.forEach((s) => {
      const minutes = studyLogs
        .filter((log) => log.subjectId === s.id)
        .reduce((sum, log) => sum + log.duration, 0);
      hours[s.id] = minutes / 60;
    });

    // Handle IPMAT
    const ipmatMins = studyLogs
      .filter((log) => log.subjectId === "IPMAT")
      .reduce((sum, log) => sum + log.duration, 0);
    hours["IPMAT"] = ipmatMins / 60;

    return hours;
  }, [studyLogs, subjects]);

  // Combine subject list with performance statistics
  const extendedPerformances = useMemo(() => {
    const combined: Array<SubjectPerformance & { name: string; level?: string; studyHours: number; status: "On Track" | "Needs Attention" | "High Priority" }> = [];

    // Combine standard subjects
    subjects.forEach((sub) => {
      let perf = subjectPerformances.find((p) => p.subjectId === sub.id);
      if (!perf) {
        // Fallback default
        perf = {
          subjectId: sub.id,
          completion: 50,
          confidence: 6,
          avgTestScore: 75,
          lastRevisionDate: new Date().toISOString().split("T")[0],
          currentGradeEstimate: sub.level === "HL" ? "5" : "6",
          targetGrade: sub.level === "HL" ? "6" : "7",
          trend: "stable"
        };
      }

      // Calculate automated status
      // Red: High Priority (confidence < 6 OR completion < 45 OR current grade falls 2 grades below target)
      // Yellow: Needs Attention (confidence is 6-7 OR completion is 45-60 OR current grade falls 1 grade below target)
      // Green: On Track (otherwise)
      let status: "On Track" | "Needs Attention" | "High Priority" = "On Track";
      const targetNum = parseInt(perf.targetGrade) || 7;
      const currentNum = parseInt(perf.currentGradeEstimate) || 5;
      
      if (perf.confidence < 6 || perf.completion < 45 || (targetNum - currentNum >= 2)) {
        status = "High Priority";
      } else if (perf.confidence <= 7 || perf.completion < 65 || (targetNum - currentNum >= 1)) {
        status = "Needs Attention";
      }

      combined.push({
        ...perf,
        name: sub.name,
        level: sub.level,
        studyHours: subjectHoursMap[sub.id] || 0,
        status
      });
    });

    // Combine IPMAT Prep
    let ipmatPerf = subjectPerformances.find((p) => p.subjectId === "IPMAT");
    if (!ipmatPerf) {
      ipmatPerf = {
        subjectId: "IPMAT",
        completion: 60,
        confidence: 7,
        avgTestScore: 78,
        lastRevisionDate: new Date().toISOString().split("T")[0],
        currentGradeEstimate: "92%",
        targetGrade: "98%",
        trend: "stable"
      };
    }
    
    let ipmatStatus: "On Track" | "Needs Attention" | "High Priority" = "On Track";
    if (ipmatPerf.confidence < 6 || ipmatPerf.completion < 50) {
      ipmatStatus = "High Priority";
    } else if (ipmatPerf.confidence <= 7 || ipmatPerf.completion < 65) {
      ipmatStatus = "Needs Attention";
    }

    combined.push({
      ...ipmatPerf,
      name: "IPMAT Preparation",
      studyHours: subjectHoursMap["IPMAT"] || 0,
      status: ipmatStatus
    });

    // Apply Sorting
    return [...combined].sort((a, b) => {
      switch (sortBy) {
        case "lowest_completion":
          return a.completion - b.completion;
        case "lowest_confidence":
          return a.confidence - b.confidence;
        case "study_hours":
          return b.studyHours - a.studyHours;
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "priority":
        default:
          // High Priority (Red) -> Needs Attention (Yellow) -> On Track (Green)
          const priorityMap = { "High Priority": 3, "Needs Attention": 2, "On Track": 1 };
          return priorityMap[b.status] - priorityMap[a.status];
      }
    });
  }, [subjects, subjectPerformances, subjectHoursMap, sortBy]);

  // Overall Global statistics for the tracker header
  const globalStats = useMemo(() => {
    if (extendedPerformances.length === 0) return { avgComp: 0, avgConf: 0, totalHours: 0, onTrackCount: 0 };
    const totalComp = extendedPerformances.reduce((sum, p) => sum + p.completion, 0);
    const totalConf = extendedPerformances.reduce((sum, p) => sum + p.confidence, 0);
    const totalHrs = extendedPerformances.reduce((sum, p) => sum + p.studyHours, 0);
    const onTrack = extendedPerformances.filter((p) => p.status === "On Track").length;

    return {
      avgComp: Math.round(totalComp / extendedPerformances.length),
      avgConf: parseFloat((totalConf / extendedPerformances.length).toFixed(1)),
      totalHours: parseFloat(totalHrs.toFixed(1)),
      onTrackCount: onTrack
    };
  }, [extendedPerformances]);

  const startEdit = (perf: SubjectPerformance) => {
    setEditingId(perf.subjectId);
    setEditCompletion(perf.completion);
    setEditConfidence(perf.confidence);
    setEditAvgTestScore(perf.avgTestScore);
    setEditCurrentGrade(perf.currentGradeEstimate);
    setEditTargetGrade(perf.targetGrade);
    setEditTrend(perf.trend);
    setEditRevisionDate(perf.lastRevisionDate);
  };

  const handleSave = (subjectId: string) => {
    const exists = subjectPerformances.some((p) => p.subjectId === subjectId);
    let updated: SubjectPerformance[] = [];

    const newPerf: SubjectPerformance = {
      subjectId,
      completion: Number(editCompletion),
      confidence: Number(editConfidence),
      avgTestScore: Number(editAvgTestScore),
      currentGradeEstimate: editCurrentGrade,
      targetGrade: editTargetGrade,
      trend: editTrend,
      lastRevisionDate: editRevisionDate || new Date().toISOString().split("T")[0]
    };

    if (exists) {
      updated = subjectPerformances.map((p) => p.subjectId === subjectId ? newPerf : p);
    } else {
      updated = [...subjectPerformances, newPerf];
    }

    onUpdatePerformance(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="performance-tracker-page">
      
      {/* Header and Sorting Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="perf-header-panel">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-zinc-100 flex items-center gap-2">
            <TrendingUp className="text-orange-500" />
            Subject Performance Analytics
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Real-time coursework completion, confidence indexing, and predictive grade metrics.
          </p>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl" id="perf-sorting-controls">
          <div className="p-2 text-zinc-500">
            <SlidersHorizontal size={14} />
          </div>
          <select 
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-transparent text-xs text-zinc-300 outline-none font-medium pr-3 cursor-pointer"
          >
            <option value="priority" className="bg-zinc-950 text-zinc-300">Sort: Priority</option>
            <option value="lowest_completion" className="bg-zinc-950 text-zinc-300">Sort: Lowest Completion</option>
            <option value="lowest_confidence" className="bg-zinc-950 text-zinc-300">Sort: Lowest Confidence</option>
            <option value="study_hours" className="bg-zinc-950 text-zinc-300">Sort: Study Hours</option>
            <option value="alphabetical" className="bg-zinc-950 text-zinc-300">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Global Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="perf-global-metrics">
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-3xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Avg Completion</span>
          <span className="text-2xl font-display font-bold text-zinc-100 block mt-1">{globalStats.avgComp}%</span>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${globalStats.avgComp}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-3xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Confidence Rating</span>
          <span className="text-2xl font-display font-bold text-emerald-400 block mt-1">{globalStats.avgConf}<span className="text-xs text-zinc-500">/10</span></span>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Based on student confidence assessments</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-3xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Total Logs Logged</span>
          <span className="text-2xl font-display font-bold text-orange-400 block mt-1">{globalStats.totalHours}h</span>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Dynamically linked to Pomodoro logs</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-3xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Subjects On Track</span>
          <span className="text-2xl font-display font-bold text-indigo-400 block mt-1">
            {globalStats.onTrackCount} / {extendedPerformances.length}
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Green status subjects</p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="perf-subjects-grid">
        {extendedPerformances.map((perf) => {
          const isEditing = editingId === perf.subjectId;
          const statusColors = {
            "High Priority": "bg-rose-500/10 text-rose-400 border-rose-500/20",
            "Needs Attention": "bg-amber-500/10 text-amber-400 border-amber-500/20",
            "On Track": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          };

          const trendIcons = {
            improving: <TrendingUp size={16} className="text-emerald-400" />,
            stable: <span className="text-zinc-500 font-bold text-sm">→</span>,
            declining: <TrendingDown size={16} className="text-rose-400" />
          };

          return (
            <div 
              key={perf.subjectId}
              className={`bg-zinc-900 border ${isEditing ? "border-orange-500/60" : "border-zinc-800"} rounded-3xl p-6 transition-all space-y-6 flex flex-col justify-between`}
              id={`perf-card-${perf.subjectId}`}
            >
              <div>
                {/* Card Title & Automated status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {perf.level ? `${perf.level} Course` : "Mock Preparation"}
                      </span>
                      {perf.trend && (
                        <div className="flex items-center space-x-1" title={`Trend: ${perf.trend}`}>
                          {trendIcons[perf.trend]}
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-zinc-100 text-lg mt-0.5 leading-snug">
                      {perf.name}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${statusColors[perf.status]}`}>
                    {perf.status}
                  </span>
                </div>

                {isEditing ? (
                  /* EDITING MODE FORM */
                  <div className="mt-5 space-y-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                    <h4 className="text-xs font-bold text-orange-400">Update Metrics</h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] uppercase font-mono block">Completion %</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="100"
                          value={editCompletion}
                          onChange={(e) => setEditCompletion(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] uppercase font-mono block">Confidence (1-10)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="100" // To allow percentiles as well for IPMAT
                          value={editConfidence}
                          onChange={(e) => setEditConfidence(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] uppercase font-mono block">Avg Test %</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="100"
                          value={editAvgTestScore}
                          onChange={(e) => setEditAvgTestScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] uppercase font-mono block">Last Revision</label>
                        <input 
                          type="date"
                          value={editRevisionDate}
                          onChange={(e) => setEditRevisionDate(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-orange-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] uppercase font-mono block">Current Est</label>
                        <input 
                          type="text"
                          value={editCurrentGrade}
                          onChange={(e) => setEditCurrentGrade(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] uppercase font-mono block">Target Grade</label>
                        <input 
                          type="text"
                          value={editTargetGrade}
                          onChange={(e) => setEditTargetGrade(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-zinc-500 text-[10px] uppercase font-mono block">Performance Trend</label>
                      <div className="flex space-x-2">
                        {["improving", "stable", "declining"].map((t) => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setEditTrend(t as any)}
                            className={`flex-1 py-1 px-2 border rounded-lg capitalize text-center text-[11px] ${
                              editTrend === t 
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/30 font-semibold" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-500"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(perf.subjectId)}
                        className="px-4.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-xl text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VISUAL DASHBOARD VIEW */
                  <div className="mt-5 grid grid-cols-5 gap-4 items-center">
                    {/* Visual indicators (Completion ring & Estimate badge) */}
                    <div className="col-span-2 flex flex-col items-center justify-center space-y-2 border-r border-zinc-850 pr-4">
                      {/* Circle completion visualizer */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-zinc-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-orange-500"
                            strokeWidth="3.5"
                            strokeDasharray={`${perf.completion}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="font-display font-bold text-zinc-100 text-xs leading-none">
                            {perf.completion}%
                          </span>
                          <span className="text-[7px] text-zinc-500 font-mono uppercase mt-0.5">Syllabus</span>
                        </div>
                      </div>

                      {/* Grades visual indicator */}
                      <div className="bg-zinc-950 px-2.5 py-1 border border-zinc-800 rounded-lg text-center flex items-center space-x-1">
                        <Award size={10} className="text-zinc-400" />
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Grade: <strong className="text-zinc-200">{perf.currentGradeEstimate}</strong> / {perf.targetGrade}
                        </span>
                      </div>
                    </div>

                    {/* Stats table */}
                    <div className="col-span-3 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-0.5 border-b border-zinc-850">
                        <span className="text-zinc-500 text-[10px] uppercase font-mono flex items-center gap-1">
                          <Clock size={10} />
                          Hours Logged
                        </span>
                        <span className="font-mono font-bold text-zinc-300">
                          {perf.studyHours.toFixed(1)}h
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-zinc-850">
                        <span className="text-zinc-500 text-[10px] uppercase font-mono">Confidence</span>
                        <span className="font-mono font-bold text-zinc-300 flex items-center gap-0.5">
                          {perf.confidence}
                          <span className="text-[10px] text-zinc-500">/10</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-zinc-850">
                        <span className="text-zinc-500 text-[10px] uppercase font-mono">Avg Test %</span>
                        <span className="font-mono font-bold text-emerald-400">{perf.avgTestScore}%</span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-zinc-850">
                        <span className="text-zinc-500 text-[10px] uppercase font-mono flex items-center gap-1">
                          <Calendar size={10} />
                          Last Revised
                        </span>
                        <span className="font-mono text-zinc-400 text-[10px]">{perf.lastRevisionDate}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="flex justify-end pt-4 border-t border-zinc-850 mt-4">
                  <button
                    onClick={() => startEdit(perf)}
                    className="text-zinc-500 hover:text-orange-400 text-xs font-semibold flex items-center gap-1 group transition"
                  >
                    <Edit2 size={12} className="group-hover:scale-110 transition" />
                    <span>Edit Metrics</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
