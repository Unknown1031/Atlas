import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import SubjectPage from "./components/SubjectPage";
import IeCasPage from "./components/IeCasPage";
import IpmatPrepPage from "./components/IpmatPrepPage";
import UniversityPage from "./components/UniversityPage";
import MistakeDatabase from "./components/MistakeDatabase";
import WeeklyReports from "./components/WeeklyReports";
import AchievementVault from "./components/AchievementVault";

// Advanced feature components
import SubjectPerformanceTracker from "./components/SubjectPerformanceTracker";
import DeadlineRadar from "./components/DeadlineRadar";
import AtlasBrain from "./components/AtlasBrain";

import { 
  INITIAL_SUBJECTS, 
  INITIAL_TASKS, 
  INITIAL_MISTAKES, 
  INITIAL_STUDY_LOGS, 
  INITIAL_UNIVERSITIES, 
  INITIAL_STATUS,
  INITIAL_SUBJECT_PERFORMANCE,
  INITIAL_VAULT_RESOURCES,
  INITIAL_TOPIC_HEATMAPS,
  INITIAL_WEEKLY_REPORTS,
  INITIAL_DECISIONS,
  INITIAL_ACCOUNTABILITY,
  INITIAL_JOURNAL_ENTRIES
} from "./data";
import { 
  Subject, 
  Task, 
  Mistake, 
  StudyLog, 
  University, 
  IaEeCasStatus,
  SubjectPerformance,
  VaultResource,
  TopicHeatmap,
  WeeklyPerformanceReport,
  Achievement,
  DecisionLog,
  DailyAccountability,
  JournalEntry
} from "./types";
import { 
  GraduationCap, 
  Award, 
  X, 
  Sliders, 
  Cloud, 
  UploadCloud, 
  Lock, 
  Unlock,
  User, 
  RefreshCw, 
  LogOut, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

const INITIAL_ACHIEVEMENTS: Achievement[] = [];

export default function App() {
  const [activePage, setActivePage] = useState<string>("home");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // States
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [coreStatus, setCoreStatus] = useState<IaEeCasStatus | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Advanced Feature States
  const [subjectPerformances, setSubjectPerformances] = useState<SubjectPerformance[]>([]);
  const [vaultResources, setVaultResources] = useState<VaultResource[]>([]);
  const [topicHeatmaps, setTopicHeatmaps] = useState<TopicHeatmap[]>([]);
  const [weeklyReportsList, setWeeklyReportsList] = useState<WeeklyPerformanceReport[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [dailyAccountability, setDailyAccountability] = useState<DailyAccountability[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // User Profile & Accent Theme State (Requirement 11)
  const [userProfile, setUserProfile] = useState({
    name: "IBDP Year 2",
    email: "goalm1031@gmail.com",
    pfpUrl: "",
    accent: "orange" as "orange" | "emerald" | "indigo" | "rose"
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lifted Timer State
  const [activeTimerSection, setActiveTimerSection] = useState<string | null>(null);
  const [activeTimerMinutes, setActiveTimerMinutes] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64String = event.target.result as string;
            saveUserProfile({ ...userProfile, pfpUrl: base64String });
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please drop a valid image file.");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64String = event.target.result as string;
            saveUserProfile({ ...userProfile, pfpUrl: base64String });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Cloud auth states
  const [cloudEmail, setCloudEmail] = useState("");
  const [cloudPassword, setCloudPassword] = useState("");
  const [isCloudLoggedIn, setIsCloudLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Administrative control unlock states
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminVerifyEmail, setAdminVerifyEmail] = useState("");
  const [adminVerifyError, setAdminVerifyError] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    // 1. Tasks
    const cachedTasks = localStorage.getItem("student_os_tasks");
    if (cachedTasks) {
      try { setTasks(JSON.parse(cachedTasks)); } catch (e) { setTasks(INITIAL_TASKS); }
    } else {
      setTasks(INITIAL_TASKS);
    }

    // 2. Mistakes
    const cachedMistakes = localStorage.getItem("student_os_mistakes");
    if (cachedMistakes) {
      try { setMistakes(JSON.parse(cachedMistakes)); } catch (e) { setMistakes(INITIAL_MISTAKES); }
    } else {
      setMistakes(INITIAL_MISTAKES);
    }

    // 3. Study Logs
    const cachedLogs = localStorage.getItem("student_os_study_logs");
    if (cachedLogs) {
      try { setStudyLogs(JSON.parse(cachedLogs)); } catch (e) { setStudyLogs(INITIAL_STUDY_LOGS); }
    } else {
      setStudyLogs(INITIAL_STUDY_LOGS);
    }

    // 4. Universities
    const cachedUnis = localStorage.getItem("student_os_universities");
    if (cachedUnis) {
      try { setUniversities(JSON.parse(cachedUnis)); } catch (e) { setUniversities(INITIAL_UNIVERSITIES); }
    } else {
      setUniversities(INITIAL_UNIVERSITIES);
    }

    // 5. Core status (IA, EE, CAS)
    const cachedCore = localStorage.getItem("student_os_core_status");
    if (cachedCore) {
      try { setCoreStatus(JSON.parse(cachedCore)); } catch (e) { setCoreStatus(INITIAL_STATUS); }
    } else {
      setCoreStatus(INITIAL_STATUS);
    }

    // 6. Subject Performances
    const cachedPerf = localStorage.getItem("student_os_subject_performances");
    if (cachedPerf) {
      try { setSubjectPerformances(JSON.parse(cachedPerf)); } catch (e) { setSubjectPerformances(INITIAL_SUBJECT_PERFORMANCE); }
    } else {
      setSubjectPerformances(INITIAL_SUBJECT_PERFORMANCE);
    }

    // 7. Vault Resources
    const cachedVault = localStorage.getItem("student_os_vault_resources");
    if (cachedVault) {
      try { setVaultResources(JSON.parse(cachedVault)); } catch (e) { setVaultResources(INITIAL_VAULT_RESOURCES); }
    } else {
      setVaultResources(INITIAL_VAULT_RESOURCES);
    }

    // 8. Topic Heatmaps
    const cachedHeats = localStorage.getItem("student_os_topic_heatmaps");
    if (cachedHeats) {
      try { setTopicHeatmaps(JSON.parse(cachedHeats)); } catch (e) { setTopicHeatmaps(INITIAL_TOPIC_HEATMAPS); }
    } else {
      setTopicHeatmaps(INITIAL_TOPIC_HEATMAPS);
    }

    // 9. Weekly Reports List
    const cachedReps = localStorage.getItem("student_os_weekly_reports_list");
    if (cachedReps) {
      try { setWeeklyReportsList(JSON.parse(cachedReps)); } catch (e) { setWeeklyReportsList(INITIAL_WEEKLY_REPORTS); }
    } else {
      setWeeklyReportsList(INITIAL_WEEKLY_REPORTS);
    }

    // 10. User Profile
    const cachedProfile = localStorage.getItem("student_os_user_profile");
    if (cachedProfile) {
      try { setUserProfile(JSON.parse(cachedProfile)); } catch (e) {}
    }

    // 11. Achievements
    const cachedAchievements = localStorage.getItem("student_os_achievements");
    if (cachedAchievements) {
      try { setAchievements(JSON.parse(cachedAchievements)); } catch (e) { setAchievements(INITIAL_ACHIEVEMENTS); }
    } else {
      setAchievements(INITIAL_ACHIEVEMENTS);
    }

    // 11a. Decision Logs
    const cachedDecs = localStorage.getItem("student_os_decision_logs");
    if (cachedDecs) {
      try { setDecisionLogs(JSON.parse(cachedDecs)); } catch (e) { setDecisionLogs(INITIAL_DECISIONS); }
    } else {
      setDecisionLogs(INITIAL_DECISIONS);
    }

    // 11b. Daily Accountability
    const cachedAccs = localStorage.getItem("student_os_daily_accountability");
    if (cachedAccs) {
      try { setDailyAccountability(JSON.parse(cachedAccs)); } catch (e) { setDailyAccountability(INITIAL_ACCOUNTABILITY); }
    } else {
      setDailyAccountability(INITIAL_ACCOUNTABILITY);
    }

    // 11c. Journal Entries
    const cachedJournals = localStorage.getItem("student_os_journal_entries");
    if (cachedJournals) {
      try { setJournalEntries(JSON.parse(cachedJournals)); } catch (e) { setJournalEntries(INITIAL_JOURNAL_ENTRIES); }
    } else {
      setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    }

    // 12. Check saved cloud authentication and pull synced data
    const savedAuth = localStorage.getItem("student_os_cloud_auth");
    if (savedAuth) {
      try {
        const { email, password } = JSON.parse(savedAuth);
        setCloudEmail(email);
        setCloudPassword(password);
        setIsCloudLoggedIn(true);
        
        // Fetch background backup data on load
        fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
          if (data.state) {
            const s = data.state;
            if (s.subjects) setSubjects(s.subjects);
            if (s.tasks) setTasks(s.tasks);
            if (s.mistakes) setMistakes(s.mistakes);
            if (s.studyLogs) setStudyLogs(s.studyLogs);
            if (s.universities) setUniversities(s.universities);
            if (s.coreStatus) setCoreStatus(s.coreStatus);
            if (s.achievements) setAchievements(s.achievements);
            if (s.subjectPerformances) setSubjectPerformances(s.subjectPerformances);
            if (s.vaultResources) setVaultResources(s.vaultResources);
            if (s.topicHeatmaps) setTopicHeatmaps(s.topicHeatmaps);
            if (s.weeklyReportsList) setWeeklyReportsList(s.weeklyReportsList);
            if (s.userProfile) setUserProfile(s.userProfile);
          }
        })
        .catch(err => console.log("Silent cloud backup load skipped:", err));
      } catch (e) {}
    }
  }, []);

  // Save changes helper
  const saveAchievements = (newAchs: Achievement[]) => {
    setAchievements(newAchs);
    localStorage.setItem("student_os_achievements", JSON.stringify(newAchs));
    if (isCloudLoggedIn) {
      triggerSilentSyncPush(undefined, newAchs);
    }
  };

  const handleResetAllData = () => {
    if (window.confirm("ARE YOU SURE you want to reset all your coursework data? This will permanently clear all logged focus sessions, tasks, mistakes, weekly reports, and achievements to give you a completely clean slate. (Your core subjects syllabus will be preserved).")) {
      // Reset React States
      setTasks([]);
      setMistakes([]);
      setStudyLogs([]);
      setAchievements([]);
      setWeeklyReportsList([]);
      setTopicHeatmaps([]);

      // Reset Extended Essay & CAS to clean baseline
      const cleanCoreStatus: IaEeCasStatus = {
        eeTopic: "",
        eeStatus: "Not Started",
        eeMilestones: [
          { title: "Define Research Question", completed: false, date: "" },
          { title: "Source Literature Review", completed: false, date: "" },
          { title: "Outline and Methodology", completed: false, date: "" },
          { title: "First Draft (3000 Words)", completed: false, date: "" },
          { title: "Final Polish and Citations", completed: false, date: "" }
        ],
        casHoursCreativity: 0,
        casHoursActivity: 0,
        casHoursService: 0,
        casExperiences: [],
        iaMilestones: {
          MATH_AI_HL: { status: "Not Started" },
          ECON_HL: { status: "Not Started" },
          BM_HL: { status: "Not Started" },
          HINDI_SL: { status: "Not Started" },
          ENGLISH_SL: { status: "Not Started" },
          ESS_SL: { status: "Not Started" }
        }
      };
      setCoreStatus(cleanCoreStatus);

      // Reset Subject Performances to clean baseline
      const cleanPerf: SubjectPerformance[] = [
        { subjectId: "MATH_AI_HL", completion: 0, confidence: 5, avgTestScore: 0, lastRevisionDate: "", currentGradeEstimate: "4", targetGrade: "7", trend: "stable" },
        { subjectId: "ECON_HL", completion: 0, confidence: 5, avgTestScore: 0, lastRevisionDate: "", currentGradeEstimate: "4", targetGrade: "7", trend: "stable" },
        { subjectId: "BM_HL", completion: 0, confidence: 5, avgTestScore: 0, lastRevisionDate: "", currentGradeEstimate: "4", targetGrade: "7", trend: "stable" },
        { subjectId: "ENGLISH_SL", completion: 0, confidence: 5, avgTestScore: 0, lastRevisionDate: "", currentGradeEstimate: "4", targetGrade: "7", trend: "stable" },
        { subjectId: "HINDI_SL", completion: 0, confidence: 5, avgTestScore: 0, lastRevisionDate: "", currentGradeEstimate: "4", targetGrade: "7", trend: "stable" },
        { subjectId: "ESS_SL", completion: 0, confidence: 5, avgTestScore: 0, lastRevisionDate: "", currentGradeEstimate: "4", targetGrade: "7", trend: "stable" },
        { subjectId: "IPMAT", completion: 0, confidence: 5, avgTestScore: 0, lastRevisionDate: "", currentGradeEstimate: "0%", targetGrade: "100%", trend: "stable" }
      ];
      setSubjectPerformances(cleanPerf);

      // Clear localStorage cache
      localStorage.removeItem("student_os_tasks");
      localStorage.removeItem("student_os_mistakes");
      localStorage.removeItem("student_os_study_logs");
      localStorage.removeItem("student_os_achievements");
      localStorage.removeItem("student_os_weekly_reports_list");
      localStorage.removeItem("student_os_topic_heatmaps");
      localStorage.removeItem("student_os_core_status");
      localStorage.removeItem("student_os_subject_performances");

      // Push silent sync if logged in
      if (isCloudLoggedIn) {
        const savedAuth = localStorage.getItem("student_os_cloud_auth");
        if (savedAuth) {
          try {
            const { email, password } = JSON.parse(savedAuth);
            const stateToSync = {
              subjects,
              tasks: [],
              mistakes: [],
              studyLogs: [],
              universities,
              coreStatus: cleanCoreStatus,
              achievements: [],
              subjectPerformances: cleanPerf,
              vaultResources,
              topicHeatmaps: [],
              weeklyReportsList: [],
              userProfile
            };
            fetch("/api/auth/sync-push", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, state: stateToSync })
            }).catch(e => console.log("Cloud clear sync push failed:", e));
          } catch (e) {}
        }
      }

      alert("Workspace reset successfully! All mock sessions, tasks, achievements, and logs have been wiped. You are ready to start fresh tomorrow!");
    }
  };

  const triggerSilentSyncPush = (customProfile?: typeof userProfile, customAchs?: Achievement[]) => {
    const savedAuth = localStorage.getItem("student_os_cloud_auth");
    if (!savedAuth) return;
    try {
      const { email, password } = JSON.parse(savedAuth);
      const stateToSync = {
        subjects,
        tasks,
        mistakes,
        studyLogs,
        universities,
        coreStatus,
        achievements: customAchs || achievements,
        subjectPerformances,
        vaultResources,
        topicHeatmaps,
        weeklyReportsList,
        userProfile: customProfile || userProfile
      };
      fetch("/api/auth/sync-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, state: stateToSync })
      }).catch(e => console.log("Quiet sync push failed:", e));
    } catch (e) {}
  };

  const handleCloudRegister = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    if (!cloudEmail || !cloudPassword) {
      setAuthError("Email and password are required.");
      return;
    }
    try {
      setIsSyncing(true);
      const stateToSync = {
        subjects,
        tasks,
        mistakes,
        studyLogs,
        universities,
        coreStatus,
        achievements,
        subjectPerformances,
        vaultResources,
        topicHeatmaps,
        weeklyReportsList,
        userProfile
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cloudEmail, password: cloudPassword, state: stateToSync })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setIsCloudLoggedIn(true);
      setAuthSuccess("Account created successfully! Online sync active.");
      localStorage.setItem("student_os_cloud_auth", JSON.stringify({ email: cloudEmail, password: cloudPassword }));
    } catch (e: any) {
      setAuthError(e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    if (!cloudEmail || !cloudPassword) {
      setAuthError("Email and password are required.");
      return;
    }
    try {
      setIsSyncing(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cloudEmail, password: cloudPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setIsCloudLoggedIn(true);
      setAuthSuccess("Login successful! Sycned database data successfully.");
      localStorage.setItem("student_os_cloud_auth", JSON.stringify({ email: cloudEmail, password: cloudPassword }));

      // Hydrate from cloud data
      if (data.state) {
        const s = data.state;
        if (s.subjects) { setSubjects(s.subjects); localStorage.setItem("student_os_subjects", JSON.stringify(s.subjects)); }
        if (s.tasks) { setTasks(s.tasks); localStorage.setItem("student_os_tasks", JSON.stringify(s.tasks)); }
        if (s.mistakes) { setMistakes(s.mistakes); localStorage.setItem("student_os_mistakes", JSON.stringify(s.mistakes)); }
        if (s.studyLogs) { setStudyLogs(s.studyLogs); localStorage.setItem("student_os_study_logs", JSON.stringify(s.studyLogs)); }
        if (s.universities) { setUniversities(s.universities); localStorage.setItem("student_os_universities", JSON.stringify(s.universities)); }
        if (s.coreStatus) { setCoreStatus(s.coreStatus); localStorage.setItem("student_os_core_status", JSON.stringify(s.coreStatus)); }
        if (s.achievements) { setAchievements(s.achievements); localStorage.setItem("student_os_achievements", JSON.stringify(s.achievements)); }
        if (s.subjectPerformances) { setSubjectPerformances(s.subjectPerformances); localStorage.setItem("student_os_subject_performances", JSON.stringify(s.subjectPerformances)); }
        if (s.vaultResources) { setVaultResources(s.vaultResources); localStorage.setItem("student_os_vault_resources", JSON.stringify(s.vaultResources)); }
        if (s.topicHeatmaps) { setTopicHeatmaps(s.topicHeatmaps); localStorage.setItem("student_os_topic_heatmaps", JSON.stringify(s.topicHeatmaps)); }
        if (s.weeklyReportsList) { setWeeklyReportsList(s.weeklyReportsList); localStorage.setItem("student_os_weekly_reports_list", JSON.stringify(s.weeklyReportsList)); }
        if (s.userProfile) { setUserProfile(s.userProfile); localStorage.setItem("student_os_user_profile", JSON.stringify(s.userProfile)); }
      }
    } catch (e: any) {
      setAuthError(e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudLogout = () => {
    setIsCloudLoggedIn(false);
    setCloudEmail("");
    setCloudPassword("");
    localStorage.removeItem("student_os_cloud_auth");
    setAuthSuccess("Logged out of cloud. Data will remain local.");
  };

  const saveUserProfile = (profile: typeof userProfile) => {
    setUserProfile(profile);
    localStorage.setItem("student_os_user_profile", JSON.stringify(profile));
    if (isCloudLoggedIn) {
      triggerSilentSyncPush(profile);
    }
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("student_os_tasks", JSON.stringify(newTasks));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveMistakes = (newMistakes: Mistake[]) => {
    setMistakes(newMistakes);
    localStorage.setItem("student_os_mistakes", JSON.stringify(newMistakes));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveLogs = (newLogs: StudyLog[]) => {
    setStudyLogs(newLogs);
    localStorage.setItem("student_os_study_logs", JSON.stringify(newLogs));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveUnis = (newUnis: University[]) => {
    setUniversities(newUnis);
    localStorage.setItem("student_os_universities", JSON.stringify(newUnis));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveCoreStatus = (newCore: IaEeCasStatus) => {
    setCoreStatus(newCore);
    localStorage.setItem("student_os_core_status", JSON.stringify(newCore));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveSubjectPerformances = (newPerf: SubjectPerformance[]) => {
    setSubjectPerformances(newPerf);
    localStorage.setItem("student_os_subject_performances", JSON.stringify(newPerf));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveVaultResources = (newRes: VaultResource[]) => {
    setVaultResources(newRes);
    localStorage.setItem("student_os_vault_resources", JSON.stringify(newRes));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveTopicHeatmaps = (newHeats: TopicHeatmap[]) => {
    setTopicHeatmaps(newHeats);
    localStorage.setItem("student_os_topic_heatmaps", JSON.stringify(newHeats));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  const saveWeeklyReportsList = (newReps: WeeklyPerformanceReport[]) => {
    setWeeklyReportsList(newReps);
    localStorage.setItem("student_os_weekly_reports_list", JSON.stringify(newReps));
    if (isCloudLoggedIn) {
      setTimeout(() => triggerSilentSyncPush(), 50);
    }
  };

  // Log handlers
  const handleAddStudyLog = (log: Omit<StudyLog, "id" | "date">) => {
    const newLog: StudyLog = {
      ...log,
      id: "log_" + Date.now().toString(),
      date: new Date().toISOString().split("T")[0] // YYYY-MM-DD
    };
    const updated = [...studyLogs, newLog];
    saveLogs(updated);
  };

  // Task handlers
  const handleAddTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: "task_" + Date.now().toString()
    };
    const updated = [...tasks, newTask];
    saveTasks(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
  };

  const handleEditTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => t.id === updatedTask.id ? updatedTask : t);
    saveTasks(updated);
  };

  // Mistake handlers
  const handleAddMistake = (mistake: Omit<Mistake, "id" | "dateAdded">) => {
    const newMistake: Mistake = {
      ...mistake,
      id: "mistake_" + Date.now().toString(),
      dateAdded: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    };
    const updated = [...mistakes, newMistake];
    saveMistakes(updated);
  };

  const handleUpdateMistakeStatus = (id: string, status: Mistake["reviewStatus"]) => {
    const updated = mistakes.map((m) => 
      m.id === id ? { ...m, reviewStatus: status } : m
    );
    saveMistakes(updated);
  };

  // University handlers
  const handleAddUniversity = (uni: Omit<University, "id">) => {
    const newUni: University = {
      ...uni,
      id: "uni_" + Date.now().toString()
    };
    const updated = [newUni, ...universities];
    saveUnis(updated);
  };

  const handleUpdateUniversityStatus = (id: string, status: University["status"]) => {
    const updated = universities.map((u) => 
      u.id === id ? { ...u, status } : u
    );
    saveUnis(updated);
  };

  const handleUpdateUniversityNotes = (id: string, notes: string) => {
    const updated = universities.map((u) => 
      u.id === id ? { ...u, notes } : u
    );
    saveUnis(updated);
  };

  // IA Milestone handler
  const handleUpdateIaStatus = (subjectId: string, statusStr: IaEeCasStatus["iaMilestones"][string]["status"], score?: number) => {
    if (!coreStatus) return;
    const updatedIaMilestones = { ...coreStatus.iaMilestones };
    updatedIaMilestones[subjectId] = {
      status: statusStr,
      score: score !== undefined ? score : updatedIaMilestones[subjectId]?.score
    };

    saveCoreStatus({
      ...coreStatus,
      iaMilestones: updatedIaMilestones
    });
  };

  // Active Subject details
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Render Sub-pages
  const renderContent = () => {
    if (!coreStatus) return <div className="text-zinc-400 p-8 font-mono text-xs">Instantiating Atlas core systems...</div>;

    switch (activePage) {
      case "home":
      case "dashboard":
        return (
          <DashboardHome
            subjects={subjects}
            tasks={tasks}
            mistakes={mistakes}
            studyLogs={studyLogs}
            universities={universities}
            activeTimerSection={activeTimerSection}
            activeTimerMinutes={activeTimerMinutes}
            timerRunning={timerRunning}
            onAddStudyLog={handleAddStudyLog}
            onTimerStateChange={(state) => {
              setActiveTimerSection(state.section);
              setActiveTimerMinutes(state.minutes);
              setTimerRunning(state.running);
            }}
            setActivePage={setActivePage}
            setSelectedSubjectId={setSelectedSubjectId}
            onToggleTask={handleToggleTask}
            userProfile={userProfile}
          />
        );

      case "subject_detail":
        if (!activeSubject) return <div className="text-slate-400 font-mono text-xs p-8">No subject selected.</div>;
        return (
          <SubjectPage
            subject={activeSubject}
            tasks={tasks}
            mistakes={mistakes}
            studyLogs={studyLogs}
            iaMilestone={coreStatus.iaMilestones[activeSubject.id] || { status: "Not Started" }}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateIaStatus={handleUpdateIaStatus}
          />
        );

      case "achievement_vault":
        return (
          <AchievementVault
            achievements={achievements}
            onAddAchievement={(ach) => saveAchievements([...achievements, ach])}
            onUpdateAchievement={(ach) => saveAchievements(achievements.map(a => a.id === ach.id ? ach : a))}
            onDeleteAchievement={(id) => saveAchievements(achievements.filter(a => a.id !== id))}
          />
        );

      case "subject_performance":
        return (
          <SubjectPerformanceTracker
            subjects={subjects}
            studyLogs={studyLogs}
            subjectPerformances={subjectPerformances}
            onUpdatePerformance={saveSubjectPerformances}
            tasks={tasks}
          />
        );

      case "deadline_radar":
        return (
          <DeadlineRadar
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            subjects={subjects}
          />
        );

      case "ia_ee_cas":
        return (
          <IeCasPage
            status={coreStatus}
            subjects={subjects}
            onUpdateStatus={saveCoreStatus}
            onUpdateIaStatus={handleUpdateIaStatus}
          />
        );

      case "ipmat":
        return (
          <IpmatPrepPage
            tasks={tasks}
            studyLogs={studyLogs}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        );

      case "universities":
        return (
          <UniversityPage
            universities={universities}
            onAddUniversity={handleAddUniversity}
            onUpdateUniversityStatus={handleUpdateUniversityStatus}
            onUpdateUniversityNotes={handleUpdateUniversityNotes}
          />
        );

      case "mistakes":
        return (
          <MistakeDatabase
            mistakes={mistakes}
            subjects={subjects}
            onAddMistake={handleAddMistake}
            onUpdateMistakeStatus={handleUpdateMistakeStatus}
          />
        );

      case "reports":
      case "ai_reports":
        return (
          <WeeklyReports
            subjects={subjects}
            mistakes={mistakes}
            studyLogs={studyLogs}
            targetUnis={universities}
          />
        );

      default:
        return <div className="text-zinc-400 p-8 font-mono text-xs">Constructing workspace...</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100 font-sans" id="applet-viewport">
      
      {/* Persistent Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        activeTimerSection={activeTimerSection}
        activeTimerMinutes={activeTimerMinutes}
        timerRunning={timerRunning}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userProfile={userProfile}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 min-w-0 md:ml-64 p-6 md:p-10 space-y-8" id="workspace-main">
        {renderContent()}
      </main>

      {/* Atlas Floating Command and Intelligence Core */}
      <AtlasBrain
        tasks={tasks}
        subjects={subjects}
        mistakes={mistakes}
        studyLogs={studyLogs}
        universities={universities}
        coreStatus={coreStatus}
        achievements={achievements}
        subjectPerformances={subjectPerformances}
        setActivePage={setActivePage}
        setSelectedSubjectId={setSelectedSubjectId}
        vaultResources={vaultResources}
        weeklyReportsList={weeklyReportsList}
        decisionLogs={decisionLogs}
        dailyAccountability={dailyAccountability}
        journalEntries={journalEntries}
        topicHeatmaps={topicHeatmaps}
      />

      {/* Settings Modal Overlay (Requirement 11) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto animate-fade-in" id="settings-overlay">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-auto" id="settings-card-container">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 p-2 rounded-xl hover:bg-zinc-900 transition"
              title="Close Settings"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="space-y-1.5 border-b border-zinc-800/80 pb-4">
              <h3 className="font-display font-bold text-zinc-100 text-lg flex items-center gap-2">
                <Sliders size={20} className="text-orange-500 animate-pulse" />
                <span>Atlas Core Workspace Configuration</span>
              </h3>
              <p className="text-zinc-400 text-xs font-medium">Customize your academic identity, visual themes, and synchronize your data globally.</p>
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs" id="settings-bento-grid">
              
              {/* Left Column: Personal Identity & Drag-Drop Avatar */}
              <div className="bg-zinc-950/40 border border-zinc-850/50 p-5 rounded-2xl space-y-5" id="settings-profile-panel">
                <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-850/40 pb-2">
                  <User size={12} className="text-orange-400" />
                  <span>Personal Identity</span>
                </h4>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold font-mono text-[9px] uppercase tracking-wider">Student Profile Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => saveUserProfile({ ...userProfile, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 font-medium outline-none focus:border-orange-500 transition-colors font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold font-mono text-[9px] uppercase tracking-wider">Secondary Contact Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => saveUserProfile({ ...userProfile, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 font-medium outline-none focus:border-orange-500 transition-colors font-mono text-[11px]"
                    />
                  </div>

                  {/* Drag-and-drop Avatar Zone */}
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 font-semibold font-mono text-[9px] uppercase tracking-wider">Profile Avatar Image</label>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2
                        ${dragActive 
                          ? "border-orange-500 bg-orange-500/5 text-orange-400" 
                          : "border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900/40"
                        }
                      `}
                      id="avatar-dropzone"
                    >
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        id="avatar-file-input"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      
                      <label htmlFor="avatar-file-input" className="cursor-pointer w-full flex flex-col items-center">
                        {userProfile.pfpUrl ? (
                          <div className="relative group">
                            <img
                              src={userProfile.pfpUrl}
                              alt="Avatar Preview"
                              className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shadow-lg"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                              <UploadCloud size={14} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-sm tracking-wider">
                            {userProfile.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        
                        <p className="text-[10px] font-bold text-zinc-300 mt-2.5">
                          Drag & Drop or Click to Upload Image
                        </p>
                        <p className="text-[8px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">
                          Supports PNG, JPG, WEBP, GIF
                        </p>
                      </label>
                    </div>

                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={userProfile.pfpUrl}
                        placeholder="Or paste direct image URL address link here..."
                        onChange={(e) => saveUserProfile({ ...userProfile, pfpUrl: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-[10px] text-zinc-400 outline-none focus:border-orange-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Global Login / Sync Cloud (Worldwide Access) */}
              <div className="bg-zinc-950/40 border border-zinc-850/50 p-5 rounded-2xl space-y-5 flex flex-col justify-between" id="settings-sync-panel">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-850/40 pb-2">
                    <Cloud size={12} className="text-sky-400" />
                    <span>Global Database Sync Engine</span>
                  </h4>

                  {/* Live Sync Connection Badge */}
                  <div>
                    {isCloudLoggedIn ? (
                      <div className="flex items-center space-x-2 bg-sky-500/10 border border-sky-500/25 text-sky-400 px-3 py-2 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                        <span>Cloud Database Live Sync Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-2 rounded-xl font-mono text-[9px] uppercase tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                        <span>Local Sandbox Mode (Offline Only)</span>
                      </div>
                    )}
                  </div>

                  {/* Auth forms */}
                  <div className="space-y-3">
                    {!isCloudLoggedIn ? (
                      <>
                        <p className="text-zinc-400 text-[10px] leading-relaxed">
                          Link your email and password to access your coursework files, achievements, and statistics on any device worldwide.
                        </p>

                        <div className="flex bg-zinc-950 p-0.5 rounded-xl border border-zinc-850" id="settings-auth-tabs">
                          <button
                            type="button"
                            onClick={() => setAuthMode("login")}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all ${
                              authMode === "login" ? "bg-zinc-800 text-sky-400 border border-zinc-700" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            SIGN IN
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthMode("register")}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all ${
                              authMode === "register" ? "bg-zinc-800 text-sky-400 border border-zinc-700" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            CREATE CLOUD ACCOUNT
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-zinc-600 font-mono">@</span>
                            <input
                              type="email"
                              placeholder="Enter Cloud Email Address"
                              value={cloudEmail}
                              onChange={(e) => setCloudEmail(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-8 pr-3 py-2 text-zinc-200 outline-none focus:border-sky-500 transition-colors font-mono"
                            />
                          </div>

                          <div className="relative flex items-center">
                            <Lock size={12} className="absolute left-3 text-zinc-600" />
                            <input
                              type="password"
                              placeholder="Master Password"
                              value={cloudPassword}
                              onChange={(e) => setCloudPassword(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-8 pr-3 py-2 text-zinc-200 outline-none focus:border-sky-500 transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={authMode === "login" ? handleCloudLogin : handleCloudRegister}
                          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2"
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Syncing cloud...</span>
                            </>
                          ) : (
                            <>
                              <Cloud size={14} />
                              <span>{authMode === "login" ? "Verify & Pull Database" : "Establish Secure Account"}</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3.5 bg-zinc-950/60 border border-zinc-850 rounded-2xl p-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-zinc-500 font-mono uppercase">Connected Account</p>
                          <p className="text-zinc-200 font-mono font-bold truncate text-xs">{cloudEmail}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={() => triggerSilentSyncPush()}
                            className="flex-1 py-2 bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 text-zinc-300 rounded-xl transition font-bold font-mono text-[10px] flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                            <span>Manual Sync</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCloudLogout}
                            className="px-3.5 py-2 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-red-400 rounded-xl transition font-mono text-[10px]"
                            title="Disconnect Sync"
                          >
                            <LogOut size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Auth Status/Errors Feedback */}
                    {authError && (
                      <div className="p-3 bg-red-950/30 border border-red-900/30 text-red-400 rounded-xl flex items-start space-x-2 animate-bounce">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span className="text-[10px] leading-tight font-medium">{authError}</span>
                      </div>
                    )}

                    {authSuccess && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-xl flex items-start space-x-2">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" />
                        <span className="text-[10px] leading-tight font-medium">{authSuccess}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Accent Palette Row (Full Width for Premium Balanced Layout) */}
            <div className="border-t border-zinc-800/80 pt-5 space-y-3" id="settings-accent-row">
              <label className="text-zinc-400 font-bold font-mono text-[10px] uppercase tracking-wider block">OS Aesthetic Accent Palette Selection</label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: "orange", name: "Amber Flame", class: "bg-orange-500 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" },
                  { id: "emerald", name: "Forest Mint", class: "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" },
                  { id: "indigo", name: "Royal Velvet", class: "bg-indigo-500 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" },
                  { id: "rose", name: "Cosmic Rose", class: "bg-rose-500 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" }
                ].map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => saveUserProfile({ ...userProfile, accent: acc.id as any })}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-zinc-950/50 hover:bg-zinc-900/40 transition text-left ${
                      userProfile.accent === acc.id ? "border-zinc-400 bg-zinc-900/30" : "border-zinc-800"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${acc.class}`} />
                    <span className="text-[10px] text-zinc-300 font-semibold font-mono tracking-tight leading-none">{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone: Clean Slate Data Reset */}
            <div className="border-t border-zinc-800/80 pt-5 space-y-3" id="settings-danger-row">
              <label className="text-red-400 font-bold font-mono text-[10px] uppercase tracking-wider block">System Administrative Controls</label>
              
              {!isAdminUnlocked ? (
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3" id="admin-locked-panel">
                  <div className="flex items-center space-x-2 text-amber-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Lock size={12} />
                    <span>Administrative Actions Locked</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed">
                    Wiping workspace data is an irreversible administrative action. Please verify your registered contact email address to unlock these options.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={adminVerifyEmail}
                      onChange={(e) => {
                        setAdminVerifyEmail(e.target.value);
                        setAdminVerifyError(null);
                      }}
                      placeholder="Verify profile email (e.g. goalm1031@gmail.com)..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-zinc-200 font-mono outline-none focus:border-red-500 transition-colors"
                      id="admin-email-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const targetEmail = (cloudEmail || userProfile.email || "goalm1031@gmail.com").trim().toLowerCase();
                        const inputEmail = adminVerifyEmail.trim().toLowerCase();
                        if (inputEmail === targetEmail || inputEmail === "goalm1031@gmail.com") {
                          setIsAdminUnlocked(true);
                          setAdminVerifyError(null);
                        } else {
                          setAdminVerifyError("Email verification failed. Enter your profile secondary contact email (goalm1031@gmail.com).");
                        }
                      }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-[10px] font-mono font-bold uppercase rounded-xl transition"
                      id="admin-verify-btn"
                    >
                      Authenticate
                    </button>
                  </div>
                  
                  {adminVerifyError && (
                    <p className="text-[9px] text-red-400 font-semibold font-mono" id="admin-verify-error">{adminVerifyError}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-950/10 border border-red-950/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="admin-unlocked-panel">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider mb-1">
                      <Unlock size={11} />
                      <span>Unlocked via Email Verification</span>
                    </div>
                    <p className="text-[11px] text-zinc-200 font-bold">Wipe Workspace Mock Data & Clear Cache</p>
                    <p className="text-[9px] text-zinc-500 leading-relaxed font-sans">
                      Clears all default mock tasks, logged study logs, mistake folders, and achievements. Clears browser local storage completely for a fresh tracking slate tomorrow.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetAllData}
                    className="w-full md:w-auto shrink-0 px-4 py-2.5 bg-red-950/40 hover:bg-red-900/30 border border-red-900/40 text-red-400 text-[10px] font-bold font-mono uppercase tracking-wider rounded-xl transition animate-pulse"
                    id="clean-slate-btn"
                  >
                    Reset Workspace to Clean Slate
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Row Controls */}
            <div className="border-t border-zinc-800/85 pt-4 space-y-4">
              <div className="flex items-center justify-between text-[11px]">
                <div>
                  <p className="text-zinc-300 font-semibold">Automatic Background Backups</p>
                  <p className="text-zinc-500 text-[9px]">Every transaction is automatically saved to local secure cache</p>
                </div>
                <div className="w-8 h-4 bg-orange-500/15 border border-orange-500/30 rounded-full p-0.5 flex items-center justify-end">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-3 bg-orange-500 text-black rounded-xl text-xs font-bold hover:bg-orange-600 transition uppercase tracking-wider font-mono shadow-lg shadow-orange-500/10"
                >
                  Save & Complete Configuration
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
