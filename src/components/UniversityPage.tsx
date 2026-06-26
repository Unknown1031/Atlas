import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Briefcase, 
  Filter, 
  Check, 
  Edit, 
  Sparkles,
  School,
  ArrowUpRight,
  TrendingUp,
  Award
} from "lucide-react";
import { University } from "../types";

interface UniversityPageProps {
  universities: University[];
  onAddUniversity: (uni: Omit<University, "id">) => void;
  onUpdateUniversityStatus: (id: string, status: University["status"]) => void;
  onUpdateUniversityNotes: (id: string, notes: string) => void;
}

export default function UniversityPage({
  universities,
  onAddUniversity,
  onUpdateUniversityStatus,
  onUpdateUniversityNotes
}: UniversityPageProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // State for adding a new university
  const [newName, setNewName] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newTier, setNewTier] = useState<"A" | "R" | "S">("R");
  const [newTypicalOffer, setNewTypicalOffer] = useState("");
  const [newEntranceExams, setNewEntranceExams] = useState("");
  const [newTuition, setNewTuition] = useState("");
  const [newTotalCost, setNewTotalCost] = useState("");
  const [newScholarships, setNewScholarships] = useState("");
  const [newCompetition, setNewCompetition] = useState<University["competitionLevel"]>("moderate");

  // Extract unique countries for filter
  const countries = useMemo(() => {
    const list = new Set(universities.map((u) => u.country));
    return ["All", ...Array.from(list)];
  }, [universities]);

  // Filtered universities
  const filteredUnis = useMemo(() => {
    return universities.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.program.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === "All" || u.country === selectedCountry;
      const matchesTier = selectedTier === "All" || u.tier === selectedTier;
      const matchesStatus = selectedStatus === "All" || u.status === selectedStatus;

      return matchesSearch && matchesCountry && matchesTier && matchesStatus;
    });
  }, [universities, searchQuery, selectedCountry, selectedTier, selectedStatus]);

  // Aggregate stats
  const stats = useMemo(() => {
    return {
      total: universities.length,
      aim: universities.filter((u) => u.tier === "A").length,
      reach: universities.filter((u) => u.tier === "R").length,
      safety: universities.filter((u) => u.tier === "S").length,
      applied: universities.filter((u) => ["Applied", "Interviewing", "Offered", "Accepted Offer"].includes(u.status)).length,
      offered: universities.filter((u) => u.status === "Offered" || u.status === "Accepted Offer").length
    };
  }, [universities]);

  const handleCreateUni = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCountry.trim()) return;

    onAddUniversity({
      name: newName,
      program: newProgram || "General Studies",
      country: newCountry,
      tier: newTier,
      typicalOffer: newTypicalOffer || "35+",
      gapVsOffer: 0,
      acceptanceRate: "20-40%",
      tuition: newTuition || "₹5L/year",
      livingCost: "₹2-4L/year",
      totalCost: newTotalCost || "₹25L",
      scholarships: newScholarships || "Available upon application",
      entranceExams: newEntranceExams || "None",
      competitionLevel: newCompetition,
      status: "Interested",
      notes: ""
    });

    // Reset Form
    setNewName("");
    setNewProgram("");
    setNewCountry("");
    setNewTier("R");
    setNewTypicalOffer("");
    setNewEntranceExams("");
    setNewTuition("");
    setNewTotalCost("");
    setNewScholarships("");
    setNewCompetition("moderate");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="university-page">
      
      {/* Page Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-zinc-100 relative overflow-hidden shadow-none" id="uni-page-header">
        <div className="z-10 space-y-2 relative">
          <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            Globally Integrated Target Universities
          </span>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-2">
            University Application Tracker
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            Pre-loaded with all your 22 targets from Singapore, UK, India, and China. Easily filter by tier, monitor conditions like Typical IB Offers or entrance exams, log application statuses, and add custom options.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" id="uni-stats-grid">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Targets</span>
          <span className="text-2xl font-display font-bold text-zinc-100 block mt-1">{stats.total}</span>
        </div>
        <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase text-rose-400 block font-semibold">Aim Tier (A)</span>
          <span className="text-2xl font-display font-bold text-rose-400 block mt-1">{stats.aim}</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">Reach Tier (R)</span>
          <span className="text-2xl font-display font-bold text-zinc-200 block mt-1">{stats.reach}</span>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold font-mono">Safety Tier (S)</span>
          <span className="text-2xl font-display font-bold text-emerald-400 block mt-1">{stats.safety}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase text-zinc-450 block">Applied/Progress</span>
          <span className="text-2xl font-display font-bold text-zinc-100 block mt-1">{stats.applied}</span>
        </div>
        <div className="bg-teal-950/20 border border-teal-900/30 p-4 rounded-2xl col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono uppercase text-teal-400 block font-semibold">Offered Offers</span>
          <span className="text-2xl font-display font-bold text-teal-400 block mt-1">{stats.offered}</span>
        </div>
      </div>

      {/* Control Actions & Search Board */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6 shadow-none" id="uni-controls-board">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search target universities or programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-zinc-700"
            />
          </div>

          {/* Quick-add toggle button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-orange-500 text-black rounded-xl text-xs font-semibold hover:bg-orange-600 transition"
            id="quick-add-uni-toggle"
          >
            <Plus size={16} />
            <span>Add Custom University</span>
          </button>
        </div>

        {/* Multi-Filter board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800" id="uni-filters-grid">
          
          {/* Country filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Country</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-zinc-300 font-medium outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tier filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Tier Category</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-zinc-300 font-medium outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="A">Aim (A)</option>
              <option value="R">Reach (R)</option>
              <option value="S">Safety (S)</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Application Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-zinc-300 font-medium outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Interested">Interested</option>
              <option value="Drafting Essays">Drafting Essays</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
              <option value="Accepted Offer">Accepted Offer</option>
            </select>
          </div>

        </div>
      </div>

      {/* Quick Add Custom University Form */}
      {showAddForm && (
        <form onSubmit={handleCreateUni} className="bg-zinc-950 rounded-3xl border border-zinc-800 p-6 space-y-4 animate-slide-up" id="add-uni-form">
          <h3 className="font-display font-bold text-zinc-100 text-sm">Add Custom Institution</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">University Name</label>
              <input
                type="text"
                required
                placeholder="e.g. University of Oxford"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Target Program</label>
              <input
                type="text"
                placeholder="e.g. Economics & Management"
                value={newProgram}
                onChange={(e) => setNewProgram(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Country</label>
              <input
                type="text"
                required
                placeholder="e.g. UK"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Tier Classification</label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700"
              >
                <option value="A">Aim (Dream / Hardest Match)</option>
                <option value="R">Reach (Competitive Match)</option>
                <option value="S">Safety (High Probability Match)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Typical IB Offer</label>
              <input
                type="text"
                placeholder="e.g. 38-40 points"
                value={newTypicalOffer}
                onChange={(e) => setNewTypicalOffer(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Required Exams</label>
              <input
                type="text"
                placeholder="e.g. TSA / IELTS / SAT"
                value={newEntranceExams}
                onChange={(e) => setNewEntranceExams(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Total Estimated Cost</label>
              <input
                type="text"
                placeholder="e.g. ₹40L/year"
                value={newTotalCost}
                onChange={(e) => setNewTotalCost(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
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
              Add Institution
            </button>
          </div>
        </form>
      )}

      {/* Grid of target institutions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="unis-list-grid">
        {filteredUnis.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-zinc-900 border border-zinc-800 rounded-3xl text-sm text-zinc-500">
            No universities match your active filter parameters. Try broadening your query!
          </div>
        ) : (
          filteredUnis.map((uni) => (
            <div 
              key={uni.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-none flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-all duration-200"
              id={`uni-card-${uni.id}`}
            >
              {/* Card top */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-mono">
                    <MapPin size={10} />
                    <span>{uni.country}</span>
                  </div>

                  {/* Tier indicators */}
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    uni.tier === "A" 
                      ? "bg-rose-950/25 text-rose-400 border border-rose-900/30" 
                      : uni.tier === "R" 
                      ? "bg-purple-950/25 text-purple-400 border border-purple-900/30" 
                      : "bg-emerald-950/25 text-emerald-400 border border-emerald-900/30"
                  }`}>
                    {uni.tier === "A" ? "Tier A (Aim)" : uni.tier === "R" ? "Tier R (Reach)" : "Tier S (Safety)"}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-zinc-100 text-sm leading-snug line-clamp-1 flex items-center gap-1.5" title={uni.name}>
                    <School size={14} className="text-zinc-400" />
                    {uni.name}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-snug">
                    {uni.program}
                  </p>
                </div>
              </div>

              {/* Application Status Picker */}
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 space-y-1.5" id={`status-panel-${uni.id}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">App Status</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    uni.status === "Offered" || uni.status === "Accepted Offer"
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : uni.status === "Rejected" 
                      ? "bg-rose-500/10 text-rose-400" 
                      : uni.status === "Applied" || uni.status === "Interviewing"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {uni.status}
                  </span>
                </div>
                <select
                  value={uni.status}
                  onChange={(e) => onUpdateUniversityStatus(uni.id, e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-lg px-2 py-1.5 font-medium text-zinc-300 outline-none"
                >
                  <option value="Interested">Interested</option>
                  <option value="Drafting Essays">Drafting Essays</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered (Accepted Conditions)</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted Offer">Accepted Offer 🎉</option>
                </select>
              </div>

              {/* Offers, costs and criteria details */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-850 text-[11px]" id={`uni-details-${uni.id}`}>
                <div>
                  <span className="text-zinc-500 block uppercase text-[9px] font-mono">IB Offer Target</span>
                  <span className="font-semibold text-zinc-200 block mt-0.5">{uni.typicalOffer}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase text-[9px] font-mono">Acceptance Rate</span>
                  <span className="font-semibold text-zinc-200 block mt-0.5">{uni.acceptanceRate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-500 block uppercase text-[9px] font-mono">Entrance Exams</span>
                  <span className="font-semibold text-zinc-300 block mt-0.5 truncate" title={uni.entranceExams}>
                    {uni.entranceExams || "None"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-500 block uppercase text-[9px] font-mono">Cost Profile (Total)</span>
                  <span className="font-semibold text-zinc-200 block mt-0.5 truncate">
                    {uni.totalCost} <span className="text-zinc-500 font-normal">({uni.tuition} tuition)</span>
                  </span>
                </div>
                {uni.scholarships && (
                  <div className="col-span-2">
                    <span className="text-zinc-500 block uppercase text-[9px] font-mono flex items-center gap-1">
                      <Award size={10} className="text-amber-400" />
                      Scholarships
                    </span>
                    <span className="font-medium text-zinc-400 block mt-0.5 text-[10px] line-clamp-1" title={uni.scholarships}>
                      {uni.scholarships}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick editable Notes box */}
              <div className="space-y-1 pt-3 border-t border-zinc-850">
                <label className="text-[9px] font-mono text-zinc-500 uppercase block">Application Notes / Tasks</label>
                <textarea
                  placeholder="e.g. Essay deadline Dec 15th, login: user123"
                  value={uni.notes || ""}
                  onChange={(e) => onUpdateUniversityNotes(uni.id, e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-200 rounded-lg px-2.5 py-1.5 h-12 resize-none focus:bg-zinc-900 outline-none focus:border-zinc-750"
                />
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
