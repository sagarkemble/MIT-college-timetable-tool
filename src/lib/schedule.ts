import { format, isSameDay } from "date-fns"

import timetableData from "@/time-table.json"
import type { Batch, SessionType, TimeTable, Weekday } from "@/types"

export const timetable = timetableData as TimeTable

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

export type CardStatus = "Done" | "Ongoing" | "Next" | "Later"

export type SessionKind = "Lecture" | "Practical" | "Other"

type TimedCard = {
  id: string
  startTime: string
  endTime: string
  status?: CardStatus
}

export type ClassCard = TimedCard & {
  kind: "class"
  subject: string
  sessionKind: SessionKind
  faculty: string
  room?: string
}

export type CreativeLabel = "Short break" | "Lunch" | "Free" | "Sunday"

export type CreativeCard = {
  id: string
  kind: "creative"
  label: CreativeLabel
  illustration: "short-break" | "lunch" | "free" | "sunday"
  startTime?: string
  endTime?: string
  dateLabel?: string
  status?: CardStatus
}

export type GlanceCard = ClassCard | CreativeCard

type MergePiece = {
  id: string
  startTime: string
  endTime: string
  label?: CreativeLabel
  illustration?: CreativeCard["illustration"]
  subject?: string
  sessionKind?: SessionKind
  faculty?: string
  room?: string
  creative: boolean
}

function clockMinutes(clock: string) {
  const [hour, minute] = clock.split(":").map(Number)
  return hour * 60 + minute
}

function nowMinutes(now: Date) {
  return now.getHours() * 60 + now.getMinutes()
}

function formatClock(clock: string) {
  const [hour, minute] = clock.split(":")
  return `${Number(hour)}:${minute}`
}

export function formatRange(startTime: string, endTime: string) {
  return `${formatClock(startTime)}–${formatClock(endTime)}`
}

function sessionKind(sessionType: SessionType): SessionKind {
  if (sessionType === "lab") {
    return "Practical"
  }
  if (sessionType === "lecture") {
    return "Lecture"
  }
  return "Other"
}

function hasRange(
  card: GlanceCard
): card is GlanceCard & { startTime: string; endTime: string } {
  return Boolean(card.startTime && card.endTime)
}

function canMerge(previous: MergePiece, next: MergePiece) {
  if (previous.creative || next.creative) {
    return false
  }
  if (previous.endTime !== next.startTime) {
    return false
  }
  if (!previous.subject && !next.subject) {
    return true
  }
  return (
    previous.subject === next.subject &&
    previous.sessionKind === next.sessionKind &&
    previous.faculty === next.faculty &&
    previous.room === next.room
  )
}

function pieceFor(
  day: Weekday,
  slot: TimeTable[number]["slots"][number],
  batch: Batch
): MergePiece {
  const id = `${day}-${slot.startTime}`
  if (slot.type === "break") {
    return {
      id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      label: "Short break",
      illustration: "short-break",
      creative: true,
    }
  }
  if (slot.type === "lunch-break") {
    return {
      id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      label: "Lunch",
      illustration: "lunch",
      creative: true,
    }
  }

  const allocation = slot.allocations.find((item) => item.batch === batch)
  if (!allocation) {
    return {
      id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      label: "Free",
      illustration: "free",
      creative: false,
    }
  }

  const room = allocation.room?.trim()
  return {
    id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    subject: allocation.subject,
    sessionKind: sessionKind(allocation.sessionType),
    faculty: allocation.faculty[0],
    room: room || undefined,
    creative: false,
  }
}

function toCard(piece: MergePiece): GlanceCard {
  if (piece.subject && piece.sessionKind && piece.faculty) {
    return {
      id: piece.id,
      kind: "class",
      startTime: piece.startTime,
      endTime: piece.endTime,
      subject: piece.subject,
      sessionKind: piece.sessionKind,
      faculty: piece.faculty,
      room: piece.room,
    }
  }

  return {
    id: piece.id,
    kind: "creative",
    label: piece.label ?? "Free",
    illustration: piece.illustration ?? "free",
    startTime: piece.startTime,
    endTime: piece.endTime,
  }
}

function withStatus(cards: GlanceCard[], selected: Date, now: Date) {
  if (!isSameDay(selected, now)) {
    return cards
  }

  const current = nowMinutes(now)
  let markedNext = false

  return cards.map((card) => {
    if (!hasRange(card)) {
      return card
    }

    const start = clockMinutes(card.startTime)
    const end = clockMinutes(card.endTime)
    let status: CardStatus
    if (current >= end) {
      status = "Done"
    } else if (current >= start) {
      status = "Ongoing"
    } else if (!markedNext) {
      status = "Next"
      markedNext = true
    } else {
      status = "Later"
    }

    return { ...card, status }
  })
}

export function cardsFor(
  selected: Date,
  batch: Batch,
  now: Date
): GlanceCard[] {
  const weekday = WEEKDAYS[selected.getDay()]
  if (weekday === "Sunday") {
    return [
      {
        id: `sunday-${format(selected, "yyyy-MM-dd")}`,
        kind: "creative",
        label: "Sunday",
        illustration: "sunday",
        dateLabel: format(selected, "d MMM yyyy"),
      },
    ]
  }

  const day = timetable.find((entry) => entry.day === weekday)
  if (!day) {
    return []
  }

  const merged: MergePiece[] = []
  for (const slot of day.slots) {
    const piece = pieceFor(day.day, slot, batch)
    const previous = merged.at(-1)
    if (previous && canMerge(previous, piece)) {
      previous.endTime = piece.endTime
      continue
    }
    merged.push(piece)
  }

  return withStatus(merged.map(toCard), selected, now)
}

export function liveIndex(cards: GlanceCard[], selected: Date, now: Date) {
  if (!isSameDay(selected, now) || cards.length === 0) {
    return 0
  }

  const current = nowMinutes(now)
  const ongoing = cards.findIndex(
    (card) =>
      hasRange(card) &&
      clockMinutes(card.startTime) <= current &&
      current < clockMinutes(card.endTime)
  )
  if (ongoing >= 0) {
    return ongoing
  }

  const first = cards.find(hasRange)
  if (first && current < clockMinutes(first.startTime)) {
    return 0
  }

  for (let index = cards.length - 1; index >= 0; index -= 1) {
    if (hasRange(cards[index])) {
      return index
    }
  }

  return 0
}
