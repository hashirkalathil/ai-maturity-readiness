'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import AnswerCard from '@/components/assessment/AnswerCard'
import DimensionBadge from '@/components/assessment/DimensionBadge'
import NavigationButtons from '@/components/assessment/NavigationButtons'
import ProgressBar from '@/components/assessment/ProgressBar'
import { useAssessmentStore } from '@/store/assessmentStore'

export default function AssessmentStepPage() {
  const params = useParams()
  const router = useRouter()
  const step = Number(params.step)

  const respondentName = useAssessmentStore((state) => state.respondentName)
  const companyName = useAssessmentStore((state) => state.companyName)
  const email = useAssessmentStore((state) => state.email)
  const region = useAssessmentStore((state) => state.region)
  const orgSize = useAssessmentStore((state) => state.orgSize)
  const industry = useAssessmentStore((state) => state.industry)
  const industryLabel = useAssessmentStore((state) => state.industryLabel)
  const sessionId = useAssessmentStore((state) => state.sessionId)
  const questions = useAssessmentStore((state) => state.questions)
  const answers = useAssessmentStore((state) => state.answers)
  const isSubmitting = useAssessmentStore((state) => state.isSubmitting)
  const answerQuestion = useAssessmentStore((state) => state.answerQuestion)
  const goToStep = useAssessmentStore((state) => state.goToStep)
  const setSubmitting = useAssessmentStore((state) => state.setSubmitting)
  const setComplete = useAssessmentStore((state) => state.setComplete)

  const [error, setError] = useState('')
  const totalSteps = questions.length
  const currentQuestion = useMemo(() => questions[step - 1] || null, [questions, step])
  const currentQuestionKey = currentQuestion?.id || currentQuestion?.question_id
  const currentQuestionText = currentQuestion?.questionText || currentQuestion?.question_text

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
  }, [goToStep, industry, orgSize, questions, router, sessionId, step])

  async function handleNext() {
    if (!currentQuestionKey || !answers[currentQuestionKey]) {
      return
    }

    if (step < totalSteps) {
      goToStep(step + 1)
      router.push(`/assessment/${step + 1}`)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit assessment.')
      }

      setComplete(data.sessionId)
      router.push(`/results/${data.sessionId}`)
    } catch (submitError) {
      setSubmitting(false)
      setError(submitError.message)
    }
  }

  function handleBack() {
    if (step <= 1) {
      router.push('/assessment')
      return
    }

    goToStep(step - 1)
    router.push(`/assessment/${step - 1}`)
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <main className="relative flex-1">
      <section className="mx-auto w-full max-w-4xl px-10 py-10 space-y-5">
        <DimensionBadge dimension={currentQuestion.dimension} />

        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ProgressBar currentStep={step} totalSteps={totalSteps} />

          <div className="mt-10 space-y-5">
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
                {currentQuestionText}
              </h1>
            </div>
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

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-8">
            <NavigationButtons
              onBack={handleBack}
              onNext={handleNext}
              disableBack={step === 1}
              disableNext={!answers[currentQuestionKey]}
              isLastStep={step === totalSteps}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </section>

      {isSubmitting ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 px-6 backdrop-blur-sm">
          <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-2xl">
            <p className="text-lg font-semibold text-slate-950">
              Submitting your assessment
            </p>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;re scoring your responses and building your report.
            </p>
          </div>
        </div>
      ) : null}
    </main>
  )
}
