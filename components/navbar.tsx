'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BookmarkPlus, LogOut, Search, User, Bookmark, Download, FileUp, Sun, Moon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/(auth)/actions'
import { BookmarkForm } from './bookmark-form'
import { ImportModal } from './import-modal'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/utils/utils'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

interface NavbarProps {
  userEmail?: string | null
}

export function Navbar({ userEmail }: NavbarProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')
  const debouncedSearch = useDebounce(searchValue, 300)
  const logoutFormRef = useRef<HTMLFormElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleExportJSON = async () => {
    try {
      const res = await fetch('/api/bookmarks')
      const data = await res.json()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `linkvault-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Bookmarks exported successfully')
    } catch (error) {
      toast.error('Failed to export bookmarks')
    }
  }

  useEffect(() => {
    if (pathname === '/dashboard') {
      const params = new URLSearchParams(searchParams)
      if (debouncedSearch) {
        params.set('q', debouncedSearch)
      } else {
        params.delete('q')
      }
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [debouncedSearch, pathname, router, searchParams])

  return (
    <nav className="sticky top-0 z-50 h-12 w-full border-b border-black/[0.06] dark:border-white/[0.06] bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="container flex h-full items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-zinc-900 dark:bg-white shadow-md border border-white/10 dark:border-black/10 group-hover:scale-105 transition-transform duration-200">
              <Bookmark className="h-3.5 w-3.5 text-white dark:text-black fill-current" />
            </div>
            <div className="flex items-baseline">
              <span className="text-[16px] font-medium tracking-[-0.02em] text-zinc-500 dark:text-zinc-400">Link</span>
              <span className="text-[16px] font-bold tracking-[-0.03em] text-black dark:text-white">Vault</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 max-w-[320px]">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/25 dark:text-white/25 group-focus-within:text-black/40 dark:group-focus-within:text-white/40 transition-colors" />
            <input
              type="search"
              placeholder="Search bookmarks..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-8 w-full rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.05] pl-9 pr-3 text-[13px] text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 focus:outline-none focus:border-black/20 dark:focus:border-white/20 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-[13px] font-medium rounded-lg h-8 px-3.5 hover:opacity-90 transition-all letter-spacing-[-0.2px]"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Add link
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="sm:hidden flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-lg h-8 w-8"
          >
            <BookmarkPlus className="h-4 w-4" />
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.05] dark:bg-white/[0.05] text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10 transition-all')}>
              <User className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-widest px-2 py-1.5">
                  {userEmail || 'My Account'}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-[13px] py-2"
                onClick={handleExportJSON}
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-[13px] py-2"
                onClick={() => setIsImportModalOpen(true)}
              >
                <FileUp className="mr-2 h-3.5 w-3.5" />
                Import Bookmarks
              </DropdownMenuItem>
              <form action={logout} ref={logoutFormRef}>
                <DropdownMenuItem
                  className="cursor-pointer text-[13px] py-2"
                  onClick={() => logoutFormRef.current?.requestSubmit()}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Logout
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <BookmarkForm
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          // Refresh data
          window.location.reload()
        }}
      />
      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </nav>
  )
}
