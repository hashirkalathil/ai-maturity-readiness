'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

const dimensionOptions = [
  'businessStrategy',
  'dataReadiness',
  'technologyInfrastructure',
  'talentSkills',
  'useCaseReadiness',
  'operationalReadiness',
  'aiGovernance',
]

function createEmptyQuestion() {
  return {
    dimension: 'businessStrategy',
    scope: 'global',
    industries: [],
    question_text: '',
    sort_order: 1,
    options: [1, 2, 3, 4, 5].map((score, index) => ({
      score,
      label: String.fromCharCode(65 + index),
      text: '',
    })),
  }
}

export default function QuestionFormModal({
  isOpen,
  onClose,
  question,
  industries,
}) {
  const router = useRouter()
  const initialValue = useMemo(
    () => question || createEmptyQuestion(),
    [question]
  )
  const [form, setForm] = useState(initialValue)
  const [saving, setSaving] = useState(false)

  function updateOption(index, text) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, text } : option
      ),
    }))
  }

  async function handleSave() {
    setSaving(true)
    const method = question ? 'PUT' : 'POST'
    const endpoint = question ? `/api/admin/questions/${question.id}` : '/api/admin/questions'

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (response.ok) {
      onClose()
      router.refresh()
    }

    setSaving(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? 'Edit Question' : 'Add Question'}
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Dimension
            </span>
            <select
              value={form.dimension}
              onChange={(event) =>
                setForm((current) => ({ ...current, dimension: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              {dimensionOptions.map((dimension) => (
                <option key={dimension} value={dimension}>
                  {dimension}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Scope
            </span>
            <select
              value={form.scope}
              onChange={(event) =>
                setForm((current) => ({ ...current, scope: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="global">Global</option>
              <option value="industry">Industry</option>
            </select>
          </label>
        </div>

        {form.scope === 'industry' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Industries
            </span>
            <div className="grid gap-2 md:grid-cols-2">
              {industries.map((industry) => (
                <label
                  key={industry.slug}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.industries.includes(industry.slug)}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        industries: event.target.checked
                          ? [...current.industries, industry.slug]
                          : current.industries.filter((item) => item !== industry.slug),
                      }))
                    }
                  />
                  <span>{industry.label}</span>
                </label>
              ))}
            </div>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Question text
          </span>
          <textarea
            value={form.question_text}
            onChange={(event) =>
              setForm((current) => ({ ...current, question_text: event.target.value }))
            }
            rows={4}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Sort order
          </span>
          <input
            type="number"
            value={form.sort_order}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                sort_order: Number(event.target.value || 1),
              }))
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
        </label>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Answer options</p>
          {form.options.map((option, index) => (
            <label key={option.score} className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                {`${option.label} - Score ${option.score}`}
              </span>
              <textarea
                value={option.text}
                onChange={(event) => updateOption(index, event.target.value)}
                rows={2}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSave}>
            Save Question
          </Button>
        </div>
      </div>
    </Modal>
  )
}
