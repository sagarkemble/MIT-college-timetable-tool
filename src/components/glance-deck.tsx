import { useRef, useState, type PointerEvent } from "react"

import { GlanceCardView } from "@/components/glance-card"
import type { GlanceCard } from "@/lib/schedule"

const SWIPE_THRESHOLD = 64
const MOVE_MS = 280
const MOVE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

type DragAxis = "x" | "y"

export function GlanceDeck({
  card,
  previous,
  next,
  earlierDay,
  laterDay,
  onPrevious,
  onNext,
  onEarlierDay,
  onLaterDay,
}: {
  card: GlanceCard
  previous?: GlanceCard
  next?: GlanceCard
  earlierDay: GlanceCard
  laterDay: GlanceCard
  onPrevious: () => void
  onNext: () => void
  onEarlierDay: () => void
  onLaterDay: () => void
}) {
  const origin = useRef({ x: 0, y: 0, id: -1, axis: null as DragAxis | null })
  const offsetRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const pending = useRef<(() => void) | null>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [instant, setInstant] = useState(false)

  function setDrag(x: number, y: number) {
    offsetRef.current = { x, y }
    setOffset({ x, y })
  }

  function deckSize() {
    const deck = deckRef.current
    return {
      width: deck?.clientWidth ?? 390,
      height: deck?.clientHeight ?? 640,
    }
  }

  function settle() {
    const action = pending.current
    if (!action) {
      return
    }
    pending.current = null
    setInstant(true)
    setDragging(false)
    setDrag(0, 0)
    action()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstant(false))
    })
  }

  function release(x: number, y: number, action?: () => void) {
    setDragging(false)
    requestAnimationFrame(() => {
      if (!action) {
        setDrag(0, 0)
        return
      }
      pending.current = action
      setDrag(x, y)
      window.setTimeout(settle, MOVE_MS + 40)
    })
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (pending.current) {
      return
    }
    origin.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      axis: null,
    }
    draggingRef.current = true
    setDragging(true)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // A synthetic pointer event cannot capture the pointer.
    }
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      !draggingRef.current ||
      event.pointerId !== origin.current.id ||
      pending.current
    ) {
      return
    }

    let x = event.clientX - origin.current.x
    let y = event.clientY - origin.current.y
    if (!origin.current.axis && Math.hypot(x, y) > 10) {
      origin.current.axis = Math.abs(x) > Math.abs(y) ? "x" : "y"
    }

    if (origin.current.axis === "x") {
      y = 0
      const blocked = (x > 0 && !previous) || (x < 0 && !next)
      if (blocked) {
        x *= 0.22
      }
    } else if (origin.current.axis === "y") {
      x = 0
    } else {
      return
    }

    setDrag(x, y)
  }

  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerId !== origin.current.id || pending.current) {
      return
    }

    const { x, y } = offsetRef.current
    const axis = origin.current.axis
    origin.current.axis = null
    draggingRef.current = false
    const { width, height } = deckSize()

    if (axis === "x" && x >= SWIPE_THRESHOLD && previous) {
      release(width, 0, onPrevious)
      return
    }
    if (axis === "x" && x <= -SWIPE_THRESHOLD && next) {
      release(-width, 0, onNext)
      return
    }
    if (axis === "y" && y <= -SWIPE_THRESHOLD) {
      release(0, -height, onLaterDay)
      return
    }
    if (axis === "y" && y >= SWIPE_THRESHOLD) {
      release(0, height, onEarlierDay)
      return
    }

    release(0, 0)
  }

  const { width, height } = deckSize()
  const incoming =
    offset.y < -8
      ? laterDay
      : offset.y > 8
        ? earlierDay
        : offset.x > 8
          ? previous
          : offset.x < -8
            ? next
            : undefined
  const incomingX =
    Math.abs(offset.x) > Math.abs(offset.y)
      ? offset.x > 0
        ? offset.x - width
        : offset.x + width
      : 0
  const incomingY =
    Math.abs(offset.y) > Math.abs(offset.x)
      ? offset.y > 0
        ? offset.y - height
        : offset.y + height
      : 0
  const motion =
    dragging || instant ? "none" : `transform ${MOVE_MS}ms ${MOVE_EASE}`

  return (
    <div
      ref={deckRef}
      data-deck
      className="relative min-h-0 flex-1 touch-none overflow-hidden px-3 pb-2"
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
    >
      {incoming ? (
        <div
          data-behind
          className="pointer-events-none absolute inset-x-3 top-0 bottom-2"
          style={{
            transform: `translate3d(${incomingX}px, ${incomingY}px, 0)`,
            transition: motion,
          }}
        >
          <GlanceCardView card={incoming} />
        </div>
      ) : null}
      <div
        key={card.id}
        className="absolute inset-x-3 top-0 bottom-2"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: motion,
        }}
        onTransitionEnd={(event) => {
          if (event.propertyName === "transform") {
            settle()
          }
        }}
      >
        <GlanceCardView
          card={card}
          className="cursor-grab active:cursor-grabbing"
        />
      </div>
    </div>
  )
}
