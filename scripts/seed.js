import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.'
  )
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const makeOption = (score, label, text) => ({ score, label, text })

const makeQuestion = ({
  question_id,
  dimension,
  scope,
  sort_order,
  question_text,
  options,
  industries = [],
}) => ({
  question_id,
  dimension,
  scope,
  sort_order,
  question_text,
  options,
  industries,
  is_active: true,
})

const INDUSTRIES = [
  {
    slug: 'healthcare',
    label: 'Healthcare & Life Sciences',
    icon: 'Heart',
    description: 'Hospitals, clinics, pharma, biotech, medical devices',
  },
  {
    slug: 'finance',
    label: 'Financial Services',
    icon: 'TrendingUp',
    description: 'Banking, insurance, investment, fintech',
  },
  {
    slug: 'retail',
    label: 'Retail & E-Commerce',
    icon: 'ShoppingBag',
    description: 'Brick-and-mortar, online retail, consumer goods',
  },
  {
    slug: 'manufacturing',
    label: 'Manufacturing & Industry',
    icon: 'Factory',
    description: 'Automotive, aerospace, FMCG, industrial production',
  },
  {
    slug: 'technology',
    label: 'Technology & SaaS',
    icon: 'Cpu',
    description: 'Software companies, tech startups, cloud providers',
  },
  {
    slug: 'education',
    label: 'Education & EdTech',
    icon: 'GraduationCap',
    description: 'Schools, universities, online learning platforms',
  },
  {
    slug: 'government',
    label: 'Government & Public Sector',
    icon: 'Landmark',
    description: 'Federal, state, local agencies, public utilities',
  },
  {
    slug: 'logistics',
    label: 'Logistics & Supply Chain',
    icon: 'Truck',
    description: 'Freight, warehousing, 3PL, last-mile delivery',
  },
]

const GLOBAL_QUESTIONS = [
  makeQuestion({
    question_id: 'G_BS_01',
    dimension: 'businessStrategy',
    scope: 'global',
    sort_order: 1,
    question_text: 'How clearly is AI embedded in your organization-wide business strategy?',
    options: [
      makeOption(1, 'A', 'AI is absent from strategy discussions and annual planning.'),
      makeOption(2, 'B', 'AI appears in presentations, but no formal objectives or owners exist.'),
      makeOption(3, 'C', 'AI goals are defined for select functions with executive sponsorship.'),
      makeOption(4, 'D', 'AI objectives are tied to business KPIs across multiple business units.'),
      makeOption(5, 'E', 'AI is a core strategic pillar with board oversight and funded outcomes.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_BS_02',
    dimension: 'businessStrategy',
    scope: 'global',
    sort_order: 2,
    question_text: 'How does leadership prioritize AI investment decisions?',
    options: [
      makeOption(1, 'A', 'AI spending is not planned or approved in budgets.'),
      makeOption(2, 'B', 'Small AI experiments are funded ad hoc without business cases.'),
      makeOption(3, 'C', 'AI investments are prioritized through departmental business cases.'),
      makeOption(4, 'D', 'AI investments follow a portfolio process with ROI and risk criteria.'),
      makeOption(5, 'E', 'AI funding is continuously optimized using enterprise value, risk, and capability data.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_BS_03',
    dimension: 'businessStrategy',
    scope: 'global',
    sort_order: 3,
    question_text: 'How well are AI use cases linked to measurable business outcomes?',
    options: [
      makeOption(1, 'A', 'AI ideas are not linked to revenue, cost, risk, or service outcomes.'),
      makeOption(2, 'B', 'Some AI ideas mention benefits, but metrics are undefined.'),
      makeOption(3, 'C', 'Priority AI use cases have success metrics and target owners.'),
      makeOption(4, 'D', 'Most AI initiatives track baseline, target, and realized business impact.'),
      makeOption(5, 'E', 'AI outcomes are measured enterprise-wide and drive strategic course correction.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_BS_04',
    dimension: 'businessStrategy',
    scope: 'global',
    sort_order: 4,
    question_text: 'How consistently do business leaders champion AI adoption?',
    options: [
      makeOption(1, 'A', 'Leaders rarely discuss AI and do not sponsor adoption.'),
      makeOption(2, 'B', 'A few leaders support AI, but messaging is inconsistent.'),
      makeOption(3, 'C', 'Business leaders actively sponsor pilots in their areas.'),
      makeOption(4, 'D', 'Most leaders promote AI adoption with shared objectives and accountability.'),
      makeOption(5, 'E', 'Leadership models AI-first decision-making and scales wins across the enterprise.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_DR_01',
    dimension: 'dataReadiness',
    scope: 'global',
    sort_order: 5,
    question_text: 'How accessible is the data needed for AI use cases across the organization?',
    options: [
      makeOption(1, 'A', 'Critical data is scattered, manual, and difficult to access.'),
      makeOption(2, 'B', 'Some data is digitized, but access depends on individual teams.'),
      makeOption(3, 'C', 'Key data sources are available for priority use cases with some integration.'),
      makeOption(4, 'D', 'Most business-critical data is integrated and accessible through governed platforms.'),
      makeOption(5, 'E', 'Trusted, near real-time data products are broadly available for AI development.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_DR_02',
    dimension: 'dataReadiness',
    scope: 'global',
    sort_order: 6,
    question_text: 'How mature are your data quality practices for AI and analytics?',
    options: [
      makeOption(1, 'A', 'Data quality issues are frequent and largely undiscovered until late.'),
      makeOption(2, 'B', 'Teams fix quality issues manually with limited monitoring.'),
      makeOption(3, 'C', 'Priority datasets have quality checks and defined remediation owners.'),
      makeOption(4, 'D', 'Data quality is monitored across core domains with service-level targets.'),
      makeOption(5, 'E', 'Automated quality controls continuously protect enterprise data products used by AI.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_DR_03',
    dimension: 'dataReadiness',
    scope: 'global',
    sort_order: 7,
    question_text: 'How well is your data governed for secure and compliant AI use?',
    options: [
      makeOption(1, 'A', 'No clear rules exist for data ownership, classification, or AI usage.'),
      makeOption(2, 'B', 'Basic policies exist, but enforcement is inconsistent across teams.'),
      makeOption(3, 'C', 'Sensitive data has owners, access rules, and review steps.'),
      makeOption(4, 'D', 'Governance policies are enforced through tooling and routine audits.'),
      makeOption(5, 'E', 'Data governance is embedded in workflows with automated controls and lineage.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_DR_04',
    dimension: 'dataReadiness',
    scope: 'global',
    sort_order: 8,
    question_text: 'How prepared are your data pipelines to support repeatable AI operations?',
    options: [
      makeOption(1, 'A', 'Data is gathered manually for each report or model.'),
      makeOption(2, 'B', 'Some pipelines exist, but they break often and need manual fixes.'),
      makeOption(3, 'C', 'Priority pipelines are scheduled and documented for recurring AI work.'),
      makeOption(4, 'D', 'Core pipelines are reliable, monitored, and support multiple AI initiatives.'),
      makeOption(5, 'E', 'Reusable pipelines deliver governed data continuously for enterprise AI products.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_TI_01',
    dimension: 'technologyInfrastructure',
    scope: 'global',
    sort_order: 9,
    question_text: "What best describes your organization's use of cloud computing?",
    options: [
      makeOption(1, 'A', 'We run everything on physical on-premises servers. Cloud is not used.'),
      makeOption(2, 'B', 'We use basic cloud services, but core systems remain on-premises.'),
      makeOption(3, 'C', 'We are migrating key systems to the cloud in a hybrid environment.'),
      makeOption(4, 'D', 'Most systems and data are cloud-based across major providers.'),
      makeOption(5, 'E', 'We operate a cloud-native platform with elastic AI and ML infrastructure.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_TI_02',
    dimension: 'technologyInfrastructure',
    scope: 'global',
    sort_order: 10,
    question_text: 'How ready is your technology stack to deploy and monitor AI solutions?',
    options: [
      makeOption(1, 'A', 'Our stack cannot support model deployment or monitoring.'),
      makeOption(2, 'B', 'We can host simple AI tools, but integration is fragile.'),
      makeOption(3, 'C', 'We support limited deployment pipelines for selected AI use cases.'),
      makeOption(4, 'D', 'We have standard environments, observability, and deployment controls for AI.'),
      makeOption(5, 'E', 'We run enterprise MLOps with automated deployment, monitoring, and rollback.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_TI_03',
    dimension: 'technologyInfrastructure',
    scope: 'global',
    sort_order: 11,
    question_text: 'How integrated are your core applications, platforms, and APIs for AI enablement?',
    options: [
      makeOption(1, 'A', 'Systems are siloed and mostly lack usable APIs.'),
      makeOption(2, 'B', 'Some integrations exist, but many workflows require manual exports.'),
      makeOption(3, 'C', 'Priority systems expose APIs for a few AI-enabled workflows.'),
      makeOption(4, 'D', 'Most core applications integrate through managed APIs and event flows.'),
      makeOption(5, 'E', 'AI services plug into a modular platform with reusable enterprise APIs.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_TS_01',
    dimension: 'talentSkills',
    scope: 'global',
    sort_order: 12,
    question_text: 'How strong are your internal AI and data skills today?',
    options: [
      makeOption(1, 'A', 'We have no in-house AI, data science, or ML capability.'),
      makeOption(2, 'B', 'A few individuals have AI interest, but skills are informal.'),
      makeOption(3, 'C', 'We have dedicated staff for analytics, data engineering, or applied AI.'),
      makeOption(4, 'D', 'Cross-functional teams combine business, data, engineering, and AI expertise.'),
      makeOption(5, 'E', 'We maintain deep AI talent with clear roles, career paths, and communities.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_TS_02',
    dimension: 'talentSkills',
    scope: 'global',
    sort_order: 13,
    question_text: 'How systematically do you build AI literacy across the workforce?',
    options: [
      makeOption(1, 'A', 'No AI training or literacy program exists.'),
      makeOption(2, 'B', 'AI training is optional and limited to a few enthusiasts.'),
      makeOption(3, 'C', 'Targeted AI training exists for selected roles and pilot teams.'),
      makeOption(4, 'D', 'Role-based AI learning paths are available across major functions.'),
      makeOption(5, 'E', 'AI literacy is embedded in onboarding, development, and performance expectations.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_TS_03',
    dimension: 'talentSkills',
    scope: 'global',
    sort_order: 14,
    question_text: 'How effectively do business and technical teams collaborate on AI initiatives?',
    options: [
      makeOption(1, 'A', 'Business and technical teams rarely work together on AI topics.'),
      makeOption(2, 'B', 'Collaboration happens informally and breaks down after pilot stages.'),
      makeOption(3, 'C', 'Teams collaborate on defined AI projects with named stakeholders.'),
      makeOption(4, 'D', 'Cross-functional governance and delivery rituals support ongoing AI programs.'),
      makeOption(5, 'E', 'Business and technical teams co-own AI products from design to scaling.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_UC_01',
    dimension: 'useCaseReadiness',
    scope: 'global',
    sort_order: 15,
    question_text: 'How mature is your process for identifying high-value AI use cases?',
    options: [
      makeOption(1, 'A', 'Use cases are not defined beyond general interest in AI.'),
      makeOption(2, 'B', 'Ideas are collected informally without prioritization criteria.'),
      makeOption(3, 'C', 'Use cases are assessed for value, feasibility, and sponsorship.'),
      makeOption(4, 'D', 'A repeatable intake process ranks use cases across business units.'),
      makeOption(5, 'E', 'Use case discovery is continuous, data-driven, and tied to strategic outcomes.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_UC_02',
    dimension: 'useCaseReadiness',
    scope: 'global',
    sort_order: 16,
    question_text: 'How well do your AI use cases match available data, systems, and process readiness?',
    options: [
      makeOption(1, 'A', 'Most use cases ignore current data, system, and process constraints.'),
      makeOption(2, 'B', 'Some feasibility is considered, but readiness gaps are overlooked.'),
      makeOption(3, 'C', 'Priority use cases are screened against data and operational readiness.'),
      makeOption(4, 'D', 'Use cases include clear dependency mapping before approval.'),
      makeOption(5, 'E', 'Use cases are sequenced using enterprise readiness, value, and scaling signals.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_UC_03',
    dimension: 'useCaseReadiness',
    scope: 'global',
    sort_order: 17,
    question_text: 'How effectively do you move AI use cases from pilot to scaled execution?',
    options: [
      makeOption(1, 'A', 'Pilots rarely move forward after initial demos.'),
      makeOption(2, 'B', 'A few pilots progress, but scaling depends on heroics.'),
      makeOption(3, 'C', 'Selected pilots move into production with dedicated support.'),
      makeOption(4, 'D', 'We follow a standard path from pilot, to production, to scaling.'),
      makeOption(5, 'E', 'Scaled AI productization is repeatable, fast, and governed enterprise-wide.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_OR_01',
    dimension: 'operationalReadiness',
    scope: 'global',
    sort_order: 18,
    question_text: 'How prepared are your business processes to incorporate AI into daily operations?',
    options: [
      makeOption(1, 'A', 'Processes are undocumented and cannot absorb AI-driven changes.'),
      makeOption(2, 'B', 'Some processes are documented, but AI changes would disrupt operations.'),
      makeOption(3, 'C', 'Priority workflows are mapped and can support targeted AI adoption.'),
      makeOption(4, 'D', 'Operational processes are standardized and ready for AI-enabled redesign.'),
      makeOption(5, 'E', 'Continuous improvement processes rapidly absorb and optimize AI changes.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_OR_02',
    dimension: 'operationalReadiness',
    scope: 'global',
    sort_order: 19,
    question_text: 'How strong is your change management approach for AI-enabled transformation?',
    options: [
      makeOption(1, 'A', 'No change management approach exists for AI-related initiatives.'),
      makeOption(2, 'B', 'Change support is reactive and limited to communications.'),
      makeOption(3, 'C', 'AI projects include adoption plans, training, and stakeholder engagement.'),
      makeOption(4, 'D', 'Structured change management is standard for major AI rollouts.'),
      makeOption(5, 'E', 'Change adoption is measured continuously and informs rollout decisions.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_OR_03',
    dimension: 'operationalReadiness',
    scope: 'global',
    sort_order: 20,
    question_text: 'How consistently do you monitor AI performance after deployment?',
    options: [
      makeOption(1, 'A', 'We do not monitor AI outputs or business performance post-launch.'),
      makeOption(2, 'B', 'Monitoring is manual and only happens when issues surface.'),
      makeOption(3, 'C', 'Key AI deployments have basic KPI and issue tracking.'),
      makeOption(4, 'D', 'Performance, drift, and business metrics are routinely monitored.'),
      makeOption(5, 'E', 'AI monitoring is automated with alerts, review cadences, and optimization loops.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_AG_01',
    dimension: 'aiGovernance',
    scope: 'global',
    sort_order: 21,
    question_text: 'How formalized are your AI governance policies and decision rights?',
    options: [
      makeOption(1, 'A', 'No AI governance policies or accountability structures exist.'),
      makeOption(2, 'B', 'Draft policies exist, but decisions remain decentralized and inconsistent.'),
      makeOption(3, 'C', 'Core AI policies and review roles are defined for priority initiatives.'),
      makeOption(4, 'D', 'Governance policies are enforced across business units and vendors.'),
      makeOption(5, 'E', 'Enterprise AI governance is proactive, measurable, and continuously improved.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_AG_02',
    dimension: 'aiGovernance',
    scope: 'global',
    sort_order: 22,
    question_text: 'How do you manage AI risks such as bias, privacy, security, and misuse?',
    options: [
      makeOption(1, 'A', 'AI risks are not assessed before tools or models are used.'),
      makeOption(2, 'B', 'Risk reviews happen irregularly and focus on obvious issues only.'),
      makeOption(3, 'C', 'Priority AI initiatives complete risk assessments before launch.'),
      makeOption(4, 'D', 'Risk controls are standardized with approvals, documentation, and monitoring.'),
      makeOption(5, 'E', 'Risk management is embedded in development, procurement, deployment, and oversight.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_AG_03',
    dimension: 'aiGovernance',
    scope: 'global',
    sort_order: 23,
    question_text: 'How transparent are AI decisions, approvals, and model behaviors in your organization?',
    options: [
      makeOption(1, 'A', 'AI decisions and model behavior are undocumented and opaque.'),
      makeOption(2, 'B', 'Some documentation exists, but it is incomplete and hard to access.'),
      makeOption(3, 'C', 'Important AI systems include documented assumptions, approvals, and owners.'),
      makeOption(4, 'D', 'Documentation and traceability are standard across material AI systems.'),
      makeOption(5, 'E', 'AI decisions are fully traceable with auditable records for stakeholders.'),
    ],
  }),
  makeQuestion({
    question_id: 'G_AG_04',
    dimension: 'aiGovernance',
    scope: 'global',
    sort_order: 24,
    question_text: 'How do you govern third-party AI tools, vendors, and models?',
    options: [
      makeOption(1, 'A', 'Teams adopt third-party AI tools without review or controls.'),
      makeOption(2, 'B', 'Procurement reviews some vendors, but AI-specific checks are limited.'),
      makeOption(3, 'C', 'Third-party AI tools require security, privacy, and contractual review.'),
      makeOption(4, 'D', 'Vendor AI governance includes due diligence, controls, and ongoing oversight.'),
      makeOption(5, 'E', 'Third-party AI risk is continuously monitored with contractual and technical safeguards.'),
    ],
  }),
]

const INDUSTRY_QUESTION_DEFINITIONS = {
  healthcare: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'HC_BS_01',
        question_text:
          'How clearly is AI prioritized in your healthcare strategy across patient care, operations, and compliance?',
        options: [
          'AI is absent from care delivery, operations, and compliance planning.',
          'AI is discussed, but no hospital or life sciences roadmap exists.',
          'AI priorities are defined for selected service lines or operational areas.',
          'AI goals are linked to clinical, operational, and compliance outcomes.',
          'AI drives enterprise strategy across care, research, and administrative performance.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'HC_BS_02',
        question_text:
          'How are healthcare AI investments prioritized across patient experience, cost, and safety outcomes?',
        options: [
          'AI investments are not prioritized against patient or operational outcomes.',
          'Teams propose isolated tools without ROI, safety, or compliance criteria.',
          'Major AI ideas are assessed for care impact, cost, and feasibility.',
          'AI investments follow a portfolio process balancing patient, cost, and risk outcomes.',
          'Funding decisions continuously optimize care quality, productivity, and responsible AI controls.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'HC_DR_01',
        question_text:
          'How ready is your EHR, imaging, and patient data for AI use under HIPAA and clinical workflows?',
        options: [
          'Patient data is fragmented across EHR, imaging, and paper records.',
          'Some patient data is digital, but access is manual and inconsistent.',
          'Priority clinical datasets are integrated for approved AI use cases.',
          'Most EHR, imaging, and operational data is governed and accessible securely.',
          'Trusted patient data products support AI across care, operations, and research.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'HC_DR_02',
        question_text:
          'How strong are your controls for data quality, lineage, and consent across healthcare AI datasets?',
        options: [
          'Data quality, lineage, and consent are not tracked for AI datasets.',
          'Teams check quality manually, and consent handling is inconsistent.',
          'Important datasets have quality checks, owners, and consent review steps.',
          'Clinical AI datasets are monitored for quality, lineage, and access controls.',
          'Automated governance enforces quality, lineage, consent, and retention policies.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'HC_TI_01',
        question_text:
          'How capable is your healthcare technology stack of deploying AI into EHR, imaging, and clinical workflows?',
        options: [
          'Core clinical systems cannot support AI deployment or integration.',
          'Point solutions exist, but AI cannot integrate cleanly with workflows.',
          'Selected AI tools connect to EHR or imaging systems with support.',
          'Most clinical platforms support monitored AI deployment through secure integrations.',
          'AI services integrate natively into care workflows with governed monitoring and rollback.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'HC_TS_01',
        question_text:
          'How prepared are clinicians, analysts, and operations teams to adopt and govern AI tools?',
        options: [
          'Clinicians and staff have no AI training or defined support.',
          'A few champions experiment, but most teams lack practical AI skills.',
          'Targeted training supports selected clinicians, analysts, and operational teams.',
          'Role-based AI learning reaches clinical, administrative, and data teams.',
          'AI capability is embedded across clinical, research, compliance, and operations roles.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'HC_UC_01',
        question_text:
          'How mature is your pipeline for selecting healthcare AI use cases such as triage, coding, and scheduling?',
        options: [
          'Use cases are vague and not tied to care or operational pain points.',
          'Ideas are collected informally without clinical or operational prioritization.',
          'Priority use cases are screened for value, feasibility, and safety.',
          'A repeatable intake process ranks clinical and operational AI opportunities.',
          'Use case selection is data-driven and aligned to enterprise care outcomes.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'HC_OR_01',
        question_text:
          'How ready are your healthcare workflows to operationalize AI with oversight, escalation, and audit trails?',
        options: [
          'Workflows lack documentation, oversight, and escalation for AI-supported decisions.',
          'Some workflows are documented, but audit and escalation paths are weak.',
          'Priority workflows define approvals, human review, and exception handling.',
          'Clinical and administrative AI workflows include monitoring, escalation, and audits.',
          'AI is operationalized with robust oversight, traceability, and continuous improvement loops.',
        ],
      },
    ],
  },
  finance: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'FIN_BS_01',
        question_text:
          'How clearly is AI embedded in your financial services strategy for growth, risk, and customer experience?',
        options: [
          'AI is absent from banking, insurance, or investment strategy.',
          'AI is mentioned, but no roadmap connects it to financial outcomes.',
          'AI priorities exist for selected products, operations, or risk functions.',
          'AI strategy aligns with revenue, customer, and risk management goals.',
          'AI is a core strategic lever across growth, service, fraud, and compliance.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'FIN_BS_02',
        question_text:
          'How are AI investments prioritized across underwriting, fraud, servicing, and regulatory demands?',
        options: [
          'AI spending is not prioritized against business or regulatory outcomes.',
          'Teams fund pilots without clear business cases or risk review.',
          'Priority ideas are assessed for value, compliance, and implementation effort.',
          'AI investments follow a portfolio process balancing revenue, cost, and risk.',
          'Funding is optimized continuously using financial impact, compliance, and resilience data.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'FIN_DR_01',
        question_text:
          'How ready are your core banking, claims, trading, or customer data platforms for AI use?',
        options: [
          'Customer and transaction data is fragmented across siloed legacy systems.',
          'Some financial data is accessible, but integration is manual and slow.',
          'Priority datasets are integrated for approved analytics and AI use cases.',
          'Core customer, transaction, and risk data is governed and broadly accessible.',
          'Trusted financial data products support AI in real time across the enterprise.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'FIN_DR_02',
        question_text:
          'How strong are your controls for model data quality, lineage, privacy, and auditability?',
        options: [
          'Quality, lineage, and audit records are missing for AI-related data.',
          'Controls are manual and inconsistent across products or business lines.',
          'Important datasets have owners, checks, and approval records.',
          'Data quality, lineage, and access controls are monitored across core domains.',
          'Automated controls enforce auditability, privacy, and lineage for regulated AI data.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'FIN_TI_01',
        question_text:
          'How capable is your technology stack of deploying AI into banking, claims, trading, or servicing workflows?',
        options: [
          'Core financial systems cannot support AI deployment or integration.',
          'AI tools run separately from core platforms and require manual workarounds.',
          'Selected AI solutions integrate with priority systems under controlled conditions.',
          'Most core platforms support secure AI deployment with monitoring and controls.',
          'AI is deployed through resilient, compliant platforms with continuous observability.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'FIN_TS_01',
        question_text:
          'How prepared are risk, operations, product, and compliance teams to use AI responsibly?',
        options: [
          'Teams have no AI training relevant to financial services work.',
          'A few specialists understand AI, but frontline teams do not.',
          'Targeted training supports selected analysts, product, and operations teams.',
          'Role-based AI learning reaches risk, service, operations, and compliance teams.',
          'AI fluency is embedded across business, risk, compliance, and technology roles.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'FIN_UC_01',
        question_text:
          'How mature is your process for choosing financial AI use cases such as fraud, underwriting, or service automation?',
        options: [
          'Use cases are not tied to clear banking, insurance, or investment needs.',
          'Ideas are gathered informally without value or risk screening.',
          'Priority use cases are evaluated for value, feasibility, and controls.',
          'A repeatable pipeline ranks AI opportunities across lines of business.',
          'Use case selection is dynamic, enterprise-wide, and linked to strategic outcomes.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'FIN_OR_01',
        question_text:
          'How ready are your financial operations to use AI with approvals, exceptions, and regulatory oversight?',
        options: [
          'Operational workflows lack controls for AI-assisted decisions or exceptions.',
          'Some teams document steps, but oversight and escalation are inconsistent.',
          'Priority workflows include approvals, exception handling, and review checkpoints.',
          'Operational AI processes are standardized with monitoring and compliance evidence.',
          'AI-enabled operations run with robust controls, traceability, and continuous tuning.',
        ],
      },
    ],
  },
  retail: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'RET_BS_01',
        question_text:
          'How clearly is AI embedded in your retail strategy across stores, e-commerce, and merchandising?',
        options: [
          'AI is absent from store, digital, and merchandising strategy.',
          'AI is discussed, but no roadmap supports channels or categories.',
          'AI priorities exist for selected commerce or merchandising functions.',
          'AI strategy supports revenue, margin, and customer experience goals.',
          'AI is central to omnichannel growth, personalization, and operational performance.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'RET_BS_02',
        question_text:
          'How are AI investments prioritized across pricing, promotions, inventory, and customer engagement?',
        options: [
          'AI spending is not prioritized against retail outcomes.',
          'Teams run isolated pilots without margin or experience targets.',
          'Priority ideas are assessed for revenue, cost, and feasibility.',
          'AI investments follow a portfolio process across channels and categories.',
          'Funding is optimized continuously using demand, margin, and customer signals.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'RET_DR_01',
        question_text:
          'How ready are your POS, inventory, e-commerce, and loyalty data sources for AI use?',
        options: [
          'POS, inventory, and digital data remain fragmented and hard to access.',
          'Some retail data is integrated, but many teams rely on extracts.',
          'Priority datasets support selected forecasting or personalization use cases.',
          'Core commerce data is integrated and governed across major channels.',
          'Trusted retail data products feed AI decisions across stores and digital.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'RET_DR_02',
        question_text:
          'How strong are your controls for product, customer, and inventory data quality?',
        options: [
          'Data quality issues regularly disrupt reporting and planning decisions.',
          'Teams fix data issues manually after they affect stores or sites.',
          'Important retail datasets have checks, owners, and remediation steps.',
          'Quality controls monitor customer, product, and inventory data continuously.',
          'Automated controls maintain reliable data products for merchandising and AI.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'RET_TI_01',
        question_text:
          'How capable is your retail technology stack of deploying AI into store, web, and supply workflows?',
        options: [
          'Core retail systems cannot support AI deployment or integration.',
          'AI tools stay outside POS, e-commerce, and planning systems.',
          'Selected AI solutions integrate into priority commerce workflows.',
          'Most retail platforms support monitored AI deployment across channels.',
          'AI services connect natively to commerce, planning, and fulfillment platforms.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'RET_TS_01',
        question_text:
          'How prepared are merchandising, store, digital, and supply teams to use AI effectively?',
        options: [
          'Retail teams have no practical AI training or support.',
          'A few specialists experiment, but most teams lack confidence.',
          'Targeted training supports selected planners, merchandisers, and digital teams.',
          'Role-based AI learning reaches stores, merchandising, and operations teams.',
          'AI capability is embedded across commerce, analytics, and frontline operations.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'RET_UC_01',
        question_text:
          'How mature is your pipeline for selecting retail AI use cases such as pricing, demand forecasting, or personalization?',
        options: [
          'Use cases are not tied to concrete retail pain points.',
          'Ideas are collected informally without channel or category prioritization.',
          'Priority use cases are screened for value, feasibility, and data readiness.',
          'A repeatable intake process ranks AI opportunities across retail functions.',
          'Use case selection is data-driven across customers, products, and operations.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'RET_OR_01',
        question_text:
          'How ready are store, fulfillment, and merchandising workflows to operationalize AI recommendations?',
        options: [
          'Retail workflows are not prepared to act on AI recommendations.',
          'Some workflows are documented, but adoption depends on manual effort.',
          'Priority workflows define ownership, review, and exception handling.',
          'Operational processes support monitored AI adoption across major workflows.',
          'AI is embedded in retail operations with feedback loops and continuous improvement.',
        ],
      },
    ],
  },
  manufacturing: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'MFG_BS_01',
        question_text:
          'How clearly is AI embedded in your manufacturing strategy across production, quality, and maintenance?',
        options: [
          'AI is absent from plant, quality, and maintenance strategy.',
          'AI is discussed, but no roadmap supports operations or engineering.',
          'AI priorities exist for selected lines, plants, or business units.',
          'AI strategy supports throughput, quality, and cost objectives.',
          'AI is a strategic lever across production, supply, and product performance.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'MFG_BS_02',
        question_text:
          'How are AI investments prioritized across production efficiency, downtime, and defect reduction?',
        options: [
          'AI spending is not prioritized against manufacturing outcomes.',
          'Plants propose pilots without shared value or risk criteria.',
          'Priority ideas are assessed for throughput, quality, and feasibility.',
          'AI investments follow a portfolio process across plants and functions.',
          'Funding is optimized using production, reliability, and margin performance data.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'MFG_DR_01',
        question_text:
          'How ready are your MES, ERP, sensor, and quality data sources for AI use?',
        options: [
          'Plant, sensor, and quality data is fragmented and mostly inaccessible.',
          'Some data is digital, but integration across plants is weak.',
          'Priority datasets support selected predictive or quality use cases.',
          'Core operational data is integrated and governed across major sites.',
          'Trusted industrial data products support AI across production and supply chains.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'MFG_DR_02',
        question_text:
          'How strong are your controls for equipment, process, and quality data quality?',
        options: [
          'Data quality problems are common and discovered after operational impact.',
          'Teams correct quality issues manually with limited tracking.',
          'Important datasets have quality checks, owners, and remediation plans.',
          'Quality controls monitor process, equipment, and defect data routinely.',
          'Automated controls maintain reliable operational data for AI at scale.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'MFG_TI_01',
        question_text:
          'How capable is your manufacturing technology stack of deploying AI into plants and operations?',
        options: [
          'Plant systems cannot support AI deployment or data integration.',
          'AI tools run separately from operational systems and controls.',
          'Selected AI solutions connect to priority plant workflows.',
          'Most operational platforms support monitored AI deployment securely.',
          'AI integrates across plants, edge systems, and enterprise platforms with resilience.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'MFG_TS_01',
        question_text:
          'How prepared are engineers, operators, and planners to use AI in manufacturing workflows?',
        options: [
          'Operations teams have no AI training or practical support.',
          'A few engineers experiment, but frontline adoption is minimal.',
          'Targeted training supports selected engineering and operations teams.',
          'Role-based AI learning reaches operators, planners, and engineers.',
          'AI capability is embedded across operations, engineering, and quality roles.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'MFG_UC_01',
        question_text:
          'How mature is your process for selecting manufacturing AI use cases such as predictive maintenance or quality inspection?',
        options: [
          'Use cases are not tied to production or quality bottlenecks.',
          'Ideas are informal and not ranked by plant value or feasibility.',
          'Priority use cases are screened for impact, readiness, and plant fit.',
          'A repeatable process ranks AI opportunities across operations and supply.',
          'Use case selection is data-driven and aligned to enterprise manufacturing goals.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'MFG_OR_01',
        question_text:
          'How ready are plant workflows to operationalize AI with maintenance, quality, and safety controls?',
        options: [
          'Plant workflows cannot safely absorb AI-driven recommendations.',
          'Some workflows are documented, but controls and escalation are limited.',
          'Priority workflows define review, approvals, and exception handling.',
          'Operational AI processes are standardized with monitoring across plants.',
          'AI is operationalized with strong safety, quality, and improvement loops.',
        ],
      },
    ],
  },
  technology: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'TECH_BS_01',
        question_text:
          'How clearly is AI embedded in your technology or SaaS strategy across product, growth, and operations?',
        options: [
          'AI is absent from product, platform, and go-to-market strategy.',
          'AI is discussed, but no roadmap links it to product outcomes.',
          'AI priorities exist for selected products or internal functions.',
          'AI strategy supports differentiation, revenue, and platform efficiency goals.',
          'AI is core to product strategy, operations, and market positioning.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'TECH_BS_02',
        question_text:
          'How are AI investments prioritized across product features, developer efficiency, and customer value?',
        options: [
          'AI investments are not prioritized against product or operational outcomes.',
          'Teams fund experiments without product strategy or ROI discipline.',
          'Priority ideas are assessed for value, feasibility, and product fit.',
          'AI investments follow a portfolio process across product and platform teams.',
          'Funding is optimized continuously using adoption, margin, and platform signals.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'TECH_DR_01',
        question_text:
          'How ready are your product, usage, support, and telemetry data sources for AI use?',
        options: [
          'Product and customer data is siloed and hard to use reliably.',
          'Some data is captured, but integration is incomplete and manual.',
          'Priority datasets support selected AI product or internal use cases.',
          'Core product and customer data is governed and broadly accessible.',
          'Trusted data products feed AI features and operations in near real time.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'TECH_DR_02',
        question_text:
          'How strong are your controls for data quality, lineage, and tenant-safe AI usage?',
        options: [
          'Data quality, lineage, and tenant controls are poorly defined.',
          'Controls exist in parts of the stack, but enforcement is inconsistent.',
          'Important datasets have owners, checks, and tenant-safe review steps.',
          'Quality, lineage, and access controls are monitored across core data flows.',
          'Automated controls enforce tenant safety and trusted AI-ready data products.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'TECH_TI_01',
        question_text:
          'How capable is your engineering platform of deploying, monitoring, and scaling AI features?',
        options: [
          'Our platform cannot reliably deploy or monitor AI features.',
          'AI features run as isolated experiments with weak observability.',
          'Selected AI services deploy through supported engineering workflows.',
          'Most AI features use standardized deployment, monitoring, and rollback patterns.',
          'AI runs on mature platform tooling with strong reliability and governance controls.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'TECH_TS_01',
        question_text:
          'How prepared are product, engineering, support, and go-to-market teams to work with AI?',
        options: [
          'Teams have little practical AI knowledge beyond general awareness.',
          'A few specialists lead experiments, but broader capability is limited.',
          'Targeted training supports selected product and engineering teams.',
          'Role-based learning reaches engineering, product, support, and sales teams.',
          'AI capability is embedded across product delivery, operations, and customer teams.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'TECH_UC_01',
        question_text:
          'How mature is your process for selecting AI use cases such as copilots, support automation, or product intelligence?',
        options: [
          'Use cases are not tied to user needs or product strategy.',
          'Ideas are collected informally without prioritization criteria.',
          'Priority use cases are screened for value, feasibility, and guardrails.',
          'A repeatable process ranks AI opportunities across product and operations.',
          'Use case selection is dynamic and aligned to product and company strategy.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'TECH_OR_01',
        question_text:
          'How ready are your product and support operations to manage AI features after launch?',
        options: [
          'Operations lack processes to monitor or support AI-powered features.',
          'Some launch steps exist, but issue handling is inconsistent.',
          'Priority AI launches include support, monitoring, and escalation plans.',
          'Operational processes support reliable AI rollout and post-launch tuning.',
          'AI operations are mature with continuous monitoring, feedback, and optimization.',
        ],
      },
    ],
  },
  education: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'EDU_BS_01',
        question_text:
          'How clearly is AI embedded in your education strategy across teaching, student services, and administration?',
        options: [
          'AI is absent from academic and administrative strategy.',
          'AI is discussed, but no roadmap supports educators or learners.',
          'AI priorities exist for selected programs or support functions.',
          'AI strategy supports learning outcomes, retention, and operational efficiency.',
          'AI is central to instructional, student, and institutional strategy.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'EDU_BS_02',
        question_text:
          'How are AI investments prioritized across instruction, student support, and institutional operations?',
        options: [
          'AI investments are not prioritized against educational outcomes.',
          'Teams run pilots without learner impact or governance criteria.',
          'Priority ideas are assessed for value, feasibility, and student impact.',
          'AI investments follow a portfolio process across academic and operations teams.',
          'Funding is optimized using learning, retention, and operational performance data.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'EDU_DR_01',
        question_text:
          'How ready are your LMS, SIS, assessment, and student support data sources for AI use?',
        options: [
          'Student and learning data is fragmented and difficult to access.',
          'Some data is digital, but integration is limited and manual.',
          'Priority datasets support selected advising or learning use cases.',
          'Core student and learning data is governed and broadly accessible.',
          'Trusted education data products support AI across learning and operations.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'EDU_DR_02',
        question_text:
          'How strong are your controls for student data quality, privacy, and appropriate AI use?',
        options: [
          'Student data quality and privacy controls are weak or undefined.',
          'Policies exist, but enforcement is inconsistent across systems.',
          'Important datasets have owners, checks, and privacy review steps.',
          'Quality and privacy controls are monitored across core student data.',
          'Automated controls protect student data and trusted AI-ready workflows.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'EDU_TI_01',
        question_text:
          'How capable is your education technology stack of deploying AI into learning and student workflows?',
        options: [
          'Core education systems cannot support AI deployment or integration.',
          'AI tools run outside LMS, SIS, and support systems.',
          'Selected AI tools integrate with priority learning workflows.',
          'Most platforms support monitored AI deployment across education processes.',
          'AI integrates natively into learning, support, and administrative platforms.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'EDU_TS_01',
        question_text:
          'How prepared are educators, advisors, and administrators to use AI responsibly and effectively?',
        options: [
          'Staff have no practical AI training or guidance.',
          'A few innovators experiment, but capability is uneven.',
          'Targeted training supports selected faculty and operational teams.',
          'Role-based AI learning reaches teaching, advising, and admin roles.',
          'AI capability is embedded across instruction, student support, and operations.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'EDU_UC_01',
        question_text:
          'How mature is your process for selecting education AI use cases such as tutoring, advising, or workload automation?',
        options: [
          'Use cases are not tied to concrete learner or staff needs.',
          'Ideas are collected informally without educational prioritization.',
          'Priority use cases are screened for value, readiness, and safeguards.',
          'A repeatable process ranks AI opportunities across academic functions.',
          'Use case selection is data-driven and aligned to learner and institutional outcomes.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'EDU_OR_01',
        question_text:
          'How ready are teaching and student support workflows to operationalize AI with oversight and feedback loops?',
        options: [
          'Workflows are not prepared to adopt AI responsibly or consistently.',
          'Some workflows are documented, but oversight is limited.',
          'Priority workflows include approvals, review, and escalation paths.',
          'Operational AI processes are standardized across major education functions.',
          'AI is embedded with strong oversight, feedback, and continuous improvement.',
        ],
      },
    ],
  },
  government: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'GOV_BS_01',
        question_text:
          'How clearly is AI embedded in your public sector strategy across citizen services, operations, and policy delivery?',
        options: [
          'AI is absent from agency strategy and service planning.',
          'AI is discussed, but no roadmap supports mission or service outcomes.',
          'AI priorities exist for selected programs or operational functions.',
          'AI strategy supports service delivery, efficiency, and policy objectives.',
          'AI is central to mission delivery, public value, and operational performance.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'GOV_BS_02',
        question_text:
          'How are AI investments prioritized across citizen services, compliance, and operational efficiency?',
        options: [
          'AI investments are not prioritized against mission outcomes.',
          'Teams run pilots without shared value, risk, or procurement criteria.',
          'Priority ideas are assessed for impact, feasibility, and oversight needs.',
          'AI investments follow a portfolio process across programs and functions.',
          'Funding is optimized using service, cost, and risk data across the agency.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'GOV_DR_01',
        question_text:
          'How ready are your case, records, benefits, and citizen service data sources for AI use?',
        options: [
          'Agency data is fragmented across systems and manual records.',
          'Some program data is digital, but access is slow and inconsistent.',
          'Priority datasets support selected analytics or automation use cases.',
          'Core agency data is governed and accessible for approved AI work.',
          'Trusted public sector data products support mission AI use across programs.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'GOV_DR_02',
        question_text:
          'How strong are your controls for data quality, privacy, and records management in AI use?',
        options: [
          'Data quality and privacy controls are weak or undefined.',
          'Policies exist, but enforcement varies across departments or vendors.',
          'Important datasets have owners, checks, and records requirements.',
          'Quality, privacy, and records controls are monitored across core data.',
          'Automated controls enforce quality, privacy, retention, and auditability.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'GOV_TI_01',
        question_text:
          'How capable is your government technology stack of deploying AI into mission and service workflows?',
        options: [
          'Legacy systems cannot support AI deployment or integration.',
          'AI tools operate separately from core agency workflows.',
          'Selected AI tools integrate with priority service or back-office systems.',
          'Most critical platforms support monitored AI deployment with controls.',
          'AI integrates into agency platforms with strong security, observability, and resilience.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'GOV_TS_01',
        question_text:
          'How prepared are policy, service, operations, and IT teams to use AI responsibly?',
        options: [
          'Agency teams have no practical AI training or support.',
          'A few specialists experiment, but most teams lack capability.',
          'Targeted training supports selected program and technical teams.',
          'Role-based AI learning reaches service, policy, and operational teams.',
          'AI capability is embedded across mission, operations, and technical roles.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'GOV_UC_01',
        question_text:
          'How mature is your process for selecting public sector AI use cases such as case triage or service automation?',
        options: [
          'Use cases are not tied to mission or citizen service priorities.',
          'Ideas are informal and not screened for impact or oversight.',
          'Priority use cases are screened for value, feasibility, and safeguards.',
          'A repeatable process ranks AI opportunities across programs and operations.',
          'Use case selection is data-driven and aligned to mission outcomes and trust.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'GOV_OR_01',
        question_text:
          'How ready are your agency workflows to operationalize AI with human review, audit trails, and accountability?',
        options: [
          'Agency workflows lack controls for AI-supported actions or decisions.',
          'Some workflows are documented, but review and accountability are uneven.',
          'Priority workflows define approvals, review, and exception handling.',
          'Operational AI processes are standardized with monitoring and audit records.',
          'AI is operationalized with strong accountability, transparency, and improvement loops.',
        ],
      },
    ],
  },
  logistics: {
    questions: [
      {
        dimension: 'businessStrategy',
        question_id: 'LOG_BS_01',
        question_text:
          'How clearly is AI embedded in your logistics strategy across planning, warehousing, and delivery operations?',
        options: [
          'AI is absent from logistics strategy and network planning.',
          'AI is discussed, but no roadmap supports transport or warehouse outcomes.',
          'AI priorities exist for selected logistics or supply functions.',
          'AI strategy supports service, cost, and network performance goals.',
          'AI is central to planning, fulfillment, and delivery competitiveness.',
        ],
      },
      {
        dimension: 'businessStrategy',
        question_id: 'LOG_BS_02',
        question_text:
          'How are AI investments prioritized across routing, capacity, warehouse efficiency, and service levels?',
        options: [
          'AI investments are not prioritized against logistics outcomes.',
          'Teams run isolated pilots without network or service criteria.',
          'Priority ideas are assessed for service, cost, and feasibility.',
          'AI investments follow a portfolio process across logistics operations.',
          'Funding is optimized using network, cost, and customer performance data.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'LOG_DR_01',
        question_text:
          'How ready are your TMS, WMS, fleet, and shipment data sources for AI use?',
        options: [
          'Transport, warehouse, and shipment data is fragmented and delayed.',
          'Some logistics data is digital, but integration is inconsistent.',
          'Priority datasets support selected routing or forecasting use cases.',
          'Core logistics data is governed and accessible across major workflows.',
          'Trusted logistics data products support AI across network and fulfillment operations.',
        ],
      },
      {
        dimension: 'dataReadiness',
        question_id: 'LOG_DR_02',
        question_text:
          'How strong are your controls for shipment, inventory, and carrier data quality?',
        options: [
          'Data quality issues frequently disrupt planning and execution.',
          'Teams fix data issues manually after service failures occur.',
          'Important datasets have checks, owners, and remediation steps.',
          'Quality controls monitor carrier, shipment, and warehouse data routinely.',
          'Automated controls maintain reliable logistics data for AI-driven operations.',
        ],
      },
      {
        dimension: 'technologyInfrastructure',
        question_id: 'LOG_TI_01',
        question_text:
          'How capable is your logistics technology stack of deploying AI into routing, warehouse, and delivery workflows?',
        options: [
          'Core logistics systems cannot support AI deployment or integration.',
          'AI tools run outside TMS, WMS, and dispatch workflows.',
          'Selected AI tools integrate with priority logistics systems.',
          'Most platforms support monitored AI deployment across logistics operations.',
          'AI integrates natively into network planning, warehousing, and delivery platforms.',
        ],
      },
      {
        dimension: 'talentSkills',
        question_id: 'LOG_TS_01',
        question_text:
          'How prepared are planners, warehouse teams, dispatchers, and analysts to use AI tools?',
        options: [
          'Logistics teams have no practical AI training or guidance.',
          'A few specialists experiment, but frontline use is limited.',
          'Targeted training supports selected planners and operational teams.',
          'Role-based AI learning reaches warehousing, transport, and analytics teams.',
          'AI capability is embedded across planning, fulfillment, and delivery roles.',
        ],
      },
      {
        dimension: 'useCaseReadiness',
        question_id: 'LOG_UC_01',
        question_text:
          'How mature is your process for selecting logistics AI use cases such as routing, ETA prediction, or warehouse optimization?',
        options: [
          'Use cases are not tied to logistics bottlenecks or service goals.',
          'Ideas are gathered informally without network prioritization.',
          'Priority use cases are screened for impact, readiness, and feasibility.',
          'A repeatable process ranks AI opportunities across logistics workflows.',
          'Use case selection is data-driven and aligned to network strategy and service.',
        ],
      },
      {
        dimension: 'operationalReadiness',
        question_id: 'LOG_OR_01',
        question_text:
          'How ready are your logistics workflows to operationalize AI with dispatch, exception, and service controls?',
        options: [
          'Operational workflows cannot reliably act on AI recommendations.',
          'Some workflows are documented, but exception handling is weak.',
          'Priority workflows define ownership, review, and escalation steps.',
          'Operational AI processes are standardized with monitoring across logistics teams.',
          'AI is embedded with strong control loops across planning and execution.',
        ],
      },
    ],
  },
}

const INDUSTRY_SPECIFIC_QUESTIONS = Object.entries(
  INDUSTRY_QUESTION_DEFINITIONS
).flatMap(([industrySlug, config]) =>
  config.questions.map((question, index) =>
    makeQuestion({
      ...question,
      scope: 'industry',
      sort_order: index + 1,
      industries: [industrySlug],
      options: question.options.map((text, optionIndex) =>
        makeOption(optionIndex + 1, String.fromCharCode(65 + optionIndex), text)
      ),
    })
  )
)

const QUESTIONS = [...GLOBAL_QUESTIONS, ...INDUSTRY_SPECIFIC_QUESTIONS]

async function upsertIndustries() {
  const { error } = await supabase.from('industries').upsert(INDUSTRIES, {
    onConflict: 'slug',
  })

  if (error) {
    throw error
  }
}

async function upsertQuestions() {
  const { error } = await supabase.from('questions').upsert(QUESTIONS, {
    onConflict: 'question_id',
  })

  if (error) {
    throw error
  }
}

async function logCounts() {
  const [
    { count: industryCount, error: industryError },
    { count: questionCount, error: questionError },
  ] = await Promise.all([
    supabase.from('industries').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
  ])

  if (industryError) {
    throw industryError
  }

  if (questionError) {
    throw questionError
  }

  console.log(`Industries seeded: ${INDUSTRIES.length}`)
  console.log(`Questions seeded this run: ${QUESTIONS.length}`)
  console.log(`Global questions: ${GLOBAL_QUESTIONS.length}`)
  console.log(`Industry questions: ${INDUSTRY_SPECIFIC_QUESTIONS.length}`)
  console.log(`Industries in database: ${industryCount ?? 'unknown'}`)
  console.log(`Questions in database: ${questionCount ?? 'unknown'}`)
}

async function main() {
  console.log('Upserting industries...')
  await upsertIndustries()
  console.log('Upserting questions...')
  await upsertQuestions()
  console.log('Logging final counts...')
  await logCounts()
}

main()
  .then(() => {
    console.log('Seed completed successfully.')
  })
  .catch((error) => {
    console.error('Seed failed.')
    console.error(error)
    process.exit(1)
  })
