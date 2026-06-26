import { Subject, University, Task, Mistake, StudyLog, IaEeCasStatus, DecisionLog, DailyAccountability, JournalEntry } from "./types";

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "MATH_AI_HL",
    name: "Mathematics: Applications & Interpretation HL",
    level: "HL",
    syllabus: [
      "Number and Algebra (Matrices, Complex Numbers)",
      "Functions (Polynomials, Exponential, Logarithmic)",
      "Geometry and Trigonometry (Vectors, Voronoi Diagrams)",
      "Statistics and Probability (Hypothesis Testing, Chi-Squared)",
      "Calculus (Euler's method, Differential Equations)"
    ]
  },
  {
    id: "ECON_HL",
    name: "Economics HL",
    level: "HL",
    syllabus: [
      "Introduction to Economics (Scarcity, Opportunity Cost)",
      "Microeconomics (Demand/Supply, Elasticities, Market Failure)",
      "Macroeconomics (GDP, Unemployment, Inflation, Monetary Policy)",
      "The Global Economy (Trade, Exchange Rates, Development)"
    ]
  },
  {
    id: "BM_HL",
    name: "Business Management HL",
    level: "HL",
    syllabus: [
      "Introduction to Business Management",
      "Human Resource Management",
      "Finance and Accounts (Cash Flow, Balance Sheet, Ratio Analysis)",
      "Marketing (Pricing strategies, Digital marketing, BCG matrix)",
      "Operations Management"
    ]
  },
  {
    id: "HINDI_SL",
    name: "Hindi B SL",
    level: "SL",
    syllabus: [
      "Identities (Self-awareness, Health, Life stories)",
      "Experiences (Leisure activities, Holidays, Customs)",
      "Human Ingenuity (Technology, Media, Arts)",
      "Social Organization (Education, Work, Law and Order)",
      "Sharing the Planet (Environment, Globalization)"
    ]
  },
  {
    id: "ENGLISH_SL",
    name: "English A: Language & Literature SL",
    level: "SL",
    syllabus: [
      "Readers, writers and texts (Non-literary body of work)",
      "Time and space (Historical context, Translation context)",
      "Intertextuality: connecting texts (Comparative study)"
    ]
  },
  {
    id: "ESS_SL",
    name: "Environmental Systems & Societies SL",
    level: "SL",
    syllabus: [
      "Foundations of Environmental Systems and Societies",
      "Ecosystems and Ecology",
      "Biodiversity and Conservation",
      "Water and Aquatic Food Production Systems",
      "Soil Systems and Terrestrial Food Production Systems",
      "Atmospheric Systems",
      "Climate Change and Energy Production",
      "Human Systems and Resource Use"
    ]
  }
];

export const INITIAL_UNIVERSITIES: University[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_MISTAKES: Mistake[] = [];

export const INITIAL_STUDY_LOGS: StudyLog[] = [];

export const INITIAL_STATUS: IaEeCasStatus = {
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

import { SubjectPerformance, VaultResource, TopicHeatmap, WeeklyPerformanceReport } from "./types";

export const INITIAL_SUBJECT_PERFORMANCE: SubjectPerformance[] = [
  {
    subjectId: "MATH_AI_HL",
    completion: 0,
    confidence: 5,
    avgTestScore: 0,
    lastRevisionDate: "",
    currentGradeEstimate: "4",
    targetGrade: "7",
    trend: "stable"
  },
  {
    subjectId: "ECON_HL",
    completion: 0,
    confidence: 5,
    avgTestScore: 0,
    lastRevisionDate: "",
    currentGradeEstimate: "4",
    targetGrade: "7",
    trend: "stable"
  },
  {
    subjectId: "BM_HL",
    completion: 0,
    confidence: 5,
    avgTestScore: 0,
    lastRevisionDate: "",
    currentGradeEstimate: "4",
    targetGrade: "7",
    trend: "stable"
  },
  {
    subjectId: "ENGLISH_SL",
    completion: 0,
    confidence: 5,
    avgTestScore: 0,
    lastRevisionDate: "",
    currentGradeEstimate: "4",
    targetGrade: "7",
    trend: "stable"
  },
  {
    subjectId: "HINDI_SL",
    completion: 0,
    confidence: 5,
    avgTestScore: 0,
    lastRevisionDate: "",
    currentGradeEstimate: "4",
    targetGrade: "7",
    trend: "stable"
  },
  {
    subjectId: "ESS_SL",
    completion: 0,
    confidence: 5,
    avgTestScore: 0,
    lastRevisionDate: "",
    currentGradeEstimate: "4",
    targetGrade: "7",
    trend: "stable"
  },
  {
    subjectId: "IPMAT",
    completion: 0,
    confidence: 5,
    avgTestScore: 0,
    lastRevisionDate: "",
    currentGradeEstimate: "0%",
    targetGrade: "100%",
    trend: "stable"
  }
];

export const INITIAL_VAULT_RESOURCES: VaultResource[] = [
  // Mathematics AI HL
  {
    id: "m_r1",
    subjectId: "MATH_AI_HL",
    category: "Past Paper",
    title: "Mathematics AI HL 2024 May Paper 1",
    description: "Official IB past paper for Mathematics: Applications and Interpretation HL, May 2024 session.",
    tags: ["Past Paper", "2024", "Paper 1", "Calculator"],
    bookmarked: true,
    favorite: true,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 42,
    year: "2024",
    paperNumber: "Paper 1",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%205%20-%20Mathematics/Mathematics_Applications_and_Interpretation_HL/2024_May/Mathematics_paper_1_HL.pdf",
    clicksCount: 15,
    lastAccessedDate: "2026-06-23T15:20:00Z"
  },
  {
    id: "m_r2",
    subjectId: "MATH_AI_HL",
    category: "Past Paper",
    title: "Mathematics AI HL 2024 May Paper 2",
    description: "Official IB past paper for Mathematics: Applications and Interpretation HL, May 2024 session.",
    tags: ["Past Paper", "2024", "Paper 2", "Calculator"],
    bookmarked: false,
    favorite: true,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 38,
    year: "2024",
    paperNumber: "Paper 2",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%205%20-%20Mathematics/Mathematics_Applications_and_Interpretation_HL/2024_May/Mathematics_paper_2_HL.pdf",
    clicksCount: 22,
    lastAccessedDate: "2026-06-22T10:15:00Z"
  },
  {
    id: "m_r3",
    subjectId: "MATH_AI_HL",
    category: "Past Paper",
    title: "Mathematics AI HL 2024 May Paper 3",
    description: "Official IB past paper for Mathematics: Applications and Interpretation HL, May 2024 session. Long-form inquiry questions.",
    tags: ["Past Paper", "2024", "Paper 3", "Inquiry"],
    bookmarked: false,
    favorite: false,
    fileType: "pdf",
    dateAdded: "2026-06-16",
    viewsCount: 19,
    year: "2024",
    paperNumber: "Paper 3",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%205%20-%20Mathematics/Mathematics_Applications_and_Interpretation_HL/2024_May/Mathematics_paper_3_HL.pdf",
    clicksCount: 5,
    lastAccessedDate: "2026-06-19T14:45:00Z"
  },
  {
    id: "m_r4",
    subjectId: "MATH_AI_HL",
    category: "Markscheme",
    title: "Mathematics AI HL 2024 May Paper 1 Markscheme",
    description: "Official markscheme for Mathematics: Applications and Interpretation HL, May 2024.",
    tags: ["Markscheme", "2024", "Paper 1"],
    bookmarked: true,
    favorite: false,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 55,
    year: "2024",
    paperNumber: "Paper 1",
    resourceType: "Markscheme",
    externalUrl: "https://repo.pirateib.su/IB%20PAST%20PAPERS/Group%205%20-%20Mathematics/Mathematics_Applications_and_Interpretation_HL/2024_May/Mathematics_paper_1_HL_markscheme.pdf",
    clicksCount: 31,
    lastAccessedDate: "2026-06-24T09:30:00Z"
  },
  {
    id: "m_r5",
    subjectId: "MATH_AI_HL",
    category: "Textbook",
    title: "Mathematics AI HL Oxford Textbook Edition",
    description: "Complete digital textbook for IB Diploma Mathematics Applications and Interpretation HL.",
    tags: ["Textbook", "Oxford", "Math AI HL"],
    bookmarked: true,
    favorite: true,
    fileType: "link",
    dateAdded: "2026-06-01",
    viewsCount: 120,
    year: "N/A",
    paperNumber: "N/A",
    resourceType: "Textbook",
    externalUrl: "https://ibresources.cc/browser/Group%205%20-%20Mathematics/Textbooks/Oxford_Maths_AI_HL.pdf",
    clicksCount: 88,
    lastAccessedDate: "2026-06-24T11:00:00Z"
  },

  // Economics HL
  {
    id: "e_r1",
    subjectId: "ECON_HL",
    category: "Past Paper",
    title: "Economics HL 2024 May Paper 1",
    description: "Official IB past paper for Economics HL, May 2024 session. Microeconomics and Macroeconomics.",
    tags: ["Past Paper", "2024", "Paper 1", "Essay"],
    bookmarked: false,
    favorite: true,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 49,
    year: "2024",
    paperNumber: "Paper 1",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%203%20-%20Individuals%20and%20Societies/Economics_HL/2024_May/Economics_paper_1_HL.pdf",
    clicksCount: 18,
    lastAccessedDate: "2026-06-23T11:45:00Z"
  },
  {
    id: "e_r2",
    subjectId: "ECON_HL",
    category: "Past Paper",
    title: "Economics HL 2024 May Paper 2",
    description: "Official IB past paper for Economics HL, May 2024 session. Quantitative & policy questions.",
    tags: ["Past Paper", "2024", "Paper 2", "Data Response"],
    bookmarked: true,
    favorite: true,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 45,
    year: "2024",
    paperNumber: "Paper 2",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%203%20-%20Individuals%20and%20Societies/Economics_HL/2024_May/Economics_paper_2_HL.pdf",
    clicksCount: 25,
    lastAccessedDate: "2026-06-24T08:15:00Z"
  },
  {
    id: "e_r3",
    subjectId: "ECON_HL",
    category: "Textbook",
    title: "Economics Textbook Oxford Course Companion",
    description: "Oxford IB Diploma Programme Economics textbook digital companion. Essential for diagrams and theory.",
    tags: ["Textbook", "Oxford", "Economics"],
    bookmarked: true,
    favorite: false,
    fileType: "link",
    dateAdded: "2026-06-01",
    viewsCount: 110,
    year: "N/A",
    paperNumber: "N/A",
    resourceType: "Textbook",
    externalUrl: "https://ibresources.cc/browser/Group%203%20-%20Individuals%20and%20Societies/Economics/Oxford_Economics.pdf",
    clicksCount: 72,
    lastAccessedDate: "2026-06-23T16:50:00Z"
  },

  // Business Management HL
  {
    id: "b_r1",
    subjectId: "BM_HL",
    category: "Past Paper",
    title: "Business Management HL 2024 May Paper 1",
    description: "Official IB past paper for Business Management HL, May 2024 session.",
    tags: ["Past Paper", "2024", "Paper 1", "Case Study"],
    bookmarked: false,
    favorite: false,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 33,
    year: "2024",
    paperNumber: "Paper 1",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%203%20-%20Individuals%20and%20Societies/Business_Management_HL/2024_May/Business_management_paper_1_HL.pdf",
    clicksCount: 12,
    lastAccessedDate: "2026-06-21T09:10:00Z"
  },
  {
    id: "b_r2",
    subjectId: "BM_HL",
    category: "Past Paper",
    title: "Business Management HL 2024 May Paper 2",
    description: "Official IB past paper for Business Management HL, May 2024 session. Financial calculations.",
    tags: ["Past Paper", "2024", "Paper 2", "Finance"],
    bookmarked: true,
    favorite: true,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 37,
    year: "2024",
    paperNumber: "Paper 2",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%203%20-%20Individuals%20and%20Societies/Business_Management_HL/2024_May/Business_management_paper_2_HL.pdf",
    clicksCount: 19,
    lastAccessedDate: "2026-06-24T10:40:00Z"
  },
  {
    id: "b_r3",
    subjectId: "BM_HL",
    category: "Textbook",
    title: "Business Management Textbook Paul Hoang 5th Edition",
    description: "Widely regarded Paul Hoang textbook for the IB Business Management curriculum.",
    tags: ["Textbook", "Paul Hoang", "Business"],
    bookmarked: false,
    favorite: true,
    fileType: "link",
    dateAdded: "2026-06-02",
    viewsCount: 145,
    year: "N/A",
    paperNumber: "N/A",
    resourceType: "Textbook",
    externalUrl: "https://ibresources.cc/browser/Group%203%20-%20Individuals%20and%20Societies/Business_Management/Paul_Hoang_5th_Ed.pdf",
    clicksCount: 94,
    lastAccessedDate: "2026-06-24T11:12:00Z"
  },

  // ESS SL
  {
    id: "ess_r1",
    subjectId: "ESS_SL",
    category: "Past Paper",
    title: "ESS SL 2023 November Paper 1",
    description: "Official IB past paper for Environmental Systems & Societies SL, November 2023 session.",
    tags: ["Past Paper", "2023", "Paper 1", "Case Study"],
    bookmarked: false,
    favorite: false,
    fileType: "pdf",
    dateAdded: "2026-06-10",
    viewsCount: 26,
    year: "2023",
    paperNumber: "Paper 1",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%204%20-%20Sciences/Environmental_Systems_and_Societies_SL/2023_November/Environmental_systems_and_societies_paper_1_SL.pdf",
    clicksCount: 8,
    lastAccessedDate: "2026-06-20T11:20:00Z"
  },
  {
    id: "ess_r2",
    subjectId: "ESS_SL",
    category: "Past Paper",
    title: "ESS SL 2023 November Paper 2",
    description: "Official IB past paper for Environmental Systems & Societies SL, November 2023 session. Short & long answers.",
    tags: ["Past Paper", "2023", "Paper 2", "Ecosystems"],
    bookmarked: true,
    favorite: true,
    fileType: "pdf",
    dateAdded: "2026-06-10",
    viewsCount: 28,
    year: "2023",
    paperNumber: "Paper 2",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%204%20-%20Sciences/Environmental_Systems_and_Societies_SL/2023_November/Environmental_systems_and_societies_paper_2_SL.pdf",
    clicksCount: 14,
    lastAccessedDate: "2026-06-24T07:45:00Z"
  },

  // English SL
  {
    id: "eng_r1",
    subjectId: "ENGLISH_SL",
    category: "Past Paper",
    title: "English A Language & Literature SL 2024 May Paper 1",
    description: "Official IB past paper for English A Language and Literature SL, May 2024 session.",
    tags: ["Past Paper", "2024", "Paper 1", "Analysis"],
    bookmarked: false,
    favorite: true,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 30,
    year: "2024",
    paperNumber: "Paper 1",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%201%20-%20Studies%20in%20Language%20and%20Literature/English_A_Language_and_Literature_SL/2024_May/English_A_Language_and_literature_paper_1_SL.pdf",
    clicksCount: 11,
    lastAccessedDate: "2026-06-22T14:30:00Z"
  },

  // Hindi SL
  {
    id: "hin_r1",
    subjectId: "HINDI_SL",
    category: "Past Paper",
    title: "Hindi B SL 2024 May Paper 1",
    description: "Official IB past paper for Hindi B SL, May 2024 session. Writing tasks.",
    tags: ["Past Paper", "2024", "Paper 1", "Hindi"],
    bookmarked: false,
    favorite: false,
    fileType: "pdf",
    dateAdded: "2026-06-15",
    viewsCount: 18,
    year: "2024",
    paperNumber: "Paper 1",
    resourceType: "Past Paper",
    externalUrl: "https://dl.pirateib.su/IB%20PAST%20PAPERS/Group%202%20-%20Language%20Acquisition/Hindi_B_SL/2024_May/Hindi_B_paper_1_SL.pdf",
    clicksCount: 4,
    lastAccessedDate: "2026-06-18T10:00:00Z"
  }
];;

export const INITIAL_TOPIC_HEATMAPS: TopicHeatmap[] = [
  {
    id: "h1",
    subjectId: "MATH_AI_HL",
    topicName: "Complex Numbers & Matrices",
    completion: 85,
    confidence: 80,
    testPerformance: 78,
    revisionFrequency: 5,
    examFocus: "High"
  },
  {
    id: "h2",
    subjectId: "ECON_HL",
    topicName: "Market Failure & Elasticities",
    completion: 95,
    confidence: 90,
    testPerformance: 92,
    revisionFrequency: 6,
    examFocus: "High"
  },
  {
    id: "h3",
    subjectId: "ESS_SL",
    topicName: "Ecosystems and Ecology",
    completion: 55,
    confidence: 45,
    testPerformance: 52,
    revisionFrequency: 1,
    examFocus: "High"
  }
];

export const INITIAL_WEEKLY_REPORTS: WeeklyPerformanceReport[] = [
  {
    id: "rep-1",
    date: "2026-06-21",
    totalStudyHours: 24.5,
    subjectHours: {
      "MATH_AI_HL": 8.5,
      "ECON_HL": 6,
      "BM_HL": 4,
      "ESS_SL": 2,
      "ENGLISH_SL": 2,
      "HINDI_SL": 2
    },
    mostImprovedSubject: "Economics HL",
    weakestSubject: "ESS SL",
    highestAccuracySubject: "Economics HL",
    lowestAccuracySubject: "ESS SL",
    tasksCompleted: 12,
    tasksMissed: 1,
    iaProgress: 75,
    eeProgress: 80,
    casProgress: 60,
    insights: [
      "Consistent mathematical execution noted across Functions and Algebra blocks.",
      "ESS SL ecology vocabulary retention remains a core drag on general performance.",
      "IPMAT quant practice has slipped beneath the recommended 120-minute weekly floor."
    ],
    wins: [
      "Secured 90%+ accuracy on Macroeconomics policy practice test.",
      "Successfully submitted first formal draft of Business Management IA on schedule."
    ],
    risks: [
      "Extreme risk on ESS SL exam revision: confidence sits below 5/10 on Soil Systems and Terrestrial Food Production."
    ],
    recommendations: [
      "Dedicate first 30 minutes of Monday's block to ESS Soil Systems active recall.",
      "Increase IPMAT Quantitative practice frequency to daily 20-minute sprints.",
      "Sync with advisor regarding CAS Service hours log verification."
    ]
  }
];

export const INITIAL_DECISIONS: DecisionLog[] = [
  {
    id: "dec-1",
    decision: "Pivot EE research methodology from quantitative survey to detailed qualitative case study on local business models",
    reason: "Low response rate from external public surveys threatened the validity of primary quantitative analysis, risking poor Criterion B assessment.",
    expectedOutcome: "Stronger primary research grounding and richer analytical depth under IB Extended Essay criteria.",
    actualOutcome: "Dramatically improved writing flow and direct relevance to business management concepts.",
    lessonsLearned: "Early methodology pivoting prevents last-minute research gaps. Always secure backup interview channels.",
    date: "2026-06-10"
  },
  {
    id: "dec-2",
    decision: "Settle IA Topic for ESS SL on comparing environmental indicators across two micro-climates",
    reason: "Immediate availability of local sensor data and simple physical logging steps reduced risk of empirical failure.",
    expectedOutcome: "Highly secure and reliable internal assessment with structured primary data logging.",
    actualOutcome: "Proposal formally accepted by advisor. Initial sensor readings showing robust data variations.",
    lessonsLearned: "Simple, highly empirical setups beat overly complex setups with hard-to-source parameters.",
    date: "2026-06-18"
  }
];

export const INITIAL_ACCOUNTABILITY: DailyAccountability[] = [
  {
    id: "acc-1",
    date: "2026-06-24",
    plannedStudyTime: 240,
    actualStudyTime: 210,
    tasksPlannedCount: 5,
    tasksCompletedCount: 4,
    missedCommitments: ["IPMAT practice test execution"],
    integrityScore: 85,
    consistencyScore: 90,
    executionScore: 80
  },
  {
    id: "acc-2",
    date: "2026-06-23",
    plannedStudyTime: 180,
    actualStudyTime: 195,
    tasksPlannedCount: 3,
    tasksCompletedCount: 3,
    missedCommitments: [],
    integrityScore: 100,
    consistencyScore: 100,
    executionScore: 100
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "jou-1",
    date: "2026-06-24",
    title: "Syllabus overwhelm and ESS SL crisis control",
    category: "Strategic",
    content: "Feeling some pressure regarding ESS SL. It has the lowest confidence score on my performance tracker. I need to stop ignoring it because it is an SL subject. Going to start active recall reviews using the flashcard banks every Tuesday and Thursday evening. High HL scores won't protect my overall IB diploma target if I fall flat on SL."
  },
  {
    id: "jou-2",
    date: "2026-06-20",
    title: "Reflecting on IPMAT prep consistency",
    category: "Reflections",
    content: "Quantitative section is coming together slowly. My verbal scores are strong but quant feels like a different beast. Need to treat IPMAT as an elite endurance race rather than a sprint. Will establish a strict 25-minute Pomodoro block specifically for IPMAT algebraic equations every single day before logging off."
  }
];


