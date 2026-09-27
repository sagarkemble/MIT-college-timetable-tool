import { Link, Outlet } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export function RootLayout() {
  return <Outlet />
}

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-5">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Button render={<Link to="/" />}>Back to the timetable</Button>
    </main>
  )
}
