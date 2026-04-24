import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export const DIMENSION_ORDER = [
  'businessStrategy',
  'dataReadiness',
  'technologyInfrastructure',
  'talentSkills',
  'useCaseReadiness',
  'operationalReadiness',
  'aiGovernance',
]

export const DIMENSION_LABELS = {
  businessStrategy: 'Business Strategy',
  dataReadiness: 'Data Readiness',
  technologyInfrastructure: 'Technology Infrastructure',
  talentSkills: 'Talent & Skills',
  useCaseReadiness: 'Use Case Readiness',
  operationalReadiness: 'Operational Readiness',
  aiGovernance: 'AI Governance',
}

export const DIMENSION_WEIGHTS = {
  businessStrategy: 0.2,
  dataReadiness: 0.2,
  technologyInfrastructure: 0.15,
  talentSkills: 0.15,
  useCaseReadiness: 0.1,
  operationalReadiness: 0.1,
  aiGovernance: 0.1,
}

const INDUSTRY_PRIORITIES = {
  Healthcare: ['dataReadiness', 'aiGovernance'],
  Finance: ['aiGovernance', 'technologyInfrastructure'],
  Retail: ['useCaseReadiness', 'operationalReadiness'],
  Manufacturing: ['technologyInfrastructure', 'operationalReadiness'],
  'Technology/SaaS': ['technologyInfrastructure', 'talentSkills'],
  Education: ['operationalReadiness', 'useCaseReadiness'],
  Government: ['aiGovernance', 'dataReadiness'],
  Logistics: ['operationalReadiness', 'technologyInfrastructure'],
}

export function calculateAllocation(industryLabel) {
  const priorities =
    INDUSTRY_PRIORITIES[industryLabel] || ['businessStrategy', 'dataReadiness']
  const allocation = {}

  for (const dim of DIMENSION_ORDER) {
    allocation[dim] = 2
  }

  for (const priority of priorities) {
    if (allocation[priority] !== undefined) {
      allocation[priority] += 1
    }
  }

  return allocation
}

export function getAllocationRationale(industryLabel) {
  const priorities =
    INDUSTRY_PRIORITIES[industryLabel] || ['businessStrategy', 'dataReadiness']
  const labels = priorities.map((p) => DIMENSION_LABELS[p] || p)

  if (!labels.length) {
    return `Questions are distributed evenly across all seven AI maturity dimensions.`
  }

  return `For ${industryLabel}, extra focus is placed on ${labels.join(' and ')} to reflect the most relevant capability gaps in this sector.`
}

function stripMarkdownFences(value) {
  return String(value || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}



const TEMPLATE_QUESTIONS = {
  businessStrategy: [
    {
      id: 'Q_BS_001',
      dimension: 'businessStrategy',
      dimensionLabel: 'Business Strategy',
      order: 1,
      questionText: 'How does senior leadership view AI investment?',
      options: [
        { score: 1, label: 'A', text: 'No budget or interest in AI exists' },
        { score: 2, label: 'B', text: 'Leadership is curious but has not committed budget' },
        { score: 3, label: 'C', text: 'Leadership has approved a small budget for pilots' },
        { score: 4, label: 'D', text: 'AI investment is part of annual budget with clear KPIs' },
        { score: 5, label: 'E', text: 'AI is a board-level priority with dedicated long-term funding' },
      ],
    },
    {
      id: 'Q_BS_002',
      dimension: 'businessStrategy',
      dimensionLabel: 'Business Strategy',
      order: 2,
      questionText: 'Do you have identified AI use cases with business value?',
      options: [
        { score: 1, label: 'A', text: 'No specific AI use cases identified' },
        { score: 2, label: 'B', text: 'Preliminary ideas exist but not fully scoped' },
        { score: 3, label: 'C', text: 'Several use cases identified with estimated ROI' },
        { score: 4, label: 'D', text: 'Actively piloting multiple use cases in production' },
        { score: 5, label: 'E', text: 'Mature portfolio of AI solutions delivering measurable value' },
      ],
    },
    {
      id: 'Q_BS_003',
      dimension: 'businessStrategy',
      dimensionLabel: 'Business Strategy',
      order: 3,
      questionText: 'How do you track ROI from AI initiatives?',
      options: [
        { score: 1, label: 'A', text: 'No formal ROI tracking in place' },
        { score: 2, label: 'B', text: 'Ad hoc tracking with limited metrics' },
        { score: 3, label: 'C', text: 'Defined metrics but inconsistent measurement' },
        { score: 4, label: 'D', text: 'Formal ROI tracking with quarterly reviews' },
        { score: 5, label: 'E', text: 'Comprehensive ROI dashboard with continuous optimization' },
      ],
    },
    {
      id: 'Q_BS_004',
      dimension: 'businessStrategy',
      dimensionLabel: 'Business Strategy',
      order: 4,
      questionText: 'Is there a clear AI strategy aligned with business goals?',
      options: [
        { score: 1, label: 'A', text: 'No documented AI strategy exists' },
        { score: 2, label: 'B', text: 'Early-stage strategy discussion underway' },
        { score: 3, label: 'C', text: 'Strategy drafted and shared with leadership' },
        { score: 4, label: 'D', text: 'Documented strategy integrated with business plan' },
        { score: 5, label: 'E', text: 'Living AI strategy with regular executive review' },
      ],
    },
    {
      id: 'Q_BS_005',
      dimension: 'businessStrategy',
      dimensionLabel: 'Business Strategy',
      order: 5,
      questionText: 'How committed is executive leadership to AI transformation?',
      options: [
        { score: 1, label: 'A', text: 'Leadership not engaged with AI initiatives' },
        { score: 2, label: 'B', text: 'Leadership aware but minimal direct involvement' },
        { score: 3, label: 'C', text: 'Leadership moderately engaged in planning' },
        { score: 4, label: 'D', text: 'Leadership actively sponsors AI programs' },
        { score: 5, label: 'E', text: 'AI is a top executive priority with ongoing governance' },
      ],
    },
  ],
  dataReadiness: [
    {
      id: 'Q_DR_001',
      dimension: 'dataReadiness',
      dimensionLabel: 'Data Readiness',
      order: 1,
      questionText: 'What is the quality level of your enterprise data?',
      options: [
        { score: 1, label: 'A', text: 'Data is siloed and inconsistent across systems' },
        { score: 2, label: 'B', text: 'Some data standards exist but inconsistently applied' },
        { score: 3, label: 'C', text: 'Most critical data meets defined quality standards' },
        { score: 4, label: 'D', text: 'Comprehensive data quality program with monitoring' },
        { score: 5, label: 'E', text: 'Enterprise-wide data governance with continuous improvement' },
      ],
    },
    {
      id: 'Q_DR_002',
      dimension: 'dataReadiness',
      dimensionLabel: 'Data Readiness',
      order: 2,
      questionText: 'How accessible is data for analytics and AI projects?',
      options: [
        { score: 1, label: 'A', text: 'Data is scattered and difficult to access' },
        { score: 2, label: 'B', text: 'Some centralized storage but with access limitations' },
        { score: 3, label: 'C', text: 'Data warehouse in place for key business areas' },
        { score: 4, label: 'D', text: 'Unified data platform with role-based access control' },
        { score: 5, label: 'E', text: 'Real-time data mesh with self-service analytics' },
      ],
    },
    {
      id: 'Q_DR_003',
      dimension: 'dataReadiness',
      dimensionLabel: 'Data Readiness',
      order: 3,
      questionText: 'Do you have documented data governance policies?',
      options: [
        { score: 1, label: 'A', text: 'No formal data governance in place' },
        { score: 2, label: 'B', text: 'Basic data policies with limited enforcement' },
        { score: 3, label: 'C', text: 'Data governance framework documented' },
        { score: 4, label: 'D', text: 'Data governance actively managed with defined roles' },
        { score: 5, label: 'E', text: 'Mature data governance with compliance tracking' },
      ],
    },
    {
      id: 'Q_DR_004',
      dimension: 'dataReadiness',
      dimensionLabel: 'Data Readiness',
      order: 4,
      questionText: 'Is historical data available for model training?',
      options: [
        { score: 1, label: 'A', text: 'Little or no historical data available' },
        { score: 2, label: 'B', text: 'Some historical data but with gaps' },
        { score: 3, label: 'C', text: 'Several years of historical data available' },
        { score: 4, label: 'D', text: 'Comprehensive historical data with proper archival' },
        { score: 5, label: 'E', text: 'Rich historical datasets with metadata and lineage' },
      ],
    },
    {
      id: 'Q_DR_005',
      dimension: 'dataReadiness',
      dimensionLabel: 'Data Readiness',
      order: 5,
      questionText: 'How do you handle data privacy and compliance?',
      options: [
        { score: 1, label: 'A', text: 'No formal data privacy processes in place' },
        { score: 2, label: 'B', text: 'Basic privacy practices with inconsistent enforcement' },
        { score: 3, label: 'C', text: 'Privacy by design implemented for new systems' },
        { score: 4, label: 'D', text: 'Comprehensive privacy framework with regular audits' },
        { score: 5, label: 'E', text: 'Privacy-first architecture with continuous compliance' },
      ],
    },
  ],
  technologyInfrastructure: [
    {
      id: 'Q_TI_001',
      dimension: 'technologyInfrastructure',
      dimensionLabel: 'Technology Infrastructure',
      order: 1,
      questionText: 'What is your cloud infrastructure maturity?',
      options: [
        { score: 1, label: 'A', text: 'Primarily on-premises with minimal cloud adoption' },
        { score: 2, label: 'B', text: 'Some cloud services used but mostly on-premises' },
        { score: 3, label: 'C', text: 'Hybrid architecture with significant cloud presence' },
        { score: 4, label: 'D', text: 'Primarily cloud-based with multi-region deployment' },
        { score: 5, label: 'E', text: 'Cloud-native architecture with global scale' },
      ],
    },
    {
      id: 'Q_TI_002',
      dimension: 'technologyInfrastructure',
      dimensionLabel: 'Technology Infrastructure',
      order: 2,
      questionText: 'Do you have ML infrastructure and tools in place?',
      options: [
        { score: 1, label: 'A', text: 'No ML infrastructure or tools deployed' },
        { score: 2, label: 'B', text: 'Basic tools used by individuals for experimentation' },
        { score: 3, label: 'C', text: 'Standard ML platforms available to data scientists' },
        { score: 4, label: 'D', text: 'Comprehensive ML platform with MLOps practices' },
        { score: 5, label: 'E', text: 'Fully automated ML platform with enterprise governance' },
      ],
    },
    {
      id: 'Q_TI_003',
      dimension: 'technologyInfrastructure',
      dimensionLabel: 'Technology Infrastructure',
      order: 3,
      questionText: 'How integrated are your business systems?',
      options: [
        { score: 1, label: 'A', text: 'Systems are mostly siloed with manual data movement' },
        { score: 2, label: 'B', text: 'Some system integrations with limited APIs' },
        { score: 3, label: 'C', text: 'Key systems integrated with established data flows' },
        { score: 4, label: 'D', text: 'Comprehensive integration with modern APIs and middleware' },
        { score: 5, label: 'E', text: 'Real-time system integration with event-driven architecture' },
      ],
    },
    {
      id: 'Q_TI_004',
      dimension: 'technologyInfrastructure',
      dimensionLabel: 'Technology Infrastructure',
      order: 4,
      questionText: 'What is your model deployment capability?',
      options: [
        { score: 1, label: 'A', text: 'Models rarely deployed to production' },
        { score: 2, label: 'B', text: 'Manual deployment process with long timelines' },
        { score: 3, label: 'C', text: 'Semi-automated deployment with periodic updates' },
        { score: 4, label: 'D', text: 'Automated deployment with monitoring and rollback' },
        { score: 5, label: 'E', text: 'Continuous deployment with canary releases' },
      ],
    },
    {
      id: 'Q_TI_005',
      dimension: 'technologyInfrastructure',
      dimensionLabel: 'Technology Infrastructure',
      order: 5,
      questionText: 'Do you have adequate compute resources for AI?',
      options: [
        { score: 1, label: 'A', text: 'Limited compute capacity for AI workloads' },
        { score: 2, label: 'B', text: 'Some compute available but with constraints' },
        { score: 3, label: 'C', text: 'Sufficient compute for core AI initiatives' },
        { score: 4, label: 'D', text: 'Scalable compute infrastructure with monitoring' },
        { score: 5, label: 'E', text: 'Auto-scaling compute with cost optimization' },
      ],
    },
  ],
  talentSkills: [
    {
      id: 'Q_TS_001',
      dimension: 'talentSkills',
      dimensionLabel: 'Talent & Skills',
      order: 1,
      questionText: 'Do you have data scientists and AI experts on staff?',
      options: [
        { score: 1, label: 'A', text: 'No AI or data science expertise available' },
        { score: 2, label: 'B', text: 'One or two individuals with data science skills' },
        { score: 3, label: 'C', text: 'Small team of data scientists and engineers' },
        { score: 4, label: 'D', text: 'Dedicated AI center of excellence with multiple roles' },
        { score: 5, label: 'E', text: 'World-class AI talent with specialized expertise' },
      ],
    },
    {
      id: 'Q_TS_002',
      dimension: 'talentSkills',
      dimensionLabel: 'Talent & Skills',
      order: 2,
      questionText: 'How widespread is data literacy in your organization?',
      options: [
        { score: 1, label: 'A', text: 'Most employees lack basic data literacy' },
        { score: 2, label: 'B', text: 'Only specialists have strong data understanding' },
        { score: 3, label: 'C', text: 'Many employees can interpret basic data analysis' },
        { score: 4, label: 'D', text: 'Data literacy is common across the organization' },
        { score: 5, label: 'E', text: 'Data-driven decision-making is part of culture' },
      ],
    },
    {
      id: 'Q_TS_003',
      dimension: 'talentSkills',
      dimensionLabel: 'Talent & Skills',
      order: 3,
      questionText: 'Do you have an AI skills training program?',
      options: [
        { score: 1, label: 'A', text: 'No formal training program in place' },
        { score: 2, label: 'B', text: 'Ad hoc training opportunities available' },
        { score: 3, label: 'C', text: 'Structured training program for select roles' },
        { score: 4, label: 'D', text: 'Comprehensive training program with multiple paths' },
        { score: 5, label: 'E', text: 'Continuous learning culture with certification' },
      ],
    },
    {
      id: 'Q_TS_004',
      dimension: 'talentSkills',
      dimensionLabel: 'Talent & Skills',
      order: 4,
      questionText: 'Can you attract and retain AI talent?',
      options: [
        { score: 1, label: 'A', text: 'Difficulty attracting and retaining AI professionals' },
        { score: 2, label: 'B', text: 'High turnover of AI and data science roles' },
        { score: 3, label: 'C', text: 'Moderate retention with competitive compensation' },
        { score: 4, label: 'D', text: 'Strong retention with growth opportunities' },
        { score: 5, label: 'E', text: 'Employer of choice for AI professionals' },
      ],
    },
    {
      id: 'Q_TS_005',
      dimension: 'talentSkills',
      dimensionLabel: 'Talent & Skills',
      order: 5,
      questionText: 'How collaborative is your AI team with business units?',
      options: [
        { score: 1, label: 'A', text: 'Limited collaboration between AI and business teams' },
        { score: 2, label: 'B', text: 'Occasional engagement on specific projects' },
        { score: 3, label: 'C', text: 'Regular collaboration with established partnerships' },
        { score: 4, label: 'D', text: 'Deep collaboration with embedded data scientists' },
        { score: 5, label: 'E', text: 'Integrated teams with shared goals and incentives' },
      ],
    },
  ],
  useCaseReadiness: [
    {
      id: 'Q_UC_001',
      dimension: 'useCaseReadiness',
      dimensionLabel: 'Use Case Readiness',
      order: 1,
      questionText: 'Have you identified high-priority AI use cases?',
      options: [
        { score: 1, label: 'A', text: 'No clear AI use cases identified for the organization' },
        { score: 2, label: 'B', text: 'Preliminary use cases identified but not scoped' },
        { score: 3, label: 'C', text: 'Several use cases prioritized with business cases' },
        { score: 4, label: 'D', text: 'Actively developing multiple prioritized use cases' },
        { score: 5, label: 'E', text: 'Portfolio management of mature use cases' },
      ],
    },
    {
      id: 'Q_UC_002',
      dimension: 'useCaseReadiness',
      dimensionLabel: 'Use Case Readiness',
      order: 2,
      questionText: 'How feasible are your identified use cases?',
      options: [
        { score: 1, label: 'A', text: 'Feasibility analysis not conducted' },
        { score: 2, label: 'B', text: 'Initial feasibility assessments are underway' },
        { score: 3, label: 'C', text: 'Most use cases assessed as technically feasible' },
        { score: 4, label: 'D', text: 'Feasible use cases with detailed implementation plans' },
        { score: 5, label: 'E', text: 'Proven feasibility through pilots and production' },
      ],
    },
    {
      id: 'Q_UC_003',
      dimension: 'useCaseReadiness',
      dimensionLabel: 'Use Case Readiness',
      order: 3,
      questionText: 'What is your approach to use case prioritization?',
      options: [
        { score: 1, label: 'A', text: 'No formal prioritization process in place' },
        { score: 2, label: 'B', text: 'Ad hoc prioritization based on stakeholder input' },
        { score: 3, label: 'C', text: 'Structured prioritization with defined criteria' },
        { score: 4, label: 'D', text: 'Formal prioritization framework with ROI analysis' },
        { score: 5, label: 'E', text: 'Dynamic prioritization with continuous re-evaluation' },
      ],
    },
    {
      id: 'Q_UC_004',
      dimension: 'useCaseReadiness',
      dimensionLabel: 'Use Case Readiness',
      order: 4,
      questionText: 'Have you tested any AI use cases in production?',
      options: [
        { score: 1, label: 'A', text: 'No AI use cases in production' },
        { score: 2, label: 'B', text: 'Limited pilots with mixed results' },
        { score: 3, label: 'C', text: 'Several use cases in production at limited scale' },
        { score: 4, label: 'D', text: 'Multiple production use cases with measurable impact' },
        { score: 5, label: 'E', text: 'Scaled AI use cases generating significant value' },
      ],
    },
    {
      id: 'Q_UC_005',
      dimension: 'useCaseReadiness',
      dimensionLabel: 'Use Case Readiness',
      order: 5,
      questionText: 'How do you measure success of AI use cases?',
      options: [
        { score: 1, label: 'A', text: 'Success metrics not defined for use cases' },
        { score: 2, label: 'B', text: 'Basic metrics defined but inconsistently tracked' },
        { score: 3, label: 'C', text: 'Clear success metrics for each use case' },
        { score: 4, label: 'D', text: 'Comprehensive metrics with regular reviews' },
        { score: 5, label: 'E', text: 'Advanced analytics with continuous optimization' },
      ],
    },
  ],
  operationalReadiness: [
    {
      id: 'Q_OR_001',
      dimension: 'operationalReadiness',
      dimensionLabel: 'Operational Readiness',
      order: 1,
      questionText: 'How digitized are your key business processes?',
      options: [
        { score: 1, label: 'A', text: 'Most processes are manual with limited digitization' },
        { score: 2, label: 'B', text: 'Some processes are digitized with manual steps' },
        { score: 3, label: 'C', text: 'Most critical processes are fully digitized' },
        { score: 4, label: 'D', text: 'Processes are digitized with some automation' },
        { score: 5, label: 'E', text: 'End-to-end automated processes with AI integration' },
      ],
    },
    {
      id: 'Q_OR_002',
      dimension: 'operationalReadiness',
      dimensionLabel: 'Operational Readiness',
      order: 2,
      questionText: 'What is your organization\'s change management capability?',
      options: [
        { score: 1, label: 'A', text: 'No formal change management process' },
        { score: 2, label: 'B', text: 'Basic change process with inconsistent adoption' },
        { score: 3, label: 'C', text: 'Structured change management for major initiatives' },
        { score: 4, label: 'D', text: 'Mature change management with communication plans' },
        { score: 5, label: 'E', text: 'Agile change management embedded in culture' },
      ],
    },
    {
      id: 'Q_OR_003',
      dimension: 'operationalReadiness',
      dimensionLabel: 'Operational Readiness',
      order: 3,
      questionText: 'How are AI models monitored in production?',
      options: [
        { score: 1, label: 'A', text: 'No production monitoring of AI models' },
        { score: 2, label: 'B', text: 'Manual monitoring with periodic reviews' },
        { score: 3, label: 'C', text: 'Automated monitoring with basic alerting' },
        { score: 4, label: 'D', text: 'Comprehensive monitoring with drift detection' },
        { score: 5, label: 'E', text: 'Real-time monitoring with automated remediation' },
      ],
    },
    {
      id: 'Q_OR_004',
      dimension: 'operationalReadiness',
      dimensionLabel: 'Operational Readiness',
      order: 4,
      questionText: 'Do you have incident response procedures for AI?',
      options: [
        { score: 1, label: 'A', text: 'No incident response procedures defined' },
        { score: 2, label: 'B', text: 'Basic procedures with manual responses' },
        { score: 3, label: 'C', text: 'Defined procedures for common scenarios' },
        { score: 4, label: 'D', text: 'Comprehensive procedures with playbooks' },
        { score: 5, label: 'E', text: 'Automated incident response with continuous improvement' },
      ],
    },
    {
      id: 'Q_OR_005',
      dimension: 'operationalReadiness',
      dimensionLabel: 'Operational Readiness',
      order: 5,
      questionText: 'How well prepared are employees for AI adoption?',
      options: [
        { score: 1, label: 'A', text: 'Employees are not prepared for AI adoption' },
        { score: 2, label: 'B', text: 'Limited awareness with minimal preparation' },
        { score: 3, label: 'C', text: 'Training program underway for impacted roles' },
        { score: 4, label: 'D', text: 'Comprehensive preparation with change management' },
        { score: 5, label: 'E', text: 'Organization embracing AI with enthusiasm' },
      ],
    },
  ],
  aiGovernance: [
    {
      id: 'Q_AG_001',
      dimension: 'aiGovernance',
      dimensionLabel: 'AI Governance',
      order: 1,
      questionText: 'Do you have an AI governance framework?',
      options: [
        { score: 1, label: 'A', text: 'No AI governance framework in place' },
        { score: 2, label: 'B', text: 'Initial governance discussions underway' },
        { score: 3, label: 'C', text: 'Governance framework documented and shared' },
        { score: 4, label: 'D', text: 'Active governance with defined policies' },
        { score: 5, label: 'E', text: 'Mature governance with continuous evolution' },
      ],
    },
    {
      id: 'Q_AG_002',
      dimension: 'aiGovernance',
      dimensionLabel: 'AI Governance',
      order: 2,
      questionText: 'How do you address AI ethics and bias?',
      options: [
        { score: 1, label: 'A', text: 'No formal ethics or bias assessment process' },
        { score: 2, label: 'B', text: 'Awareness of issues but no formal controls' },
        { score: 3, label: 'C', text: 'Ethics assessment for high-risk use cases' },
        { score: 4, label: 'D', text: 'Comprehensive ethics and bias mitigation program' },
        { score: 5, label: 'E', text: 'Continuous ethics monitoring with regular audits' },
      ],
    },
    {
      id: 'Q_AG_003',
      dimension: 'aiGovernance',
      dimensionLabel: 'AI Governance',
      order: 3,
      questionText: 'Are you compliant with relevant AI regulations?',
      options: [
        { score: 1, label: 'A', text: 'No compliance program for AI regulations' },
        { score: 2, label: 'B', text: 'Basic awareness of AI compliance requirements' },
        { score: 3, label: 'C', text: 'Compliance program in development' },
        { score: 4, label: 'D', text: 'Active compliance monitoring and controls' },
        { score: 5, label: 'E', text: 'Proactive compliance with industry leadership' },
      ],
    },
    {
      id: 'Q_AG_004',
      dimension: 'aiGovernance',
      dimensionLabel: 'AI Governance',
      order: 4,
      questionText: 'Do you have model explainability practices?',
      options: [
        { score: 1, label: 'A', text: 'No model explainability practices in place' },
        { score: 2, label: 'B', text: 'Basic documentation of model inputs and outputs' },
        { score: 3, label: 'C', text: 'Explainability assessment for critical models' },
        { score: 4, label: 'D', text: 'Comprehensive explainability practices and tools' },
        { score: 5, label: 'E', text: 'Advanced interpretability with stakeholder transparency' },
      ],
    },
    {
      id: 'Q_AG_005',
      dimension: 'aiGovernance',
      dimensionLabel: 'AI Governance',
      order: 5,
      questionText: 'How do you handle data security for AI systems?',
      options: [
        { score: 1, label: 'A', text: 'No formal data security for AI systems' },
        { score: 2, label: 'B', text: 'Basic security with limited controls' },
        { score: 3, label: 'C', text: 'Defined security practices for AI systems' },
        { score: 4, label: 'D', text: 'Comprehensive security with regular audits' },
        { score: 5, label: 'E', text: 'Advanced security with encryption and access control' },
      ],
    },
  ],
}

function getTemplateQuestions(dimension, questionCount, orderStart) {
  const templates = TEMPLATE_QUESTIONS[dimension] || []
  const selected = templates.slice(0, questionCount)

  return selected.map((q, index) => ({
    ...q,
    order: orderStart + index,
  }))
}

function wordCount(str) {
  return String(str || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

const DIMENSION_SYSTEM_PROMPT = `AI Maturity assessment architect. Generate plain-language questions for an AI Maturity Framework.

DIMENSIONS: businessStrategy|dataReadiness|technologyInfrastructure|talentSkills|useCaseReadiness|operationalReadiness|aiGovernance

ORG SIZE: 1-50=practical/no-jargon, 51-200=mid-market, 201-1000=department, 1000+=enterprise

RULES:
1. Question: 8-15 words, start with How/Does/Have you, one topic only.
2. Option A: complete absence (start "No" or "We have no").
3. Options B-D: each clearly better than previous (8-15 words).
4. Option E: specific mature capability.
5. Never use: somewhat, fairly, quite, pretty, slightly, rather.

Return ONLY JSON (no markdown):
{"questions":[{"id":"string","dimension":"string","dimensionLabel":"string","order":1,"questionText":"string","options":[{"score":1,"label":"A","text":"string"},{"score":2,"label":"B","text":"string"},{"score":3,"label":"C","text":"string"},{"score":4,"label":"D","text":"string"},{"score":5,"label":"E","text":"string"}]}]}`

const DIMENSION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          dimension: { type: 'string' },
          dimensionLabel: { type: 'string' },
          order: { type: 'integer' },
          questionText: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                score: { type: 'integer' },
                label: { type: 'string' },
                text: { type: 'string' },
              },
              required: ['score', 'label', 'text'],
            },
          },
        },
        required: ['id', 'dimension', 'dimensionLabel', 'order', 'questionText', 'options'],
      },
    },
  },
  required: ['questions'],
}

function buildDimensionUserMessage({
  industryLabel,
  orgSize,
  companyName,
  dimension,
  questionCount,
  orderStart,
  previousAnswers,
}) {
  const lines = [
    `Industry: ${industryLabel}`,
    `Organization size: ${orgSize}`,
    companyName ? `Company: ${companyName}` : null,
    ``,
    `TARGET DIMENSION: ${dimension} (${DIMENSION_LABELS[dimension] || dimension})`,
    `REQUIRED QUESTION COUNT: Exactly ${questionCount} questions for this dimension only.`,
    `ID FORMAT: Use Q${String(orderStart).padStart(2, '0')} through Q${String(orderStart + questionCount - 1).padStart(2, '0')}`,
    `ORDER FIELD: Start at ${orderStart}, increment by 1.`,
  ]

  if (previousAnswers && previousAnswers.length > 0) {
    const recent = previousAnswers.slice(-5)
    lines.push(`PRIOR ANSWERS (last ${recent.length}):`)
    for (const ans of recent) {
      lines.push(`  ${ans.dimension}: "${ans.selectedOptionText}"`)
    }
    lines.push(`Avoid repeating covered topics.`)
  }

  lines.push(``)
  lines.push(
    `Generate exactly ${questionCount} questions for the ${DIMENSION_LABELS[dimension] || dimension} dimension only. Return ONLY JSON.`
  )

  return lines.filter((l) => l !== null).join('\n')
}

function validateDimensionPayload(parsed, dimension, questionCount, orderStart) {
  if (!Array.isArray(parsed.questions)) {
    throw new Error('Response missing questions array')
  }

  if (parsed.questions.length !== questionCount) {
    throw new Error(
      `Expected ${questionCount} questions for ${dimension}, got ${parsed.questions.length}`
    )
  }

  for (const q of parsed.questions) {
    if (q.dimension !== dimension) {
      q.dimension = dimension
      q.dimensionLabel = DIMENSION_LABELS[dimension] || dimension
    }

    if (!Array.isArray(q.options) || q.options.length !== 5) {
      throw new Error(`Question ${q.id} has wrong number of options`)
    }

    const scores = q.options.map((o) => o.score).join(',')
    if (scores !== '1,2,3,4,5') {
      throw new Error(`Question ${q.id} has wrong option scores: ${scores}`)
    }

    if (wordCount(q.questionText) > 22) {
      q.questionText = q.questionText.split(' ').slice(0, 15).join(' ')
    }
  }
}

async function requestDimensionQuestions(params, temperature = 0.6) {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured in environment')
  }

  const start = Date.now()
  const userMessage = buildDimensionUserMessage(params)

  console.log(
    `[Gemini] Requesting ${params.questionCount} questions for ${params.dimension} (temp: ${temperature})...`
  )

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
      temperature,
    },
  })

  try {
    const result = await model.generateContent({
      systemInstruction: DIMENSION_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseSchema: DIMENSION_RESPONSE_SCHEMA,
      },
    })

    const response = await result.response
    const elapsed = Date.now() - start
    console.log(`[Gemini] ${params.dimension} response in ${elapsed}ms`)

    const rawContent = response.text() || ''
    if (!rawContent) throw new Error('Gemini returned empty response')

    let parsed
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      try {
        parsed = JSON.parse(stripMarkdownFences(rawContent))
      } catch {
        console.error('[Gemini] JSON parse error. Snippet:', rawContent.substring(0, 300))
        throw new Error('Gemini returned invalid JSON')
      }
    }

    validateDimensionPayload(parsed, params.dimension, params.questionCount, params.orderStart)

    return parsed.questions
  } catch (err) {
    throw err
  }
}

export async function generateDimensionQuestions(
  context,
  dimension,
  questionCount,
  orderStart,
  previousAnswers = []
) {
  const params = {
    industryLabel: context.industryLabel,
    orgSize: context.orgSize,
    companyName: context.companyName || null,
    dimension,
    questionCount,
    orderStart,
    previousAnswers,
  }

  try {
    return await requestDimensionQuestions(params, 0.6)
  } catch (err1) {
    console.error(`[geminiQuestions] Dimension ${dimension} attempt 1 failed:`, err1.message)
  }

  try {
    return await requestDimensionQuestions(params, 0.3)
  } catch (err2) {
    console.error(`[geminiQuestions] Dimension ${dimension} attempt 2 failed:`, err2.message)
    throw new Error(
      `Failed to generate questions for ${DIMENSION_LABELS[dimension] || dimension}: ${err2.message}`
    )
  }
}
