import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

type TabsOrientation = "horizontal" | "vertical"

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  orientation: TabsOrientation
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error(`<${component}> deve ser usado dentro de <Tabs>`)
  }
  return context
}

interface TabsProps extends Omit<ComponentProps<"div">, "onChange"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: TabsOrientation
  children?: ReactNode
}

/** Tabs acessíveis (role="tablist"/"tab"/"tabpanel") em Tailwind puro, sem Radix. */
function Tabs({
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
  ...props
}: TabsProps) {
  const baseId = useId()
  const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? "")
  const activeValue = value ?? internalValue

  function setValue(next: string) {
    if (value === undefined) {
      setInternalValue(next)
    }
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue, orientation, baseId }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn("flex gap-2", orientation === "vertical" ? "flex-row" : "flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const tabsListVariantClasses = {
  default: "bg-muted",
  line: "gap-1 bg-transparent",
} as const

type TabsListVariant = keyof typeof tabsListVariantClasses

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: ComponentProps<"div"> & { variant?: TabsListVariant }) {
  const { orientation } = useTabsContext("TabsList")
  const listRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const list = listRef.current
    if (!list) return

    const tabs = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    )
    if (tabs.length === 0) return

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement)
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight"
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft"

    let nextIndex: number | null = null
    if (event.key === nextKey) {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % tabs.length
    } else if (event.key === prevKey) {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex - 1 + tabs.length) % tabs.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1
    }

    if (nextIndex !== null) {
      event.preventDefault()
      tabs[nextIndex].focus()
      tabs[nextIndex].click()
    }
  }

  return (
    <div
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground",
        orientation === "horizontal" ? "h-9" : "h-fit flex-col",
        variant === "line" ? "rounded-none" : undefined,
        tabsListVariantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps extends Omit<ComponentProps<"button">, "value"> {
  value: string
}

function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue, baseId, orientation } = useTabsContext("TabsTrigger")
  const isActive = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-trigger-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-content-${value}`}
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        orientation === "vertical" && "w-full justify-start",
        isActive && "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30",
        className,
      )}
      {...props}
    />
  )
}

interface TabsContentProps extends ComponentProps<"div"> {
  value: string
}

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext("TabsContent")
  const isActive = activeValue === value

  return (
    <div
      role="tabpanel"
      id={`${baseId}-content-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      hidden={!isActive}
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
