# PRD: MIT timetable glance

This document is the behavior spec for the timetable app. Schedule rows live in `mit_computer_engineering_timetable.md`. If a scenario and a rule ever disagree, the rule wins.

The app is a phone website that can be installed. A student opens it between buildings and sees the card for what is happening now: subject, kind of session, time, faculty, and the room code in the largest type.

## Problem

Rohan’s class at MIT Academy of Engineering, Computer Engineering, has about 70–80 students in batches F1, F2, and F3. Lectures are for the whole class. Practicals are per batch, often in a different building. The official timetable is a photo. Between slots he unlocks his phone, zooms the photo, and hunts for his batch, the room, and the building.

## Product

One installed site for this class, for this semester. The week is fixed: Monday through Saturday each have their own day, and that week repeats for the two or three months the sheet is in force. Sunday is a holiday card.

Anyone with the link can use it. The first launch asks for a name and a batch. Both stay on the phone. There is no account and no server.

## Words

| Word          | Meaning                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Batch         | F1, F2, or F3. Chosen once, changeable in settings. Every card list is for that batch only.                                      |
| Slot          | One fixed clock interval in the day template below.                                                                              |
| Session       | A class assigned to a batch in a slot: subject, kind, faculty, room.                                                             |
| Card          | One swipe stop. A card may cover two slots when they are the same session.                                                       |
| Hot card      | The card in front.                                                                                                               |
| Live card     | Today’s ongoing card, or today’s next card when the day has not started. After the day ends, the live card is today’s last card. |
| Creative card | Short break, lunch, free, or Sunday. Illustration, time (except Sunday), and a plain label.                                      |
| Class card    | Lecture, practical, or other. Room code is the largest text.                                                                     |
| Sheet         | The semester week bundled in the app.                                                                                            |

## Day template

Every Monday through Saturday uses these slots. The clock is the phone’s local time. The college is in Pune; the app does not apply a second timezone.

| #   | Time        | Role        |
| --- | ----------- | ----------- |
| 1   | 8:30–9:25   | Class       |
| 2   | 9:25–10:20  | Class       |
| 3   | 10:20–10:30 | Short break |
| 4   | 10:30–11:25 | Class       |
| 5   | 11:25–12:20 | Class       |
| 6   | 12:20–13:15 | Lunch       |
| 7   | 13:15–14:10 | Class       |
| 8   | 14:10–15:05 | Class       |
| 9   | 15:05–15:10 | Short break |
| 10  | 15:10–16:00 | Class       |
| 11  | 16:00–16:50 | Class       |

A card is active from its start time inclusive to its end time exclusive. At 10:20 the short-break card is already the ongoing card. At 16:50 the last card has ended.

## How a day becomes cards

Build the open day’s cards for the saved batch in this order.

1. Start from the eleven slots.
2. Short break and lunch are creative cards for every batch. They always occupy slots 3, 6, and 9.
3. A class slot with a session for his batch becomes a class card for that slot.
4. A class slot with no session for his batch becomes a free card for that slot. Another batch can be in a lab at the same time. His card is still Free.
5. Merge neighboring class-slot cards when all of these match: subject, kind, faculty, room, and the second slot starts at the exact end of the first. The merged card’s time is the start of the first slot through the end of the second. A short break or lunch stays between groups, so a morning lab and an afternoon lab stay two cards even when the subject text matches.
6. Two free class slots in a row merge the same way. Tuesday F2 has no session in slots 1 and 2, so that is one free card, 8:30–10:20.
7. Sunday has one creative card. It has the Sunday illustration, the label Sunday, and the calendar date. It has no slot times and no status.

Store the sheet per batch, including lectures. A lecture that everyone attends is three stored sessions with the same subject, room, and faculty. The viewer still shows his batch’s copy. That keeps a later edit possible where two batches stay in the lecture and the third batch has a practical.

One faculty name per session. Auxiliary codes such as CNL and HL are not faculty and do not appear on cards.

Kind on a class card is one of Lecture, Practical, or Other. The title is the subject as stored. Other uses the real name from the sheet, such as Project, Sports, Office hours, Make-up, Guest Talk, or Library Hours. Those are class cards when the sheet assigns them. They are not creative cards.

Room codes are copied exactly. `H204A` and `H204B` are different rooms.

## Hot card and status

Status exists only when the open day is today. On any other date, cards have no status line.

When the open day is today, label every card from the clock:

| Clock                                                                                     | That card’s status |
| ----------------------------------------------------------------------------------------- | ------------------ |
| Now is before the card’s start, and the card is the first card whose start is still ahead | Next               |
| Now is before the card’s start, and a Next card already exists earlier                    | Later              |
| Card start ≤ now < card end                                                               | Ongoing            |
| Now is at or after the card’s end                                                         | Done               |

Landing rules. These run on first paint, when he arrives on a day by vertical swipe or the calendar, and when he presses the nav button. A horizontal swipe does not re-run them. Status labels stay tied to the clock while he swipes inside today.

| When the screen opens or he arrives on a day                  | Hot card                   |
| ------------------------------------------------------------- | -------------------------- |
| Open day is today, and now is inside some card                | That card                  |
| Open day is today, and now is before the first card           | The first card             |
| Open day is today, and now is at or after the last card’s end | The last card              |
| Open day is any other date, including Sunday                  | The first card of that day |

The nav button always loads today and then applies the today row above. If he was already on today but had swiped to a later card, the button returns him to the live card.

Horizontal swipe moves one card and stops on the first and the last card of the open day. From a merged lab, the next card is the short break, not a second copy of the lab. A horizontal swipe never changes the date.

Finger up loads the next calendar date. Finger down loads the previous calendar date. The new day uses the landing rules. Swiping can leave the current week in either direction. Every date uses the weekday’s cards. Tuesday 20 October and every other Tuesday show Tuesday’s sheet. Every Sunday shows the Sunday card.

The calendar icon opens a month calendar. The date he picks becomes the open day and uses the same landing rules. The calendar can reach any date.

The header shows the open day’s weekday and calendar date. On today it also shows the word Today.

## Card layout

Class card, top to bottom:

1. Room code, largest text. If the sheet has no room, omit the room line and let the subject lead.
2. Subject.
3. Start and end, written as `8:30–10:20`.
4. Kind: Lecture, Practical, or Other.
5. One faculty name.
6. On today, the status: Done, Ongoing, Next, or Later.

Creative card:

1. That card’s illustration, shipped with the app.
2. Label: Short break, Lunch, Free, or Sunday.
3. Time range for short break, lunch, and free. Sunday has the date instead of a slot range.
4. On today, the same status line as a class card, except Sunday, which has no status.

There are four illustrations: short break, lunch, free, and Sunday. They load with the app and work offline. Class cards have no illustration. His name is not printed on any card.

## Screens

**Onboarding.** Shown when the phone has no saved name or no saved batch. He enters a name and chooses F1, F2, or F3. The name is stored trimmed. An empty name is not saved. After save, the app opens today on the live card.

**Viewer.** The day described above. This is the only screen after onboarding.

**Settings.** He can change his name and his batch. Changing the batch rebuilds the open day’s cards immediately and applies the landing rules again. Changing the name does not change cards. Returning from settings leaves him on the same date he was viewing, on the card the landing rules choose.

If the saved profile is missing or unreadable, onboarding shows again.

## Offline and updates

The sheet, the four illustrations, and the app shell ship together. After the site has loaded once and been installed, opening it with no network still shows cards, illustrations, and the saved profile.

The sheet is not edited on the phone. A timetable change is a new deploy. The next time the installed app opens online, it loads that new sheet. The saved name and batch stay. An offline open keeps showing the last sheet the phone already loaded.

## Scenarios

Rohan is F2 in these stories. The same rules apply to F1 and F3 with their own sessions.

### He installs it on the way to college

It is Monday, 7:50. Rohan opens the site for the first time. The page asks for his name and his batch. He types Rohan and chooses F2. The viewer opens on Monday. The hot card is Programming Lab, 8:30–10:20, room H205, marked Next. The short break behind it is Later. Nothing is Ongoing yet, because 8:30 has not arrived.

### The lab is already underway

It is Monday, 9:40. He opens the app. Slots 1 and 2 are the same Programming Lab in H205, so they are one card from 8:30 to 10:20. That card is Ongoing. He swipes right once and sees the short break, 10:20–10:30, marked Next. He does not see a second Programming Lab card for 9:25–10:20.

At 9:25 exactly the lab card is still Ongoing. The merge does not tick forward at the inner boundary.

### The ten-minute break

It is Monday, 10:25. The hot card is the short-break illustration, labeled Short break, 10:20–10:30, Ongoing. The next right swipe is the 10:30 class, marked Next. At 10:20:00 the break is already Ongoing. At 10:30:00 the break is Done and the 10:30 class is Ongoing.

### His batch is free while the others are in lab

It is Tuesday, 8:45. F1 and F3 have practicals. F2 has no session in slots 1 and 2. Rohan sees one free card, 8:30–10:20, with the free illustration, marked Ongoing. The next card is the short break. He is not shown F1’s or F3’s labs.

### A lecture everyone shares

It is Tuesday, 13:40. Applied Mathematics in H202 is stored three times, once for each batch, with the same room and faculty. Rohan sees one lecture card, 13:15–14:10, room H202, kind Lecture, Ongoing. Switching his batch in settings to F1 still shows Applied Mathematics in H202 for that slot, because F1’s stored copy matches. A later semester edit can change only F3’s copy without a special “shared lecture” type.

### He checks the next walk without losing his place

It is Tuesday, 13:40, and the mathematics lecture is the hot card, Ongoing. He swipes right and reads Universal Human Values-II, marked Next, then the short break, marked Later. The mathematics card is still Ongoing in the row; he reaches it again by swiping left. The nav button, pressed from the short-break card, puts mathematics back in front because that is the live card.

On the first card of the day, a left swipe does nothing. On the last card, a right swipe does nothing. Tuesday does not turn into Wednesday from a horizontal swipe.

### Lunch, then the afternoon

It is Tuesday, 12:40. The hot card is the lunch illustration, 12:20–13:15, Ongoing. The morning lab is Done. Applied Mathematics is Next.

### After the last card

It is Monday, 17:10. Every Monday card is Done. The hot card is Monday’s last card. The app stays on Monday. Tomorrow’s first card appears when he swipes up, and that card has no status line, because the open day is no longer today.

At 16:10, if the last card is still running, that card is Ongoing and there is no Next card behind it.

### Sunday

It is Sunday, 11:00. The only card is the Sunday illustration and the label Sunday, with Sunday’s date. There is no status and no room. The nav button leaves him on that card. Swiping up opens Monday on Monday’s first card, with no status, because he is browsing Monday rather than standing in it.

He can also open the calendar and tap a Sunday in October. The same holiday card appears, with that Sunday’s date.

### Peeking at another day

It is Wednesday, 11:00. A practical is Ongoing. Rohan swipes up. Thursday’s first card is in front, with no Done, Ongoing, Next, or Later. He swipes up again and sees Friday. He swipes down twice and returns to Wednesday. Landing puts the ongoing practical in front, not whichever Thursday card he had swiped to.

He opens the calendar and taps Tuesday 20 October. Tuesday’s first card is in front, with Tuesday’s date in the header, and no status. The nav button returns to Wednesday’s ongoing practical and shows the word Today.

Finger up moves to the next date. Finger down moves to the previous date. From Saturday, finger up opens Sunday. From Sunday, finger up opens Monday.

### He changes batch in the middle of a lab

It is Monday, 9:40. Rohan is F2, so the hot card is Programming Lab in H205. In settings he switches to F1. The app returns to the viewer on today and lands on F1’s ongoing card for 8:30–10:20, which is F1’s own practical and room, not H205. His name is unchanged. Cards still do not display his name.

If he had been browsing next Thursday when he changed batch, Thursday stays open and lands on Thursday’s first card for F1.

### He clears the site data

The saved name and batch are gone. The next open shows onboarding. The sheet itself still comes from the app, not from the deleted profile.

### The phone is offline between buildings

He installed the app yesterday. Today the campus network drops. He opens the icon. Today’s live card, the room code, and the break illustrations all render. The clock is still the phone’s clock.

### The sheet is corrected

A room was wrong. The author edits the bundled sheet and deploys. Rohan is offline in a lab, so he still sees the previous room. On the way out he opens the app with a connection. The new sheet loads. His name and batch are still F2 and Rohan. The hot card is whichever card the landing rules choose for the new sheet at that minute.

### A session has no room yet

The sheet lists Sports with a time and a faculty and no room. The card shows Sports, the kind Other, the time, and the faculty. There is no invented room code.

### The same subject twice in one day

F2 has a programming lab in the morning in one room and another programming block in the afternoon in a different room, with lunch between them. He sees two class cards. The lunch card sits between them. Matching text does not merge across lunch or across a short break.

### Saturday

Saturday uses the same eleven slots and the same card rules. Guest Talk and Library Hours are class cards of kind Other when the sheet assigns them to slots. Class slots with no assignment are free cards. The author fills Saturday’s exact slot boundaries in the timetable file; the viewer does not have a separate Saturday layout.

## Content source

`mit_computer_engineering_timetable.md` is the schedule to bundle. The author is correcting two things in that file before the bundled data is treated as final: cells marked Verify, and practicals that list two faculty names. The product has no “unverified” card. Whatever is in the file at build time is what students see.

Until those edits land, implementers should still code the rules above. Do not add a second faculty field. Do not add an unverified state.

## Out of scope

Push notifications, maps, attendance, an in-app timetable editor, accounts, more than this Computer Engineering sheet, a holiday list beyond the Sunday card, and images loaded from the network.

## Acceptance

A build matches this PRD when each of these is true:

1. A new phone completes onboarding, stores the name and batch on the device, and lands on today’s live card.
2. Monday at 9:40 shows one merged lab card as Ongoing, and one right swipe shows the short break as Next.
3. Tuesday at 8:45 for F2 shows one free card covering 8:30–10:20, not another batch’s lab.
4. At 10:25 the short-break card is Ongoing. At 10:30 the following class card is Ongoing.
5. After 16:50 the last card of today is in front and every card is Done. A right swipe does not open tomorrow. A finger up does.
6. Sunday is one illustration card. The nav button on Sunday stays on Sunday.
7. A calendar date three weeks ahead shows that weekday’s sheet, with no status. The nav button returns to today’s live card.
8. Left and right stop at the ends of the open day. Up and down change the date.
9. Settings can switch the batch and the open day’s cards change immediately.
10. With the network off, an already installed app still shows the live card and the four illustrations.
11. A new deploy is visible on the next online open, and the saved name and batch are still there.
