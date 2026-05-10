import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description, is_favorite, tag_ids } = await request.json()

  // 1. Update bookmark
  const { data: bookmark, error: bookmarkError } = await supabase
    .from('bookmarks')
    .update({
      title,
      description,
      is_favorite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (bookmarkError) {
    return NextResponse.json({ error: bookmarkError.message }, { status: 500 })
  }

  // 2. Update tags if provided
  if (tag_ids !== undefined) {
    // Delete existing links
    await supabase.from('bookmark_tags').delete().eq('bookmark_id', id)

    // Insert new links
    if (tag_ids.length > 0) {
      const bookmarkTags = tag_ids.map((tagId: string) => ({
        bookmark_id: id,
        tag_id: tagId,
      }))

      await supabase.from('bookmark_tags').insert(bookmarkTags)
    }
  }

  return NextResponse.json(bookmark)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
