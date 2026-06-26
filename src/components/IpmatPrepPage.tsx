import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  Plus, 
  Search, 
  CheckCircle, 
  Circle, 
  BarChart, 
  ArrowUpRight, 
  Sparkles,
  Award,
  BookOpen,
  TrendingUp,
  Clock,
  BookOpenCheck,
  Edit2,
  Trash2
} from "lucide-react";
import { Task, StudyLog } from "../types";

interface IpmatPrepPageProps {
  tasks: Task[];
  studyLogs: StudyLog[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

interface MockLog {
  id: string;
  testName: string;
  date: string;
  quantScore: number;
  verbalScore: number;
  percentile: number;
  provider: string; // "IMS" | "Career Launcher" | "IQuanta" | "Other"
}

export default function IpmatPrepPage({
  tasks,
  studyLogs,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask
}: IpmatPrepPageProps) {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskNotes, setNewTaskNotes] = useState("");

  const [showMockForm, setShowMockForm] = useState(false);
  const [mockLogs, setMockLogs] = useState<MockLog[]>([
    { id: "m1", testName: "National Mock 03", date: "2026-06-15", quantScore: 112, verbalScore: 145, percentile: 96.8, provider: "IMS" },
    { id: "m2", testName: "IPMAT Speed Drill 4", date: "2026-06-21", quantScore: 124, verbalScore: 132, percentile: 98.1, provider: "Career Launcher" },
  ]);

  const [newMockName, setNewMockName] = useState("");
  const [newMockDate, setNewMockDate] = useState("");
  const [newMockQuant, setNewMockQuant] = useState<number>(100);
  const [newMockVerbal, setNewMockVerbal] = useState<number>(120);
  const [newMockPercentile, setNewMockPercentile] = useState<number>(95);
  const [newMockProvider, setNewMockProvider] = useState("IMS");

  // Filter tasks specifically for IPMAT prep
  const ipmatTasks = tasks.filter((t) => t.subjectId === "IPMAT");
  const pendingTasks = ipmatTasks.filter((t) => !t.completed);
  const completedTasks = ipmatTasks.filter((t) => t.completed);

  // Total IPMAT study time
  const ipmatStudyTimeMinutes = studyLogs
    .filter((l) => l.subjectId === "IPMAT")
    .reduce((sum, l) => sum + l.duration, 0);
  const ipmatStudyHours = (ipmatStudyTimeMinutes / 60).toFixed(1);

  // IPMAT Syllabus Checklist (Self Assessment)
  const [syllabusChecks, setSyllabusChecks] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("atlas_ipmat_syllabus_checks");
    return saved ? JSON.parse(saved) : {
      "qa_numbers": true,
      "qa_percentages": true,
      "qa_equations": false,
      "qa_sequences": false,
      "qa_geometry": false,
      "qa_matrices": true,
      "qa_combinatorics": false,
      "va_rc": true,
      "va_jumbles": false,
      "va_grammar": true,
      "va_vocab": false,
    };
  });

  const handleToggleSyllabus = (key: string) => {
    const updated = {
      ...syllabusChecks,
      [key]: !syllabusChecks[key]
    };
    setSyllabusChecks(updated);
    localStorage.setItem("atlas_ipmat_syllabus_checks", JSON.stringify(updated));
  };

  // Syllabus topics states
  const [qaTopics, setQaTopics] = useState<{ key: string; label: string }[]>(() => {
    const defaultQA = [
      { key: "qa_numbers", label: "Number System & Properties" },
      { key: "qa_arithmetic", label: "Arithmetic (Percentages, Profit & Loss, SI-CI)" },
      { key: "qa_algebra", label: "Algebra (Equations, Inequalities, Logarithms)" },
      { key: "qa_sequences", label: "Sequences, Series & Progressions" },
      { key: "qa_geometry", label: "Geometry, Mensuration & Trigonometry" },
      { key: "qa_combinatorics", label: "Combinatorics (Permutations & Combinations, Probability)" },
      { key: "qa_matrices", label: "Matrices, Determinants & Set Theory" },
      { key: "qa_di", label: "Data Interpretation (Tables, Graphs, Caselets)" },
      { key: "qa_lr", label: "Logical Reasoning (Syllogisms, Arrangements)" },
    ];
    const saved = localStorage.getItem("atlas_ipmat_qa_topics");
    if (!saved) return defaultQA;
    try {
      const parsed = JSON.parse(saved);
      // If the saved topics are outdated or incomplete, migrate them
      if (parsed.length < defaultQA.length || !parsed.some((t: any) => t.key === "qa_di")) {
        localStorage.setItem("atlas_ipmat_qa_topics", JSON.stringify(defaultQA));
        return defaultQA;
      }
      return parsed;
    } catch (e) {
      return defaultQA;
    }
  });

  const [vaTopics, setVaTopics] = useState<{ key: string; label: string }[]>(() => {
    const defaultVA = [
      { key: "va_rc", label: "Reading Comprehension" },
      { key: "va_completion", label: "Sentence Completion" },
      { key: "va_vocab", label: "Vocabulary" },
      { key: "va_correction", label: "Sentence Correction" },
      { key: "va_jumbles", label: "Parajumbles" },
      { key: "va_incorrect", label: "Incorrect Word" },
      { key: "va_paracomp", label: "Paracompletion" },
      { key: "va_analysis", label: "Conversation Analysis" },
    ];
    const saved = localStorage.getItem("atlas_ipmat_va_topics");
    if (!saved) return defaultVA;
    try {
      const parsed = JSON.parse(saved);
      // Migrate if outdated
      if (parsed.length < defaultVA.length || !parsed.some((t: any) => t.key === "va_incorrect")) {
        localStorage.setItem("atlas_ipmat_va_topics", JSON.stringify(defaultVA));
        return defaultVA;
      }
      return parsed;
    } catch (e) {
      return defaultVA;
    }
  });

  const saveQaTopics = (updated: { key: string; label: string }[]) => {
    setQaTopics(updated);
    localStorage.setItem("atlas_ipmat_qa_topics", JSON.stringify(updated));
  };

  const saveVaTopics = (updated: { key: string; label: string }[]) => {
    setVaTopics(updated);
    localStorage.setItem("atlas_ipmat_va_topics", JSON.stringify(updated));
  };

  // Editing state for Task & Syllabus Items
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingSyllabusItem, setEditingSyllabusItem] = useState<{ key: string; label: string; section: "qa" | "va" } | null>(null);
  const [showAddSyllabusSection, setShowAddSyllabusSection] = useState<"qa" | "va" | null>(null);
  const [newSyllabusLabel, setNewSyllabusLabel] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDeadline) return;

    onAddTask({
      subjectId: "IPMAT",
      title: newTaskTitle,
      deadline: newTaskDeadline,
      completed: false,
      priority: newTaskPriority,
      type: "IPMAT",
      notes: newTaskNotes
    });

    setNewTaskTitle("");
    setNewTaskDeadline("");
    setNewTaskPriority("Medium");
    setNewTaskNotes("");
    setShowAddTaskForm(false);
  };

  const handleAddMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMockName.trim() || !newMockDate) return;

    const newLog: MockLog = {
      id: Date.now().toString(),
      testName: newMockName,
      date: newMockDate,
      quantScore: newMockQuant,
      verbalScore: newMockVerbal,
      percentile: newMockPercentile,
      provider: newMockProvider
    };

    setMockLogs([newLog, ...mockLogs]);
    setNewMockName("");
    setNewMockDate("");
    setNewMockQuant(100);
    setNewMockVerbal(120);
    setNewMockPercentile(95);
    setShowMockForm(false);
  };

  // Calculate averages
  const avgPercentile = useMemo(() => {
    if (mockLogs.length === 0) return 0;
    const sum = mockLogs.reduce((acc, curr) => acc + curr.percentile, 0);
    return (sum / mockLogs.length).toFixed(1);
  }, [mockLogs]);

  const highestScore = useMemo(() => {
    if (mockLogs.length === 0) return 0;
    return Math.max(...mockLogs.map((m) => m.quantScore + m.verbalScore));
  }, [mockLogs]);

  return (
    <div className="space-y-8 animate-fade-in" id="ipmat-prep-panel">
      
      {/* Header Board */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-zinc-100 relative overflow-hidden shadow-none flex flex-col md:flex-row md:items-center justify-between" id="ipmat-header">
        <div className="z-10 space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            IPM Aptitude Prep Suite
          </span>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-2 text-zinc-100">
            IPMAT Preparation
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl">
            Syllabus tracker for Quant and Verbal, mock test analytics logs, pending practice targets, and automatic focus study timers.
          </p>
        </div>
        <div className="flex space-x-3 mt-6 md:mt-0 z-10" id="ipmat-stats">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center min-w-[100px]">
            <Clock size={16} className="text-orange-400 mx-auto mb-1" />
            <span className="block font-mono text-xl font-bold text-zinc-100">{ipmatStudyHours}h</span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Logged</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center min-w-[100px]">
            <TrendingUp size={16} className="text-emerald-400 mx-auto mb-1" />
            <span className="block font-mono text-xl font-bold text-zinc-100">{avgPercentile}%le</span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Avg Percent</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center min-w-[100px]">
            <Award size={16} className="text-amber-400 mx-auto mb-1" />
            <span className="block font-mono text-xl font-bold text-zinc-100">{highestScore}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">High Score</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: IPMAT Syllabus Checklist */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-4" id="ipmat-syllabus-card">
            <h2 className="font-display font-bold text-zinc-100 text-sm flex items-center gap-2">
              <BookOpenCheck size={16} className="text-orange-400" />
              Syllabus Coverage
            </h2>
            <p className="text-[11px] text-zinc-400">Self-assess your conceptual readiness for critical clusters.</p>

            {/* Quantitative Section checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider">Quantitative Ability</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSyllabusSection(showAddSyllabusSection === "qa" ? null : "qa");
                    setNewSyllabusLabel("");
                  }}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-mono flex items-center gap-1"
                >
                  <Plus size={10} /> Add Topic
                </button>
              </div>

              {showAddSyllabusSection === "qa" && (
                <div className="flex items-center space-x-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl" id="add-qa-topic-form">
                  <input
                    type="text"
                    required
                    value={newSyllabusLabel}
                    onChange={(e) => setNewSyllabusLabel(e.target.value)}
                    placeholder="Topic name..."
                    className="w-full bg-transparent text-zinc-100 text-xs px-2 py-1 outline-none font-medium"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSyllabusLabel.trim()) {
                        const newKey = "qa_" + Date.now().toString();
                        const updated = [...qaTopics, { key: newKey, label: newSyllabusLabel.trim() }];
                        saveQaTopics(updated);
                        setNewSyllabusLabel("");
                        setShowAddSyllabusSection(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSyllabusLabel.trim()) {
                        const newKey = "qa_" + Date.now().toString();
                        const updated = [...qaTopics, { key: newKey, label: newSyllabusLabel.trim() }];
                        saveQaTopics(updated);
                        setNewSyllabusLabel("");
                        setShowAddSyllabusSection(null);
                      }
                    }}
                    className="text-[10px] bg-orange-500 text-black px-2.5 py-1 font-semibold rounded-lg hover:bg-orange-600 transition"
                  >
                    Save
                  </button>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                {qaTopics.map((item) => (
                  <div
                    key={item.key}
                    className="group flex items-center justify-between p-2 bg-zinc-950 border border-zinc-850 rounded-xl hover:bg-zinc-900 transition-colors"
                  >
                    <div
                      onClick={() => handleToggleSyllabus(item.key)}
                      className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      {syllabusChecks[item.key] ? (
                        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle size={14} className="text-zinc-600 flex-shrink-0" />
                      )}
                      <span className={`font-medium truncate ${syllabusChecks[item.key] ? "line-through text-zinc-500" : "text-zinc-300"}`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSyllabusItem({ key: item.key, label: item.label, section: "qa" });
                        }}
                        className="p-1 text-zinc-500 hover:text-orange-400 transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = qaTopics.filter(t => t.key !== item.key);
                          saveQaTopics(updated);
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verbal Section checklist */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider">Verbal Ability</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSyllabusSection(showAddSyllabusSection === "va" ? null : "va");
                    setNewSyllabusLabel("");
                  }}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-mono flex items-center gap-1"
                >
                  <Plus size={10} /> Add Topic
                </button>
              </div>

              {showAddSyllabusSection === "va" && (
                <div className="flex items-center space-x-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl" id="add-va-topic-form">
                  <input
                    type="text"
                    required
                    value={newSyllabusLabel}
                    onChange={(e) => setNewSyllabusLabel(e.target.value)}
                    placeholder="Topic name..."
                    className="w-full bg-transparent text-zinc-100 text-xs px-2 py-1 outline-none font-medium"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSyllabusLabel.trim()) {
                        const newKey = "va_" + Date.now().toString();
                        const updated = [...vaTopics, { key: newKey, label: newSyllabusLabel.trim() }];
                        saveVaTopics(updated);
                        setNewSyllabusLabel("");
                        setShowAddSyllabusSection(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSyllabusLabel.trim()) {
                        const newKey = "va_" + Date.now().toString();
                        const updated = [...vaTopics, { key: newKey, label: newSyllabusLabel.trim() }];
                        saveVaTopics(updated);
                        setNewSyllabusLabel("");
                        setShowAddSyllabusSection(null);
                      }
                    }}
                    className="text-[10px] bg-orange-500 text-black px-2.5 py-1 font-semibold rounded-lg hover:bg-orange-600 transition"
                  >
                    Save
                  </button>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                {vaTopics.map((item) => (
                  <div
                    key={item.key}
                    className="group flex items-center justify-between p-2 bg-zinc-950 border border-zinc-850 rounded-xl hover:bg-zinc-900 transition-colors"
                  >
                    <div
                      onClick={() => handleToggleSyllabus(item.key)}
                      className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      {syllabusChecks[item.key] ? (
                        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle size={14} className="text-zinc-600 flex-shrink-0" />
                      )}
                      <span className={`font-medium truncate ${syllabusChecks[item.key] ? "line-through text-zinc-500" : "text-zinc-300"}`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSyllabusItem({ key: item.key, label: item.label, section: "va" });
                        }}
                        className="p-1 text-zinc-500 hover:text-orange-400 transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = vaTopics.filter(t => t.key !== item.key);
                          saveVaTopics(updated);
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Tasks (Todos & Mock Test Logs) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Todo Task Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-6" id="ipmat-todos-panel">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-zinc-100 text-sm flex items-center gap-2">
                <Calculator size={16} className="text-zinc-400" />
                IPMAT Specific Tasks
              </h2>
              <button
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-orange-500 text-black text-xs font-semibold rounded-xl hover:bg-orange-600 transition"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>

            {/* Quick Add form */}
            {showAddTaskForm && (
              <form onSubmit={handleAddTask} className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solve P&C speed mock from IMS"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Deadline</label>
                    <input
                      type="date"
                      required
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Focus on arrangements with beads..."
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskForm(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-850 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-orange-500 text-black text-xs font-semibold rounded-xl hover:bg-orange-600"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            )}

            {/* Pending Sprints list */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider">Active Assignments ({pendingTasks.length})</h3>
              {pendingTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 bg-zinc-950 p-4 rounded-xl text-center italic border border-dashed border-zinc-850">
                  🎉 No pending IPMAT practice assignments. Add one or focus with the Study Timer!
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between bg-zinc-950 border border-zinc-850 p-4 rounded-2xl hover:border-zinc-700 transition-all duration-150"
                      id={`ipmat-task-${task.id}`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="text-zinc-500 hover:text-orange-400 transition p-0.5"
                        >
                          <Circle size={18} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-100 leading-snug">{task.title}</p>
                          {task.notes && <p className="text-[10px] text-zinc-500 mt-0.5">{task.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-mono text-zinc-500">{task.deadline}</span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditingTask(task)}
                            className="p-1 text-zinc-500 hover:text-orange-400 transition"
                            title="Edit Task"
                          >
                            <Edit2 size={13} />
                          </button>
                          {onDeleteTask && (
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 transition"
                              title="Delete Task"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Archive */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider">Completed Archive ({completedTasks.length})</h3>
              {completedTasks.length === 0 ? (
                <p className="text-[11px] text-zinc-500 italic">No completed IPMAT milestones yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-zinc-400"
                      id={`ipmat-completed-${task.id}`}
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="text-emerald-400 p-0.5 flex-shrink-0"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <span className="text-xs font-medium line-through truncate text-zinc-500">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono text-zinc-500">Done</span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditingTask(task)}
                            className="p-1 text-zinc-500 hover:text-orange-400 transition"
                            title="Edit Task"
                          >
                            <Edit2 size={12} />
                          </button>
                          {onDeleteTask && (
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 transition"
                              title="Delete Task"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mock Score Logs Tracker */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-6" id="ipmat-mocks-panel">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-zinc-100 text-sm flex items-center gap-2">
                <BarChart size={16} className="text-zinc-400" />
                Mock Test Analytics Tracker
              </h2>
              <button
                onClick={() => setShowMockForm(!showMockForm)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-orange-500 text-black text-xs font-semibold rounded-xl hover:bg-orange-600 transition"
              >
                <Plus size={14} />
                <span>Log Mock</span>
              </button>
            </div>

            {/* Log Mock Form */}
            {showMockForm && (
              <form onSubmit={handleAddMock} className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Test Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. National Mock 05"
                      value={newMockName}
                      onChange={(e) => setNewMockName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Date Taken</label>
                    <input
                      type="date"
                      required
                      value={newMockDate}
                      onChange={(e) => setNewMockDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Quant Score</label>
                    <input
                      type="number"
                      required
                      value={newMockQuant}
                      onChange={(e) => setNewMockQuant(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-2 py-1.5 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Verbal Score</label>
                    <input
                      type="number"
                      required
                      value={newMockVerbal}
                      onChange={(e) => setNewMockVerbal(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-2 py-1.5 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Percentile</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newMockPercentile}
                      onChange={(e) => setNewMockPercentile(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-2 py-1.5 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Mock Provider</label>
                  <select
                    value={newMockProvider}
                    onChange={(e) => setNewMockProvider(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="IMS">IMS</option>
                    <option value="Career Launcher">Career Launcher</option>
                    <option value="IQuanta">IQuanta</option>
                    <option value="Other">Other Practice Set</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMockForm(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-850 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-orange-500 text-black text-xs font-semibold rounded-xl hover:bg-orange-600"
                  >
                    Save Score
                  </button>
                </div>
              </form>
            )}

            {/* Mocks table display */}
            <div className="overflow-x-auto text-xs font-medium text-zinc-300" id="mocks-table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[10px]">
                    <th className="py-2.5">Mock Test</th>
                    <th className="py-2.5">Provider</th>
                    <th className="py-2.5 text-center">Quant</th>
                    <th className="py-2.5 text-center">Verbal</th>
                    <th className="py-2.5 text-center">Total</th>
                    <th className="py-2.5 text-right">Percentile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {mockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-950/50">
                      <td className="py-3 font-semibold text-zinc-100">{log.testName}</td>
                      <td className="py-3 text-zinc-400">{log.provider}</td>
                      <td className="py-3 text-center font-mono text-zinc-300">{log.quantScore}</td>
                      <td className="py-3 text-center font-mono text-zinc-300">{log.verbalScore}</td>
                      <td className="py-3 text-center font-mono text-orange-400 font-bold">{log.quantScore + log.verbalScore}</td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-bold">{log.percentile}%le</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-display font-bold text-zinc-100 text-sm">Edit IPMAT Task</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Deadline</label>
                <input
                  type="date"
                  value={editingTask.deadline}
                  onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Notes (Optional)</label>
                <input
                  type="text"
                  value={editingTask.notes || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-3 py-2 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-850 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onEditTask && editingTask) {
                    onEditTask(editingTask);
                    setEditingTask(null);
                  }
                }}
                className="px-4 py-2 bg-orange-500 text-black text-xs font-bold rounded-xl hover:bg-orange-600 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Syllabus Item Modal */}
      {editingSyllabusItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-display font-bold text-zinc-100 text-sm">Edit Syllabus Topic</h3>
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Topic Name</label>
              <input
                type="text"
                value={editingSyllabusItem.label}
                onChange={(e) => setEditingSyllabusItem({ ...editingSyllabusItem, label: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSyllabusItem(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-850 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingSyllabusItem.section === "qa") {
                    const updated = qaTopics.map(t => t.key === editingSyllabusItem.key ? { ...t, label: editingSyllabusItem.label.trim() } : t);
                    saveQaTopics(updated);
                  } else {
                    const updated = vaTopics.map(t => t.key === editingSyllabusItem.key ? { ...t, label: editingSyllabusItem.label.trim() } : t);
                    saveVaTopics(updated);
                  }
                  setEditingSyllabusItem(null);
                }}
                className="px-4 py-2 bg-orange-500 text-black text-xs font-bold rounded-xl hover:bg-orange-600 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
