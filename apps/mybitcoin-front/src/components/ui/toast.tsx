import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastVariant = "default" | "success" | "destructive"

interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (input: ToastInput) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)
const TOAST_DURATION_MS = 5000

/** Provider do sistema de notificação — envolve a árvore uma vez no root. */
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID()
      setToasts((current) => [
        ...current,
        { id, variant: input.variant ?? "default", title: input.title, description: input.description },
      ])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

/** Hook para disparar notificações: `const { toast } = useToast()`. */
function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast() deve ser usado dentro de <ToastProvider>")
  }
  return context
}

const toastVariantClasses: Record<ToastVariant, string> = {
  default: "bg-card text-card-foreground",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast: item, onDismiss }: ToastItemProps) {
  return (
    <div
      role="status"
      data-slot="toast"
      className={cn(
        "relative flex w-full max-w-sm flex-col gap-0.5 rounded-lg border border-border p-4 pr-9 shadow-lg",
        toastVariantClasses[item.variant],
      )}
    >
      <p className="text-sm font-medium">{item.title}</p>
      {item.description && <p className="text-sm opacity-90">{item.description}</p>}
      <button
        type="button"
        aria-label="Descartar notificação"
        onClick={() => onDismiss(item.id)}
        className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-md opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

/** Renderizado uma vez no root da árvore, ao lado do `<ToastProvider>`. */
function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto w-full sm:w-auto">
          <ToastItem toast={item} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}

export { ToastProvider, Toaster, useToast }
