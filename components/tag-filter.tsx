'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Tag } from '@/utils/types'
import { cn } from '@/utils/utils'
import { Star, LayoutGrid, Bookmark } from 'lucide-react'

interface TagFilterProps {
  counts?: {
    all: number
    favorites: number
    tags: Record<string, number>
  }
}

export function TagFilter({ counts }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTag = searchParams.get('tag')
  const showFavorites = searchParams.get('favorites') === 'true'

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/tags')
        const data = await res.json()
        if (Array.isArray(data)) {
          setTags(data)
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }
    fetchTags()
  }, [])

  const handleTagClick = (tagName: string | null) => {
    const params = new URLSearchParams(searchParams)
    params.delete('favorites')
    if (tagName) {
      if (activeTag === tagName) {
        params.delete('tag')
      } else {
        params.set('tag', tagName)
      }
    } else {
      params.delete('tag')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleFavoritesClick = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('tag')
    if (showFavorites) {
      params.delete('favorites')
    } else {
      params.set('favorites', 'true')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col h-full gap-5 py-4">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-0.5 mb-5">
          <h3 className="px-2.5 text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-[0.08em] mb-2">
            Library
          </h3>
          <button
            onClick={() => handleTagClick(null)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded-lg transition-all group',
              !activeTag && !showFavorites
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground/70'
            )}
          >
            <Bookmark className={cn('h-3.5 w-3.5', !activeTag && !showFavorites ? 'fill-current' : '')} />
            All bookmarks
            <span className="ml-auto text-[11px] text-muted-foreground/30 group-hover:text-muted-foreground/50">{counts?.all ?? 0}</span>
          </button>
          <button
            onClick={handleFavoritesClick}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded-lg transition-all group',
              showFavorites
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground/70'
            )}
          >
            <Star className={cn('h-3.5 w-3.5', showFavorites && 'fill-yellow-400 text-yellow-400')} />
            Favorites
            <span className="ml-auto text-[11px] text-muted-foreground/30 group-hover:text-muted-foreground/50">{counts?.favorites ?? 0}</span>
          </button>
        </div>

        <div className="h-px bg-border/50 mx-2.5 my-1" />

        <div className="flex flex-col gap-0.5 mt-4">
          <h3 className="px-2.5 text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-[0.08em] mb-2">
            Tags
          </h3>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded-lg transition-all group',
                activeTag === tag.name
                  ? 'bg-muted text-foreground font-semibold'
                  : 'text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground/70'
              )}
            >
              <div
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="truncate">{tag.name}</span>
              <span className="ml-auto text-[11px] text-muted-foreground/30 group-hover:text-muted-foreground/50">
                {counts?.tags[tag.name] ?? 0}
              </span>
            </button>
          ))}
          {tags.length === 0 && (
            <p className="px-2.5 text-[11px] text-muted-foreground/30 italic">No tags</p>
          )}
        </div>
      </div>
    </div>
  )
}
