import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

export interface ActiveSession {
  id: string
  device: string
  location: string
  lastAccessAt: string
}

interface SessionRowProps {
  session: ActiveSession
  onRevoke: (id: string) => void
}

function SessionRow({ session, onRevoke }: SessionRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium">{session.device}</p>
        <p className="text-sm text-muted-foreground">
          {session.location} · último acesso em{' '}
          {new Date(session.lastAccessAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-11 shrink-0"
        onClick={() => onRevoke(session.id)}
      >
        Revogar
      </Button>
    </div>
  )
}

export interface SecuritySectionProps {
  twoFactorEnabled: boolean
  onTwoFactorChange: (enabled: boolean) => void
  sessions: ActiveSession[]
  onRevokeSession: (id: string) => void
}

/**
 * Card de segurança: 2FA + sessões ativas. Dados via props (mock/preview,
 * sem integração real ainda).
 */
export function SecuritySection({
  twoFactorEnabled,
  onTwoFactorChange,
  sessions,
  onRevokeSession,
}: SecuritySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <label htmlFor="two-factor-switch" className="font-medium">
              Autenticação em duas etapas
            </label>
            <p className="text-sm text-muted-foreground">
              {twoFactorEnabled ? 'Ativado' : 'Desativado'}
            </p>
          </div>
          <Switch
            id="two-factor-switch"
            checked={twoFactorEnabled}
            onCheckedChange={onTwoFactorChange}
          />
        </div>

        <Separator />

        <div>
          <p className="mb-1 font-medium">Sessões ativas</p>
          {sessions.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">Nenhuma sessão ativa.</p>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((session) => (
                <SessionRow key={session.id} session={session} onRevoke={onRevokeSession} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
