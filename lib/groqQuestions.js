import Groq from 'groq-sdk'
import { DIMENSION_LABELS, DIMENSION_ORDER } from '@/constants/dimensions'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

const SYSTEM_PROMPT = `You are an expert AI assessment architect. Generate medium-length, plain-language assessment questions for an AI Maturity Framework.

FRAMEWORK DIMENSIONS:
  businessStrategy        - weight 20% - Leadership alignment, AI budget, ROI tracking
  dataReadiness           - weight 20% - Data quality, accessibility, governance
  technologyInfrastructure - weight 15% - Cloud, system integration, ML compute
  talentSkills            - weight 15% - AI expertise, data literacy, upskilling
  useCaseReadiness        - weight 10% - Identified AI applications, feasibility
  operationalReadiness    - weight 10% - Process digitization, automation, change mgmt
  aiGovernance            - weight 10% - Ethics policies, compliance, model monitoring

TASK: Generate exactly 16 questions for the industry and org size provided.

DIMENSION ALLOCATION:
  EVERY dimension must have AT LEAST 2 questions. Maximum is 5. Total must equal exactly 16.
  No dimension may be skipped or receive only 1 question — this is a hard constraint.
  Prioritize dimensions most relevant by industry.

ORG SIZE CALIBRATION:
  - 1-50: practical, near-term, no enterprise jargon
  - 51-200: mid-market balance
  - 201-1000: department-level context
  - 1000+: enterprise governance and center of excellence concepts

CRITICAL WRITING RULES — READ CAREFULLY:
  1. Question text: 8 to 15 words maximum. Start with How, Does, or Have you.
  2. Each question asks about ONE specific thing only.
  3. Option text: 8 to 15 words maximum. No more. Count the words.
  4. Option A: always describes complete absence. Start with "No" or "We have no".
  5. Options B through D: each one clearly better than the previous.
  6. Option E: describes a specific, mature capability. Not just "everything is perfect".
  7. NEVER use: somewhat, fairly, quite, pretty, slightly, rather.
  8. NEVER write long sentences. If you are writing more than 15 words for any option, stop and shorten it.
  9. Each option must be a standalone statement. Do not reference other options.
  10. Use industry-specific terminology naturally — do not force it into every sentence.

STYLE EXAMPLES — YOUR OUTPUT MUST MATCH THIS STYLE AND LENGTH:

  businessStrategy:
    Q: "How does senior leadership view AI investment?"
    A: No budget or interest in AI exists at leadership level
    B: Leadership is curious but has not committed any budget
    C: Leadership has approved a small budget for AI pilots
    D: AI investment is part of the annual budget with clear KPIs
    E: AI is a board-level priority with dedicated long-term funding

  dataReadiness:
    Q: "How would you describe the state of your data?"
    A: Data is scattered across spreadsheets with no central access
    B: Some data is centralized but most lives in silos
    C: Key data is in a central warehouse used for reporting
    D: Data is governed, accessible, and trusted across teams
    E: A real-time data platform with strong governance is in place

  technologyInfrastructure:
    Q: "What best describes your use of cloud computing?"
    A: We run everything on physical on-premises servers
    B: We use some cloud tools but core systems are on-premises
    C: We are actively migrating key systems to the cloud
    D: Most systems and data are cloud-based
    E: We operate a fully cloud-native environment with ML infrastructure

  talentSkills:
    Q: "Does your team include AI or data science skills?"
    A: No one has AI or data science skills
    B: A few people have basic data analysis skills only
    C: We have hired or are hiring data analysts or scientists
    D: A dedicated data science or AI team exists and is active
    E: A mature AI team operates across multiple business functions

  useCaseReadiness:
    Q: "Has your organization identified AI use cases?"
    A: We have not thought about where AI could apply
    B: We have vague ideas but nothing documented
    C: We have identified two or three specific use cases
    D: Multiple prioritized use cases have documented business value
    E: An active AI portfolio delivers measurable ROI across functions

  operationalReadiness:
    Q: "How digitized are your core business processes?"
    A: Most processes are manual and paper-based
    B: Some processes are digital but many are still manual
    C: Core processes use software to manage key workflows
    D: Most processes are digital and some are automated
    E: End-to-end automation with AI-powered workflows is standard

  aiGovernance:
    Q: "Does your organization have AI ethics policies?"
    A: We have no policies on AI ethics or governance
    B: We know we need policies but have not written any
    C: Basic guidelines exist such as data privacy rules
    D: Formal AI policies cover ethics, bias, and transparency
    E: A full AI governance framework is enforced with regular audits

REMEMBER: Count your words. Question text must be 8-15 words. Option text must be 8-15 words. Hard limits.

OUTPUT FORMAT — return ONLY this JSON, no markdown, no explanation:
{
  "dimensionAllocation": {
    "businessStrategy": <integer 2-5>,
    "dataReadiness": <integer 2-5>,
    "technologyInfrastructure": <integer 2-5>,
    "talentSkills": <integer 2-5>,
    "useCaseReadiness": <integer 2-5>,
    "operationalReadiness": <integer 2-5>,
    "aiGovernance": <integer 2-5>
  },
  "allocationRationale": "<one sentence>",
  "questions": [
    {
      "id": "Q01",
      "dimension": "<dimension key>",
      "dimensionLabel": "<human readable label>",
      "order": 1,
      "questionText": "<8 to 15 words>",
      "options": [
        { "score": 1, "label": "A", "text": "<8 to 15 words>" },
        { "score": 2, "label": "B", "text": "<8 to 15 words>" },
        { "score": 3, "label": "C", "text": "<8 to 15 words>" },
        { "score": 4, "label": "D", "text": "<8 to 15 words>" },
        { "score": 5, "label": "E", "text": "<8 to 15 words>" }
      ]
    }
  ]
}
Order: businessStrategy, dataReadiness, technologyInfrastructure, talentSkills, useCaseReadiness, operationalReadiness, aiGovernance.
Exactly 16 questions. Return ONLY JSON.`

function stripMarkdownFences(value) {
  return String(value || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function wordCount(str) {
  return String(str || '').trim().split(/\s+/).filter(Boolean).length
}

const EXPECTED_DIMENSIONS = [
  'businessStrategy',
  'dataReadiness',
  'technologyInfrastructure',
  'talentSkills',
  'useCaseReadiness',
  'operationalReadiness',
  'aiGovernance',
]

const INDUSTRY_PRIORITIES = {
  'Healthcare': ['dataReadiness', 'aiGovernance'],
  'Finance': ['aiGovernance', 'technologyInfrastructure'],
  'Retail': ['useCaseReadiness', 'operationalReadiness'],
  'Manufacturing': ['technologyInfrastructure', 'operationalReadiness'],
  'Technology/SaaS': ['technologyInfrastructure', 'talentSkills'],
  'Education': ['operationalReadiness', 'useCaseReadiness'],
  'Government': ['aiGovernance', 'dataReadiness'],
  'Logistics': ['operationalReadiness', 'technologyInfrastructure'],
}

function calculateAllocation(industryLabel) {
  const priorities = INDUSTRY_PRIORITIES[industryLabel] || ['businessStrategy', 'dataReadiness']
  const allocation = {}
  
  for (const dim of EXPECTED_DIMENSIONS) {
    allocation[dim] = 2
  }
  
  for (const priority of priorities) {
    if (allocation[priority]) {
      allocation[priority] += 1
    }
  }
  
  return allocation
}

function validateQuestionPayload(parsed, expectedAllocation) {
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== 16) {
    throw new Error(`Expected 16 questions, got ${parsed.questions?.length ?? 0}`)
  }

  const actualCounts = {}
  for (const q of parsed.questions) {
    if (!q.dimension) throw new Error(`Question ${q.id} is missing a dimension`)
    actualCounts[q.dimension] = (actualCounts[q.dimension] || 0) + 1
  }

  parsed.dimensionAllocation = actualCounts

  for (const dim of EXPECTED_DIMENSIONS) {
    const count = actualCounts[dim] || 0
    const expected = expectedAllocation[dim]
    if (count !== expected) {
      throw new Error(`Dimension ${dim} has ${count} questions, but expected exactly ${expected}`)
    }
  }

  for (const q of parsed.questions) {
    if (!Array.isArray(q.options) || q.options.length !== 5) {
      throw new Error(`Question ${q.id} has ${q.options?.length ?? 0} options, expected 5`)
    }
    const scores = q.options.map((o) => o.score).join(',')
    if (scores !== '1,2,3,4,5') {
      throw new Error(`Question ${q.id} has wrong option scores: ${scores}`)
    }
  }

  for (const q of parsed.questions) {
    if (wordCount(q.questionText) > 22) {
      throw new Error(`Question ${q.id} text too long: "${q.questionText}"`)
    }
    for (const o of q.options) {
      if (wordCount(o.text) > 22) {
        throw new Error(`Question ${q.id} option ${o.label} too long: "${o.text}"`)
      }
    }
  }
}

async function requestQuestions(industryLabel, orgSize, companyName, temperature) {
  if (!groq) {
    throw new Error('GROQ_API_KEY is not configured in environment')
  }

  const start = Date.now()
  const allocation = calculateAllocation(industryLabel)
  const allocationString = Object.entries(allocation)
    .map(([dim, count]) => `- ${dim}: ${count} questions`)
    .join('\n')

  const userMessage = [
    `Industry: ${industryLabel}`,
    `Organization size: ${orgSize}`,
    companyName ? `Company: ${companyName}` : null,
    '\nREQUIRED ALLOCATION:',
    allocationString,
    '\nTask: Generate exactly 16 questions following this exact count per dimension.',
  ]
    .filter(Boolean)
    .join('\n')

  console.log(`[Groq] Requesting questions (temp: ${temperature})...`)
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: userMessage },
    ],
  })

  const end = Date.now()
  console.log(`[Groq] Response received in ${end - start}ms`)

  const rawContent = response.choices?.[0]?.message?.content || ''

  let parsed
  try {
    parsed = JSON.parse(stripMarkdownFences(rawContent))
  } catch {
    throw new Error('Groq returned invalid JSON')
  }

  validateQuestionPayload(parsed, allocation)

  return {
    dimensionAllocation: parsed.dimensionAllocation,
    allocationRationale: parsed.allocationRationale,
    questions:           parsed.questions,
  }
}

export async function generateQuestions(industryLabel, orgSize, companyName) {
  try {
    return await requestQuestions(industryLabel, orgSize, companyName, 0.6)
  } catch (firstError) {
    console.error('[groqQuestions] Attempt 1 failed:', firstError.message)
  }

  try {
    return await requestQuestions(industryLabel, orgSize, companyName, 0.3)
  } catch (secondError) {
    console.error('[groqQuestions] Attempt 2 failed:', secondError.message)
    throw new Error(
      `Question generation failed after two attempts: ${secondError.message}`
    )
  }
}
