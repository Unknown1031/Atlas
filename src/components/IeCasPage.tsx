import React, { useState } from "react";
import { 
  GraduationCap, 
  CheckCircle, 
  Circle, 
  Plus, 
  Sparkles, 
  Flame, 
  Award,
  BookOpen,
  Calendar,
  Layers,
  HeartHandshake,
  Edit2,
  Trash2
} from "lucide-react";
import { IaEeCasStatus, Subject } from "../types";

interface IeCasPageProps {
  status: IaEeCasStatus;
  subjects: Subject[];
  onUpdateStatus: (newStatus: IaEeCasStatus) => void;
  onUpdateIaStatus: (subjectId: string, status: IaEeCasStatus["iaMilestones"][string]["status"], score?: number) => void;
}

export default function IeCasPage({
  status,
  subjects,
  onUpdateStatus,
  onUpdateIaStatus
}: IeCasPageProps) {
  const [showAddCasForm, setShowAddCasForm] = useState(false);
  const [newCasTitle, setNewCasTitle] = useState("");
  const [newCasCategory, setNewCasCategory] = useState<"Creativity" | "Activity" | "Service">("Creativity");
  const [newCasHours, setNewCasHours] = useState<number>(10);
  const [newCasStatus, setNewCasStatus] = useState<"Planned" | "Active" | "Completed">("Active");
  const [newCasType, setNewCasType] = useState<"Series" | "Single Day" | "Project">("Series");

  // State variables for editing existing CAS experiences
  const [editingCasIdx, setEditingCasIdx] = useState<number | null>(null);
  const [editCasTitle, setEditCasTitle] = useState("");
  const [editCasCategory, setEditCasCategory] = useState<"Creativity" | "Activity" | "Service">("Creativity");
  const [editCasHours, setEditCasHours] = useState<number>(10);
  const [editCasStatus, setEditCasStatus] = useState<"Planned" | "Active" | "Completed">("Active");
  const [editCasType, setEditCasType] = useState<"Series" | "Single Day" | "Project">("Series");

  // Helper to recompute and save CAS experiences
  const handleUpdateCasExperiences = (updatedExperiences: IaEeCasStatus["casExperiences"]) => {
    let creativity = 0;
    let activity = 0;
    let service = 0;

    updatedExperiences.forEach(exp => {
      if (exp.status === "Completed" || exp.status === "Active") {
        if (exp.category === "Creativity") creativity += exp.hours;
        else if (exp.category === "Activity") activity += exp.hours;
        else if (exp.category === "Service") service += exp.hours;
      }
    });

    onUpdateStatus({
      ...status,
      casHoursCreativity: creativity,
      casHoursActivity: activity,
      casHoursService: service,
      casExperiences: updatedExperiences
    });
  };

  // Toggle EE milestones
  const handleToggleEeMilestone = (index: number) => {
    const updatedMilestones = [...status.eeMilestones];
    updatedMilestones[index].completed = !updatedMilestones[index].completed;
    
    onUpdateStatus({
      ...status,
      eeMilestones: updatedMilestones
    });
  };

  // Add new CAS experience
  const handleAddCasExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCasTitle.trim()) return;

    const newExp = {
      title: newCasTitle,
      category: newCasCategory,
      hours: newCasHours,
      status: newCasStatus,
      experienceType: newCasType
    };

    // Increment aggregate hours if experience is active or completed
    let addedCreativity = 0;
    let addedActivity = 0;
    let addedService = 0;

    if (newCasStatus === "Completed" || newCasStatus === "Active") {
      if (newCasCategory === "Creativity") addedCreativity = newCasHours;
      else if (newCasCategory === "Activity") addedActivity = newCasHours;
      else if (newCasCategory === "Service") addedService = newCasHours;
    }

    onUpdateStatus({
      ...status,
      casHoursCreativity: status.casHoursCreativity + addedCreativity,
      casHoursActivity: status.casHoursActivity + addedActivity,
      casHoursService: status.casHoursService + addedService,
      casExperiences: [newExp, ...status.casExperiences]
    });

    setNewCasTitle("");
    setShowAddCasForm(false);
  };

  const handleUpdateEeDraftStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus({
      ...status,
      eeStatus: e.target.value as any
    });
  };

  const handleUpdateEeTopic = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    onUpdateStatus({
      ...status,
      eeTopic: e.target.value
    });
  };

  return (
    <div className="space-y-8 animate-fade-in" id="ie-cas-panel">
      
      {/* Top Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-zinc-100 relative overflow-hidden shadow-none" id="ie-cas-header">
        <div className="z-10 space-y-2 relative">
          <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            IB Core Elements Coordinator
          </span>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-2 text-zinc-100">
            IA, EE & CAS Hub
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            Year 2 core submissions manager. Monitor milestone states for your 6 Internal Assessments, track draft compliance for your Extended Essay (EE), and log hours for CAS (Creativity, Activity, Service) experiences.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SECTION 1: IA Master Control Board */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-6" id="ia-master-board">
        <div className="flex items-center space-x-2">
          <BookOpen className="text-zinc-400" size={18} />
          <h2 className="font-display font-bold text-zinc-100 text-base">Internal Assessment (IA) Master Board</h2>
        </div>
        <p className="text-xs text-zinc-400">
          Sync milestones for all 6 subjects. Click to adjust current draft draft status and score boundaries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="ia-grid">
          {subjects.map((sub) => {
            const iaInfo = status.iaMilestones[sub.id] || { status: "Not Started" };
            return (
              <div key={sub.id} className="p-5 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all">
                <div>
                  <h3 className="font-display font-bold text-zinc-100 text-xs leading-snug">
                    {sub.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">IA Milestone</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase text-zinc-500">Current Phase</span>
                    <select
                      value={iaInfo.status}
                      onChange={(e) => onUpdateIaStatus(sub.id, e.target.value as any, iaInfo.score)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-300 outline-none focus:ring-1 focus:ring-zinc-700"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Drafting">Drafting</option>
                      <option value="Final Review">Final Review</option>
                      <option value="Completed">Completed 🎉</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-xs">
                    <span className="text-zinc-500 text-[10px]">Score Target:</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={iaInfo.score || ""}
                        placeholder="--"
                        onChange={(e) => onUpdateIaStatus(sub.id, iaInfo.status, parseInt(e.target.value) || undefined)}
                        className="w-12 bg-zinc-900 border border-zinc-800 text-orange-400 rounded px-1.5 py-0.5 font-mono text-center font-bold outline-none"
                      />
                      <span className="text-zinc-500 font-mono">/20</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 2: Extended Essay Tracker */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-6" id="ee-tracker-panel">
          <div className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="text-zinc-400" size={18} />
              <h2 className="font-display font-bold text-zinc-100 text-base">Extended Essay (EE)</h2>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
              status.eeStatus === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            }`}>
              {status.eeStatus} Stage
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">EE Draft Stage</label>
              <select
                value={status.eeStatus}
                onChange={handleUpdateEeDraftStatus}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="Not Started">Not Started</option>
                <option value="Drafting">Drafting (Outline / Intro)</option>
                <option value="First Draft Complete">First Draft Completed (3000 Words)</option>
                <option value="Viva Voce">Viva Voce (Concluded Interview)</option>
                <option value="Completed">Submitted & Finished 🎉</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">EE Research Topic (Interactive)</label>
              <textarea
                placeholder="Write your main Research Question / Topic..."
                defaultValue={status.eeTopic}
                onBlur={handleUpdateEeTopic}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-semibold h-20 resize-none focus:bg-zinc-900 focus:border-zinc-700 outline-none"
              />
              <p className="text-[9px] text-zinc-500 italic">Click outside the text area to save any changes.</p>
            </div>

            {/* EE Checklist milestones */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider">Milestone Checklist</h3>
              <div className="space-y-2">
                {status.eeMilestones.map((ms, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleEeMilestone(idx)}
                    className="flex items-center space-x-3 p-3 bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-900 border border-zinc-850 transition-all"
                  >
                    {ms.completed ? (
                      <CheckCircle size={16} className="text-emerald-400" />
                    ) : (
                      <Circle size={16} className="text-zinc-600" />
                    )}
                    <div className="flex-1 min-w-0 flex justify-between items-center text-xs">
                      <span className={`font-medium ${ms.completed ? "line-through text-zinc-500" : "text-zinc-300"}`}>
                        {ms.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{ms.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: CAS Tracker */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-6" id="cas-tracker-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HeartHandshake className="text-zinc-400" size={18} />
              <h2 className="font-display font-bold text-zinc-100 text-base">CAS (Creativity, Activity, Service)</h2>
            </div>
            <button
              onClick={() => setShowAddCasForm(!showAddCasForm)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-orange-500 text-black text-xs font-semibold rounded-xl hover:bg-orange-600 transition"
              id="add-cas-toggle-btn"
            >
              <Plus size={14} />
              <span>Log CAS Exp</span>
            </button>
          </div>

          {/* CAS aggregated Hour bars - Updated to IB Requirements (Series, Single Day, Project) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="cas-metrics">
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Project</span>
                <span className="font-mono text-xs text-zinc-100 font-bold">{status.casExperiences.filter(e => e.experienceType === "Project").length} / 1</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2.5">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (status.casExperiences.filter(e => e.experienceType === "Project").length / 1) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Series</span>
                <span className="font-mono text-xs text-zinc-100 font-bold">{status.casExperiences.filter(e => e.experienceType === "Series").length} / 5</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2.5">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (status.casExperiences.filter(e => e.experienceType === "Series").length / 5) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Single Day</span>
                <span className="font-mono text-xs text-zinc-100 font-bold">{status.casExperiences.filter(e => e.experienceType === "Single Day").length} / 11</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2.5">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (status.casExperiences.filter(e => e.experienceType === "Single Day").length / 11) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Log CAS Form */}
          {showAddCasForm && (
            <form onSubmit={handleAddCasExperience} className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl" id="cas-form">
              <div className="border-b border-zinc-850 pb-2">
                <h3 className="text-xs font-bold text-zinc-100 uppercase font-mono tracking-wider text-orange-400">Add CAS Experience Log</h3>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Experience Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elderly Digital Literacy Drive"
                  value={newCasTitle}
                  onChange={(e) => setNewCasTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Experience Type</label>
                  <select
                    value={newCasType}
                    onChange={(e) => setNewCasType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-orange-500"
                  >
                    <option value="Series">Series</option>
                    <option value="Single Day">Single Day</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Domain</label>
                  <select
                    value={newCasCategory}
                    onChange={(e) => setNewCasCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-orange-500"
                  >
                    <option value="Creativity">Creativity</option>
                    <option value="Activity">Activity</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Est. Hours</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCasHours}
                    onChange={(e) => setNewCasHours(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-orange-500 text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">State</label>
                  <select
                    value={newCasStatus}
                    onChange={(e) => setNewCasStatus(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-orange-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowAddCasForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-850 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold rounded-xl transition uppercase tracking-wider font-mono"
                >
                  Save CAS Log
                </button>
              </div>
            </form>
          )}

          {/* List of CAS Experiences */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider">Experience Portfolio</h3>
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1" id="cas-exp-list">
              {status.casExperiences.map((exp, idx) => (
                <div key={idx} className="group flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl hover:border-zinc-750 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-100 leading-snug truncate">
                      {exp.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                        exp.category === "Creativity" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : exp.category === "Activity" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      }`}>
                        {exp.category}
                      </span>
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full border bg-zinc-900 border-zinc-800 text-zinc-400 uppercase">
                        {exp.experienceType || "Series"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {exp.hours} hours logged
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      exp.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : exp.status === "Active" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}>
                      {exp.status}
                    </span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCasIdx(idx);
                          setEditCasTitle(exp.title);
                          setEditCasCategory(exp.category);
                          setEditCasHours(exp.hours);
                          setEditCasStatus(exp.status);
                          setEditCasType(exp.experienceType || "Series");
                        }}
                        className="p-1 text-zinc-500 hover:text-orange-400 transition"
                        title="Edit CAS Log"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete CAS experience "${exp.title}"?`)) {
                            const updated = status.casExperiences.filter((_, i) => i !== idx);
                            handleUpdateCasExperiences(updated);
                          }
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition"
                        title="Delete CAS Log"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Edit CAS Experience Modal */}
      {editingCasIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-display font-bold text-zinc-100 text-sm">Edit CAS Experience Log</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Experience Title</label>
                <input
                  type="text"
                  value={editCasTitle}
                  onChange={(e) => setEditCasTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-3 py-2 outline-none font-medium focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Experience Type</label>
                  <select
                    value={editCasType}
                    onChange={(e) => setEditCasType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-2 py-1.5 outline-none focus:border-orange-500"
                  >
                    <option value="Series">Series</option>
                    <option value="Single Day">Single Day</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Domain</label>
                  <select
                    value={editCasCategory}
                    onChange={(e) => setEditCasCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-2 py-1.5 outline-none focus:border-orange-500"
                  >
                    <option value="Creativity">Creativity</option>
                    <option value="Activity">Activity</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={editCasHours}
                    onChange={(e) => setEditCasHours(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-2 py-1.5 outline-none text-center focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">State</label>
                  <select
                    value={editCasStatus}
                    onChange={(e) => setEditCasStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-2 py-1.5 outline-none focus:border-orange-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingCasIdx(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-850 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = [...status.casExperiences];
                  updated[editingCasIdx] = {
                    title: editCasTitle,
                    category: editCasCategory,
                    hours: editCasHours,
                    status: editCasStatus,
                    experienceType: editCasType
                  };
                  handleUpdateCasExperiences(updated);
                  setEditingCasIdx(null);
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
