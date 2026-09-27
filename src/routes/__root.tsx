import { createRootRoute } from "@tanstack/react-router"

import { NotFound, RootLayout } from "@/components/root-layout"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})
