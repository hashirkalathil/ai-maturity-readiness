'use client'

import { create } from 'zustand'

import {
  DIMENSION_ORDER,
  DIMENSION_LABELS,
  DIMENSION_WEIGHTS,
} from '@/lib/geminiQuestions'

function computeDimensionScore(questions, answers) {
  const scores = questions
    .map((q) => {
      const key = q.id || q.question_id
      const score = answers[key]
      return score !== undefined ? Number(score) : null
    })
    .filter((s) => s !== null)

  if (!scores.length) return null
  return Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100
}

const initialState = {
  sessionId: null,
  respondentName: null,
  companyName: '',
  email: '',
  region: '',
  orgSize: null,
  industry: null,
  industryLabel: null,

  dimensionPlan: null,
  currentDimensionIndex: 0,
  dimensionQuestions: {},
  dimensionScores: {},
  isLoadingDimension: false,
  questions: [],

  answers: {},

  currentStep: 0,

  isSubmitting: false,
  isStarting: false,
  error: '',

  resultSessionId: null,
}

export const useAssessmentStore = create((set, get) => ({
  ...initialState,

  setContext: ({ name, companyName, email, region, orgSize, industry, industryLabel }) =>
    set({
      respondentName: name || null,
      companyName: companyName || '',
      email: email || '',
      region: region || '',
      orgSize,
      industry,
      industryLabel,
      currentStep: 0,
      currentDimensionIndex: 0,
      questions: [],
      dimensionQuestions: {},
      dimensionScores: {},
      dimensionPlan: null,
      answers: {},
      isSubmitting: false,
      isLoadingDimension: false,
      resultSessionId: null,
    }),



  setSessionId: (sessionId) => set({ sessionId }),

  setLoadingDimension: (isLoading) => set({ isLoadingDimension: isLoading }),
  


  setDimensionQuestions: (dimensionKey, questions) =>
    set((state) => {
      const merged = [
        ...state.questions.filter((q) => q.dimension !== dimensionKey),
        ...questions,
      ]
      return {
        dimensionQuestions: {
          ...state.dimensionQuestions,
          [dimensionKey]: questions,
        },
        questions: merged,
        isLoadingDimension: false,
      }
    }),

  answerQuestion: (questionId, score) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: score,
      },
    })),

  completeCurrentDimension: () => {
    const state = get()
    const dimensionKey = DIMENSION_ORDER[state.currentDimensionIndex]
    const dimQuestions = state.dimensionQuestions[dimensionKey] || []
    const score = computeDimensionScore(dimQuestions, state.answers)

    set((s) => ({
      dimensionScores: {
        ...s.dimensionScores,
        [dimensionKey]: score,
      },
      currentDimensionIndex: s.currentDimensionIndex + 1,
    }))
  },

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.questions.length),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  goToStep: (step) =>
    set((state) => ({
      currentStep: Math.max(0, Math.min(step, state.questions.length)),
    })),

  getCurrentQuestion: () => {
    const { currentStep, questions } = get()
    return questions[currentStep - 1] || null
  },

  getProgress: () => {
    const { currentStep, questions } = get()
    if (!questions.length || currentStep === 0) return 0
    return Math.round((currentStep / questions.length) * 100)
  },

  canProceed: () => {
    const { currentStep, answers } = get()
    if (currentStep === 0) return true
    const currentQuestion = get().getCurrentQuestion()
    const questionKey = currentQuestion?.id || currentQuestion?.question_id
    return Boolean(questionKey && answers[questionKey])
  },

  getDimensionProgress: () => {
    const { currentDimensionIndex, dimensionPlan } = get()
    const total = DIMENSION_ORDER.length
    const completed = currentDimensionIndex
    const currentKey = DIMENSION_ORDER[currentDimensionIndex]
    const currentLabel = DIMENSION_LABELS[currentKey] || ''
    const questionsInDimension =
      dimensionPlan?.allocation?.[currentKey] || 0

    return { completed, total, currentKey, currentLabel, questionsInDimension }
  },

  buildPreviousAnswers: () => {
    const { questions, answers } = get()
    return questions
      .filter((q) => {
        const key = q.id || q.question_id
        return answers[key] !== undefined
      })
      .map((q) => {
        const key = q.id || q.question_id
        const score = answers[key]
        const option = q.options?.find((o) => Number(o.score) === Number(score))
        return {
          dimension: q.dimension,
          questionText: q.questionText || q.question_text,
          selectedOptionText: option?.text || String(score),
        }
      })
  },

  setQuestions: (questions) => set({ questions }),

  setQuestionsAndSession: ({ questions, sessionId, dimensionAllocation }) =>
    set({ questions, sessionId, dimensionAllocation }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setComplete: (resultSessionId) =>
    set({
      sessionId: resultSessionId,
      resultSessionId,
      isSubmitting: false,
    }),

  reset: () => set(initialState),

  startAssessment: async (router) => {
    const state = get()
    const { 
      respondentName, companyName, email, region, orgSize, industry, industryLabel,
      isStarting
    } = state

    if (isStarting) return

    set({ isStarting: true, error: '' })

    try {
      const allocRes = await fetch('/api/assessment/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'allocate',
          industryLabel,
          orgSize,
        }),
      })

      if (!allocRes.ok) {
        const data = await allocRes.json()
        throw new Error(data.error || 'Allocation failed')
      }

      const { allocation, rationale, isAI } = await allocRes.json()
      
      const totalQuestions = Object.values(allocation).reduce((s, n) => s + n, 0)
      set({
        dimensionPlan: {
          allocation,
          rationale,
          totalQuestions,
          isAI,
          dimensions: DIMENSION_ORDER.map((key) => ({
            key,
            label: DIMENSION_LABELS[key],
            count: allocation[key],
            weight: DIMENSION_WEIGHTS[key],
          })),
        },
      })

      const firstDimension = DIMENSION_ORDER[0]
      const firstCount = allocation[firstDimension]

      const genRes = await fetch('/api/assessment/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: respondentName,
          companyName,
          email,
          region,
          industry,
          industryLabel,
          orgSize,
          dimension: firstDimension,
          questionCount: firstCount,
          orderStart: 1,
          previousAnswers: [],
          sessionId: null,
        }),
      })

      if (!genRes.ok) {
        const data = await genRes.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await genRes.json()
      set({
        sessionId: data.sessionId,
        isStarting: false,
      })
      get().setDimensionQuestions(firstDimension, data.questions)
      router.push('/assessment/1')
    } catch (err) {
      set({ error: err.message, isStarting: false })
    }
  },
}))
