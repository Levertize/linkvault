import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      *,
      tags:bookmark_tags(
        tag:tags(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform the response to match the Bookmark interface
  const bookmarks = data.map((b: any) => ({
    ...b,
    tags: b.tags.map((t: any) => t.tag)
  }))

  return NextResponse.json(bookmarks)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url, title, description, image_url, tag_ids } = await request.json()

  if (!url || !title) {
    return NextResponse.json({ error: 'URL and Title are required' }, { status: 400 })
  }

  // 1. Insert bookmark
  const { data: bookmark, error: bookmarkError } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      url,
      title,
      description,
      image_url,
    })
    .select()
    .single()

  if (bookmarkError) {
    return NextResponse.json({ error: bookmarkError.message }, { status: 500 })
  }

  // 2. Link tags if provided
  if (tag_ids && tag_ids.length > 0) {
    const bookmarkTags = tag_ids.map((tagId: string) => ({
      bookmark_id: bookmark.id,
      tag_id: tagId,
    }))

    const { error: tagsError } = await supabase
      .from('bookmark_tags')
      .insert(bookmarkTags)

    if (tagsError) {
      // We could delete the bookmark here or just return success with error message
      return NextResponse.json({
        ...bookmark,
        tags: [],
        warning: 'Bookmark created but tags failed to link'
      })
    }
  }

  return NextResponse.json({ ...bookmark, tags: [] })
}
