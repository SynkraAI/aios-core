'use client'

import { useState, useTransition } from 'react'
import { Button } from '@ciclo/ui'
import { updateParticipantNotes } from '../../lib/actions/participants'

// ============================================================
// Types
// ============================================================

interface NoteEntry {
  text: string
  adminEmail: string
  createdAt: string
}

interface NotesEditorProps {
  userId: string
  existingNotes: NoteEntry[]
}

// ============================================================
// Helpers
// ============================================================

function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}

// ============================================================
// Component
// ============================================================

export function NotesEditor({ userId, existingNotes }: NotesEditorProps) {
  const [noteText, setNoteText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const handleSave = () => {
    if (!noteText.trim()) return

    setFeedback(null)
    startTransition(async () => {
      // In production, adminEmail should come from server session
      const result = await updateParticipantNotes(userId, noteText.trim(), 'admin@basetriade.com')

      if (result.success) {
        setNoteText('')
        setFeedback({ type: 'success', message: 'Anotação salva com sucesso.' })
      } else {
        setFeedback({ type: 'error', message: result.error ?? 'Erro ao salvar anotação.' })
      }
    })
  }

  return (
    <div>
      {/* Note history (most recent first) */}
      {existingNotes.length > 0 && (
        <div className="mb-4 space-y-3">
          {[...existingNotes].reverse().map((note, index) => (
            <div key={index} className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.text}</p>
              <p className="mt-1 text-xs text-gray-500">
                Editado por {note.adminEmail} em {formatDateTime(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {existingNotes.length === 0 && (
        <p className="mb-4 text-sm text-gray-500">Nenhuma anotação registrada.</p>
      )}

      {/* New note input */}
      <div>
        <label htmlFor="noteText" className="block text-sm font-medium text-gray-700">
          Nova anotação
        </label>
        <textarea
          id="noteText"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          placeholder="Escreva uma anotação interna sobre este participante..."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="mt-2 flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !noteText.trim()}
          >
            {isPending ? 'Salvando...' : 'Salvar Anotação'}
          </Button>
          {feedback && (
            <span
              className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              {feedback.message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
