# LinkVault


A clean, minimal, and fast bookmark manager. Built to be a lightweight alternative to Pocket or Raindrop, focusing on speed and a refined "Apple-style" aesthetic.

LinkVault handles your links without the bloat. It automatically grabs metadata, organizes everything with tags, and stays out of your way.

---

## What's inside?

- **Simple CRUD**: Fast management of your links.
- **Auto-Metadata**: Give it a URL, and LinkVault handles the title, description, and site icon using a server-side parser.
- **Minimal Sidebar**: Quick navigation through your library and custom tags.
- **Instant Search**: Real-time filtering with debounced input.
- **Dark Mode**: A deep, immersive dark theme that follows your system or manual preference.
- **Data Freedom**: Import your existing bookmarks via HTML and export everything to JSON whenever you want.
- **Solid Auth**: Secure sign-in via Supabase, including Google OAuth support.

## The Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **Parsing**: Cheerio

---

## Setup Guide

### 1. Clone & Install
```bash
git clone https://github.com/your-username/linkvault.git
cd linkvault
npm install
```

### 2. Environment Variables
Create a `.env.local` file and plug in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Migration
Copy the SQL from `supabase/migrations/20260510000000_init_schema.sql` and run it in your Supabase SQL Editor to set up the tables and RLS policies.

### 4. Development
```bash
npm run dev
```

---

## More Info
Check out the [Technical Documentation](./DOCUMENTATION.md) for a deep dive into the folder structure and architecture.

## License
MIT
