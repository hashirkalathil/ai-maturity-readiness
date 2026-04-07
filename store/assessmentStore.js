'use client'

import { create } from 'zustand'

const initialState = {
  sessionId: null,
  respondentName: null,
  companyName: '',
  orgSize: null,
  industry: null,
  industryLabel: null,
  dimensionAllocation: null,
  questions: [],
  currentStep: 0,
  answers: {},
  isSubmitting: false,
  resultSessionId: null,
}

export const useAssessmentStore = create((set, get) => ({
  ...initialState,
  setContext: ({ name, companyName, orgSize, industry, industryLabel }) =>
    set({
      respondentName: name ?? companyName ?? null,
      companyName: companyName ?? name ?? '',
      orgSize,
      industry,
      industryLabel,
      currentStep: 0,
      questions: [],
      dimensionAllocation: null,
      answers: {},
      isSubmitting: false,
      resultSessionId: null,
    }),
  setQuestions: (questions) =>
    set({
      questions,
    }),
  setQuestionsAndSession: ({ questions, sessionId, dimensionAllocation }) =>
    set({
      questions,
      sessionId,
      dimensionAllocation,
    }),
  answerQuestion: (questionId, score) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: score,
      },
    })),
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

    if (!questions.length || currentStep === 0) {
      return 0
    }

    return Math.round((currentStep / questions.length) * 100)
  },
  canProceed: () => {
    const { currentStep, answers } = get()

    if (currentStep === 0) {
      return true
    }

    const currentQuestion = get().getCurrentQuestion()
    const questionKey = currentQuestion?.id || currentQuestion?.question_id
    return Boolean(questionKey && answers[questionKey])
  },
  setSubmitting: (isSubmitting) =>
    set({
      isSubmitting,
    }),
  setComplete: (resultSessionId) =>
    set({
      sessionId: resultSessionId,
      resultSessionId,
      isSubmitting: false,
    }),
  reset: () => set(initialState),
}))
