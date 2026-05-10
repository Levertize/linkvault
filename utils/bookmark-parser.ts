export function parseBookmarks(html: string) {
  const bookmarks: { title: string; url: string; created_at?: string }[] = []
  
  // Basic regex to find DT/A tags in Netscape bookmark format
  // Matches: <A HREF="url" ADD_DATE="12345">Title</A>
  const regex = /<A\s+HREF="([^"]+)"(?:\s+ADD_DATE="([^"]+)")?[^>]*>([^<]*)<\/A>/gi
  
  let match
  while ((regex.exec(html)) !== null) {
    // This is needed because of how exec works with global flag in a loop
  }

  // Actually using a better approach with matchAll or simple string splitting if regex is tricky
  const matches = html.matchAll(/<A\s+HREF="([^"]+)"(?:\s+ADD_DATE="([^"]+)")?[^>]*>([^<]*)<\/A>/gi)
  
  for (const match of matches) {
    const url = match[1]
    const addDate = match[2]
    const title = match[3] || url

    bookmarks.push({
      url,
      title: title.trim(),
      created_at: addDate ? new Date(parseInt(addDate) * 1000).toISOString() : undefined
    })
  }

  return bookmarks
}
