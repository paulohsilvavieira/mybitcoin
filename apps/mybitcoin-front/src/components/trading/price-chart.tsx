import { useEffect, useRef } from 'react'
import { CandlestickSeries, ColorType, createChart, type IChartApi } from 'lightweight-charts'
import { useThemeStore } from '@/stores/use-theme-store'
import type { Candle } from '@/types/trading'

// Espelha os hex de --success/--destructive/--border/--muted-foreground de
// index.css. lightweight-charts não lê custom properties, então precisa
// dos valores resolvidos — se a paleta mudar em index.css, atualizar aqui.
const CHART_COLORS = {
  light: { background: '#FFFFFF', text: '#63666D', grid: '#E1E2E0', up: '#1A7F42', down: '#D93526' },
  dark: { background: '#171B22', text: '#9BA0AA', grid: '#262B34', up: '#34D399', down: '#F0554A' },
} as const

interface PriceChartProps {
  candles: Candle[]
}

export function PriceChart({ candles }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const colors = CHART_COLORS[theme]
    const chart: IChartApi = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      timeScale: { borderColor: colors.grid },
      rightPriceScale: { borderColor: colors.grid },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: colors.up,
      downColor: colors.down,
      borderVisible: false,
      wickUpColor: colors.up,
      wickDownColor: colors.down,
    })
    series.setData(candles)
    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [candles, theme])

  return <div ref={containerRef} className="h-80 w-full sm:h-[28rem]" />
}
