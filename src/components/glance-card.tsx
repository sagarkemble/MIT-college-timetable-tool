import { CardArt } from "@/components/card-art"
import { Badge } from "@/components/ui/badge"
import { formatRange, type CardStatus, type GlanceCard } from "@/lib/schedule"
import { cn } from "cn"

function StatusLine({ status }: { status: CardStatus }) {
  return (
    <Badge
      variant={status === "Ongoing" ? "default" : "secondary"}
      className="h-7 px-3 text-sm"
    >
      {status}
    </Badge>
  )
}

export function GlanceCardView({
  card,
  className,
}: {
  card: GlanceCard
  className?: string
}) {
  if (card.kind === "creative") {
    return (
      <article
        className={cn(
          "flex h-full flex-col justify-between rounded-3xl bg-card p-6 text-card-foreground shadow-xl ring-1 ring-foreground/10",
          className
        )}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <CardArt illustration={card.illustration} className="size-40" />
          <h2 className="text-4xl font-semibold tracking-tight">
            {card.label}
          </h2>
          {card.dateLabel ? (
            <p className="text-lg text-muted-foreground">{card.dateLabel}</p>
          ) : null}
          {card.startTime && card.endTime ? (
            <p className="text-lg text-muted-foreground">
              {formatRange(card.startTime, card.endTime)}
            </p>
          ) : null}
        </div>
        <div className="flex justify-center">
          {card.status ? <StatusLine status={card.status} /> : <span />}
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-3xl bg-card p-6 text-card-foreground shadow-xl ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="flex flex-1 flex-col justify-center gap-3">
        {card.room ? (
          <p className="text-6xl font-semibold tracking-wide">{card.room}</p>
        ) : null}
        <h2
          className={cn(
            "font-semibold tracking-tight text-balance",
            card.room ? "text-2xl" : "text-5xl"
          )}
        >
          {card.subject}
        </h2>
        <p className="text-lg text-muted-foreground">
          {formatRange(card.startTime, card.endTime)}
        </p>
        <p className="text-base">{card.sessionKind}</p>
        <p className="text-base text-muted-foreground">{card.faculty}</p>
      </div>
      <div>{card.status ? <StatusLine status={card.status} /> : null}</div>
    </article>
  )
}
