export interface MonthlyReport {
  month: string
  monthShort: string
  ongoingProjects: number
  commissioned: number
  newlyAdded: number
  originalCostCrore: number
  revisedCostCrore: number
  expenditureCrore: number
  expenditurePercent: number
}

export const monthlyReports: MonthlyReport[] = [
  {
    month: "April 2026",
    monthShort: "Apr",
    ongoingProjects: 1981,
    commissioned: 9,
    newlyAdded: 55,
    originalCostCrore: 3712662,
    revisedCostCrore: 4278402,
    expenditureCrore: 2036107,
    expenditurePercent: 47.59,
  },
  {
    month: "May 2026",
    monthShort: "May",
    ongoingProjects: 1987,
    commissioned: 16,
    newlyAdded: 35,
    originalCostCrore: 3709725,
    revisedCostCrore: 4249554,
    expenditureCrore: 2181683,
    expenditurePercent: 51.34,
  },
  {
    month: "June 2026",
    monthShort: "Jun",
    ongoingProjects: 1847,
    commissioned: 130,
    newlyAdded: 17,
    originalCostCrore: 3561721,
    revisedCostCrore: 4054473,
    expenditureCrore: 2196664,
    expenditurePercent: 54.18,
  },
  {
    month: "July 2026",
    monthShort: "Jul",
    ongoingProjects: 1775,
    commissioned: 25,
    newlyAdded: 36,
    originalCostCrore: 3370138,
    revisedCostCrore: 3710642,
    expenditureCrore: 1926100,
    expenditurePercent: 51.91,
  },
]

export const dashboardSummary = {
  totalProjects: 437,
  riskScoredProjects: 437,
  partialScheduleCoverageProjects: 132,
  tier1Projects: 44,
  tier2Projects: 73,
  tier3Projects: 102,
  tier4Projects: 218,
}

export const projectContext = {
  title: "AI-powered Predictive Analytics and Early Warning System for Infrastructure Monitoring",

  organization: {
    division:
      "Infrastructure & Project Monitoring Division (IPMD)",
    ministry:
      "Ministry of Statistics and Programme Implementation (MoSPI)",
  },

  background: {
    summary:
      "The Infrastructure & Project Monitoring Division (IPMD), Ministry of Statistics and Programme Implementation (MoSPI) monitors Central Sector Infrastructure Projects costing ₹150 crore and above across infrastructural Ministries and Departments.",

    legacySystem:
      "Project monitoring was undertaken through the Online Computerised Monitoring System (OCMS) since 2006. OCMS served as the primary repository of project-level information relating to project cost, expenditure, timelines and implementation status.",

    historicalValue:
      "Over nearly two decades, OCMS generated a valuable historical database capturing project implementation trends, cost overruns and time overruns across sectors.",

    modernization:
      "OCMS was modernized to Project Assessment, Infrastructure Monitoring and Analytics for Nation-building (PAIMANA) to enable a comprehensive and integrated project-monitoring ecosystem.",
  },

  paimanaPortal: {
    description:
      "PAIMANA is a web-based integrated project-monitoring platform designed to function as a national repository of infrastructure projects.",

    capturedInformation: [
      "Approved cost",
      "Revised cost",
      "Expenditure",
      "Implementation timelines",
      "Physical progress",
      "Milestones",
      "Implementing agencies",
      "Project status",
    ],

    updateFrequency:
      "Infrastructure project information is updated on a monthly basis through role-based access and APIs.",
  },

  april2026Snapshot: {
    ongoingProjects: 1981,
    ministriesDepartments: 17,
    infrastructureSectors: 22,
    originalCostLakhCrore: 37.13,
    revisedCostLakhCrore: 42.78,
    cumulativeExpenditureLakhCrore: 20.36,

    majorSectors: [
      "Transport & Logistics",
      "Energy",
      "Water & Sanitation",
      "Communication",
      "Social Infrastructure",
      "Coal",
      "Steel",
      "Mining",
    ],
  },

  monitoringChallenges: [
    "Cost overruns",
    "Time overruns",
    "Delays in milestone achievement",
    "Contractual bottlenecks",
    "Implementation bottlenecks",
    "Resource constraints",
    "Execution risks",
  ],

  transformationNeed: {
    currentState: "Descriptive monitoring and reporting",

    desiredState:
      "Predictive and prescriptive monitoring",

    objective:
      "Strengthen infrastructure project monitoring through data-driven analytical and decision-support systems.",
  },

  aiOpportunity: {
    historicalRepository:
      "The historical project-monitoring database available through OCMS, combined with the recent PAIMANA portal, provides a comprehensive repository of infrastructure project data spanning nearly two decades.",

    dataCharacteristics: [
      "Project size",
      "Infrastructure sector",
      "Geographical location",
      "Implementing agency",
      "Expenditure patterns",
      "Implementation timelines",
    ],

    technologies: [
      "Artificial Intelligence",
      "Machine Learning",
      "Big Data Analytics",
      "Forecast Modelling",
      "Large Language Models",
    ],

    purpose: [
      "Predict cost overruns",
      "Predict schedule delays",
      "Identify implementation risks",
      "Generate early warning signals",
      "Support proactive interventions",
      "Enable evidence-based decision-making",
    ],
  },

  problemStatement: {
    theme: "AI for Infrastructure Monitoring",

    statement:
      "Develop an AI-powered Predictive Analytics and Early Warning System capable of analysing the large volume of project data available at the PAIMANA portal, using open-source tools and software, to identify projects likely to experience cost escalation, schedule delays and implementation risks before such issues materialise.",

    beneficiaries: [
      "Policymakers",
      "Project administrators",
      "Monitoring agencies",
    ],

    objectives: [
      "Prioritise interventions",
      "Improve project execution outcomes",
      "Enhance infrastructure project monitoring",
      "Transform descriptive monitoring into predictive monitoring",
      "Transform predictive insights into prescriptive decision support",
      "Generate actionable insights for evidence-based decision-making",
    ],
  },

  technicalDimensions: [
    {
      id: "a",
      title: "Statistical and Predictive Modelling",
      description:
        "Development and evaluation of statistical analysis and predictive models for analysing project performance and forecasting cost overruns, time overruns and implementation risks.",
    },
    {
      id: "b",
      title: "AI/ML versus Conventional Methods",
      description:
        "Assessment of whether Artificial Intelligence and Machine Learning techniques provide significant gains over conventional statistical methods in prediction accuracy, early warning capabilities and decision support.",
    },
    {
      id: "c",
      title: "CUF Field and Additional Variable Analysis",
      description:
        "Development of prediction and analytical models using existing Common Upload Form (CUF) fields, along with assessment of predictive performance attributable to current CUF fields versus additional variables not presently captured in the CUF.",
    },
  ],

  suggestedTechnologies: [
    "Artificial Intelligence (AI)",
    "Machine Learning (ML)",
    "Big Data Analytics",
    "Forecast Modelling",
    "Large Language Models (LLMs)",
  ],

  expectedOutcomes: [
    {
      id: "a",
      title: "Cost Overrun Prediction Model",
    },
    {
      id: "b",
      title: "Time Overrun Prediction Model",
    },
    {
      id: "c",
      title: "Project Risk Scoring Framework",
    },
    {
      id: "d",
      title: "Early Warning Alert System",
    },
    {
      id: "e",
      title: "Benchmarking and Comparative Analytics Module",
    },
    {
      id: "f",
      title: "Cost Escalation Driver Analysis Module",
    },
    {
      id: "g",
      title: "AI-powered Monitoring Dashboard",
    },
    {
      id: "h",
      title: "LLM-enabled Project Intelligence Assistant",
    },
    {
      id: "i",
      title: "Documentation and Deployment Framework",
    },
  ],

  solutionPrinciples: [
    "Use open-source tools and software wherever appropriate.",
    "Support predictive and prescriptive infrastructure monitoring.",
    "Provide early warning signals before risks materialise.",
    "Support evidence-based decision-making.",
    "Prioritise projects requiring intervention.",
    "Keep project monitoring data and predictive intelligence conceptually distinct.",
  ],
}