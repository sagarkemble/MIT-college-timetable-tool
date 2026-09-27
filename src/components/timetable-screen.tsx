import { useEffect, useLayoutEffect, useState } from "react"
import { addDays, format, isSameDay, startOfDay } from "date-fns"
import { CalendarDaysIcon } from "lucide-react"

import { GlanceDeck } from "@/components/glance-deck"
import { SettingsSheet } from "@/components/settings-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNow } from "@/hooks/use-now"
import { useProfile } from "@/hooks/use-profile"
import { cardsFor, liveIndex } from "@/lib/schedule"

export function TimetableScreen() {
  const profile = useProfile()
  const now = useNow()
  const [selected, setSelected] = useState(() => startOfDay(new Date()))
  const [index, setIndex] = useState(0)
  const [landToken, setLandToken] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const batch = profile?.batch

  const cards = batch ? cardsFor(selected, batch, now) : []
  const activeIndex = cards.length === 0 ? 0 : Math.min(index, cards.length - 1)
  const card = cards[activeIndex]
  const viewingToday = isSameDay(selected, now)

  useLayoutEffect(() => {
    if (!batch) {
      return
    }
    const clock = new Date()
    setIndex(liveIndex(cardsFor(selected, batch, clock), selected, clock))
  }, [selected, batch, landToken])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return
      }
      if (
        document.querySelector(
          "[data-slot=sheet-content], [data-slot=popover-content]"
        )
      ) {
        return
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        setIndex((current) => Math.min(current + 1, cards.length - 1))
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        setIndex((current) => Math.max(current - 1, 0))
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        setSelected((current) => addDays(current, 1))
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        setSelected((current) => addDays(current, -1))
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [cards.length])

  if (!profile || !batch || !card) {
    return null
  }

  const nextDay = addDays(selected, 1)
  const previousDay = addDays(selected, -1)
  const laterCards = cardsFor(nextDay, batch, now)
  const earlierCards = cardsFor(previousDay, batch, now)
  const laterDay = laterCards[liveIndex(laterCards, nextDay, now)]
  const earlierDay = earlierCards[liveIndex(earlierCards, previousDay, now)]

  function pickDate(date: Date | undefined) {
    if (!date) {
      return
    }
    setSelected(startOfDay(date))
    setCalendarOpen(false)
  }

  function goToday() {
    const today = startOfDay(new Date())
    const clock = new Date()
    if (isSameDay(selected, today)) {
      setIndex(liveIndex(cardsFor(today, batch, clock), today, clock))
      return
    }
    setSelected(today)
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium">
            {format(selected, "EEEE, d MMM")}
          </p>
          {viewingToday ? <Badge variant="secondary">Today</Badge> : null}
        </div>
        <SettingsSheet
          profile={profile}
          onSaved={() => setLandToken((token) => token + 1)}
        />
      </header>
      <GlanceDeck
        card={card}
        previous={cards[activeIndex - 1]}
        next={cards[activeIndex + 1]}
        earlierDay={earlierDay}
        laterDay={laterDay}
        onPrevious={() => setIndex((current) => Math.max(current - 1, 0))}
        onNext={() =>
          setIndex((current) => Math.min(current + 1, cards.length - 1))
        }
        onEarlierDay={() => setSelected((current) => addDays(current, -1))}
        onLaterDay={() => setSelected((current) => addDays(current, 1))}
      />
      <footer className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <Button variant="outline" onClick={goToday}>
          Today
        </Button>
        <p className="text-sm text-muted-foreground">
          {activeIndex + 1} of {cards.length}
        </p>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="Choose a date"
              />
            }
          >
            <CalendarDaysIcon />
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              weekStartsOn={1}
              selected={selected}
              onSelect={pickDate}
            />
          </PopoverContent>
        </Popover>
      </footer>
    </div>
  )
}
