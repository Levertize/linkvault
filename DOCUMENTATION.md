# LinkVault: Technical Overview

This document goes into the details of how LinkVault is put together. It's meant for anyone who wants to contribute to the project or understand the underlying logic.

## Architecture

LinkVault is a full-stack Next.js 15 application. We chose this stack because it gives us great performance (SSR/RSC) and a straightforward developer experience.

### Why this stack?
- **Next.js 15**: Provides the best-in-class routing and server-side capabilities.
- **Supabase**: Handles the heavy lifting for Auth and PostgreSQL. Their Row Level Security (RLS) is key to how we keep user data private.
- **Tailwind 4.0**: Keeps the styling fast and maintainable with its utility-first approach.

## Key Technical Decisions

### 1. Server-Side Metadata Parsing
Instead of relying on client-side scraping (which often hits CORS issues), we use a dedicated API route (`/api/fetch-meta`). It uses `cheerio` to parse the HTML of a provided URL on the server, extracting Open Graph tags to automatically fill in bookmark details.

### 2. Theming Engine
We use `next-themes` to handle the Dark/Light mode switch. The actual colors are defined as semantic CSS variables in `globals.css`. This makes it easy to maintain a consistent "Modern Minimal" look across both modes without cluttering the components with theme-specific logic.

### 3. Folder Layout
The project follows a standard Next.js App Router structure:
- `/app`: Contains all routes, layouts, and API endpoints.
- `/components`: Reusable UI pieces. We use Shadcn/UI for the foundation and custom components for the dashboard.
- `/utils`: Common logic, including Supabase clients and the bookmark parser.
- `/supabase`: Contains the initial database schema (migrations).

## Security & Data

We don't just rely on the API layer for security. LinkVault uses **Row Level Security (RLS)** in the database. This means even if someone managed to bypass an API check, the database itself would block them from seeing another user's bookmarks because it checks the `auth.uid()` against the `user_id` column on every query.

## Batch Importing
The import feature supports the standard Netscape HTML format used by all major browsers. The parser (`utils/bookmark-parser.ts`) uses a regex-based approach to extract URLs and titles without needing a heavy DOM-parsing library on the client side.

---

## Contributing
If you're looking to add features:
1. Fork the repo.
2. Create a new feature branch.
3. Keep the styling consistent with the existing "Modern Minimal" design system.
4. Add any necessary database changes to a new migration file.
