import { Camera, FileImage } from 'lucide-react'
import { KycRiskBadge } from '@/components/backoffice/kyc-risk-badge'
import type { AdminUserKyc } from '@/types/backoffice'

/** Mascara CPF sensível mesmo em tela administrativa (ex: `123.***.***-45`). */
function maskCpf(cpf: string): string {
  const match = /^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/.exec(cpf)
  if (!match) return cpf
  return `${match[1]}.***.***-${match[2]}`
}

/** Mascara qualquer identificador sensível, mostrando só os últimos 4 caracteres. */
function maskLast4(value: string): string {
  const digitsOrChars = value.replace(/\s/g, '')
  if (digitsOrChars.length <= 4) return '••••'
  const last4 = digitsOrChars.slice(-4)
  return `${'•'.repeat(digitsOrChars.length - 4)}${last4}`
}

interface KycFieldProps {
  label: string
  value: string
}

function KycField({ label, value }: KycFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

const DOCUMENT_PLACEHOLDERS = [
  { label: 'Frente do documento', icon: FileImage },
  { label: 'Verso do documento', icon: FileImage },
  { label: 'Selfie com documento', icon: Camera },
]

/** Blocos ilustrativos representando os documentos "enviados" — sem upload real. */
function DocumentPlaceholders() {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">
        Documentos enviados (ilustrativo — protótipo sem upload real)
      </span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DOCUMENT_PLACEHOLDERS.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground"
          >
            <Icon className="size-6" />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface KycDocumentInfoProps {
  kyc: AdminUserKyc
}

/** Dados de identificação e documento do KYC — CPF e número sempre mascarados. */
export function KycDocumentInfo({ kyc }: KycDocumentInfoProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KycField label="Nome completo" value={kyc.nomeCompleto} />
        <KycField label="CPF" value={maskCpf(kyc.cpf)} />
        <KycField
          label="Data de nascimento"
          value={new Date(kyc.dataNascimento).toLocaleDateString('pt-BR')}
        />
        <KycField label="Nacionalidade" value={kyc.nacionalidade} />
        <KycField
          label="Enviado em"
          value={new Date(kyc.enviadoEm).toLocaleDateString('pt-BR')}
        />
        <div className="flex items-center gap-2">
          <KycRiskBadge risco={kyc.riscoFraude} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KycField label="Tipo de documento" value={kyc.tipoDocumento} />
        <KycField label="Número do documento" value={maskLast4(kyc.numeroDocumento)} />
        <KycField label="Telefone" value={kyc.telefone} />
        <KycField label="Endereço" value={kyc.endereco} />
      </div>

      <DocumentPlaceholders />
    </div>
  )
}
