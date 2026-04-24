'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import AnswerCard from '@/components/assessment/AnswerCard'
import DimensionBadge from '@/components/assessment/DimensionBadge'
import NavigationButtons from '@/components/assessment/NavigationButtons'
import { useAssessmentStore } from '@/store/assessmentStore'
import { DIMENSION_ORDER, DIMENSION_LABELS } from '@/lib/geminiQuestions'

function DimensionTransition({ nextDimensionLabel, error, onRetry }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-6 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl text-center">
        {error ? (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Generation failed</h3>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 block" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Loading next section
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Generating personalized questions for{' '}
              <span className="font-semibold text-slate-700">{nextDimensionLabel}</span>…
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tailoring questions based on your previous answers
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function DimensionProgressBar({ dimensionIndex, totalDimensions, questionInDim, totalInDim }) {
  const dimPercent = Math.round(((dimensionIndex) / totalDimensions) * 100)
  const questionPercent = totalInDim ? Math.round((questionInDim / totalInDim) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
        <span>
          Dimension {dimensionIndex + 1} of {totalDimensions} ·{' '}
          Question {questionInDim} of {totalInDim}
        </span>
        <span>{dimPercent}% complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-300 transition-all duration-300"
          style={{ width: `${dimPercent}%` }}
        />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: totalInDim }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${
              i < questionInDim ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function AssessmentStepPage() {
  const params = useParams()
  const router = useRouter()
  const step = Number(params.step)

  const respondentName = useAssessmentStore((s) => s.respondentName)
  const companyName = useAssessmentStore((s) => s.companyName)
  const email = useAssessmentStore((s) => s.email)
  const region = useAssessmentStore((s) => s.region)
  const orgSize = useAssessmentStore((s) => s.orgSize)
  const industry = useAssessmentStore((s) => s.industry)
  const industryLabel = useAssessmentStore((s) => s.industryLabel)
  const sessionId = useAssessmentStore((s) => s.sessionId)
  const questions = useAssessmentStore((s) => s.questions)
  const dimensionPlan = useAssessmentStore((s) => s.dimensionPlan)
  const currentDimensionIndex = useAssessmentStore((s) => s.currentDimensionIndex)
  const dimensionQuestions = useAssessmentStore((s) => s.dimensionQuestions)
  const isLoadingDimension = useAssessmentStore((s) => s.isLoadingDimension)
  const answers = useAssessmentStore((s) => s.answers)
  const isSubmitting = useAssessmentStore((s) => s.isSubmitting)

  const answerQuestion = useAssessmentStore((s) => s.answerQuestion)
  const goToStep = useAssessmentStore((s) => s.goToStep)
  const setLoadingDimension = useAssessmentStore((s) => s.setLoadingDimension)
  const setDimensionQuestions = useAssessmentStore((s) => s.setDimensionQuestions)
  const setSessionId = useAssessmentStore((s) => s.setSessionId)
  const completeCurrentDimension = useAssessmentStore((s) => s.completeCurrentDimension)
  const buildPreviousAnswers = useAssessmentStore((s) => s.buildPreviousAnswers)
  const setSubmitting = useAssessmentStore((s) => s.setSubmitting)
  const setComplete = useAssessmentStore((s) => s.setComplete)

  const [error, setError] = useState('')
  const [transitionError, setTransitionError] = useState('')
  const [showTransition, setShowTransition] = useState(false)
  const pendingNextDimRef = useRef(null)

  const currentQuestion = useMemo(() => questions[step - 1] || null, [questions, step])
  const currentQuestionKey = currentQuestion?.id || currentQuestion?.question_id
  const currentQuestionText = currentQuestion?.questionText || currentQuestion?.question_text

  const currentDimKey = currentQuestion?.dimension || DIMENSION_ORDER[currentDimensionIndex]
  const dimQs = dimensionQuestions[currentDimKey] || []

  const dimStartIndex = useMemo(() => {
    const firstDimQ = questions.findIndex((q) => q.dimension === currentDimKey)
    return firstDimQ >= 0 ? firstDimQ : 0
  }, [questions, currentDimKey])

  const questionInDim = step - dimStartIndex
  const totalInDim = dimQs.length

  useEffect(() => {
    if (!questions.length || !industry || !orgSize || !sessionId) {
      router.replace('/assessment')
      return
    }
    if (!Number.isInteger(step) || step < 1 || step > questions.length) {
      router.replace('/assessment/1')
      return
    }
    goToStep(step)
  }, [goToStep, industry, orgSize, questions.length, router, sessionId, step])

  const fetchNextDimension = useCallback(
    async (nextDimKey, nextDimCount, nextOrderStart) => {
      if (pendingNextDimRef.current === nextDimKey) return
      pendingNextDimRef.current = nextDimKey

      setTransitionError('')
      setLoadingDimension(true)
      setShowTransition(true)

      try {
        const previousAnswers = buildPreviousAnswers()

        const response = await fetch('/api/assessment/generate-questions', {
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
            sessionId,
            dimension: nextDimKey,
            questionCount: nextDimCount,
            orderStart: nextOrderStart,
            previousAnswers,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate next section.')
        }

        setDimensionQuestions(nextDimKey, data.questions)
        setShowTransition(false)
        pendingNextDimRef.current = null

        const newStep = nextOrderStart
        goToStep(newStep)
        router.push(`/assessment/${newStep}`)
      } catch (err) {
        setTransitionError(err.message || 'Something went wrong.')
        setLoadingDimension(false)
        pendingNextDimRef.current = null
      }
    },
    [
      buildPreviousAnswers,
      companyName,
      email,
      goToStep,
      industry,
      industryLabel,
      orgSize,
      region,
      respondentName,
      router,
      sessionId,
      setDimensionQuestions,
      setLoadingDimension,
    ]
  )

  async function handleNext() {
    if (!currentQuestionKey || !answers[currentQuestionKey]) return
    setError('')

    const isLastStepOverall = step >= questions.length
    const isLastInDimension = questionInDim >= totalInDim

    if (!isLastInDimension) {
      goToStep(step + 1)
      router.push(`/assessment/${step + 1}`)
      return
    }

    const nextDimIndex = currentDimensionIndex + 1
    completeCurrentDimension()

    if (nextDimIndex >= DIMENSION_ORDER.length) {
      await handleSubmit()
      return
    }

    const allocation = dimensionPlan?.allocation || {}
    const nextDimKey = DIMENSION_ORDER[nextDimIndex]
    const nextDimCount = allocation[nextDimKey] || 2
    const nextOrderStart = questions.length + 1

    await fetchNextDimension(nextDimKey, nextDimCount, nextOrderStart)
  }

  function handleBack() {
    if (step <= 1) {
      router.push('/assessment')
      return
    }
    goToStep(step - 1)
    router.push(`/assessment/${step - 1}`)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    console.log('[Assessment Submit] Starting submission...', { sessionId, questionCount: questions.length, answerCount: Object.keys(answers).length })

    try {
      console.log('[Assessment Submit] Sending POST request to /api/assessment/submit')
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: respondentName,
          companyName,
          email,
          region,
          orgSize,
          industry,
          industryLabel,
          sessionId,
          questions,
          answers,
        }),
      })
      console.log('[Assessment Submit] Response received:', { status: response.status, ok: response.ok })
      
      const data = await response.json()
      console.log('[Assessment Submit] Response parsed:', { hasError: !!data.error, sessionId: data.sessionId })

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit assessment.')
      }

      console.log('[Assessment Submit] Setting complete and redirecting to results')
      setComplete(data.sessionId)
      router.push(`/results/${data.sessionId}`)
    } catch (submitError) {
      console.error('[Assessment Submit] Error:', submitError.message)
      setSubmitting(false)
      setError(submitError.message)
    }
  }

  function handleRetryTransition() {
    const allocation = dimensionPlan?.allocation || {}
    const nextDimIndex = currentDimensionIndex + 1
    if (nextDimIndex >= DIMENSION_ORDER.length) return

    const nextDimKey = DIMENSION_ORDER[nextDimIndex]
    const nextDimCount = allocation[nextDimKey] || 2
    const nextOrderStart = questions.length + 1

    setTransitionError('')
    fetchNextDimension(nextDimKey, nextDimCount, nextOrderStart)
  }

  const isLastInDimension = questionInDim >= totalInDim
  const isLastDimension = (currentDimensionIndex + 1) >= DIMENSION_ORDER.length
  const isLastStep = isLastInDimension && isLastDimension
  const dimIndex = DIMENSION_ORDER.indexOf(currentDimKey)

  if (!currentQuestion) return null

  return (
    <main className="relative flex-1">
      <section className="mx-auto w-full max-w-4xl px-10 py-10 space-y-5">
        <DimensionBadge dimension={currentDimKey} />

        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <DimensionProgressBar
            dimensionIndex={dimIndex >= 0 ? dimIndex : currentDimensionIndex}
            totalDimensions={DIMENSION_ORDER.length}
            questionInDim={questionInDim}
            totalInDim={totalInDim || 1}
          />

          <div className="mt-10 space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
              {currentQuestionText}
            </h1>
          </div>

          <div className="mt-10 space-y-2">
            {(currentQuestion.options || []).map((option) => (
              <AnswerCard
                key={option.label}
                label={option.label}
                score={option.score}
                text={option.text}
                selected={Number(answers[currentQuestionKey]) === Number(option.score)}
                onClick={() => answerQuestion(currentQuestionKey, option.score)}
              />
            ))}
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8">
            <NavigationButtons
              onBack={handleBack}
              onNext={handleNext}
              disableBack={step === 1}
              disableNext={!answers[currentQuestionKey]}
              isLastStep={isLastStep}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </section>

      {showTransition && (
        <DimensionTransition
          nextDimensionLabel={
            DIMENSION_LABELS[DIMENSION_ORDER[currentDimensionIndex + 1]] || ''
          }
          error={transitionError}
          onRetry={handleRetryTransition}
        />
      )}

      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 px-6 backdrop-blur-sm">
          <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-2xl">
            <p className="text-lg font-semibold text-slate-950">Submitting your assessment</p>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;re scoring your responses and building your report.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
