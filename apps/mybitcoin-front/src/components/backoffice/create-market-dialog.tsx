import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldError } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import {
  MARKET_BASE_ASSETS,
  MARKET_QUOTE_ASSETS,
  MarketAssetSelect,
} from '@/components/backoffice/market-asset-select'
import { MarketQuantityFields } from '@/components/backoffice/market-quantity-fields'
import type { AdminMarket } from '@/types/backoffice-markets'

export interface CreateMarketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (market: AdminMarket) => void
}

const EMPTY_QUANTITIES = { minQuantity: '', quantityIncrement: '', tickSize: '' }

/**
 * Dialog de novo mercado/par de negociação — mock de UI, nenhum mercado real
 * é criado. Quantidades são `string` na precisão do próprio ativo (não
 * satoshi), conforme `docs/bussiness/05-mercados-de-negociacao.md`.
 */
export function CreateMarketDialog({ open, onOpenChange, onCreate }: CreateMarketDialogProps) {
  const [baseAsset, setBaseAsset] = useState<string>(MARKET_BASE_ASSETS[0])
  const [quoteAsset, setQuoteAsset] = useState<string>(MARKET_QUOTE_ASSETS[0])
  const [quantities, setQuantities] = useState(EMPTY_QUANTITIES)
  const [showError, setShowError] = useState(false)
  const baseId = useId()
  const quoteId = useId()
  const minQuantityId = useId()
  const incrementId = useId()
  const tickSizeId = useId()
  const { toast } = useToast()

  function handleClose(next: boolean) {
    if (!next) {
      setBaseAsset(MARKET_BASE_ASSETS[0])
      setQuoteAsset(MARKET_QUOTE_ASSETS[0])
      setQuantities(EMPTY_QUANTITIES)
      setShowError(false)
    }
    onOpenChange(next)
  }

  const { minQuantity, quantityIncrement, tickSize } = quantities
  const sameAsset = baseAsset === quoteAsset
  const missingField = [minQuantity, quantityIncrement, tickSize].some((v) => v.trim() === '')

  function handleConfirm() {
    if (sameAsset || missingField) {
      setShowError(true)
      return
    }
    onCreate({
      id: `mkt_${Date.now()}`,
      symbol: `${baseAsset}/${quoteAsset}`,
      baseAsset,
      quoteAsset,
      minQuantity,
      quantityIncrement,
      tickSize,
      status: 'ATIVO',
      criadoEm: new Date().toISOString(),
    })
    toast({ title: 'Mercado criado (simulação)', variant: 'success' })
    handleClose(false)
  }

  const errorMessage = showError
    ? sameAsset
      ? 'Ativo base e ativo cotação não podem ser iguais.'
      : 'Preencha todos os campos de configuração.'
    : undefined

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Novo mercado</DialogTitle>
        <DialogDescription>
          Cria um novo par de negociação. Essa é uma simulação — nenhum mercado real é criado.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 sm:flex-row">
        <MarketAssetSelect
          id={baseId}
          label="Ativo base"
          value={baseAsset}
          options={MARKET_BASE_ASSETS}
          onChange={setBaseAsset}
        />
        <MarketAssetSelect
          id={quoteId}
          label="Ativo cotação"
          value={quoteAsset}
          options={MARKET_QUOTE_ASSETS}
          onChange={setQuoteAsset}
        />
      </div>

      <MarketQuantityFields
        minQuantityId={minQuantityId}
        incrementId={incrementId}
        tickSizeId={tickSizeId}
        minQuantity={minQuantity}
        quantityIncrement={quantityIncrement}
        tickSize={tickSize}
        onMinQuantityChange={(value) => {
          setQuantities((prev) => ({ ...prev, minQuantity: value }))
          setShowError(false)
        }}
        onQuantityIncrementChange={(value) => {
          setQuantities((prev) => ({ ...prev, quantityIncrement: value }))
          setShowError(false)
        }}
        onTickSizeChange={(value) => {
          setQuantities((prev) => ({ ...prev, tickSize: value }))
          setShowError(false)
        }}
      />

      {errorMessage && <FieldError>{errorMessage}</FieldError>}

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Criar mercado</Button>
      </DialogFooter>
    </Dialog>
  )
}
