export interface Task {
  id: string;
  subjectId: string; // "MATH_AI_HL", "ECON_HL", "BM_HL", "HINDI_SL", "ENGLISH_SL", "ESS_SL", "PHYSICS_HL", "IPMAT", "EE", "CAS", "IA", "UNI", "SCHOLARSHIP"
  title: string;
  deadline: string;
  completed: boolean;
  notes?: string;
  type: "IA" | "EE" | "CAS" | "IPMAT" | "Regular" | "Test" | "School Assignment" | "University Application" | "Scholarship Application";
  priority: "High" | "Medium" | "Low";
}

export interface Subject {
  id: string;
  name: string;
  level: "HL" | "SL" | "NA";
  syllabus: string[];
}

export interface Mistake {
  id: string;
  subjectId: string;
  topic: string;
  description: string;
  mistakeDescription: string;
  correctAction: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reviewStatus: "Needs Review" | "Understood" | "Mastered";
  dateAdded: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  duration: number; // in minutes
  date: string;
  mode: "Pomodoro" | "Normal";
  section: "IBDP" | "IPMAT" | "EE" | "CAS" | "IA";
  notes?: string;
}

export interface University {
  id: string;
  name: string;
  program: string;
  country: string;
  tier: "A" | "R" | "S"; // A=Aim/Ambition, R=Reach/Target, S=Safety
  typicalOffer: string;
  subjectRequirements?: string;
  englishReq?: string;
  gapVsOffer: number;
  acceptanceRate: string;
  tuition: string;
  livingCost: string;
  totalCost: string;
  scholarships?: string;
  entranceExams?: string;
  eligibility?: string;
  applicationAngle?: string;
  competitionLevel: "extreme" | "very high" | "high" | "moderate" | "low";
  status: "Interested" | "Drafting Essays" | "Applied" | "Interviewing" | "Offered" | "Rejected" | "Accepted Offer";
  notes?: string;
}

export interface IaEeCasStatus {
  eeTopic: string;
  eeStatus: "Not Started" | "Drafting" | "First Draft Complete" | "Viva Voce" | "Completed";
  eeMilestones: { title: string; completed: boolean; date: string }[];
  casHoursCreativity: number;
  casHoursActivity: number;
  casHoursService: number;
  casExperiences: { title: string; category: "Creativity" | "Activity" | "Service"; hours: number; status: "Planned" | "Active" | "Completed"; experienceType?: "Series" | "Single Day" | "Project" }[];
  iaMilestones: { [subjectId: string]: { status: "Not Started" | "Proposal" | "Drafting" | "Final Review" | "Completed"; score?: number } };
}

export interface SubjectPerformance {
  subjectId: string; // matches subject id (e.g. MATH_AI_HL, ECON_HL, etc.) or "IPMAT"
  completion: number; // 0-100
  confidence: number; // 1-10
  avgTestScore: number; // 0-100
  lastRevisionDate: string; // YYYY-MM-DD
  currentGradeEstimate: string; // e.g. "6", "7", "A", "92%"
  targetGrade: string; // e.g. "7", "A*", "95%"
  trend: "improving" | "stable" | "declining";
}

export interface VaultResource {
  id: string;
  subjectId: string; // e.g. ECON_HL, BM_HL, etc.
  category: string;
  title: string;
  description: string;
  tags: string[];
  bookmarked: boolean;
  favorite: boolean;
  fileType: "pdf" | "docx" | "image" | "link";
  fileUrl?: string;
  dateAdded: string;
  viewsCount: number;
  year?: string; // e.g. "2024", "2023", "N/A"
  paperNumber?: string; // e.g. "Paper 1", "Paper 2", "Paper 3", "N/A"
  resourceType?: string; // e.g. "Past Paper", "Markscheme", "Textbook", "Notes"
  externalUrl?: string; // URL to dl.pirateib.su etc.
  clicksCount?: number; // tracking access count
  lastAccessedDate?: string; // tracking last accessed timestamp
}

export interface TopicHeatmap {
  id: string;
  subjectId: string;
  topicName: string;
  completion: number; // 0-100
  confidence: number; // 0-100
  testPerformance: number; // 0-100
  revisionFrequency: number; // revisions per month
  examFocus: "High" | "Medium" | "Low";
}

export interface WeeklyPerformanceReport {
  id: string;
  date: string;
  totalStudyHours: number;
  subjectHours: { [subjectId: string]: number };
  mostImprovedSubject: string;
  weakestSubject: string;
  highestAccuracySubject: string;
  lowestAccuracySubject: string;
  tasksCompleted: number;
  tasksMissed: number;
  iaProgress: number; // 0-100
  eeProgress: number; // 0-100
  casProgress: number; // 0-100
  insights: string[];
  wins: string[];
  risks: string[];
  recommendations: string[];
  aiMentorHtml?: string;
}

export interface DecisionLog {
  id: string;
  decision: string;
  reason: string;
  expectedOutcome: string;
  actualOutcome: string;
  lessonsLearned: string;
  date: string;
}

export interface DailyAccountability {
  id: string;
  date: string;
  plannedStudyTime: number; // in minutes
  actualStudyTime: number; // in minutes
  tasksPlannedCount: number;
  tasksCompletedCount: number;
  missedCommitments: string[];
  integrityScore: number; // 0-100
  consistencyScore: number; // 0-100
  executionScore: number; // 0-100
}

export interface Achievement {
  id: string;
  category: "Leadership" | "TEDx" | "School Events" | "Marketing Campaigns" | "Service" | "LAAL" | "Volunteering" | "Academics" | "Olympiads" | "Competitions" | "Research" | "Internships" | "Certifications" | "Awards";
  title: string;
  date: string;
  description: string;
  impact: string;
  skillsDemonstrated: string[];
  evidence: string;
  photos: string[];
  links: string[];
  reflection: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  category: "Academic" | "Personal" | "Strategic" | "Reflections";
}

