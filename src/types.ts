export type Batch = "F1" | "F2" | "F3"

export type Weekday =
  "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"

export type SlotNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type SessionType = "lecture" | "lab" | "other"

export type Allocation = {
  batch: Batch
  subject: string
  subjectCode?: string
  sessionType: SessionType
  faculty: [string]
  room?: string
}

export type Slot = {
  slotNumber: SlotNumber
  startTime: string
  endTime: string
  type: "class"
  allocations: Allocation[]
}

export type DaySchedule = {
  day: Weekday
  slots: Slot[]
}

export type TimeTable = DaySchedule[]
