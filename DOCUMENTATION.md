# 📖 LinkVault Technical Documentation

## 🏗️ Architecture Overview

LinkVault is built as a highly responsive, server-side optimized web application using the **Next.js 15 App Router**. It leverages **Supabase** for a scalable backend-as-a-service solution, including real-time database capabilities and secure authentication.

### Key Components

1.  **Framework**: Next.js 15 (React 19)
2.  **Backend**: Supabase (Auth, PostgreSQL, Row Level Security)
3.  **UI/UX**: Tailwind CSS 4.0 + Shadcn/UI (Radix/Base UI)
4.  **Middleware**: Handles session refreshing and route protection.

---

## 📂 Folder Structure

```text
linkvault/
├── app/
│   ├── (auth)/             # Login, Register, Actions
│   ├── (dashboard)/        # Dashboard layout and main page
│   ├── api/                # Backend API Routes
│   │   ├── bookmarks/      # CRUD for bookmarks
│   │   ├── fetch-meta/     # OG Metadata parser
│   │   └── tags/           # Tag management
│   ├── auth/callback/      # Supabase OAuth/Email callback
│   ├── globals.css         # Global styles & Design System
│   └── layout.tsx          # Root layout & Providers
├── components/             # Reusable UI components
│   ├── ui/                 # Shadcn/UI primitives
│   ├── bookmark-card.tsx   # Core grid item
│   ├── bookmark-form.tsx   # Add/Edit modal
│   └── navbar.tsx          # Navigation & Profile menu
├── hooks/                  # Custom React hooks (Debounce, etc.)
├── utils/                  # Shared logic
│   ├── supabase/           # Server, Client, & Middleware clients
│   ├── bookmark-parser.ts  # HTML bookmark parser logic
│   └── utils.ts            # Tailwind merging (cn)
├── supabase/
│   └── migrations/         # SQL Schema definitions
└── README.md               # Project overview
```

---

## 🔒 Security (RLS)

LinkVault uses **Row Level Security (RLS)** in PostgreSQL. This ensures that:
- Users can only see their own bookmarks and tags.
- Even if an API route is exposed, the database layer prevents cross-user data access.

**Policy Example:**
```sql
CREATE POLICY "Users can CRUD own bookmarks" 
ON bookmarks FOR ALL 
USING (auth.uid() = user_id);
```

---

## 🚀 Feature Guides

### 1. Adding Bookmarks
When you paste a URL, LinkVault triggers a server-side fetch to the `/api/fetch-meta` route. This route uses `cheerio` to parse the site's Open Graph tags to automatically populate the title, description, and preview image.

### 2. Importing Bookmarks
LinkVault supports the **Netscape Bookmark HTML** format. 
- Go to Profile -> Import Bookmarks.
- Upload the `.html` file exported from Chrome/Safari/Firefox.
- The system will batch-process and save them to your vault.

### 3. Themes (Dark Mode)
The theme engine is powered by `next-themes`. We use a "Modern Minimal" design system defined in `globals.css`:
- **Light Mode**: Pure white (#FFFFFF) backgrounds with subtle gray borders.
- **Dark Mode**: Deep black (#0D0D0D) backgrounds with #141414 card surfaces.

---

## 🛠️ Developer Guide

### Deployment (Vercel)
1. Push your code to GitHub.
2. Link the repository in Vercel.
3. Add the Environment Variables from `.env.local` to Vercel's project settings.
4. Set the `NEXT_PUBLIC_APP_URL` to your production domain.

### Local Development
Always use `npm run dev` to see real-time updates with Turbopack. To verify the final build, run:
```bash
npm run build
npm start
```

---

## 🧪 Future Roadmap
- [ ] Keyboard Shortcuts (⌘ + K for search, etc.)
- [ ] Browser Extension integration
- [ ] Team collaboration (Shared Vaults)
