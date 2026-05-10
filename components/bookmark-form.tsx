'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, Tag as TagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Bookmark, Tag } from '@/utils/types'

interface BookmarkFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  bookmark?: Bookmark // If provided, we are editing
}

export function BookmarkForm({
  open,
  onOpenChange,
  onSuccess,
  bookmark,
}: BookmarkFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingMeta, setIsFetchingMeta] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  useEffect(() => {
    if (open) {
      fetchTags()
    }
  }, [open])

  useEffect(() => {
    if (bookmark) {
      setUrl(bookmark.url)
      setTitle(bookmark.title)
      setDescription(bookmark.description || '')
      setImageUrl(bookmark.image_url || '')
      setSelectedTagIds(bookmark.tags?.map((t) => t.id) || [])
    } else {
      setUrl('')
      setTitle('')
      setDescription('')
      setImageUrl('')
      setSelectedTagIds([])
    }
  }, [bookmark, open])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (Array.isArray(data)) {
        setAllTags(data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const handleFetchMeta = async (inputUrl: string) => {
    if (!inputUrl || bookmark) return

    try {
      setIsFetchingMeta(true)
      const res = await fetch('/api/fetch-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      })

      const data = await res.json()

      if (data.title) setTitle(data.title)
      if (data.description) setDescription(data.description)
      if (data.image_url) setImageUrl(data.image_url)
    } catch (error) {
      console.error('Failed to fetch meta:', error)
    } finally {
      setIsFetchingMeta(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName) return
    setIsAddingTag(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName }),
      })
      const data = await res.json()
      if (data.id) {
        setAllTags([...allTags, data])
        setSelectedTagIds([...selectedTagIds, data.id])
        setNewTagName('')
      }
    } catch (error) {
      toast.error('Failed to create tag')
    } finally {
      setIsAddingTag(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = bookmark ? `/api/bookmarks/${bookmark.id}` : '/api/bookmarks'
      const method = bookmark ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title,
          description,
          image_url: imageUrl,
          tag_ids: selectedTagIds,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save bookmark')
      }

      toast.success(bookmark ? 'Bookmark updated' : 'Bookmark added')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bookmark ? 'Edit Bookmark' : 'Add New Link'}</DialogTitle>
          <DialogDescription>
            {bookmark
              ? 'Update the details of your bookmark.'
              : 'Paste a URL to save a new link to your vault.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={(e) => handleFetchMeta(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isLoading || !!bookmark}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page Title"
                required
                disabled={isLoading || isFetchingMeta}
              />
              {isFetchingMeta && (
                <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief summary..."
              disabled={isLoading || isFetchingMeta}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 py-1">
              {allTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                  style={
                    selectedTagIds.includes(tag.id)
                      ? { backgroundColor: tag.color }
                      : { color: tag.color, borderColor: tag.color }
                  }
                >
                  {tag.name}
                </Badge>
              ))}
              {allTags.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No tags yet</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="New tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreateTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={handleCreateTag}
                disabled={isAddingTag || !newTagName}
              >
                {isAddingTag ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || isFetchingMeta}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {bookmark ? 'Save Changes' : 'Add Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
