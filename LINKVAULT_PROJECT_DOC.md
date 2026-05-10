# 🔖 LinkVault — Project Design Document

> Full-stack bookmark manager built with Next.js, Supabase, and Tailwind CSS  
> Version: `1.0.0`

---

## 🤖 UNTUK AI AGENT — BACA INI DULU

Kamu adalah coding assistant yang membantu membangun proyek **LinkVault**.
Dokumen ini adalah sumber kebenaran tunggal (*single source of truth*) untuk proyek ini.

**Tugasmu:**
- Ikuti roadmap secara berurutan dari atas ke bawah
- Setiap kali sebuah task selesai dikerjakan dan berjalan dengan baik, ubah `- [ ]` menjadi `- [x]` di bagian Roadmap
- Jangan skip task kecuali user minta
- Selalu tanya user sebelum mengubah keputusan arsitektur yang ada di dokumen ini
- Kalau ada error, selesaikan dulu sebelum lanjut ke task berikutnya

**Cara baca status:**
- `- [ ]` = belum dikerjakan
- `- [x]` = sudah selesai & berjalan

---

## 📊 PROJECT STATUS

```
Fase saat ini  : FINISHED
Task aktif     : Project Maintenance
Terakhir update: 10 Mei 2026
Blocker        : -
```

> ⚠️ Update blok STATUS di atas setiap kali ada perubahan fase atau task aktif.

---

## 📌 Overview

**LinkVault** adalah aplikasi web untuk menyimpan, mengorganisir, dan menemukan kembali link/URL dengan cepat. Dibuat sebagai alternatif ringan dari Pocket atau Raindrop.io, dengan fokus pada simplisitas dan kecepatan.

---

## 🎯 Goals & Non-Goals

### Goals
- User bisa simpan link dengan judul, deskripsi, dan tag
- Auto-fetch metadata (judul, thumbnail) dari URL
- Search dan filter link dengan cepat
- Authentication (user punya data masing-masing)
- Responsive di desktop dan mobile

### Non-Goals (v1.0)
- Browser extension
- Sharing koleksi ke publik
- Kolaborasi tim
- Mobile app native

---

## 🛠️ Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API Routes, file-based routing |
| Styling | Tailwind CSS + shadcn/ui | Cepat, konsisten, maintainable |
| Database | Supabase (PostgreSQL) | Gratis, realtime, ada auth bawaan |
| Auth | Supabase Auth | OAuth Google + Email/Password |
| ORM | Supabase JS Client | Langsung dari Supabase |
| Meta Fetch | API Route (server-side) | Bypass CORS saat fetch Open Graph |
| Deployment | Vercel | Integrasi native dengan Next.js |
| Linting | ESLint + Prettier | Code quality |

---

## 📁 Folder Structure

```
linkvault/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        ← Main dashboard (/dashboard)
│   ├── api/
│   │   ├── bookmarks/
│   │   │   ├── route.ts        ← GET all, POST new
│   │   │   └── [id]/
│   │   │       └── route.ts    ← GET one, PUT, DELETE
│   │   └── fetch-meta/
│   │       └── route.ts        ← Fetch Open Graph dari URL
│   ├── layout.tsx
│   └── page.tsx                ← Landing page / redirect
│
├── components/
│   ├── ui/                     ← shadcn/ui components
│   ├── bookmark-card.tsx
│   ├── bookmark-form.tsx
│   ├── search-bar.tsx
│   ├── tag-filter.tsx
│   ├── navbar.tsx
│   └── empty-state.tsx
│
├── utils/
│   ├── supabase/
│   │   ├── client.ts           ← Browser client
│   │   ├── server.ts           ← Server client (RSC)
│   │   └── middleware.ts       ← Middleware client
│   └── utils.ts                ← Helper functions
│
├── hooks/
│   ├── use-bookmarks.ts        ← Custom hook CRUD bookmark
│   └── use-tags.ts             ← Custom hook manage tags
│
├── middleware.ts                ← Auth protection route
├── .env.local
├── .env.example
└── README.md
```

---

## 🗃️ Database Schema (Supabase / PostgreSQL)

### Table: `bookmarks`

```sql
CREATE TABLE bookmarks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: user hanya bisa akses data miliknya sendiri
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own bookmarks"
  ON bookmarks
  FOR ALL
  USING (auth.uid() = user_id);
```

### Table: `tags`

```sql
CREATE TABLE tags (
  id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name    TEXT NOT NULL,
  color   TEXT DEFAULT '#6366f1',
  UNIQUE(user_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tags"
  ON tags
  FOR ALL
  USING (auth.uid() = user_id);
```

### Table: `bookmark_tags` (junction)

```sql
CREATE TABLE bookmark_tags (
  bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id      UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);

ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmark_tags"
  ON bookmark_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bookmarks
      WHERE bookmarks.id = bookmark_id
        AND bookmarks.user_id = auth.uid()
    )
  );
```

---

## 🔌 API Routes

### `GET /api/bookmarks`
Ambil semua bookmark milik user yang sedang login.

**Response:**
```json
[
  {
    "id": "uuid",
    "url": "https://example.com",
    "title": "Example",
    "description": "...",
    "image_url": "https://...",
    "is_favorite": false,
    "tags": [{ "id": "uuid", "name": "dev", "color": "#..." }],
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### `POST /api/bookmarks`
Tambah bookmark baru.

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example Site",
  "description": "Optional description",
  "tag_ids": ["uuid1", "uuid2"]
}
```

---

### `PUT /api/bookmarks/[id]`
Update bookmark (judul, deskripsi, tags, favorite).

---

### `DELETE /api/bookmarks/[id]`
Hapus bookmark.

---

### `POST /api/fetch-meta`
Fetch Open Graph metadata dari URL.

**Request Body:**
```json
{ "url": "https://example.com" }
```

**Response:**
```json
{
  "title": "Example Domain",
  "description": "This domain is for use in...",
  "image_url": "https://example.com/og-image.jpg"
}
```

---

## 🧩 TypeScript Types (`lib/types.ts`)

```typescript
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  image_url?: string;
  is_favorite: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tag_ids?: string[];
}
```

---

## 🖥️ UI Pages & Components

### Landing Page (`/`)
- Hero section: tagline + CTA "Get Started"
- Preview screenshot app
- Redirect ke `/dashboard` jika sudah login

### Login / Register (`/login`, `/register`)
- Form email + password
- Tombol "Continue with Google"

### Dashboard (`/dashboard`)
- **Navbar**: Compact h-12 (48px), stark black logo mark, centered search bar with subtle gray background.
- **Sidebar**: Narrow w-192px, minimalist library and tag navigation with colored dots and count indicators.
- **Main Area**: Inline header (title + count), subtle bottom-bordered filters (All, Recent, Favorites).
- **Bookmark Card**: Ultra-minimal rounded-[10px] container, 90px top area with centered 40x40 site initials icon, hidden domain row, 12px title, single inline tag, and transparent action icons.

### Add/Edit Bookmark Modal
- Input URL → auto-fetch metadata
- Edit judul & deskripsi
- Pilih / buat tag baru (inline tag creation)
- Tombol simpan

---

## 🚦 Feature Checklist (Roadmap)

### v1.0 — MVP
- [x] Setup project Next.js + Tailwind + shadcn/ui
- [x] Setup Supabase project + schema + RLS
- [x] Auth: login, register, logout (email + Google)
- [x] Protected routes via middleware
- [x] CRUD bookmark (tambah, lihat, edit, hapus)
- [x] Auto-fetch meta dari URL
- [x] Tag management
- [x] Search by keyword
- [x] Filter by tag
- [x] Responsive design
- [ ] Deploy ke Vercel

### v1.1 — Polish
- [x] Favorite bookmark
- [x] Sort (terbaru, favorit, A-Z)
- [x] Export ke JSON
- [x] Toast notifications
- [x] Loading skeleton

### v1.2 — Extras
- [x] Import dari file bookmark browser (.html)
- [x] Dark mode
- [ ] Keyboard shortcuts

---

## ⚙️ Environment Variables

Buat file `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Tambahkan `.env.local` ke `.gitignore`!  
Sertakan `.env.example` di repo dengan value kosong.

---

## 🚀 Setup & Installation

```bash
# 1. Clone repo
git clone https://github.com/username/linkvault.git
cd linkvault

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env.local
# Isi nilai dari Supabase dashboard

# 4. Jalankan dev server
npm run dev
```

---

## 📝 README Template

```markdown
# 🔖 LinkVault

> Save, organize, and rediscover your links — effortlessly.

## Features
- 🔗 Save links with title, description & tags
- 🔍 Search and filter instantly
- ⭐ Favorite important links
- 🏷️ Custom color tags
- 🔐 Secure auth with Supabase

## Tech Stack
Next.js · Supabase · Tailwind CSS · shadcn/ui · TypeScript

## Getting Started
[lihat bagian Setup di atas]

## Screenshots
[tambahkan screenshot setelah selesai]

## License
MIT
```

---

## 💡 Tips Vibe Coding

1. **Mulai dari auth dulu** — semua fitur lain butuh user_id
2. **Bikin 1 fitur sampai jalan, baru lanjut** — jangan loncat-loncat
3. **Gunakan Supabase Dashboard** untuk cek data langsung saat development
4. **Commit kecil-kecil** dengan pesan yang jelas: `feat: add bookmark card component`
5. **Deploy early** ke Vercel biar bisa test di environment real

---

*Generated for: LinkVault v1.0 | Stack: Next.js + Supabase + Tailwind*
 + Tailwind*
