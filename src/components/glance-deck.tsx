import { useRef, useState, type PointerEvent } from "react"

import { GlanceCardView } from "@/components/glance-card"
import type { GlanceCard } from "@/lib/schedule"

const SWIPE_THRESHOLD = 72
const PROMOTE_DISTANCE = 150
const MOVE_MS = 320
const MOVE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

type DragAxis = "x" | "y"

function promoteAmount(x: number, y: number) {
  return Math.min(1, Math.hypot(x, y) / PROMOTE_DISTANCE)
}

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

  function exitBy(axis: DragAxis) {
    const deck = deckRef.current
    if (!deck) {
      return 420
    }
    return axis === "x" ? deck.clientWidth + 36 : deck.clientHeight + 36
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
      const blocked = (x > 0 && !next) || (x < 0 && !previous)
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

    if (axis === "x" && x >= SWIPE_THRESHOLD && next) {
      release(exitBy("x"), 0, onNext)
      return
    }
    if (axis === "x" && x <= -SWIPE_THRESHOLD && previous) {
      release(-exitBy("x"), 0, onPrevious)
      return
    }
    if (axis === "y" && y <= -SWIPE_THRESHOLD) {
      release(0, -exitBy("y"), onLaterDay)
      return
    }
    if (axis === "y" && y >= SWIPE_THRESHOLD) {
      release(0, exitBy("y"), onEarlierDay)
      return
    }

    release(0, 0)
  }

  const behind =
    offset.y < -8
      ? laterDay
      : offset.y > 8
        ? earlierDay
        : offset.x < -8
          ? previous
          : next
  const promoted = promoteAmount(offset.x, offset.y)
  const behindScale = 0.965 + 0.035 * promoted
  const behindShift = 12 * (1 - promoted)
  const tilt = Math.max(-8, Math.min(8, offset.x / 24))
  const motion =
    dragging || instant
      ? "none"
      : `transform ${MOVE_MS}ms ${MOVE_EASE}, opacity ${MOVE_MS}ms ${MOVE_EASE}`

  return (
    <div
      ref={deckRef}
      data-deck
      className="relative min-h-0 flex-1 touch-none px-3 pb-2"
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
    >
      {behind ? (
        <div
          data-behind
          className="pointer-events-none absolute inset-x-3 top-0 bottom-2"
          style={{
            transform: `translate3d(0, ${behindShift}px, 0) scale(${behindScale})`,
            opacity: 0.72 + 0.28 * promoted,
            transformOrigin: "center center",
            transition: motion,
          }}
        >
          <GlanceCardView card={behind} />
        </div>
      ) : null}
      <div
        key={card.id}
        className="absolute inset-x-3 top-0 bottom-2"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${tilt}deg)`,
          transition:
            dragging || instant
              ? "none"
              : `transform ${MOVE_MS}ms ${MOVE_EASE}`,
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
