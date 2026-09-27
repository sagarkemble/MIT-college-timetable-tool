import type { ReactNode } from "react"

import type { CreativeCard } from "@/lib/schedule"

function ArtFrame({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden fill="none">
      {children}
    </svg>
  )
}

export function CardArt({
  illustration,
  className,
}: {
  illustration: CreativeCard["illustration"]
  className?: string
}) {
  if (illustration === "short-break") {
    return (
      <ArtFrame className={className}>
        <path
          d="M48 78h64v28a24 24 0 0 1-24 24H72a24 24 0 0 1-24-24V78Z"
          className="fill-primary/15 stroke-primary"
          strokeWidth="4"
        />
        <path
          d="M58 78c2-16 10-24 22-24s20 8 22 24"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M112 86h10a10 10 0 0 1 0 20h-10"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M68 42c0-8 6-10 6-18M80 38c0-8 6-10 6-18M92 42c0-8 6-10 6-18"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </ArtFrame>
    )
  }

  if (illustration === "lunch") {
    return (
      <ArtFrame className={className}>
        <ellipse
          cx="80"
          cy="96"
          rx="46"
          ry="18"
          className="fill-primary/15 stroke-primary"
          strokeWidth="4"
        />
        <path
          d="M52 96c4-28 16-44 28-44s24 16 28 44"
          className="fill-primary/10 stroke-primary"
          strokeWidth="4"
        />
        <path
          d="M68 62c4 8 8 8 12 0M80 58c4 8 8 8 12 0"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </ArtFrame>
    )
  }

  if (illustration === "free") {
    return (
      <ArtFrame className={className}>
        <circle
          cx="112"
          cy="48"
          r="16"
          className="fill-primary/15 stroke-primary"
          strokeWidth="4"
        />
        <path
          d="M28 118c22-28 40-40 52-40 18 0 28 16 52 40"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M46 118h72"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M70 90c6 10 14 10 20 0"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </ArtFrame>
    )
  }

  return (
    <ArtFrame className={className}>
      <circle
        cx="80"
        cy="78"
        r="28"
        className="fill-primary/15 stroke-primary"
        strokeWidth="4"
      />
      <path
        d="M80 34v10M80 112v10M36 78h10M114 78h10M48 46l8 8M104 102l8 8M112 46l-8 8M56 102l-8 8"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M36 128h88"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </ArtFrame>
  )
}
