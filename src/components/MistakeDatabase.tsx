import React, { useState, useMemo } from "react";
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  RotateCw,
  Sparkles,
  Award
} from "lucide-react";
import { Mistake, Subject } from "../types";

interface MistakeDatabaseProps {
  mistakes: Mistake[];
  subjects: Subject[];
  onAddMistake: (mistake: Omit<Mistake, "id" | "dateAdded">) => void;
  onUpdateMistakeStatus: (id: string, status: Mistake["reviewStatus"]) => void;
}

export default function MistakeDatabase({
  mistakes,
  subjects,
  onAddMistake,
  onUpdateMistakeStatus
}: MistakeDatabaseProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // New mistake form state
  const [newSubjectId, setNewSubjectId] = useState("MATH_AI_HL");
  const [newTopic, setNewTopic] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMistakeDescription, setNewMistakeDescription] = useState("");
  const [newCorrectAction, setNewCorrectAction] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Filtered mistakes list
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      const matchesSearch = m.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.mistakeDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === "All" || m.subjectId === selectedSubject;
      const matchesStatus = selectedStatus === "All" || m.reviewStatus === selectedStatus;
      const matchesDifficulty = selectedDifficulty === "All" || m.difficulty === selectedDifficulty;

      return matchesSearch && matchesSubject && matchesStatus && matchesDifficulty;
    });
  }, [mistakes, searchQuery, selectedSubject, selectedStatus, selectedDifficulty]);

  // Aggregate Stats
  const stats = useMemo(() => {
    return {
      total: mistakes.length,
      needsReview: mistakes.filter((m) => m.reviewStatus === "Needs Review").length,
      understood: mistakes.filter((m) => m.reviewStatus === "Understood").length,
      mastered: mistakes.filter((m) => m.reviewStatus === "Mastered").length,
    };
  }, [mistakes]);

  const handleCreateMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newDescription.trim() || !newCorrectAction.trim()) return;

    onAddMistake({
      subjectId: newSubjectId,
      topic: newTopic,
      description: newDescription,
      mistakeDescription: newMistakeDescription,
      correctAction: newCorrectAction,
      difficulty: newDifficulty,
      reviewStatus: "Needs Review"
    });

    // Reset Form
    setNewTopic("");
    setNewDescription("");
    setNewMistakeDescription("");
    setNewCorrectAction("");
    setNewDifficulty("Medium");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="mistake-database-panel">
      
      {/* Top Header Board */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-zinc-100 relative overflow-hidden shadow-none" id="mistake-header-board">
        <div className="z-10 space-y-2 relative">
          <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            Mistake Remediation Engine
          </span>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-2">
            The Mistake Database
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            Record, tag, and repeatedly review conceptual slip-ups or test errors. Master the correct corrective actions to avoid repeating mistakes during actual IB assessments and the IPMAT exam.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Aggregate review progress bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="mistake-metrics-row">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-3 bg-zinc-950 text-orange-400 border border-zinc-850 rounded-xl">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Bugs</span>
            <span className="text-xl font-display font-bold text-zinc-100">{stats.total} logged</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-3 bg-amber-950/20 text-amber-400 border border-amber-900/30 rounded-xl">
            <RotateCw size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Needs Review</span>
            <span className="text-xl font-display font-bold text-amber-400">{stats.needsReview} active</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-3 bg-blue-950/20 text-blue-400 border border-blue-900/30 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Understood</span>
            <span className="text-xl font-display font-bold text-blue-400">{stats.understood} review</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-3 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded-xl">
            <Award size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Mastered</span>
            <span className="text-xl font-display font-bold text-emerald-400">{stats.mastered} conquered</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-none space-y-6" id="mistake-filters-board">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search mistakes by topic, slip-ups, or corrective action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-zinc-700 text-zinc-100"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-orange-500 text-black rounded-xl text-xs font-semibold hover:bg-orange-600 transition"
            id="quick-add-mistake-toggle"
          >
            <Plus size={16} />
            <span>Record New Mistake</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800" id="mistake-filters-grid">
          
          {/* Subject category */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Academic Area</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-zinc-300 font-medium outline-none"
            >
              <option value="All">All Subjects & Exams</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
              <option value="IPMAT">IPMAT Preparation (Quant & Verbal)</option>
              <option value="EE">Extended Essay (EE)</option>
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Severity / Difficulty</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-zinc-300 font-medium outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy (Silly Calculation Mistake)</option>
              <option value="Medium">Medium (Conceptual Disconnect)</option>
              <option value="Hard">Hard (Severe Under-preparedness)</option>
            </select>
          </div>

          {/* Review status */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Review State</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-zinc-300 font-medium outline-none"
            >
              <option value="All">All States</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Understood">Understood</option>
              <option value="Mastered">Mastered</option>
            </select>
          </div>

        </div>
      </div>

      {/* Log a New Mistake Form */}
      {showAddForm && (
        <form onSubmit={handleCreateMistake} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 animate-slide-up" id="add-mistake-form">
          <h3 className="font-display font-bold text-zinc-100 text-sm">Record a Conceptual Slip-up</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Subject or Section</label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
                <option value="IPMAT">IPMAT Preparation</option>
                <option value="EE">Extended Essay (EE)</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Specific Topic / Concept Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Permutations with Identical Items, Voronoi Cell Boundaries"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-750"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase">What was the problem scenario? (Context)</label>
            <textarea
              required
              placeholder="Explain the problem or exam question context..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 text-zinc-100 text-xs rounded-xl px-3 py-2 h-16 outline-none resize-none focus:border-zinc-750"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-rose-400">
              <label className="text-[10px] font-mono text-rose-400 uppercase">The Error / What did you do wrong?</label>
              <textarea
                required
                placeholder="e.g. Divided instead of multiplied, forgot to seat the fixed person first..."
                value={newMistakeDescription}
                onChange={(e) => setNewMistakeDescription(e.target.value)}
                className="w-full bg-rose-950/20 border border-rose-900/30 text-zinc-200 text-xs rounded-xl px-3 py-2 h-20 outline-none resize-none focus:border-rose-800"
              />
            </div>

            <div className="space-y-1 text-emerald-400">
              <label className="text-[10px] font-mono text-emerald-400 uppercase">The Correct Mastery Action (How to fix it)</label>
              <textarea
                required
                placeholder="e.g. Circular seated formula is always (n-1)!. Lock one variable first..."
                value={newCorrectAction}
                onChange={(e) => setNewCorrectAction(e.target.value)}
                className="w-full bg-emerald-950/20 border border-emerald-900/30 text-zinc-200 text-xs rounded-xl px-3 py-2 h-20 outline-none resize-none focus:border-emerald-800"
              />
            </div>
          </div>

          <div className="space-y-1 max-w-xs">
            <label className="text-[10px] font-mono text-zinc-500 uppercase">Severity / Level</label>
            <div className="flex space-x-2">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNewDifficulty(d)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    newDifficulty === d 
                      ? "bg-orange-500 text-black border-orange-500 font-bold" 
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-850 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-black text-xs font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Record Slip-up
            </button>
          </div>
        </form>
      )}

      {/* Grid of recorded mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="mistakes-log-grid">
        {filteredMistakes.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-zinc-900 border border-zinc-800 rounded-3xl text-sm text-zinc-500">
            Excellent! No mistakes found for the active filter parameters.
          </div>
        ) : (
          filteredMistakes.map((m) => (
            <div
              key={m.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none space-y-4 hover:border-zinc-700 transition-colors"
              id={`mistake-card-${m.id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono bg-zinc-950 text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-850">
                    {m.subjectId.replace("_HL", " HL").replace("_SL", " SL").replace("MATH_AI", "Math")}
                  </span>
                  <h3 className="font-display font-bold text-zinc-100 text-sm mt-2 leading-snug">
                    {m.topic}
                  </h3>
                </div>

                <div className="flex flex-col items-end space-y-1.5">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    m.difficulty === "Hard" 
                      ? "bg-rose-950/25 text-rose-400 border border-rose-900/30" 
                      : m.difficulty === "Medium" 
                      ? "bg-amber-950/25 text-amber-400 border border-amber-900/30" 
                      : "bg-emerald-950/25 text-emerald-400 border border-emerald-900/30"
                  }`}>
                    {m.difficulty} Level
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    Added: {m.dateAdded}
                  </span>
                </div>
              </div>

              {/* Core Descriptions */}
              <div className="space-y-3 pt-3 border-t border-zinc-850 text-xs">
                <div className="text-zinc-400">
                  <span className="font-bold text-zinc-300 block">Question Scenario / Context</span>
                  <p className="mt-0.5 leading-relaxed">{m.description}</p>
                </div>

                <div className="bg-rose-950/10 p-3 rounded-2xl border border-rose-900/20 text-rose-400">
                  <span className="font-bold block uppercase text-[9px] font-mono text-rose-500">The slip-up</span>
                  <p className="mt-0.5 leading-relaxed font-semibold">{m.mistakeDescription}</p>
                </div>

                <div className="bg-emerald-950/10 p-3 rounded-2xl border border-emerald-900/20 text-emerald-400">
                  <span className="font-bold block uppercase text-[9px] font-mono text-emerald-500">Correct Mastery Action</span>
                  <p className="mt-0.5 leading-relaxed font-semibold">{m.correctAction}</p>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-850">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Review Status</span>
                <div className="flex space-x-1.5">
                  {(["Needs Review", "Understood", "Mastered"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateMistakeStatus(m.id, status)}
                      className={`text-[9px] font-mono font-bold px-2 py-1 rounded border transition-colors ${
                        m.reviewStatus === status
                          ? status === "Mastered"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : status === "Understood"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-zinc-950 text-zinc-500 border border-zinc-850 hover:bg-zinc-900"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
