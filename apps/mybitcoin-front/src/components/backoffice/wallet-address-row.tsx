import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface WalletAddressRowProps {
  label: string
  address: string
}

/** Endereço de custódia (hot/cold), readonly, truncado, com botão de copiar. */
export function WalletAddressRow({ label, address }: WalletAddressRowProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast({ title: 'Endereço copiado', variant: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Não foi possível copiar o endereço', variant: 'destructive' })
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate font-mono text-xs" title={address}>
          {address}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Copiar endereço de ${label}`}
        onClick={handleCopy}
      >
        {copied ? <Check className="text-success" /> : <Copy />}
      </Button>
    </div>
  )
}
