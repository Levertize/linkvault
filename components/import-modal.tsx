'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, Loader2, FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { parseBookmarks } from '@/utils/bookmark-parser'

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportModal({ open, onOpenChange, onSuccess }: ImportModalProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const parsed = parseBookmarks(text)

      if (parsed.length === 0) {
        throw new Error('No bookmarks found in this file.')
      }

      toast.info(`Found ${parsed.length} bookmarks. Importing...`)

      // Batch import (we'll do it sequentially or in chunks for safety)
      let successCount = 0
      for (const item of parsed) {
        try {
          const res = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: item.url,
              title: item.title,
              description: 'Imported from browser',
            }),
          })
          if (res.ok) successCount++
        } catch (e) {
          console.error(`Failed to import ${item.url}`)
        }
      }

      toast.success(`Successfully imported ${successCount} out of ${parsed.length} bookmarks.`)
      onSuccess()
      onOpenChange(false)
      setFile(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse file.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileUp className="h-5 w-5" />
            Import Bookmarks
          </DialogTitle>
          <DialogDescription>
            Upload an HTML bookmark file exported from your browser (Chrome, Safari, Firefox).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-black/5 rounded-xl bg-black/[0.01]">
          <input
            type="file"
            accept=".html"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-black/5 rounded-full">
                <Upload className="h-6 w-6 text-black/40" />
              </div>
              <span className="text-[13px] font-medium text-black/80">{file.name}</span>
              <button 
                onClick={() => setFile(null)} 
                className="text-[11px] text-black/40 hover:text-black/60 underline"
              >
                Change file
              </button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              className="flex flex-col h-auto py-4 px-8 hover:bg-black/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mb-2 text-black/20" />
              <span className="text-[13px] font-medium text-black/60">Choose HTML file</span>
              <span className="text-[11px] text-black/30 mt-1">Netscape bookmark format</span>
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button 
            disabled={!file || isImporting} 
            onClick={handleImport}
            className="w-full bg-black text-white h-9"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Start Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
