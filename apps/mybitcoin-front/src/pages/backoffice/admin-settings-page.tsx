import { useState } from 'react'
import { AdminChangePasswordForm } from '@/components/backoffice/admin-change-password-form'
import { AdminPersonalInfoForm } from '@/components/backoffice/admin-personal-info-form'
import { AdminProfileHeader } from '@/components/backoffice/admin-profile-header'
import type { ActiveSession } from '@/components/profile/security-section'
import { SecuritySection } from '@/components/profile/security-section'
import type { AdminProfile } from '@/types/backoffice-admin'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).
const MOCK_ADMIN: AdminProfile = {
  nome: 'Ana Beatriz',
  email: 'ana.beatriz@mybitcoin.com',
  cargo: 'Administradora de Operações',
  twoFactorEnabled: true,
}

const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: 'session_admin_1',
    device: 'Chrome · macOS',
    location: 'São Paulo, BR',
    lastAccessAt: '2026-09-11T09:10:00',
  },
  {
    id: 'session_admin_2',
    device: 'Safari · iPhone',
    location: 'São Paulo, BR',
    lastAccessAt: '2026-09-10T21:40:00',
  },
]

/** Página de configurações do admin logado no backoffice (mock de UI). */
export function AdminSettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(MOCK_ADMIN.twoFactorEnabled)
  const [sessions, setSessions] = useState(MOCK_SESSIONS)

  function handleRevokeSession(id: string) {
    setSessions((current) => current.filter((session) => session.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminProfileHeader admin={MOCK_ADMIN} />
      <AdminPersonalInfoForm admin={MOCK_ADMIN} />
      <AdminChangePasswordForm />
      <SecuritySection
        twoFactorEnabled={twoFactorEnabled}
        onTwoFactorChange={setTwoFactorEnabled}
        sessions={sessions}
        onRevokeSession={handleRevokeSession}
      />
    </div>
  )
}
