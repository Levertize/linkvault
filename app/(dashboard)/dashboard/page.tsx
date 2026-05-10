'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { BookmarkCard } from '@/components/bookmark-card'
import { Bookmark } from '@/utils/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookmarkForm } from '@/components/bookmark-form'
import { TagFilter } from '@/components/tag-filter'
import { cn } from '@/utils/utils'

export default function DashboardPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const q = searchParams.get('q')?.toLowerCase() || ''
  const activeTag = searchParams.get('tag')
  const showFavorites = searchParams.get('favorites') === 'true'
  const sortBy = searchParams.get('sort') || 'all'

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/bookmarks')
      const data = await res.json()
      if (Array.isArray(data)) {
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const counts = useMemo(() => {
    const tagCounts: Record<string, number> = {}
    let favorites = 0
    bookmarks.forEach((b) => {
      if (b.is_favorite) favorites++
      b.tags?.forEach((t) => {
        tagCounts[t.name] = (tagCounts[t.name] || 0) + 1
      })
    })
    return {
      all: bookmarks.length,
      favorites,
      tags: tagCounts,
    }
  }, [bookmarks])

  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks]

    if (showFavorites) {
      filtered = filtered.filter((b) => b.is_favorite)
    }

    if (activeTag) {
      filtered = filtered.filter((b) =>
        b.tags?.some((t) => t.name === activeTag)
      )
    }

    if (q) {
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.name.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'az') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }

    return filtered
  }, [bookmarks, q, activeTag, showFavorites, sortBy])

  const setSort = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    if (sort === 'all') params.delete('sort')
    else params.set('sort', sort)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <aside className="hidden w-[192px] shrink-0 border-r border-black/[0.06] dark:border-white/[0.06] bg-background md:block px-3 overflow-y-auto no-scrollbar">
        <TagFilter counts={counts} />
      </aside>

      <main className="flex-1 overflow-y-auto bg-background flex flex-col">
        <div className="flex-1 px-6 py-4 md:px-8">
          <div className="mx-auto max-w-5xl w-full">
            <header className="mb-4 flex items-center gap-2.5">
              <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
                {showFavorites
                  ? 'Favorites'
                  : activeTag
                  ? `#${activeTag}`
                  : q
                  ? `Search results for "${q}"`
                  : 'All bookmarks'}
              </h1>
              <span className="text-[12px] text-muted-foreground/50">
                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'link' : 'links'}
              </span>
            </header>

            <div className="mb-4 flex items-center gap-1 border-b border-black/[0.06] dark:border-white/[0.06] pb-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSort('all')}
                className={cn(
                  'h-[26px] whitespace-nowrap rounded-full border px-3 text-[12px] transition-all font-medium',
                  sortBy === 'all'
                    ? 'bg-foreground border-transparent text-background'
                    : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-muted-foreground hover:border-black/30 dark:hover:border-white/30 hover:text-foreground'
                )}
              >
                All
              </button>
              <button
                onClick={() => setSort('recent')}
                className={cn(
                  'h-[26px] whitespace-nowrap rounded-full border px-3 text-[12px] transition-all font-medium',
                  sortBy === 'recent'
                    ? 'bg-foreground border-transparent text-background'
                    : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-muted-foreground hover:border-black/30 dark:hover:border-white/30 hover:text-foreground'
                )}
              >
                Recent
              </button>
              <button
                onClick={() => setSort('az')}
                className={cn(
                  'h-[26px] whitespace-nowrap rounded-full border px-3 text-[12px] transition-all font-medium',
                  sortBy === 'az'
                    ? 'bg-foreground border-transparent text-background'
                    : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-muted-foreground hover:border-black/30 dark:hover:border-white/30 hover:text-foreground'
                )}
              >
                A-Z
              </button>
              <button
                onClick={() => setSort('favorites')}
                className={cn(
                  'h-[26px] whitespace-nowrap rounded-full border px-3 text-[12px] transition-all font-medium',
                  sortBy === 'favorites'
                    ? 'bg-foreground border-transparent text-background'
                    : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-muted-foreground hover:border-black/30 dark:hover:border-white/30 hover:text-foreground'
                )}
              >
                Favorites
              </button>
            </div>

            <div className="py-2">
              {isLoading ? (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-[10px] overflow-hidden">
                      <Skeleton className="h-[90px] w-full rounded-none" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-2 w-1/4" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredBookmarks.length > 0 ? (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onRefresh={fetchBookmarks}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/20">
                  {q || activeTag || showFavorites ? (
                    <>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                        <SearchX className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-[15px] font-medium text-foreground">No results found</h3>
                      <p className="mt-1 text-[13px] text-muted-foreground max-w-[240px]">
                        We couldn't find anything matching your search or filters.
                      </p>
                      <Button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams)
                          params.delete('q')
                          params.delete('tag')
                          params.delete('favorites')
                          params.delete('sort')
                          router.push(pathname)
                        }}
                        className="mt-6 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                      >
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-[15px] font-medium text-foreground">No bookmarks yet</h3>
                      <p className="mt-1 text-[13px] text-muted-foreground max-w-[240px]">
                        Start saving your favorite links by clicking the "Add link" button.
                      </p>
                      <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-6 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                      >
                        Add your first link
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="py-12 flex flex-col items-center justify-center border-t border-black/[0.03] dark:border-white/[0.03] mt-auto">
          <a 
            href="https://github.com/iqbaldev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-[14px] text-muted-foreground/40 hover:text-foreground/60 transition-all group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-github"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-4.51-2-7-2" />
            </svg>
            <span className="font-semibold tracking-tight">made by lev with 💕</span>
          </a>
        </footer>
      </main>

      <BookmarkForm
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={fetchBookmarks}
      />
    </div>
  )
}
