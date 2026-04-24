import { GoogleGenerativeAI } from '@google/generative-ai'
import { DIMENSION_ORDER, DIMENSION_LABELS } from './geminiQuestions'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

function stripMarkdownFences(value) {
  return String(value || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}


function buildAllocationPrompt(industryLabel, orgSize) {
  return `You are an expert AI maturity assessment architect. Allocate exactly 20 assessment questions across 7 dimensions based on organizational context.

DIMENSIONS:
${DIMENSION_ORDER.map(dim => `- ${DIMENSION_LABELS[dim]}`).join('\n')}

ORGANIZATION CONTEXT:
- Industry: ${industryLabel}
- Organization Size: ${orgSize}

RULES:
1. Total questions MUST be EXACTLY 20
2. Each dimension: 2-5 questions (minimum 2, maximum 5)
3. Allocate 4-5 questions to dimensions most critical for this industry
4. Allocate 2-3 questions to less critical dimensions
5. Larger orgs may benefit from more governance/compliance questions
6. Balance breadth and depth - cover all areas

RETURN ONLY JSON (no markdown, no explanation):
{
  "allocation": {
    "businessStrategy": <2-5>,
    "dataReadiness": <2-5>,
    "technologyInfrastructure": <2-5>,
    "talentSkills": <2-5>,
    "useCaseReadiness": <2-5>,
    "operationalReadiness": <2-5>,
    "aiGovernance": <2-5>
  },
  "rationale": "<2-3 sentence explanation of allocation>"
}`
}

async function requestAllocationFromAI(industryLabel, orgSize) {
  if (!genAI) {
    console.log('[allocate] GEMINI_API_KEY not configured')
    return null
  }

  try {
    console.log('[allocate] Requesting AI allocation for', industryLabel, orgSize)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    })

    const result = await model.generateContent(buildAllocationPrompt(industryLabel, orgSize))
    const response = await result.response
    const rawContent = response.text() || ''

    if (!rawContent) {
      console.error('[allocate] Empty response from AI')
      return null
    }

    console.log('[allocate] Parsing AI response')
    let parsed
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      const cleaned = stripMarkdownFences(rawContent)
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseErr) {
        console.error('[allocate] JSON parse failed. Cleaned string:', cleaned.substring(0, 300))
        throw parseErr
      }
    }

    if (!parsed.allocation || typeof parsed.allocation !== 'object') {
      console.error('[allocate] Invalid allocation object')
      return null
    }

    for (const dim of DIMENSION_ORDER) {
      const val = parsed.allocation[dim] || 2
      parsed.allocation[dim] = Math.max(2, Math.min(5, val))
    }

    let total = Object.values(parsed.allocation).reduce((sum, val) => sum + val, 0)
    console.log('[allocate] Initial total:', total)

    if (total !== 20) {
      console.log('[allocate] Adjusting to sum to exactly 20')
      const diff = 20 - total
      if (diff > 0) {
        const priorityDims = ['dataReadiness', 'businessStrategy', 'aiGovernance']
        for (const dim of priorityDims) {
          if (diff <= 0) break
          const currentVal = parsed.allocation[dim] || 2
          const increase = Math.min(diff, 5 - currentVal)
          parsed.allocation[dim] = currentVal + increase
        }
      } else {
        const lowPriorityDims = ['talentSkills', 'useCaseReadiness', 'operationalReadiness']
        for (const dim of lowPriorityDims) {
          if (diff >= 0) break
          const currentVal = parsed.allocation[dim] || 2
          const decrease = Math.min(Math.abs(diff), currentVal - 2)
          parsed.allocation[dim] = currentVal - decrease
        }
      }
    }

    console.log('[allocate] Final allocation:', parsed.allocation)
    return parsed
  } catch (error) {
    console.error('[allocate] AI allocation error:', error.message)
    return null
  }
}

export async function getAIAllocation(industryLabel, orgSize) {
  console.log('[allocate] getAIAllocation called for', industryLabel)

  const aiAllocation = await requestAllocationFromAI(industryLabel, orgSize)

  if (aiAllocation) {
    return {
      allocation: aiAllocation.allocation,
      rationale: aiAllocation.rationale,
      isAI: true,
    }
  }

  return null
}
