# Peer Play — Final Presentation Script

Group [X] | ~19 min | Speakers: Kai Xin, Nuqman (as Alex), Kai Le, Isaac

Before the presentation, run in the browser console:

```
await unseedDummySessions()
await seedDummySessions()
resetSkillsForDemo()
```

---

## Opening + Problem

Kai Xin, ~4 min

Slide: Group X | Peer Play

Finding someone to play sports with casually at university sounds simple. You're surrounded by thousands of students. But the challenge isn't finding people — it's finding the right person. Someone who plays your sport, matches your level, and happens to be free at the same time.

We wanted to understand what that actually looks like for students here. So we ran a series of interviews. One of the students we spoke to was Alex, a first-year who plays badminton.

[Nuqman steps forward — no preamble, he just starts]

Nuqman as Alex: I love badminton. Back home I played most weeks — nothing serious, just regular games with people from my neighbourhood. I wanted the same thing at Imperial.

A few weeks in, someone posted in the halls WhatsApp: anyone want to play badminton Sunday? I immediately said yes.

When I got there, it was three people who already knew each other, playing at a pace way above mine. For an hour and a half I chased shuttles I couldn't reach, trying not to slow everyone down.

I smiled afterwards, said thanks, walked back to my room — and just didn't try again for a while.

[Nuqman steps back. Play Jesse clip. Kai Xin continues.]

That same story came up in interview after interview. Not just badminton — basketball, football, table tennis. Different sport, same wall.

Slide: The Numbers Back It Up — 56.3% / 64.9% / 92%

We surveyed 88 Imperial students. 56.3% said they'd wanted to play a sport but couldn't — simply because they couldn't find someone to play with. And this isn't just an Imperial problem: 64.9% of university students have dropped a sport they enjoy due to skill-level mismatches. That matters — because physically inactive students have a 92% higher likelihood of developing depression.

Slide: Problem statement

University students who want to play recreational racket and ball sports struggle to find casual partners at a compatible skill level when they have a free window in their schedule. Without a reliable way to connect with the right person at the right time, they either play far less than they want to or stop altogether, leaving courts underused and students less active than they could be.

Slide: HMW

How might we help university students connect with recreational sport partners who match their skill level so that they can get on the court together and stay physically active around their busy schedules, without needing to commit to a club?

Here's what we built.

---

## Explore, Assess & Join

Kai Xin (iteration), then Nuqman (demo) — ~5 min total

Slide: Paper mockup — early explore page prototype

Alex has a free Thursday afternoon and wants a game. This is where we started — a paper prototype of the core idea. A feed of upcoming sessions, filterable by sport and level, where you can see the host, time, and how many spots are left.

We tested this with users before writing a single line of code. They understood the concept immediately — they could navigate it, they knew what to do. That told us the core idea was worth building. So we moved to a digital version.

Slide: User feedback — Kuan (map), Thomas (skill level)

As users tested the digital version, a few things came up. On location — Kuan, a fresher trying to get into basketball, told us: "I want to look for sessions near my accommodation." So we added the map as a second browsing mode alongside the list.

On skill level — Thomas, a squash player at Imperial, said two things that stuck with us. First: "Skill matching is really important because I will lose every time if I play with people better than me." And then, when we asked him to label himself: "I am not sure if I am high intermediate or low intermediate."

That raised a design question: if users can't self-classify, and skill matching is the whole point — what happens when someone without a level tries to join a session? Our answer is to gate the join.

[Hand to Nuqman]

Live app: Sessions feed → filters → map view → session detail → tap Join → modal → quiz → result → join

I open the sessions feed and filter by sport and date.

[Applies filters — list narrows]

I want something close to campus, so I switch to the map.

[Switches to map view. Finds and taps a session near South Kensington.]

I find one nearby. I can see the host, the time, spots left, and the skill range they've set. I tap Join.

[Taps Join — modal appears asking to complete skill assessment first]

The app asks me to complete a skill assessment before joining. It needs to know my level — so the host knows exactly who's coming, and so the matching actually means something.

[Taps through to skill assessment quiz]

Seven questions about what I actually do on court. "Can you serve consistently?" "Do you understand doubles positioning?"

[Walks through 2–3 questions live]

Lower-intermediate. That sounds right. Now I can join.

[Returns to session detail. Joins successfully.]

Done. From no one to play with, to a confirmed game — and the host knows exactly who's showing up.

[Hand to Kai Le]

---

## Reviews

Kai Le (iteration), then Nuqman (demo) — ~4 min total

That session Alex just joined — it happened. But one of the players there, let's call her Sarah, spent the whole session arguing calls, losing her temper, and making it unpleasant for everyone else.

Alex wants to flag that. Not to publicly shame her — but so the next person who plays with Sarah can make an informed decision. Ruth, a sports officer at the Imperial Malaysian Society, put it exactly right: "I want to leave reviews on players I've played with so other players know who's fun and reliable to play with."

That's the whole motivation for this feature. And before we see it in action, it's worth showing how we got to the design — because the review form went through three distinct versions.

Slide: Iteration 1 — open text box

Our first version was an open text field. "Leave a review." The responses were all over the place — some detailed, some a single word, most not comparable to each other. It told us very little about whether someone was a good person to play with.

Slide: Iteration 2 — guided questions

We added structured questions to guide the response. Review quality went up. But users told us it felt like filling in a form — too much effort after a casual game. People were dropping off before finishing.

Slide: Iteration 3 — MCQ: punctuality, sportsmanship, vibe

So we moved to multiple choice, focused on three things that actually matter in casual sport: punctuality, sportsmanship, and vibe. Fast to fill in, low friction, and consistent enough to build a meaningful picture over time.

One of the players at Alex's last session — Sarah — showed up late and made things tense. Let's see how that review works.

[Hand to Nuqman]

Live app: Reviews tab — open Sarah's review, select options, submit

The session's ended. I notice a badge on the Reviews tab — there are players I haven't reviewed yet. I open Sarah's.

[Selects: Late or no-show / Hot-headed or dirty / Unpleasant to play with. Submits.]

Submitted. Not a public call-out — just aggregated reputation data attached to Sarah's profile. The next host who considers her sees her overall rating over time. Over time, every player builds a picture of how they actually show up.

[Nuqman continues into hosting]

---

## Hosting

Nuqman (demo only), ~1.5 min — iteration mentioned in narration

Live app: Create session screen

After a few sessions as a player, I want to run my own. I pick the sport, set the date, time, and location.

[Fills in the form]

The skill slider lets me define who I want — narrow for competitive, open for casual. I can set it to private, set a gender preference, pick from popular nearby venues. Every one of these options came from users telling us what was missing in the first version.

I set a player cap, add a note, and post it.

[Posts the session]

The session goes live. Anyone who fits my criteria can find it and join.

Three weeks ago, I had no one to play with. Now I've got a regular game, I've hosted one myself, and I'm building a reputation on the platform. That's what Peer Play is for.

[Hand to Isaac]

---

## Tech Stack + Architecture

Isaac, ~3 min

Slide: Tech stack diagram

Let's talk about how it's built.

Peer Play is a React and TypeScript frontend, built with Vite, styled with Tailwind CSS, and using Framer Motion for animations. React's component model suited a stateful, screen-based single-page app well — and TypeScript enforced consistent data shapes across Firestore, components, and security rules, which matters when four people are all touching the same models.

For the backend and services we're using Firebase — Firestore as our real-time database, Firebase Auth for user identity. The app is deployed through GitHub Actions to Firebase Hosting.

There's no separate backend server. The frontend talks directly to Firestore through the Firebase SDK, and access control is enforced through Firestore security rules — only a session host can modify or cancel their own session, enforced at the database level.

For the map, we're using Leaflet with CARTO tile layers, and Nominatim for address geocoding.

Slide: CI/CD Pipeline

Something we're particularly proud of is the CI/CD pipeline. Every pull request triggers a CI check that runs TypeScript type checking and a full Vite production build. If either fails, the build is blocked — broken or type-unsafe code cannot reach users.

On the deployment side, pushing to the staging branch automatically deploys to a Firebase Hosting preview channel — a live URL we could share and test before anything touched production. Pushing to main deploys to the production URL. Firebase credentials are stored as GitHub secrets, so nothing sensitive lives in the repository.

With four people working in parallel, this was what kept the codebase from falling apart. TypeScript catches data shape errors as you write — the pipeline catches anything that slips through before it can deploy. Between the two, we had a lot of confidence merging frequently.

Slide: Why Firebase — one platform vs. Supabase + Vercel

We chose Firebase primarily because everything lives in one ecosystem — hosting, auth, database, and storage under a single project and deploy pipeline. With Supabase we'd have had a proper relational model, which actually fits the session, player, and review structure well — but we'd still have needed a separate hosting provider on top of it. Firebase bundles everything, which meant less infrastructure overhead for a team of four focused on iterating quickly.

The main tradeoff with Firestore is its document model. There are no joins, so data shape matters early. We spent time upfront thinking carefully about how sessions, players, and reviews relate to each other so queries stay efficient as the data grows.

We chose Leaflet with CARTO over Google Maps to avoid API key setup and billing — open source and sufficient for our use case. Nominatim handles geocoding for the same reason: free, no quota to manage.

[Hand to Kai Le]

---

## Impact + Evaluation + Future Work

Kai Le, ~3.5 min

Slide: User feedback / testimonials

We've been testing with real users throughout development — not just to check that features work, but to decide what to build next.

[Read 2–3 direct quotes with names and context]

[Any quantitative metrics from usability sessions — task completion rate, time-to-join, etc.]

Slide: Reflection

Looking back, there are things we'd do differently. Light and dark mode came in relatively late — accessibility considerations like colour contrast and support for users with visual impairments should be part of the design system from day one, not added afterwards. We'd also invest earlier in code architecture: as features grew, so did complexity, and a more modular structure would have made iteration faster.

Slide: Future work

For what comes next: Single Sign-On would reduce onboarding friction — students already have university credentials, they shouldn't need a separate account. Integration with venue booking systems would let users book courts and pay within the app, removing the redirect step we currently rely on. We also spoke with sports society organisers at Imperial who were interested in using Peer Play to facilitate open sessions — a natural expansion of the host flow.

Longer term, a native mobile app. Peer Play works in the browser today, and that was the right call for this stage. But something you reach for on your phone, with push notifications when a session fills or a review comes in, would be more natural for how people actually use an app like this.

Slide: Closing

The core problem was simple: the right match, at the right time, without needing to commit to a club. We think Peer Play makes that possible. Thank you — we're happy to take your questions.

---

## Notes for rehearsal

- Kai Xin: problem + opening + explore/assess iteration, ~5 min
- Nuqman: explore → tap Join → modal → quiz → join → reviews demo → hosting, ~7.5 min
- Kai Le: reviews iteration + impact + future, ~5.5 min
- Isaac: tech stack + architecture, ~3 min

Nuqman: the skill assessment flows from the Join button — tap it, modal fires, do the quiz live, return to the same session and join. No separate navigation needed. The modal is what triggers the whole quiz sequence.

Do not say "persona", "demo", or "now I will show you". Just use the app as you talk.

Slides to prepare:
- Explore: paper mockup photo + user feedback quotes (Kuan + Thomas) + map view screenshot
- Reviews: 3-panel progression — open text box, guided questions, MCQ
- Why Firebase: one-platform diagram vs. Supabase + Vercel; Leaflet/Nominatim callout
