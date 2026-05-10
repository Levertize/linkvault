'use client'

import { useState } from 'react'
import { MoreVertical, Star, Trash2, Pencil, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bookmark } from '@/utils/types'
import { BookmarkForm } from './bookmark-form'
import { cn } from '@/utils/utils'

interface BookmarkCardProps {
  bookmark: Bookmark
  onRefresh: () => void
}

export function BookmarkCard({ bookmark, onRefresh }: BookmarkCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return ''
    }
  }

  const hostname = getHostname(bookmark.url)

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !bookmark.is_favorite }),
      })
      if (res.ok) {
        onRefresh()
      }
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Bookmark deleted')
        onRefresh()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete bookmark')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden bg-card border border-border rounded-[10px] transition-all hover:border-foreground/15 hover:bg-foreground/[0.01]">
        <div className="h-[90px] w-full overflow-hidden bg-muted/20 flex items-center justify-center relative border-b border-border/50">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[17px] font-bold text-white tracking-tighter border border-white/10"
            style={{ 
              backgroundColor: bookmark.tags?.[0]?.color || '#1a1a1a',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {hostname ? hostname.split('.')[0].substring(0, 2).toUpperCase() : 'L'}
          </div>
          {bookmark.is_favorite && (
            <div className="absolute top-2 right-2 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
            </div>
          )}
        </div>

        <div className="p-3 pb-2.5 flex-1 flex flex-col">
          <div className="text-[10px] text-muted-foreground/40 font-medium tracking-tight mb-1 truncate">
            {hostname || bookmark.url}
          </div>

          <h3 className="text-[12px] font-medium leading-[1.5] text-foreground/80 mb-2 line-clamp-2">
            <a 
              href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {bookmark.title}
            </a>
          </h3>

          <div className="mt-auto">
            {bookmark.tags?.[0] && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-[4px] bg-muted text-muted-foreground font-medium"
              >
                {bookmark.tags[0].name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground/30 font-medium">
            {formatDistanceToNow(new Date(bookmark.created_at))} ago
          </span>
          <div className="flex items-center gap-3">
            <a 
              href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors focus:outline-none">
                <MoreVertical className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 mt-1">
                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-xs text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <BookmarkForm
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={onRefresh}
        bookmark={bookmark}
      />
    </>
  )
}
