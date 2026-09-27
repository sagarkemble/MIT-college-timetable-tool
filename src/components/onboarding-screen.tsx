import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { hasText, saveProfile } from "@/lib/profile"
import type { Batch } from "@/types"

const BATCHES: Batch[] = ["F1", "F2", "F3"]

function isBatch(value: string): value is Batch {
  return BATCHES.includes(value as Batch)
}

export function OnboardingScreen() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [batch, setBatch] = useState<Batch | null>(null)
  const canContinue = hasText(name) && batch !== null

  function continueSetup() {
    if (!batch || !hasText(name)) {
      return
    }

    saveProfile({ name, batch })
    void navigate({ to: "/" })
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-5 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Set up your timetable
        </h1>
        <p className="text-sm text-muted-foreground">
          Your name and batch stay on this phone.
        </p>
      </div>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="student-name">Name</FieldLabel>
            <Input
              id="student-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Batch</FieldLabel>
            <ToggleGroup
              variant="outline"
              spacing={0}
              className="w-full"
              value={batch ? [batch] : []}
              onValueChange={(values) => {
                const next = values.at(-1)
                if (next && isBatch(next)) {
                  setBatch(next)
                }
              }}
            >
              {BATCHES.map((item) => (
                <ToggleGroupItem key={item} value={item} className="flex-1">
                  {item}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Button size="lg" disabled={!canContinue} onClick={continueSetup}>
        Continue
      </Button>
    </main>
  )
}
