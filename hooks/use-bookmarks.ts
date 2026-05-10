import { useState, useEffect, useMemo } from 'react'
import { Bookmark } from '@/utils/types'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks

    const query = searchQuery.toLowerCase()
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.tags?.some((t) => t.name.toLowerCase().includes(query))
    )
  }, [bookmarks, searchQuery])

  return {
    bookmarks: filteredBookmarks,
    totalCount: bookmarks.length,
    isLoading,
    searchQuery,
    setSearchQuery,
    refresh: fetchBookmarks,
  }
}
