import type { Batch } from "@/types"

const STORAGE_KEY = "mit-timetable-profile"

export type Profile = {
  name: string
  batch: Batch
}

const BATCHES: readonly Batch[] = ["F1", "F2", "F3"]

const listeners = new Set<() => void>()

function isBatch(value: unknown): value is Batch {
  return typeof value === "string" && BATCHES.includes(value as Batch)
}

function readStored(): Profile | null {
  if (typeof localStorage === "undefined") {
    return null
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) {
      return null
    }

    const record = parsed as { name?: unknown; batch?: unknown }
    if (typeof record.name !== "string" || !isBatch(record.batch)) {
      return null
    }

    const name = record.name.trim()
    if (!name) {
      return null
    }

    return { name, batch: record.batch }
  } catch {
    return null
  }
}

let profile = readStored()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeProfile(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getProfile() {
  return profile
}

export function readProfile() {
  profile = readStored()
  return profile
}

export function hasText(value: string) {
  return value.trim().length > 0
}

export function saveProfile(next: Profile) {
  const name = next.name.trim()
  if (!name || !isBatch(next.batch)) {
    return
  }

  profile = { name, batch: next.batch }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  emit()
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) {
      return
    }

    profile = readStored()
    emit()
  })
}
