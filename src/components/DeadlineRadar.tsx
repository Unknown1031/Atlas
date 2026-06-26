import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  X, 
  Filter, 
  Kanban, 
  Grid, 
  ListTodo, 
  Hourglass,
  Layout,
  AlertCircle
} from "lucide-react";
import { Task, Subject } from "../types";

interface DeadlineRadarProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onToggleTask: (taskId: string) => void;
  subjects: Subject[];
}

export default function DeadlineRadar({
  tasks,
  onAddTask,
  onToggleTask,
  subjects
}: DeadlineRadarProps) {
  const [activeTab, setActiveTab] = useState<"cards" | "kanban" | "timeline">("cards");
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter/Search states
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // New Deadline Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newType, setNewType] = useState<Task["type"]>("School Assignment");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Medium");
  const [newNotes, setNewNotes] = useState("");

  // Calculate days remaining helper
  const getDaysRemaining = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deadlineStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Safe color coding: Green (>30 days), Yellow (7-30 days), Red (<7 days / overdue)
  const getUrgencyLevel = (daysRemaining: number, completed: boolean) => {
    if (completed) return { color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", label: "Completed" };
    if (daysRemaining < 0) return { color: "text-rose-500 border-rose-500/30 bg-rose-500/10", label: "Overdue" };
    if (daysRemaining < 7) return { color: "text-rose-400 border-rose-500/20 bg-rose-500/5", label: "Critical" };
    if (daysRemaining <= 30) return { color: "text-amber-400 border-amber-500/20 bg-amber-500/5", label: "Soon" };
    return { color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", label: "Safe" };
  };

  // Map of tasks with computed offset and urgency
  const extendedTasks = useMemo(() => {
    return tasks.map((task) => {
      const days = getDaysRemaining(task.deadline);
      const urgency = getUrgencyLevel(days, task.completed);
      return {
        ...task,
        daysRemaining: days,
        urgency
      };
    });
  }, [tasks]);

  // Widgets filters calculations
  const widgets = useMemo(() => {
    const active = extendedTasks.filter((t) => !t.completed);
    
    const overdue = active.filter((t) => t.daysRemaining < 0);
    const next7Days = active.filter((t) => t.daysRemaining >= 0 && t.daysRemaining <= 7);
    const next30Days = active.filter((t) => t.daysRemaining >= 0 && t.daysRemaining <= 30);
    const critical = active.filter((t) => t.priority === "High" || t.daysRemaining <= 7);

    return {
      overdueCount: overdue.length,
      next7DaysCount: next7Days.length,
      next30DaysCount: next30Days.length,
      criticalCount: critical.length
    };
  }, [extendedTasks]);

  // Main filtered deadlines
  const filteredTasks = useMemo(() => {
    return extendedTasks.filter((task) => {
      const matchesType = typeFilter === "ALL" || task.type === typeFilter;
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesPriority && matchesSearch;
    });
  }, [extendedTasks, typeFilter, priorityFilter, searchQuery]);

  // Kanban lanes
  const kanbanLanes = useMemo(() => {
    return {
      todo: filteredTasks.filter((t) => !t.completed && t.daysRemaining >= 7),
      critical: filteredTasks.filter((t) => !t.completed && t.daysRemaining < 7),
      completed: filteredTasks.filter((t) => t.completed)
    };
  }, [filteredTasks]);

  // Timeline view (Chronological ordering)
  const chronologicalTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [filteredTasks]);

  // Submit new task/deadline handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDeadline) {
      alert("Please enter a Title and Due Date.");
      return;
    }

    onAddTask({
      subjectId: newSubject || "IA",
      title: newTitle,
      deadline: newDeadline,
      completed: false,
      notes: newNotes || undefined,
      type: newType,
      priority: newPriority
    });

    setShowAddModal(false);
    setNewTitle("");
    setNewDeadline("");
    setNewSubject("");
    setNewType("School Assignment");
    setNewPriority("Medium");
    setNewNotes("");
  };

  return (
    <div className="space-y-8 animate-fade-in" id="deadline-radar-page">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="radar-header-section">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Clock className="text-orange-500" />
            Deadline Radar
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Visual workspace tracking IA milestones, Extended Essay drafts, university applications, and critical exams.
          </p>
        </div>

        <button
          onClick={() => {
            setNewSubject(subjects[0]?.id || "IA");
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md transition"
          id="radar-add-btn"
        >
          <Plus size={14} />
          <span>Add Deadline Target</span>
        </button>
      </div>

      {/* Grid: Alert & Filter status widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="radar-metric-widgets">
        
        {/* Overdue */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-2xl">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Overdue</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">
              {widgets.overdueCount} {widgets.overdueCount === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>

        {/* Next 7 Days */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-orange-500/10 text-orange-400 border border-orange-500/25 rounded-2xl">
            <Hourglass size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Next 7 Days</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">
              {widgets.next7DaysCount} active
            </span>
          </div>
        </div>

        {/* Next 30 Days */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-2xl">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Next 30 Days</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">
              {widgets.next30DaysCount} targets
            </span>
          </div>
        </div>

        {/* Critical Priority */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-2xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Critical priority</span>
            <span className="text-xl font-display font-bold text-zinc-100 block mt-0.5">
              {widgets.criticalCount} priority
            </span>
          </div>
        </div>

      </div>

      {/* Filter Options Panel */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          
          {/* Sub filtering dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-xl flex items-center space-x-2 w-52 text-xs">
              <Filter size={14} className="text-zinc-500" />
              <input
                type="text"
                placeholder="Search deadlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 outline-none w-full"
              />
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase mr-1">Radar Focus:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="IA">Internal Assessments</option>
                <option value="EE">Extended Essay</option>
                <option value="CAS">CAS Milestones</option>
                <option value="School Assignment">School Assignments</option>
                <option value="IPMAT">IPMAT Deadlines</option>
                <option value="University Application">University Apps</option>
                <option value="Scholarship Application">Scholarship Apps</option>
                <option value="Test">Exams / Tests</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-zinc-500 font-mono uppercase mr-1">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Toggle Display mode buttons */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-850" id="radar-tabs-toggle">
            <button
              onClick={() => setActiveTab("cards")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "cards" ? "bg-zinc-800 text-orange-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Grid size={14} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "kanban" ? "bg-zinc-800 text-orange-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Kanban size={14} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "timeline" ? "bg-zinc-800 text-orange-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ListTodo size={14} />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Radar Screen Layouts */}
      {activeTab === "cards" && (
        /* COUNTDOWN CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="radar-cards-layout">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-500 italic text-xs">
              No matching deadline targets mapped in database.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const overdue = task.daysRemaining < 0 && !task.completed;
              return (
                <div
                  key={task.id}
                  className={`bg-zinc-900 border ${task.urgency.color} rounded-2xl p-5 shadow-none flex flex-col justify-between h-44`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono uppercase bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850">
                        {task.type}
                      </span>
                      <span className={`font-mono font-bold px-1.5 rounded-full border ${
                        task.priority === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <h4 className={`font-display font-bold text-sm ${task.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                      {task.title}
                    </h4>

                    {task.notes && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {task.notes}
                      </p>
                    )}
                  </div>

                  {/* Visual progress row */}
                  <div className="pt-3 border-t border-zinc-850 mt-2 flex items-center justify-between text-xs">
                    <div>
                      {task.completed ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                          <CheckCircle size={12} />
                          Finalized
                        </span>
                      ) : overdue ? (
                        <span className="text-[10px] font-mono font-bold text-rose-500 uppercase flex items-center gap-1">
                          <AlertCircle size={12} />
                          Overdue ({Math.abs(task.daysRemaining)} days)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                          <Clock size={12} />
                          {task.daysRemaining} days remaining
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition ${
                        task.completed 
                          ? "bg-zinc-800 text-zinc-400 border-zinc-700" 
                          : "bg-orange-500 hover:bg-orange-600 text-zinc-950 border-orange-600"
                      }`}
                    >
                      {task.completed ? "Reopen" : "Submit"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "kanban" && (
        /* KANBAN LANE WORKSPACE */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="radar-kanban-layout">
          
          {/* LANE 1: Backlog / Active */}
          <div className="bg-zinc-950/40 p-4 rounded-3xl border border-zinc-850 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <h3 className="text-xs font-bold font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Active Deadlines ({kanbanLanes.todo.length})
              </h3>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {kanbanLanes.todo.map((task) => (
                <div key={task.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-zinc-400 bg-zinc-950 px-1 py-0.2 rounded uppercase">{task.type}</span>
                    <span className="text-orange-400">{task.daysRemaining}d left</span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-200">{task.title}</h4>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-850">
                    <span className="text-[10px] text-zinc-500 font-mono">Due: {task.deadline}</span>
                    <button onClick={() => onToggleTask(task.id)} className="text-xs font-bold text-orange-400 hover:text-orange-300">Done</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LANE 2: Critical / Soon */}
          <div className="bg-zinc-950/40 p-4 rounded-3xl border border-zinc-850 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <h3 className="text-xs font-bold font-mono uppercase text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Critical Lane ({kanbanLanes.critical.length})
              </h3>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {kanbanLanes.critical.map((task) => (
                <div key={task.id} className="bg-zinc-900 border border-rose-500/20 p-4 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-rose-400 bg-rose-500/5 px-1 py-0.2 rounded uppercase">{task.type}</span>
                    <span className="text-rose-500 font-bold">{task.daysRemaining < 0 ? "Overdue" : `${task.daysRemaining}d`}</span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-200">{task.title}</h4>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-850">
                    <span className="text-[10px] text-zinc-500 font-mono">Due: {task.deadline}</span>
                    <button onClick={() => onToggleTask(task.id)} className="text-xs font-bold text-rose-400 hover:text-rose-300">Complete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LANE 3: Mastered / Completed */}
          <div className="bg-zinc-950/40 p-4 rounded-3xl border border-zinc-850 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <h3 className="text-xs font-bold font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed ({kanbanLanes.completed.length})
              </h3>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {kanbanLanes.completed.map((task) => (
                <div key={task.id} className="bg-zinc-900 border border-emerald-500/10 p-4 rounded-xl space-y-2 opacity-65">
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <span className="uppercase">{task.type}</span>
                    <span className="text-emerald-400">Done</span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-400 line-through">{task.title}</h4>
                  <div className="flex justify-end pt-2 border-t border-zinc-850">
                    <button onClick={() => onToggleTask(task.id)} className="text-[10px] text-zinc-500 hover:text-zinc-300">Reopen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === "timeline" && (
        /* CHRONOLOGICAL TIMELINE VIEW */
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6" id="radar-timeline-layout">
          <h3 className="font-display font-bold text-zinc-100 text-sm">Chronological Deadline Sequence</h3>
          
          <div className="relative border-l-2 border-zinc-800 pl-6 space-y-6 ml-3" id="timeline-flow">
            {chronologicalTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No milestones to visualize in chronological pipeline.</p>
            ) : (
              chronologicalTasks.map((task) => {
                const overdue = task.daysRemaining < 0 && !task.completed;
                return (
                  <div key={task.id} className="relative text-xs">
                    
                    {/* Circle timeline dot */}
                    <span className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                      task.completed 
                        ? "bg-emerald-500 border-emerald-500 text-zinc-950" 
                        : overdue 
                        ? "bg-rose-500 border-rose-500 text-zinc-950" 
                        : "bg-zinc-950 border-zinc-700"
                    }`}>
                      {task.completed && "✓"}
                    </span>

                    <div className="bg-zinc-950/60 p-4 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 rounded uppercase">
                            {task.type}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">{task.deadline}</span>
                        </div>
                        <h4 className={`font-bold mt-1 text-sm ${task.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-3">
                        {task.completed ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                            Completed
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono font-bold ${
                            task.daysRemaining < 0 ? "text-rose-500 bg-rose-500/10 border border-rose-500/20" : "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                          } px-2.5 py-1 rounded-full uppercase`}>
                            {task.daysRemaining < 0 ? "Overdue" : `${task.daysRemaining} days remaining`}
                          </span>
                        )}

                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="px-3.5 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl font-semibold border border-zinc-850"
                        >
                          {task.completed ? "Reopen" : "Check off"}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Contribute file / target modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="add-deadline-modal">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-zinc-100 text-base flex items-center gap-1.5">
                <Clock className="text-orange-500" />
                Register New Deadline Target
              </h3>
              <p className="text-zinc-400 text-xs">This syncs with your global coursework dashboard lists.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Deadline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Economics IA Final Commentary Draft"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Target Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                    <option value="IA">General IA System</option>
                    <option value="EE">Extended Essay</option>
                    <option value="CAS">CAS Tracker</option>
                    <option value="IPMAT">IPMAT Preparation</option>
                    <option value="UNI">University Applications</option>
                    <option value="SCHOLARSHIP">Scholarships</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Deadline Category</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 outline-none focus:border-orange-500 cursor-pointer text-xs"
                  >
                    <option value="School Assignment">School Assignment</option>
                    <option value="IA">Internal Assessment (IA)</option>
                    <option value="EE">Extended Essay (EE)</option>
                    <option value="CAS">CAS Milestone</option>
                    <option value="IPMAT">IPMAT Date</option>
                    <option value="University Application">University Application</option>
                    <option value="Scholarship Application">Scholarship Application</option>
                    <option value="Test">Exam / Test</option>
                    <option value="Regular">Regular Task</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 outline-none focus:border-orange-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold block">Priority Status</label>
                  <div className="flex space-x-1.5 mt-0.5">
                    {["Low", "Medium", "High"].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPriority(p as any)}
                        className={`flex-1 py-2 border rounded-xl capitalize text-center text-[10px] ${
                          newPriority === p 
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30 font-semibold" 
                            : "bg-zinc-950 border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Additional Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter outline metrics, links or target descriptors..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 rounded-2xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-2xl text-xs font-bold"
                >
                  Save Milestone
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
