'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import QuestionFormModal from '@/components/admin/QuestionFormModal'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function QuestionsList({ questions, industries }) {
  const router = useRouter()
  const groupedQuestions = useMemo(() => {
    return questions.reduce((accumulator, question) => {
      if (!accumulator[question.dimension]) {
        accumulator[question.dimension] = []
      }

      accumulator[question.dimension].push(question)
      return accumulator
    }, {})
  }, [questions])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function toggleQuestion(question) {
    await fetch(`/api/admin/questions/${question.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !question.is_active }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
            Question Manager
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Assessment question bank
          </h1>
        </div>
        <Button
          onClick={() => {
            setSelectedQuestion(null)
            setIsModalOpen(true)
          }}
        >
          Add Question
        </Button>
      </div>

      {Object.entries(groupedQuestions).map(([dimension, items]) => (
        <details
          key={dimension}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          open
        >
          <summary className="cursor-pointer text-xl font-semibold text-slate-950">
            {dimension}
          </summary>
          <div className="mt-5 space-y-3">
            {items.map((question) => (
              <div
                key={question.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">{question.question_id}</Badge>
                    <Badge variant={question.scope === 'global' ? 'neutral' : 'warning'}>
                      {question.scope}
                    </Badge>
                    {question.industries?.map((industry) => (
                      <Badge key={industry} variant="success" size="sm">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm leading-7 text-slate-700">
                    {question.question_text}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={question.is_active ? 'secondary' : 'danger'}
                    size="sm"
                    onClick={() => toggleQuestion(question)}
                  >
                    {question.is_active ? 'Active' : 'Inactive'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedQuestion(question)
                      setIsModalOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </details>
      ))}

      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={selectedQuestion}
        industries={industries}
      />
    </div>
  )
}
