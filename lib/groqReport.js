import Groq from 'groq-sdk'

import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
} from '@/constants/dimensions'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

function roundToTwo(value) {
  return Math.round(Number(value || 0) * 100) / 100
}

function stripMarkdownFences(value) {
  return String(value || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function getSortedDimensions(dimensionScores = {}) {
  return [...DIMENSION_ORDER]
    .filter((dimension) => typeof dimensionScores[dimension] === 'number')
    .sort((left, right) => dimensionScores[right] - dimensionScores[left])
}

function buildDimensionTable(dimensionScores = {}) {
  const header = '| Dimension | Score | Weight |\n| --- | ---: | ---: |'
  const rows = DIMENSION_ORDER.map((dimension) => {
    const score = roundToTwo(dimensionScores[dimension] ?? 0).toFixed(2)
    const weight = `${Math.round((DIMENSION_WEIGHTS[dimension] || 0) * 100)}%`
    return `| ${DIMENSION_LABELS[dimension]} | ${score} | ${weight} |`
  })

  return [header, ...rows].join('\n')
}

function buildWeightedCalculation(dimensionScores = {}) {
  const parts = DIMENSION_ORDER.map((dimension) => {
    const score = roundToTwo(dimensionScores[dimension] ?? 0).toFixed(2)
    const weight = DIMENSION_WEIGHTS[dimension] || 0
    const weightedValue = roundToTwo(
      (dimensionScores[dimension] ?? 0) * weight
    ).toFixed(2)

    return `${DIMENSION_LABELS[dimension]}: ${score} x ${weight.toFixed(2)} = ${weightedValue}`
  })

  return parts.join('\n')
}

function buildQuestionAnswerPairs(answers = {}, questions = []) {
  const questionMap = new Map(
    questions.map((question) => [String(question.question_id || question.id), question])
  )

  return Object.entries(answers)
    .map(([questionId, selectedScore]) => {
      const question = questionMap.get(String(questionId))

      if (!question) {
        return `- ${questionId}: selected score ${selectedScore}, but question metadata was not provided.`
      }

      const selectedOption = (question.options || []).find(
        (option) => Number(option.score) === Number(selectedScore)
      )

      return [
        `- ${questionId}`,
        `  Dimension: ${DIMENSION_LABELS[question.dimension] || question.dimension}`,
        `  Question: ${question.question_text}`,
        `  Selected score: ${selectedScore}`,
        `  Selected answer: ${selectedOption ? selectedOption.text : 'Option text unavailable'}`,
      ].join('\n')
    })
    .join('\n')
}

function buildFallbackReport(params) {
  const sortedDimensions = getSortedDimensions(params.dimensionScores)
  const strongest = sortedDimensions.slice(0, 3)
  const weakest = [...sortedDimensions]
    .reverse()
    .slice(0, 3)
    .sort(
      (left, right) =>
        (params.dimensionScores[left] || 0) - (params.dimensionScores[right] || 0)
    )

  return {
    executiveSummary: `${params.companyName || params.industryLabel} organization assessed at Level ${params.maturityLevel} (${params.maturityLabel}) with an adjusted overall score of ${roundToTwo(params.overallScore).toFixed(2)} and raw score of ${roundToTwo(params.rawOverallScore).toFixed(2)}.`,
    maturityNarrative:
      'The current profile indicates emerging but uneven AI capability across the organization. Teams have some foundations in place, but scaling will depend on closing the lowest-scoring capability gaps first. The assessed maturity level reflects both the weighted score and any blocker rule constraints. Near-term progress should focus on practical, controlled initiatives that fit current operating capacity. As capabilities stabilize, the organization can expand into broader transformation programs.',
    keyStrengths: strongest.map((dimension) => ({
      dimension,
      score: roundToTwo(params.dimensionScores[dimension]),
      headline: `${DIMENSION_LABELS[dimension]} is ahead of the broader maturity profile.`,
      insight: `This dimension scored ${roundToTwo(params.dimensionScores[dimension]).toFixed(2)}, making it one of the strongest foundations available for near-term execution.`,
    })),
    keyGaps: weakest.map((dimension) => ({
      dimension,
      score: roundToTwo(params.dimensionScores[dimension]),
      headline: `${DIMENSION_LABELS[dimension]} is limiting broader AI progress.`,
      risk: `A score of ${roundToTwo(params.dimensionScores[dimension]).toFixed(2)} indicates readiness gaps that may delay reliable scaling.`,
      isBlocker: params.blockerDimension === dimension,
    })),
    immediateOpportunities: [
      {
        title: `Prioritize one ${params.industryLabel} AI use case with clear ownership`,
        description:
          'Choose a practical, low-complexity initiative tied to a measurable operational or customer outcome.',
        timeframe: '30-60 days',
        estimatedImpact: 'Creates a credible path from assessment to execution.',
        prerequisite: 'Confirm business owner, data source, and success metric.',
      },
      {
        title: 'Stabilize the lowest-scoring capability dimension',
        description:
          'Address the weakest readiness area with a focused improvement plan before expanding scope.',
        timeframe: '30-90 days',
        estimatedImpact: 'Reduces delivery risk and improves scale readiness.',
        prerequisite: params.blockerDimension
          ? `Resolve key issues in ${DIMENSION_LABELS[params.blockerDimension]}.`
          : 'Name accountable leads and define remediation milestones.',
      },
      {
        title: 'Create a simple governance and review cadence',
        description:
          'Set a monthly review covering outcomes, risks, data quality, and adoption progress.',
        timeframe: 'Immediately',
        estimatedImpact: 'Improves consistency and prevents unmanaged experimentation.',
        prerequisite: 'Identify executive sponsor and cross-functional reviewers.',
      },
    ],
    risksAndBlockers: [
      {
        severity: params.blockerDimension ? 'high' : 'medium',
        risk: params.blockerDimension
          ? `${DIMENSION_LABELS[params.blockerDimension]} is below the blocker threshold, capping overall maturity.`
          : 'Uneven capability growth could create execution drag during scaling.',
        mitigation: params.blockerDimension
          ? `Launch a 30-60 day remediation plan for ${DIMENSION_LABELS[params.blockerDimension]} with named owners and weekly checkpoints.`
          : 'Review weakest dimensions monthly and set corrective actions before broad rollout.',
        triggersDimension: params.blockerDimension,
      },
      {
        severity: 'medium',
        risk: 'AI efforts may stall if governance, operations, and business ownership evolve at different speeds.',
        mitigation:
          'Set a 60-day operating cadence for prioritization, controls, and post-launch review.',
        triggersDimension: params.unevenMaturity ? 'cross-functional' : null,
      },
    ],
    roadmapRecommendation: `Focus the next 90 days on one high-value ${params.industryLabel.toLowerCase()} use case, remediation of the weakest readiness dimension, and a lightweight governance cadence. Reassess after initial execution data is available and expand only once adoption, controls, and delivery reliability are stable.`,
    blockerRuleTriggered: Boolean(params.blockerDimension),
    blockerDimension: params.blockerDimension,
    unevenMaturityWarning: Boolean(params.unevenMaturity),
    unevenMaturityNote: params.unevenMaturity
      ? 'Capability scores are spread widely, which suggests the organization may struggle to scale AI consistently.'
      : null,
  }
}

function buildSystemPrompt() {
  return `You are a senior AI strategy consultant advising organizations on AI maturity, sequencing, and execution risk.

Return a JSON object with EXACTLY these keys:
- executiveSummary
- maturityNarrative
- keyStrengths
- keyGaps
- immediateOpportunities
- risksAndBlockers
- roadmapRecommendation
- blockerRuleTriggered
- blockerDimension
- unevenMaturityWarning
- unevenMaturityNote

Rules:
- Return ONLY valid JSON with no markdown, explanation, or preamble.
- Every finding must reference actual numerical scores from the provided assessment context.
- Recommendations must be specific to the stated industry, organization size, and reported answers.
- Opportunities must be realistic for the current maturity level and not assume capabilities the organization lacks.
- Risks must include concrete mitigations with timeframes.
- If blockerDimension is provided, explicitly explain that the blocker rule capped maturity and treat it as non-negotiable.
- If uneven maturity is true, explain the operational consequences clearly.
- keyStrengths must be an array of exactly 3 objects: {dimension, score, headline, insight}.
- keyGaps must be an array of exactly 3 objects: {dimension, score, headline, risk, isBlocker}.
- immediateOpportunities must be an array of exactly 3 objects: {title, description, timeframe, estimatedImpact, prerequisite}.
- risksAndBlockers must be an array of 2 to 4 objects: {severity, risk, mitigation, triggersDimension}.
- executiveSummary must be 2-3 sentences and specific, not generic.
- maturityNarrative must be 4-6 sentences and explain what the maturity level means in practice.
- roadmapRecommendation must be 2-3 sentences and time-bound.`
}

function buildUserPrompt(params) {
  return `Organization profile:
- Company Name: ${params.companyName || 'Not provided'}
- Organization size: ${params.orgSize}
- Industry: ${params.industryLabel} (${params.industry})

Dimension scores:
${buildDimensionTable(params.dimensionScores)}

Weighted score calculation:
${buildWeightedCalculation(params.dimensionScores)}
Weighted score result: ${roundToTwo(params.rawOverallScore).toFixed(2)}
Adjusted overall score after blocker rule: ${roundToTwo(params.overallScore).toFixed(2)}
Maturity level: Level ${params.maturityLevel} - ${params.maturityLabel}

Blocker rule:
- Triggered: ${params.blockerDimension ? 'Yes' : 'No'}
- Blocker dimension: ${params.blockerDimension ? DIMENSION_LABELS[params.blockerDimension] : 'None'}

Uneven maturity:
- Detected: ${params.unevenMaturity ? 'Yes' : 'No'}

Individual question and answer pairs:
${buildQuestionAnswerPairs(params.answers, params.questions)}`
}

export async function generateGroqReport(params) {
  const fallbackReport = buildFallbackReport(params)

  if (!groq) {
    return fallbackReport
  }

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(),
        },
        {
          role: 'user',
          content: buildUserPrompt(params),
        },
      ],
    })

    const rawContent = response.choices?.[0]?.message?.content || ''

    try {
      return JSON.parse(rawContent)
    } catch {
      return JSON.parse(stripMarkdownFences(rawContent))
    }
  } catch {
    return fallbackReport
  }
}
