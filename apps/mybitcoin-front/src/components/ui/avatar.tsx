import * as React from "react"

import { cn } from "@/lib/utils"

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

export interface AvatarProps extends React.ComponentProps<"span"> {
  src?: string
  alt?: string
  /** Nome usado para gerar as iniciais de fallback quando não há imagem. */
  name?: string
}

/** Círculo com imagem ou fallback de iniciais — sem Radix. */
function Avatar({ className, src, alt = "", name, ...props }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false)
  const showImage = !!src && !hasError

  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground select-none",
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span aria-hidden="true">{name ? initialsFromName(name) : "?"}</span>
      )}
    </span>
  )
}

export { Avatar }
