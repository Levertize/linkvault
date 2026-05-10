# 🔖 LinkVault

> Save, organize, and rediscover your links — effortlessly.

LinkVault is a modern, minimal, and premium bookmark manager built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. Designed with an Apple-like aesthetic, it offers a seamless experience for managing your digital library.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green.svg)

---

## ✨ Features

- **🚀 Core CRUD**: Create, read, update, and delete bookmarks with ease.
- **🪄 Auto-Meta Fetch**: Automatically grab titles, descriptions, and site icons using our server-side parser.
- **🔍 Instant Search**: Real-time search across titles, URLs, and descriptions with debouncing.
- **🏷️ Tag Management**: Organize your links with custom-colored tags.
- **⭐ Favorites**: Mark important links for quick access.
- **🌗 Dark Mode**: Fully immersive "Apple-like" dark mode experience.
- **📥 Import/Export**: Batch import from browser HTML files and export your data as JSON.
- **🔒 Secure Auth**: Built-in authentication powered by Supabase (Email & Google).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Icons**: Lucide React
- **Typography**: Inter (Apple-system optimized)
- **Parsing**: Cheerio (Server-side metadata extraction)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/linkvault.git
   cd linkvault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Initialize Database**
   Run the SQL provided in `supabase/migrations/20260510000000_init_schema.sql` in your Supabase SQL Editor.

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see your LinkVault.

---

## 📖 Documentation

For detailed information on architecture, folder structure, and advanced usage, please refer to our [Full Documentation](./DOCUMENTATION.md).

---

## 📝 License

This project is licensed under the [MIT License](./LICENSE).
