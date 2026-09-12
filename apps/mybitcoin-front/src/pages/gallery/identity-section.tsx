import { useState } from 'react'
import { KycBadge } from '@/components/auth/kyc-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ActiveSession, SecuritySection } from '@/components/profile/security-section'
import type { KycStatus } from '@/types/auth'

const KYC_STATUSES: KycStatus[] = ['VERIFIED', 'PENDING', 'REJECTED', 'NOT_STARTED']

const MOCK_SESSIONS: ActiveSession[] = [
  { id: 's1', device: 'Chrome · macOS', location: 'São Paulo, BR', lastAccessAt: new Date().toISOString() },
  {
    id: 's2',
    device: 'App iOS',
    location: 'Rio de Janeiro, BR',
    lastAccessAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
]

/** `KycBadge` em todas as variantes e `SecuritySection` com mock de 2FA e
 * sessões ativas, com estado local próprio (sem persistência real). */
export function IdentitySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [sessions, setSessions] = useState(MOCK_SESSIONS)

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold">Identidade / Perfil</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>KycBadge</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {KYC_STATUSES.map((status) => (
              <KycBadge key={status} status={status} />
            ))}
          </CardContent>
        </Card>

        <SecuritySection
          twoFactorEnabled={twoFactorEnabled}
          onTwoFactorChange={setTwoFactorEnabled}
          sessions={sessions}
          onRevokeSession={(id) => setSessions((current) => current.filter((s) => s.id !== id))}
        />
      </div>
    </section>
  )
}
