# BeautyMap — AI-Powered Bridal Salon Marketplace

🔗 **Live Demo:** https://beautymap-delhi.vercel.app  
📹 **Demo Video:** [Coming soon]

> Built for the SuperXgen AI Startup Buildathon 2026 — Delhi Bridal Beauty Booking Platform challenge.

## What is BeautyMap?

BeautyMap is an AI-powered marketplace connecting Delhi brides with their perfect bridal salon — personalized to their budget, location, style, and their own described vision. Built with 20 real, manually-researched Delhi bridal salons (no scraped or fabricated listings), powered by live AI recommendation, explanation, and personalization features.

## Features

- **AI Recommendation Engine** — Scoring + Groq-powered natural-language explanations personalized to each bride's inputs including free-text vision
- **AI Matching Sequence** — Animated visualization of the AI scoring process between intake and results
- **Custom Vision Input** — Bride describes her look in her own words; AI extracts priority tags to influence both ranking and explanation
- **Compare Mode** — Side-by-side salon comparison (up to 3 salons)
- **Salon Detail Pages** — Real reviews, ratings, photos, Google Maps, specialities, price tier
- **AI "Questions to Ask"** — Groq-generated, personalized per salon AND per bride's stated preferences
- **Ask About Availability** — Pre-filled WhatsApp inquiry with wedding date (honest: facilitates real outreach, never fakes real-time availability)
- **WhatsApp Contact** — One-tap direct salon contact
- **Nearby Salons** — Geolocation-based distance-sorted discovery with map
- **20 Real Delhi Bridal Salons** — Manually researched, real data, real reviews, real locations

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres) |
| Storage | Supabase Storage |
| AI (live features) | Groq API — Llama 3.3 70B |
| Maps | Google Maps Embed API |
| Deployment | Vercel |

## AI Tools & Workflow Used

- **Claude (Claude.ai + Claude Code)** — Primary development tool throughout. Used for architecture planning, feature implementation, debugging, data cleaning via Supabase MCP, and all Claude Code prompts. Claude Opus used specifically for high-judgment tasks: UI/UX redesign, motion design, animation system.
- **Groq (Llama 3.3 70B)** — Powers all live in-app AI: personalized recommendation explanations, free-text vision parsing, AI-generated "Questions to Ask." Chosen for fast inference and generous free tier.
- **Gemini** — Logo and icon concept generation (constellation + bridal profile silhouette mark), refined into production-ready transparent PNG assets.
- **Supabase** — Database, storage, and MCP integration for direct SQL data operations (geocoding, phone cleanup, review seeding, rating recalculation).
- **Vercel** — Continuous deployment from GitHub, live URL for submission.

## Local Setup

```bash
git clone https://github.com/manuwills11-png/beautymap-delhi
cd beautymap-delhi
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

## Team

**Martin Wills** & **Adwaith M**  
Built for SuperXgen AI Startup Buildathon 2026
