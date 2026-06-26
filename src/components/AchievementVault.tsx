import React, { useState } from "react";
import { 
  Award, Calendar, FileText, Link as LinkIcon, Image as ImageIcon, Sparkles, Plus, Trash2, 
  Edit3, Eye, Compass, Trophy, Briefcase, BookOpen, Heart, Activity, Globe, CheckCircle2, AlertCircle, X, Search, Filter, HelpCircle
} from "lucide-react";
import { Achievement } from "../types";

interface AchievementVaultProps {
  achievements: Achievement[];
  onAddAchievement: (achievement: Achievement) => void;
  onUpdateAchievement: (achievement: Achievement) => void;
  onDeleteAchievement: (id: string) => void;
}

const CATEGORY_METADATA: Record<Achievement["category"], { icon: any; color: string; bg: string; border: string }> = {
  Leadership: { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  TEDx: { icon: Sparkles, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  "School Events": { icon: Globe, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  "Marketing Campaigns": { icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  Service: { icon: Heart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  LAAL: { icon: Award, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Volunteering: { icon: Heart, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  Academics: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Olympiads: { icon: Trophy, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Competitions: { icon: Award, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  Research: { icon: BookOpen, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  Internships: { icon: Briefcase, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  Certifications: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  Awards: { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" }
};

export default function AchievementVault({
  achievements,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement
}: AchievementVaultProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [viewingAchievement, setViewingAchievement] = useState<Achievement | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Achievement["category"]>("Leadership");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [skillsDemonstrated, setSkillsDemonstrated] = useState("");
  const [evidence, setEvidence] = useState("");
  const [photoInput, setPhotoInput] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");

  const resetForm = () => {
    setTitle("");
    setCategory("Leadership");
    setDate("");
    setDescription("");
    setImpact("");
    setSkillsDemonstrated("");
    setEvidence("");
    setPhotos([]);
    setPhotoInput("");
    setLinks([]);
    setLinkInput("");
    setReflection("");
    setEditingAchievement(null);
  };

  const handleEdit = (ach: Achievement) => {
    setEditingAchievement(ach);
    setTitle(ach.title);
    setCategory(ach.category);
    setDate(ach.date);
    setDescription(ach.description);
    setImpact(ach.impact);
    setSkillsDemonstrated(ach.skillsDemonstrated.join(", "));
    setEvidence(ach.evidence);
    setPhotos(ach.photos || []);
    setLinks(ach.links || []);
    setReflection(ach.reflection || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const parsedSkills = skillsDemonstrated
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newAch: Achievement = {
      id: editingAchievement ? editingAchievement.id : "ach_" + Date.now(),
      category,
      title,
      date,
      description,
      impact,
      skillsDemonstrated: parsedSkills,
      evidence,
      photos,
      links,
      reflection
    };

    if (editingAchievement) {
      onUpdateAchievement(newAch);
    } else {
      onAddAchievement(newAch);
    }

    resetForm();
    setIsFormOpen(false);
  };

  const addPhoto = () => {
    if (photoInput.trim()) {
      setPhotos([...photos, photoInput.trim()]);
      setPhotoInput("");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (linkInput.trim()) {
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Filter achievements
  const filteredAchievements = achievements.filter(ach => {
    const matchesCategory = selectedCategory === "All" || ach.category === selectedCategory;
    const matchesSearch = ach.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ach.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ach.impact.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ach.skillsDemonstrated.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="achievement-vault-root">
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border border-zinc-800 rounded-3xl p-6 bg-zinc-900/50 backdrop-blur-xs relative overflow-hidden gap-4">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-orange-500/10 text-orange-500">
              <Trophy size={18} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Personal Milestone Archive</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-zinc-100 tracking-tight">
            ACHIEVEMENT VAULT
          </h2>
          <p className="text-zinc-400 text-xs max-w-xl">
            A permanent strategic ledger of high-impact milestones, leadership experiences, TEDx speaking, volunteering, research, and competition wins. Built to enrich university profiles (UCAS, CommonApp, Ivy League).
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-3 bg-orange-500 text-black hover:bg-orange-600 rounded-2xl text-xs font-bold font-mono tracking-wider transition uppercase flex items-center gap-1.5 shadow-lg shadow-orange-500/10"
            id="add-achievement-btn"
          >
            <Plus size={14} />
            <span>Archive Achievement</span>
          </button>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-radial from-orange-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Stats Counter Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="achievement-stats-ledger">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">Total Indexed Milestones</span>
          <span className="text-2xl font-bold text-zinc-100 mt-1 block">{achievements.length}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">Leadership & Service</span>
          <span className="text-2xl font-bold text-zinc-100 mt-1 block">
            {achievements.filter(a => ["Leadership", "Service", "LAAL", "Volunteering"].includes(a.category)).length}
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">Academic & Research</span>
          <span className="text-2xl font-bold text-zinc-100 mt-1 block">
            {achievements.filter(a => ["Academics", "Olympiads", "Competitions", "Research"].includes(a.category)).length}
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">Professional Credentials</span>
          <span className="text-2xl font-bold text-zinc-100 mt-1 block">
            {achievements.filter(a => ["Internships", "Certifications", "Marketing Campaigns", "TEDx"].includes(a.category)).length}
          </span>
        </div>
      </div>

      {/* Control panel: search, filter */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between" id="achievement-filters">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search credentials & skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-300 outline-none focus:border-zinc-800 transition font-mono"
          />
        </div>

        {/* Category filtering */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scroller-hidden">
          {["All", ...Object.keys(CATEGORY_METADATA)].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-medium transition whitespace-nowrap border ${
                  isSelected 
                    ? "bg-orange-500/10 text-orange-500 border-orange-500/30" 
                    : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of achievements */}
      {filteredAchievements.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500">
            <Trophy size={24} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-display font-semibold text-zinc-200 text-sm">No recorded milestones found</h3>
            <p className="text-zinc-500 text-xs">
              Filter matches zero records or you haven't logged any achievements. Press "Archive Achievement" above to register one.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="achievement-cards-grid">
          {filteredAchievements.map((ach) => {
            const meta = CATEGORY_METADATA[ach.category] || CATEGORY_METADATA["Leadership"];
            const CatIcon = meta.icon;

            return (
              <div 
                key={ach.id} 
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl hover:border-zinc-800 hover:bg-zinc-900/60 transition duration-200 flex flex-col p-5 space-y-4 relative group"
                id={`ach-card-${ach.id}`}
              >
                {/* Category badge */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider ${meta.bg} ${meta.color} ${meta.border}`}>
                    <CatIcon size={10} />
                    <span>{ach.category}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{ach.date}</span>
                </div>

                {/* Title & desc */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display font-bold text-zinc-200 text-sm tracking-tight leading-snug">
                    {ach.title}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-3">
                    {ach.description}
                  </p>
                </div>

                {/* Skills indicators */}
                {ach.skillsDemonstrated.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ach.skillsDemonstrated.map((sk, idx) => (
                      <span key={idx} className="bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-zinc-400 px-2 py-0.5 rounded-md">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Impact Summary Box */}
                {ach.impact && (
                  <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 text-xs">
                    <span className="text-[9px] font-mono text-orange-500 font-bold block uppercase tracking-wider">Metrics / Quantifiable Impact</span>
                    <p className="text-zinc-300 font-medium mt-0.5">{ach.impact}</p>
                  </div>
                )}

                {/* Card controls */}
                <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-xs">
                  <button
                    onClick={() => setViewingAchievement(ach)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 font-mono text-[10px]"
                  >
                    <Eye size={12} />
                    <span>View Detail Ledger</span>
                  </button>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-150">
                    <button
                      onClick={() => handleEdit(ach)}
                      className="p-1.5 hover:bg-zinc-950 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
                      title="Edit Ledger Record"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteAchievement(ach.id)}
                      className="p-1.5 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 text-zinc-500 hover:text-red-400 rounded-lg transition"
                      title="Delete Entry"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog: Record/Edit Achievement form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <div>
                <h3 className="font-display font-bold text-base text-zinc-100">
                  {editingAchievement ? "Update Milestone Ledger" : "Archive New Achievement"}
                </h3>
                <p className="text-zinc-500 text-xs">Maintain strict precision and quantifiable metrics for UCAS alignment.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form inputs */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Achievement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TEDxYouth Organizer & Chief Curator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Date / Timeline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2025"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Category Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Achievement["category"])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                  >
                    {Object.keys(CATEGORY_METADATA).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Skills Demonstrated (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Public Speaking, Leadership, Strategic Planning"
                    value={skillsDemonstrated}
                    onChange={(e) => setSkillsDemonstrated(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Description</label>
                <textarea
                  placeholder="Summarize the core elements of the initiative, project scope, or curriculum."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Quantifiable Impact</label>
                <textarea
                  placeholder="Specify absolute outcomes (e.g. Raised ₹50,000, impacted 300+ students, 98% accuracy feedback)."
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Key Reflections</label>
                <textarea
                  placeholder="Lessons learned, how this shapes your PPE/Academic pathway, or skill breakthroughs."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Evidence & Certifications Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Official certificate from school board / Letter of endorsement from supervisor"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                />
              </div>

              {/* Photo list */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Demonstration Photos</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste Photo URL (e.g. https://images.unsplash.com/...)"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                  />
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono font-medium transition"
                  >
                    Add Image
                  </button>
                </div>
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {photos.map((ph, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 px-3 py-1.5 rounded-lg">
                        <ImageIcon size={12} />
                        <span className="truncate max-w-[150px] font-mono text-[10px]">{ph}</span>
                        <button type="button" onClick={() => removePhoto(idx)} className="text-red-400 hover:text-red-300 ml-1">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* External Links */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">External Links (TEDx stream, github, press releases)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste link address (e.g. https://youtube.com/watch?...)"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-700 transition"
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono font-medium transition"
                  >
                    Add Link
                  </button>
                </div>
                {links.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {links.map((lk, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 px-3 py-1.5 rounded-lg">
                        <LinkIcon size={12} />
                        <span className="truncate max-w-[150px] font-mono text-[10px]">{lk}</span>
                        <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 ml-1">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-5 flex justify-end gap-3 bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-mono font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 text-black hover:bg-orange-600 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition"
                >
                  {editingAchievement ? "Confirm Changes" : "Save to Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog: Detail Ledger Viewer */}
      {viewingAchievement && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-mono uppercase font-bold tracking-wider ${CATEGORY_METADATA[viewingAchievement.category].bg} ${CATEGORY_METADATA[viewingAchievement.category].color} ${CATEGORY_METADATA[viewingAchievement.category].border}`}>
                    {viewingAchievement.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{viewingAchievement.date}</span>
                </div>
                <h3 className="font-display font-bold text-base md:text-lg text-zinc-100 leading-tight">
                  {viewingAchievement.title}
                </h3>
              </div>
              <button 
                onClick={() => setViewingAchievement(null)}
                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 space-y-6">
              
              {/* Description */}
              {viewingAchievement.description && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Scope & Description</span>
                  <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">{viewingAchievement.description}</p>
                </div>
              )}

              {/* Quantifiable Impact */}
              {viewingAchievement.impact && (
                <div className="space-y-1.5 bg-zinc-950/60 border border-zinc-900 rounded-xl p-4">
                  <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest block font-bold">Quantifiable Impact & Core Metric Outcomes</span>
                  <p className="text-zinc-200 text-xs md:text-sm font-semibold mt-1">{viewingAchievement.impact}</p>
                </div>
              )}

              {/* Reflections */}
              {viewingAchievement.reflection && (
                <div className="space-y-1.5 bg-zinc-950/30 border border-zinc-800/40 rounded-xl p-4">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Strategic Reflections & Profile Alignment</span>
                  <p className="text-zinc-300 text-xs md:text-sm italic leading-relaxed">"{viewingAchievement.reflection}"</p>
                </div>
              )}

              {/* Row: Skills & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900 pt-5">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Skills Cultivated</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingAchievement.skillsDemonstrated.map((sk, i) => (
                      <span key={i} className="bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 px-2.5 py-1 rounded-md">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Archived Evidence</span>
                  {viewingAchievement.evidence ? (
                    <div className="flex items-center gap-1.5 bg-zinc-950/40 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-300 font-mono">
                      <FileText size={14} className="text-zinc-500" />
                      <span>{viewingAchievement.evidence}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 text-xs font-mono">No physical cert uploaded</span>
                  )}
                </div>
              </div>

              {/* Photos Gallery */}
              {viewingAchievement.photos && viewingAchievement.photos.length > 0 && (
                <div className="space-y-2 border-t border-zinc-900 pt-5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Image Gallery</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {viewingAchievement.photos.map((ph, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-zinc-800 bg-zinc-950">
                        <img 
                          src={ph} 
                          alt="Evidence gallery item" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback image indicator if broken link
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/60 px-1 py-0.5 rounded text-zinc-400 truncate max-w-[90%]">
                          {ph.substring(0, 20)}...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links List */}
              {viewingAchievement.links && viewingAchievement.links.length > 0 && (
                <div className="space-y-2 border-t border-zinc-900 pt-5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">External Verification Links</span>
                  <div className="space-y-1.5">
                    {viewingAchievement.links.map((lk, idx) => (
                      <a 
                        key={idx}
                        href={lk}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-xs font-mono truncate"
                      >
                        <LinkIcon size={12} />
                        <span>{lk}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
              <button
                onClick={() => {
                  const toEdit = viewingAchievement;
                  setViewingAchievement(null);
                  handleEdit(toEdit);
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition"
              >
                Modify Ledger Record
              </button>
              <button
                onClick={() => setViewingAchievement(null)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-mono font-medium transition"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
