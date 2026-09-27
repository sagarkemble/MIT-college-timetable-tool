import { useSyncExternalStore } from "react"

import { getProfile, subscribeProfile } from "@/lib/profile"

export function useProfile() {
  return useSyncExternalStore(subscribeProfile, getProfile, getProfile)
}
