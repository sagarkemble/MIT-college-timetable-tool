# UI design plan

Screen structure confirmed for the timetable app. Phone first. On a wide screen the same column sits centered with a max width.

The week repeats. A chosen date selects that date’s weekday. Monday through Saturday come from `src/time-table.json`. Sunday is not in the file. The page draws the Holiday card itself.

The phone’s local time is the clock. A slot owns Now from its start inclusive to its end exclusive. At 09:25, slot 2 owns Now. At 16:50 the last slot has ended and nothing is Now.

## Routes

| Path          | Screen    |
| ------------- | --------- |
| `/`           | Timetable |
| `/onboarding` | First run |

`/` redirects to `/onboarding` when the saved name or batch is missing. A successful onboarding save redirects to `/`. Opening `/onboarding` when both are already stored redirects to `/`. Later edits happen in the gear sheet on `/`.

Name, batch, and theme stay in local storage. The chosen date lasts for the visit. A reload opens today.

Until the first theme save, theme follows the system setting. The `d` key does nothing.

## Onboarding

`/onboarding` is one screen:

- A name field.
- F1, F2, and F3. One is selected.
- Continue.

Continue stays off until the name contains a non-space character and a batch is selected. The stored name is the trimmed name. This screen has no greeting, gear, day list, or bottom bar.

## Timetable chrome

The header stays fixed. The day list is the only region that scrolls. The bottom bar stays fixed.

**Header.** Left: `Good morning, Priya.` The word follows the clock: morning from 05:00, afternoon from 12:00, evening from 17:00. The line is one line. A long name ends with `...`. The full name is what is stored and what the sheet shows. Right: the gear only.

**Bottom bar.** Weekday and short date, as in `Saturday, 26 Sep`. A calendar button. Reset appears only when the selected date is not today. Reset sets the date to today and runs the same scroll as opening the app.

**Scroll.** Opening, reloading, or reset scrolls the Now row up under the header when today has a row in progress. Otherwise the list stays at the top. That includes the time before 08:30, a gap with no row, the time from 16:50 on, and Sunday.

## Gear sheet

The gear opens a bottom sheet. Tap outside, or the close control, dismisses it.

The sheet contains:

- Name, an editable field.
- Batch: F1, F2, F3.
- Theme: Light, Dark, System.
- Save.

Nothing is written until Save. Save stays off until the name contains a non-space character. Dismissing without Save keeps the previous name, batch, and theme.

## The day list

Monday through Saturday lists all 11 slots in time order. Slot numbers are not printed.

| Slot | Time        | Row                  |
| ---- | ----------- | -------------------- |
| 1    | 08:30–09:25 | Class or Free period |
| 2    | 09:25–10:20 | Class or Free period |
| 3    | 10:20–10:30 | Break                |
| 4    | 10:30–11:25 | Class or Free period |
| 5    | 11:25–12:20 | Class or Free period |
| 6    | 12:20–13:15 | Lunch                |
| 7    | 13:15–14:10 | Class or Free period |
| 8    | 14:10–15:05 | Class or Free period |
| 9    | 15:05–15:10 | Break                |
| 10   | 15:10–16:00 | Class or Free period |
| 11   | 16:00–16:50 | Class or Free period |

Each slot is its own row. Neighboring free slots stay separate. Saturday uses this same list. Where Saturday’s class slots have no subject, each one is a Free period card, with Break and Lunch still in place.

**Class card.** Shown when this batch has a subject in that slot. The time range, the full subject (it wraps), the code when the file has one, a Lecture or Lab badge, the faculty name, and the room when the file has one.

**Free period card.** Shown when this slot is a class slot and this batch has no subject, including when another batch has a class then. Time range and the title `Free period`. One card per slot.

**Break and lunch.** Quiet rows: `Break · 10:20–10:30`, `Break · 15:05–15:10`, and `Lunch · 12:20–13:15`.

Free, break, and lunch rows have less visual weight than a class card.

**Now.** When the selected day is today, the one row whose time contains the clock gets a Now badge. The badge looks the same on a class, free period, break, or lunch row. Other days have no Now badge.

## Sunday

One Holiday card. No slot times. The bottom bar still shows that Sunday’s date, the calendar button, and Reset when that Sunday is not today.

## Calendar

The calendar button opens the shadcn calendar in a popover above the button. The week starts on Monday. Choosing a date selects that weekday, closes the popover, and shows that day’s list. Any date in the grid can be chosen. Every Monday shows Monday’s slots.
