import { useState } from "react"
import { SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useTheme } from "@/components/theme-provider"
import { hasText, saveProfile, type Profile } from "@/lib/profile"
import type { Batch } from "@/types"

const BATCHES: Batch[] = ["F1", "F2", "F3"]
const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const

type ThemeChoice = (typeof THEMES)[number]["value"]

function isBatch(value: string): value is Batch {
  return BATCHES.includes(value as Batch)
}

function isTheme(value: string): value is ThemeChoice {
  return THEMES.some((theme) => theme.value === value)
}

export function SettingsSheet({
  profile,
  onSaved,
}: {
  profile: Profile
  onSaved: () => void
}) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(profile.name)
  const [batch, setBatch] = useState<Batch>(profile.batch)
  const [draftTheme, setDraftTheme] = useState<ThemeChoice>(theme)

  function openChange(next: boolean) {
    if (next) {
      setName(profile.name)
      setBatch(profile.batch)
      setDraftTheme(theme)
    }
    setOpen(next)
  }

  function save() {
    if (!hasText(name)) {
      return
    }

    saveProfile({ name, batch })
    setTheme(draftTheme)
    setOpen(false)
    onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={openChange}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Settings" />}
      >
        <SettingsIcon />
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Changes are kept on this phone after you save.
          </SheetDescription>
        </SheetHeader>
        <FieldSet className="px-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="settings-name">Name</FieldLabel>
              <Input
                id="settings-name"
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
                value={[batch]}
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
            <Field>
              <FieldLabel>Theme</FieldLabel>
              <ToggleGroup
                variant="outline"
                spacing={0}
                className="w-full"
                value={[draftTheme]}
                onValueChange={(values) => {
                  const next = values.at(-1)
                  if (next && isTheme(next)) {
                    setDraftTheme(next)
                  }
                }}
              >
                {THEMES.map((item) => (
                  <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    className="flex-1"
                  >
                    {item.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </FieldSet>
        <SheetFooter>
          <Button disabled={!hasText(name)} onClick={save}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
