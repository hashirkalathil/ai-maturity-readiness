import Groq from 'groq-sdk'

import { DIMENSION_LABELS, DIMENSION_ORDER } from '@/constants/dimensions'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

const SYSTEM_PROMPT = `You are an expert AI assessment architect with deep knowledge of enterprise
AI adoption, digital transformation, and organizational readiness across all
industries. Your task is to generate a precise set of assessment questions
for an AI Maturity Framework evaluation.
 
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
  Allocate between 2 and 5 questions per dimension. Total must equal 16.
  Weight allocations toward dimensions most critical for the given industry:
  - Healthcare: more questions on dataReadiness and aiGovernance
  - Finance: more on aiGovernance and technologyInfrastructure
  - Retail: more on useCaseReadiness and operationalReadiness
  - Manufacturing: more on technologyInfrastructure and operationalReadiness
  - Technology/SaaS: more on technologyInfrastructure and talentSkills
  - Education: more on operationalReadiness and useCaseReadiness
  - Government: more on aiGovernance and dataReadiness
  - Logistics: more on operationalReadiness and technologyInfrastructure
 
ORG SIZE CALIBRATION:
  - 1-50: avoid enterprise concepts, focus on practical near-term barriers
  - 51-200: mid-market context, balance ambition with resource realism
  - 201-1000: department-level structures applicable
  - 1000+: include enterprise governance, center of excellence concepts
 
QUESTION RULES:
  1. Scenario-based: ask what the org IS DOING, not what they know
  2. Industry-specific: use real terminology of that industry
  3. Size-calibrated: Level 5 answers must be believable for the org size
  4. Concise question text: 15-25 words, no double-barreled questions
  5. Five clearly distinct answer options per question
 
ANSWER OPTION RULES (score 1-5):
  Score 1 (A): Completely absent - nothing exists, not considered
  Score 2 (B): Informal/ad-hoc - discussed but no formal process
  Score 3 (C): Defined but limited - formal process exists in at least one area
  Score 4 (D): Operational - formal, consistent, monitored across most areas
  Score 5 (E): Industry-leading - top 5% of orgs in this industry, fully mature
  Each option text: 15-30 words. Concrete behaviors, no vague qualifiers.
 
OUTPUT: Return ONLY valid JSON with this exact structure, no markdown, no preamble:
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
  "allocationRationale": "<1-2 sentences explaining the weighting>",
  "questions": [
    {
      "id": "Q01",
      "dimension": "<one of the 7 dimension keys>",
      "dimensionLabel": "<human readable label>",
      "order": 1,
      "questionText": "<15-25 words>",
      "options": [
        { "score": 1, "label": "A", "text": "<15-30 words>" },
        { "score": 2, "label": "B", "text": "<15-30 words>" },
        { "score": 3, "label": "C", "text": "<15-30 words>" },
        { "score": 4, "label": "D", "text": "<15-30 words>" },
        { "score": 5, "label": "E", "text": "<15-30 words>" }
      ]
    }
  ]
}
Group questions by dimension, ordered highest weight first:
businessStrategy -> dataReadiness -> technologyInfrastructure ->
talentSkills -> useCaseReadiness -> operationalReadiness -> aiGovernance
questions array must have exactly 16 items. Return ONLY JSON.`

const industryContexts = {
  healthcare: {
    label: 'Healthcare',
    nouns: 'patient care, EHR, clinical operations, compliance',
    extras: ['dataReadiness', 'aiGovernance'],
  },
  finance: {
    label: 'Finance',
    nouns: 'banking workflows, risk controls, financial data, compliance',
    extras: ['aiGovernance', 'technologyInfrastructure'],
  },
  retail: {
    label: 'Retail',
    nouns: 'e-commerce, merchandising, inventory, store operations',
    extras: ['useCaseReadiness', 'operationalReadiness'],
  },
  manufacturing: {
    label: 'Manufacturing',
    nouns: 'shop-floor systems, production data, maintenance, planning',
    extras: ['technologyInfrastructure', 'operationalReadiness'],
  },
  technology: {
    label: 'Technology',
    nouns: 'product analytics, engineering workflows, cloud platforms, support data',
    extras: ['technologyInfrastructure', 'talentSkills'],
  },
  education: {
    label: 'Education',
    nouns: 'student services, learning platforms, academic workflows, institutional data',
    extras: ['operationalReadiness', 'useCaseReadiness'],
  },
  government: {
    label: 'Government',
    nouns: 'public services, case management, records, regulatory oversight',
    extras: ['aiGovernance', 'dataReadiness'],
  },
  logistics: {
    label: 'Logistics',
    nouns: 'fleet operations, warehousing, routing, supply chain data',
    extras: ['operationalReadiness', 'technologyInfrastructure'],
  },
  generic: {
    label: 'Organization',
    nouns: 'core workflows, operational data, customer processes, compliance',
    extras: ['businessStrategy', 'dataReadiness'],
  },
}

const dimensionFocus = {
  businessStrategy: [
    'leadership priorities',
    'AI investment decisions',
    'business case discipline',
    'portfolio ownership',
  ],
  dataReadiness: [
    'data quality controls',
    'shared access to trusted data',
    'governance over key datasets',
    'data preparation for analytics',
  ],
  technologyInfrastructure: [
    'cloud and platform readiness',
    'system integration',
    'ML tooling support',
    'production deployment paths',
  ],
  talentSkills: [
    'AI literacy',
    'hands-on implementation skills',
    'cross-functional enablement',
    'operating support for teams',
  ],
  useCaseReadiness: [
    'prioritized use cases',
    'feasibility screening',
    'ownership for pilots',
    'value measurement plans',
  ],
  operationalReadiness: [
    'process standardization',
    'workflow digitization',
    'change management',
    'adoption readiness',
  ],
  aiGovernance: [
    'policy controls',
    'risk review',
    'monitoring practices',
    'approved operating guardrails',
  ],
}

const sizeProfiles = {
  '1-50': {
    level4: 'used consistently by a few core teams with simple review routines',
    level5: 'embedded in core operations with disciplined lightweight governance',
  },
  '51-200': {
    level4: 'used across major teams with shared operating standards',
    level5: 'scaled across functions with clear ownership and repeatable controls',
  },
  '201-1000': {
    level4: 'managed across departments with measurable outcomes and reviews',
    level5: 'scaled through formal governance, enablement, and operating playbooks',
  },
  '1000+': {
    level4: 'operationalized across business units with formal oversight',
    level5: 'run through enterprise governance, center-of-excellence support, and continuous monitoring',
  },
}

function stripMarkdownFences(value) {
  return String(value || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function slugifyIndustry(industryLabel) {
  return String(industryLabel || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getIndustryContext(industryLabel) {
  const slug = slugifyIndustry(industryLabel)

  if (slug.includes('health')) return industryContexts.healthcare
  if (slug.includes('fin')) return industryContexts.finance
  if (slug.includes('retail') || slug.includes('commerce')) return industryContexts.retail
  if (slug.includes('manufact')) return industryContexts.manufacturing
  if (slug.includes('tech') || slug.includes('saas') || slug.includes('software')) return industryContexts.technology
  if (slug.includes('educ')) return industryContexts.education
  if (slug.includes('govern') || slug.includes('public')) return industryContexts.government
  if (slug.includes('logistic') || slug.includes('supply') || slug.includes('warehouse')) return industryContexts.logistics

  return industryContexts.generic
}

function validateQuestionPayload(parsed) {
  const checks = [
    parsed.questions?.length === 16,
    Object.values(parsed.dimensionAllocation || {}).every((n) => n >= 2 && n <= 5),
    Object.values(parsed.dimensionAllocation || {}).reduce((a, b) => a + b, 0) === 16,
    parsed.questions?.every((q) => q.options?.length === 5),
    parsed.questions?.every(
      (q) => q.options.map((o) => o.score).join(',') === '1,2,3,4,5'
    ),
  ]

  if (checks.some((check) => !check)) {
    throw new Error('Invalid question structure from Groq')
  }
}

function buildAllocation(industryLabel) {
  const context = getIndustryContext(industryLabel)
  const allocation = Object.fromEntries(DIMENSION_ORDER.map((dimension) => [dimension, 2]))

  context.extras.forEach((dimension) => {
    allocation[dimension] += 1
  })

  return allocation
}

function buildOptionText(score, context, sizeProfile, focus) {
  const snippets = {
    1: `No defined approach exists for ${focus} in ${context.nouns}, and teams are not actively planning AI-enabled improvements.`,
    2: `${focus} is discussed informally in parts of the ${context.label.toLowerCase()} organization, but no repeatable process or owner exists.`,
    3: `A limited process supports ${focus} in one area, with early documentation and occasional review by responsible teams.`,
    4: `${focus} is ${sizeProfile.level4} and is tracked through regular operating reviews across most relevant workflows.`,
    5: `${focus} is ${sizeProfile.level5}, with measurable outcomes and disciplined improvement built into normal operations.`,
  }

  return snippets[score]
}

function buildFallbackQuestions(industryLabel, orgSize) {
  const context = getIndustryContext(industryLabel)
  const sizeProfile = sizeProfiles[orgSize] || sizeProfiles['51-200']
  const allocation = buildAllocation(industryLabel)
  const questions = []
  let order = 1

  DIMENSION_ORDER.forEach((dimension) => {
    const count = allocation[dimension]

    for (let index = 0; index < count; index += 1) {
      const focus = dimensionFocus[dimension][index % dimensionFocus[dimension].length]

      questions.push({
        id: `Q${String(order).padStart(2, '0')}`,
        dimension,
        dimensionLabel: DIMENSION_LABELS[dimension],
        order,
        questionText: `How consistently does your ${context.label.toLowerCase()} organization manage ${focus} across ${context.nouns}?`,
        options: [1, 2, 3, 4, 5].map((score, optionIndex) => ({
          score,
          label: ['A', 'B', 'C', 'D', 'E'][optionIndex],
          text: buildOptionText(score, context, sizeProfile, focus),
        })),
      })

      order += 1
    }
  })

  return {
    dimensionAllocation: allocation,
    allocationRationale: `This fallback assessment emphasizes ${context.extras.map((dimension) => DIMENSION_LABELS[dimension]).join(' and ')} because they are especially important in ${context.label.toLowerCase()} settings, while keeping complete coverage across all seven dimensions.`,
    questions,
  }
}

async function requestQuestions(industryLabel, orgSize, temperature) {
  if (!groq) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Generate assessment questions for Industry: ${industryLabel}, Organization size: ${orgSize}`,
      },
    ],
  })

  const rawContent = response.choices?.[0]?.message?.content || ''
  const parsed = JSON.parse(stripMarkdownFences(rawContent))
  validateQuestionPayload(parsed)

  return {
    dimensionAllocation: parsed.dimensionAllocation,
    allocationRationale: parsed.allocationRationale,
    questions: parsed.questions,
  }
}

export async function generateQuestions(industryLabel, orgSize) {
  try {
    return await requestQuestions(industryLabel, orgSize, 0.6)
  } catch {
    try {
      return await requestQuestions(industryLabel, orgSize, 0.4)
    } catch {
      return buildFallbackQuestions(industryLabel, orgSize)
    }
  }
}
