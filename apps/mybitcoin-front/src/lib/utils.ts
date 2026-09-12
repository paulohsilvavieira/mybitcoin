import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * `symbol` só troca o rótulo exibido (ex: "ETH", "SOL") para telas que listam
 * outros ativos além de Bitcoin (mercado, reservas do backoffice) — a API real
 * só lida com Bitcoin hoje, então a escala usada continua sendo satoshi (1e8).
 */
export function formatSatoshi(
  satoshi: string | bigint,
  unit: 'btc' | 'sat' = 'btc',
  symbol = 'BTC',
): string {
  const value = typeof satoshi === 'string' ? BigInt(satoshi) : satoshi

  if (value < 0n) {
    const abs = -value
    const formatted = formatSatoshi(abs, unit, symbol)
    return `-${formatted}`
  }

  if (unit === 'sat') {
    return `${value.toLocaleString('pt-BR')} sat`
  }

  const SATS_PER_BTC = 100_000_000n
  const wholePart = value / SATS_PER_BTC
  const fractionalPart = value % SATS_PER_BTC
  const btc = `${wholePart}.${fractionalPart.toString().padStart(8, '0')}`
  return `${btc} ${symbol}`
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}
