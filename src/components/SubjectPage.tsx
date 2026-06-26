import React, { useState } from "react";
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Flame, 
  Sparkles,
  ClipboardList,
  CheckSquare,
  BookMarked,
  Trash2
} from "lucide-react";
import { Subject, Task, Mistake, StudyLog } from "../types";

interface SubjectPageProps {
  subject: Subject;
  tasks: Task[];
  mistakes: Mistake[];
  studyLogs: StudyLog[];
  iaMilestone: { status: "Not Started" | "Proposal" | "Drafting" | "Final Review" | "Completed"; score?: number };
  onAddTask: (task: Omit<Task, "id">) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateIaStatus: (subjectId: string, status: "Not Started" | "Proposal" | "Drafting" | "Final Review" | "Completed", score?: number) => void;
}

export default function SubjectPage({
  subject,
  tasks,
  mistakes,
  studyLogs,
  iaMilestone,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateIaStatus
}: SubjectPageProps) {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskType, setNewTaskType] = useState<"IA" | "Regular" | "Test">("Regular");
  const [newTaskNotes, setNewTaskNotes] = useState("");

  // Filters
  const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
  const pendingTasks = subjectTasks.filter((t) => !t.completed);
  const completedTasks = subjectTasks.filter((t) => t.completed);
  
  const subjectMistakes = mistakes.filter((m) => m.subjectId === subject.id);
  const subjectLogs = studyLogs.filter((l) => l.subjectId === subject.id);
  
  // Total study hours
  const totalMinutes = subjectLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDeadline) return;

    onAddTask({
      subjectId: subject.id,
      title: newTaskTitle,
      deadline: newTaskDeadline,
      completed: false,
      priority: newTaskPriority,
      type: newTaskType,
      notes: newTaskNotes
    });

    // Reset Form
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setNewTaskPriority("Medium");
    setNewTaskType("Regular");
    setNewTaskNotes("");
    setShowAddTaskForm(false);
  };

  return (
    <div className="space-y-8 animate-fade-in" id={`subject-panel-${subject.id}`}>
      
      {/* Subject Header Board */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-zinc-100 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between" id="subject-header-board">
        <div className="z-10 space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            IBDP Year 2 Coursework
          </span>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-2 text-zinc-100">
            {subject.name}
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl">
            Syllabus, internal assessment milestones, logged mistake databases, and todo tasks.
          </p>
        </div>
        <div className="flex space-x-3 mt-6 md:mt-0 z-10" id="subject-stats">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center min-w-[100px]">
            <Clock size={16} className="text-orange-400 mx-auto mb-1" />
            <span className="block font-mono text-xl font-bold text-zinc-100">{totalHours}h</span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Logged</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center min-w-[100px]">
            <AlertCircle size={16} className="text-rose-400 mx-auto mb-1" />
            <span className="block font-mono text-xl font-bold text-zinc-100">{subjectMistakes.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Mistakes</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center min-w-[100px]">
            <CheckSquare size={16} className="text-emerald-400 mx-auto mb-1" />
            <span className="block font-mono text-xl font-bold text-zinc-100">{completedTasks.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Completed</span>
          </div>
        </div>
        {/* Subtle decorative mesh */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Course Outline & IA Status */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Internal Assessment Progress Indicator */}
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-none space-y-4" id="subject-ia-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-zinc-100 text-sm">Internal Assessment (IA)</h2>
              <Sparkles size={14} className="text-orange-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">IA Draft Stage</label>
              <select
                value={iaMilestone.status}
                onChange={(e) => onUpdateIaStatus(subject.id, e.target.value as any, iaMilestone.score)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="Not Started">Not Started</option>
                <option value="Proposal">Proposal / Design Approved</option>
                <option value="Drafting">Research & Drafting</option>
                <option value="Final Review">Final Peer/Teacher Review</option>
                <option value="Completed">Submitted & Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Subject Score target (Out of 20)</span>
                <span className="font-mono font-bold text-orange-400">{iaMilestone.score || "--"}/20</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={iaMilestone.score || 0}
                onChange={(e) => onUpdateIaStatus(subject.id, iaMilestone.status, parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            {/* IA milestone hint */}
            <div className="bg-orange-500/10 rounded-2xl p-4 text-xs text-orange-300 border border-orange-500/20">
              <p className="font-semibold flex items-center gap-1.5">
                <BookMarked size={12} className="text-orange-400" />
                Mentor Recommendation:
              </p>
              <p className="mt-1 text-zinc-300">
                {iaMilestone.status === "Not Started" && "Draft a 1-page proposal explaining your research question, key variables and methodology."}
                {iaMilestone.status === "Proposal" && "Set up experiments or gather secondary economic data. Begin drafting your background literature outline."}
                {iaMilestone.status === "Drafting" && "Complete mathematical calculations or analysis tables. Pay special attention to IB assessment criteria."}
                {iaMilestone.status === "Final Review" && "Format footnotes and citations properly. Verify total word count stays under IB restrictions."}
                {iaMilestone.status === "Completed" && "Excellent work! Ensure this submitted version is logged in your school portal."}
              </p>
            </div>
          </div>

          {/* Syllabus Outline */}
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-none space-y-4" id="subject-syllabus-card">
            <h2 className="font-display font-bold text-zinc-100 text-sm">Syllabus Breakdown</h2>
            <div className="space-y-2.5">
              {subject.syllabus.map((topic, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                  <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono w-5 h-5 flex items-center justify-center rounded-lg text-[10px] flex-shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-300 font-medium leading-relaxed">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tasks (Todos & Deadlines) & Mistakes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Todo Panel */}
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-none space-y-6" id="subject-todos-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList size={18} className="text-zinc-400" />
                <h2 className="font-display font-bold text-zinc-100 text-base">Deadlines & Tasks</h2>
              </div>
              <button
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-orange-500 text-black text-xs font-semibold rounded-xl hover:bg-orange-600 transition"
                id="add-task-toggle-btn"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>

            {/* Quick Add Form */}
            {showAddTaskForm && (
              <form onSubmit={handleCreateTask} className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 space-y-4" id="add-task-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solve matrices mock sheet"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Deadline Date</label>
                    <input
                      type="date"
                      required
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Priority</label>
                    <div className="flex space-x-2">
                      {(["High", "Medium", "Low"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewTaskPriority(p)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                            newTaskPriority === p 
                              ? "bg-orange-500 text-black border-orange-500 font-bold" 
                              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Task Category</label>
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-zinc-700"
                    >
                      <option value="Regular">Regular Homework / Practice</option>
                      <option value="IA">IA (Internal Assessment Milestone)</option>
                      <option value="Test">Exams & Mock Test Preparation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Notes (Optional)</label>
                  <textarea
                    placeholder="Provide syllabus sub-topics, pages, or special instructions..."
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-zinc-700 h-16 resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-black text-xs font-bold rounded-xl hover:bg-orange-600 transition"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            )}

            {/* Pending Tasks List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider">
                Pending Deadlines ({pendingTasks.length})
              </h3>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-6 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800 text-xs text-zinc-500">
                  🥳 High five! All pending tasks are completed.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between bg-zinc-950 border border-zinc-850 p-4 rounded-2xl hover:border-zinc-700 transition"
                      id={`task-item-${task.id}`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="text-zinc-500 hover:text-orange-400 transition p-0.5 mt-0.5"
                          id={`task-check-${task.id}`}
                        >
                          <Circle size={18} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-100 leading-snug">
                            {task.title}
                          </p>
                          {task.notes && (
                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                              {task.notes}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex items-center space-x-1 text-[10px] text-zinc-500 font-mono">
                              <Calendar size={10} />
                              <span>{task.deadline}</span>
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              task.type === "IA" 
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                                : task.type === "Test" 
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}>
                              {task.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Priority Tag */}
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        task.priority === "High" 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : task.priority === "Medium" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-zinc-850 text-zinc-400 border-zinc-800"
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks List (Similar to IPMAT section) */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                <CheckCircle size={12} className="text-emerald-400" />
                <span>Completed Archive ({completedTasks.length})</span>
              </h3>
              {completedTasks.length === 0 ? (
                <p className="text-[11px] text-zinc-500 italic">No completed tasks yet for this subject.</p>
              ) : (
                <div className="space-y-1.5">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between bg-zinc-950/50 border border-zinc-850 px-4 py-2.5 rounded-xl text-zinc-500"
                      id={`task-completed-${task.id}`}
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="text-emerald-400 p-0.5"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <span className="text-xs font-medium line-through truncate text-zinc-500">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                          Done
                        </span>
                        {onDeleteTask && (
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition"
                            title="Delete Task"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Mistakes Database Entries */}
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-none space-y-4" id="subject-mistakes-panel">
            <h2 className="font-display font-bold text-zinc-100 text-base">Mistake Remediation Log ({subjectMistakes.length})</h2>
            {subjectMistakes.length === 0 ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-2xl text-xs">
                ✨ <strong>Zero Conceptual Mistakes Recorded!</strong> Keep solving practice papers diligently. If you make any errors, record them in the Mistake Database.
              </div>
            ) : (
              <div className="space-y-3">
                {subjectMistakes.map((m) => (
                  <div key={m.id} className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-100">{m.topic}</span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        m.difficulty === "Hard" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : m.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {m.difficulty} Level
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-zinc-400">
                      <p><strong className="text-zinc-300">Underlying Concept:</strong> {m.description}</p>
                      <p className="text-rose-400"><strong className="text-rose-300">The Slip-up:</strong> {m.mistakeDescription}</p>
                      <p className="text-emerald-400"><strong className="text-emerald-300">Mentor Correction:</strong> {m.correctAction}</p>
                    </div>
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
