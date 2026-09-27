import { createFileRoute, redirect } from "@tanstack/react-router"

import { OnboardingScreen } from "@/components/onboarding-screen"
import { readProfile } from "@/lib/profile"

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    if (readProfile()) {
      throw redirect({ to: "/" })
    }
  },
  component: OnboardingScreen,
})
