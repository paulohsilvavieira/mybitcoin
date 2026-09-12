import { AlertTriangle, ArrowDownToLine, ShieldAlert, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { StatCard } from '@/components/backoffice/stat-card'
import { formatSatoshi } from '@/lib/utils'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).
const MOCK_STATS = {
  totalUsuarios: '18.412',
  volume24hSatoshi: '842300000',
  saquesPendentes: '7',
  alertasSeguranca: '3',
}

const MOCK_ALERTS = [
  {
    id: 'alert_1',
    title: '3 saques acima do limite aguardando aprovação manual',
    description: 'Valores acima de 0.5 BTC exigem dupla aprovação antes da liberação.',
  },
  {
    id: 'alert_2',
    title: 'Hot wallet BTC abaixo do limiar mínimo',
    description: 'Saldo operacional atual cobre menos de 6h de saques estimados.',
  },
  {
    id: 'alert_3',
    title: '2 contas com tentativas de login suspeitas',
    description: 'Múltiplas tentativas de acesso de IPs não reconhecidos nas últimas 24h.',
  },
]

/** Dashboard inicial do backoffice — KPIs e alertas recentes (mock de UI). */
export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da operação da exchange.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de usuários" value={MOCK_STATS.totalUsuarios} icon={Users2} />
        <StatCard
          label="Volume 24h"
          value={formatSatoshi(MOCK_STATS.volume24hSatoshi)}
          icon={ArrowDownToLine}
        />
        <Link to="/preview/backoffice/withdrawals" className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
          <StatCard
            label="Saques pendentes"
            value={MOCK_STATS.saquesPendentes}
            icon={AlertTriangle}
            change="Aguardando aprovação"
            changeTone="negative"
          />
        </Link>
        <StatCard
          label="Alertas de segurança"
          value={MOCK_STATS.alertasSeguranca}
          icon={ShieldAlert}
          change="Requer atenção"
          changeTone="negative"
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-semibold">Alertas recentes</h2>
        <div className="flex flex-col gap-2">
          {MOCK_ALERTS.map((alert) => (
            <Alert key={alert.id} variant="destructive">
              <AlertTriangle />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      </section>
    </div>
  )
}
