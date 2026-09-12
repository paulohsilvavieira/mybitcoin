import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface KycNotesProps {
  notasIniciais: string[]
}

/**
 * Notas internas da equipe de compliance sobre o KYC — mock de UI, estado só
 * local (não persiste entre reloads, sem chamada real).
 */
export function KycNotes({ notasIniciais }: KycNotesProps) {
  const [notas, setNotas] = useState(notasIniciais)
  const [novaNota, setNovaNota] = useState('')
  const inputId = useId()

  function handleAdicionar() {
    const nota = novaNota.trim()
    if (nota === '') return
    setNotas((prev) => [...prev, nota])
    setNovaNota('')
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">Notas internas</span>

      {notas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma nota registrada.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notas.map((nota, index) => (
            <li
              key={`${index}-${nota}`}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
            >
              {nota}
            </li>
          ))}
        </ul>
      )}

      <Field orientation="horizontal">
        <Label htmlFor={inputId} className="sr-only">
          Nova nota interna
        </Label>
        <Input
          id={inputId}
          value={novaNota}
          onChange={(event) => setNovaNota(event.target.value)}
          placeholder="Adicionar nota interna…"
        />
        <Button type="button" variant="outline" onClick={handleAdicionar}>
          Adicionar nota
        </Button>
      </Field>
    </div>
  )
}
