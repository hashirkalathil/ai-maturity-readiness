'use client'

import { useRouter } from 'next/navigation'

import Button from '@/components/ui/Button'

export default function DeleteResponseButton({ sessionId }) {
  const router = useRouter()

  async function handleDelete() {
    const confirmed = window.confirm(
      'Delete this response permanently? This action cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    const response = await fetch(`/api/admin/responses/${sessionId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      router.push('/admin/responses')
      router.refresh()
    }
  }

  return (
    <Button variant="danger" onClick={handleDelete}>
      Delete Response
    </Button>
  )
}
