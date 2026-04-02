import {
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
  MATURITY_LEVELS,
} from '@/constants/dimensions'

function roundToTwo(value) {
  return Math.round(value * 100) / 100
}

function findMatchingMaturityLevel(score) {
  return (
    MATURITY_LEVELS.find((entry) => score >= entry.min && score <= entry.max) ||
    MATURITY_LEVELS[MATURITY_LEVELS.length - 1]
  )
}

export function computeDimensionScores(answers, questions) {
  const questionMap = new Map(
    (questions || []).map((question) => [String(question.id), question])
  )
  const groupedScores = {}

  Object.entries(answers || {}).forEach(([questionId, score]) => {
    const numericScore = Number(score)
    const question = questionMap.get(String(questionId))

    if (!question || Number.isNaN(numericScore)) {
      return
    }

    const { dimension } = question

    if (!dimension) {
      return
    }

    if (!groupedScores[dimension]) {
      groupedScores[dimension] = []
    }

    groupedScores[dimension].push(numericScore)
  })

  return Object.fromEntries(
    Object.entries(groupedScores).map(([dimension, scores]) => {
      const average = scores.reduce((sum, value) => sum + value, 0) / scores.length
      return [dimension, roundToTwo(average)]
    })
  )
}

export function computeWeightedScore(dimensionScores) {
  const dimensions = Object.keys(dimensionScores || {})

  if (!dimensions.length) {
    return 0
  }

  const { weightedSum, totalWeight } = dimensions.reduce(
    (accumulator, dimension) => {
      const weight = DIMENSION_WEIGHTS[dimension] || 0
      const score = Number(dimensionScores[dimension])

      if (!weight || Number.isNaN(score)) {
        return accumulator
      }

      return {
        weightedSum: accumulator.weightedSum + score * weight,
        totalWeight: accumulator.totalWeight + weight,
      }
    },
    { weightedSum: 0, totalWeight: 0 }
  )

  if (!totalWeight) {
    return 0
  }

  return roundToTwo(weightedSum / totalWeight)
}

export function classifyMaturity(rawScore, dimensionScores) {
  const orderedDimensions = DIMENSION_ORDER.filter(
    (dimension) => typeof dimensionScores?.[dimension] === 'number'
  )
  const fallbackDimensions = Object.keys(dimensionScores || {}).filter(
    (dimension) => !orderedDimensions.includes(dimension)
  )
  const rankedDimensions = [...orderedDimensions, ...fallbackDimensions]

  const blockerDimension = rankedDimensions.find(
    (dimension) => dimensionScores[dimension] < 2
  )
  const overallScore = roundToTwo(
    blockerDimension ? Math.min(rawScore, MATURITY_LEVELS[1].max) : rawScore
  )
  const matchingLevel = findMatchingMaturityLevel(overallScore)
  const values = rankedDimensions.map((dimension) => dimensionScores[dimension])
  const unevenMaturity =
    values.length > 1 && Math.max(...values) - Math.min(...values) > 2

  return {
    maturityLevel: matchingLevel.level,
    maturityLabel: matchingLevel.label,
    overallScore,
    blockerDimension: blockerDimension || null,
    unevenMaturity,
  }
}

export function runScoringPipeline(answers, questions) {
  const dimensionScores = computeDimensionScores(answers, questions)
  const rawOverallScore = computeWeightedScore(dimensionScores)
  const classification = classifyMaturity(rawOverallScore, dimensionScores)

  return {
    dimensionScores,
    rawOverallScore,
    maturityLevel: classification.maturityLevel,
    maturityLabel: classification.maturityLabel,
    overallScore: classification.overallScore,
    blockerDimension: classification.blockerDimension,
    unevenMaturity: classification.unevenMaturity,
  }
}
