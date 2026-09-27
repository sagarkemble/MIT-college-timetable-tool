import { createFileRoute, redirect } from "@tanstack/react-router"

import { TimetableScreen } from "@/components/timetable-screen"
import { readProfile } from "@/lib/profile"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (!readProfile()) {
      throw redirect({ to: "/onboarding" })
    }
  },
  component: TimetableScreen,
})
