import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkVaultBot/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      url

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    let image_url =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      ''

    // Handle relative image URLs
    if (image_url && !image_url.startsWith('http')) {
      const urlObj = new URL(url)
      image_url = `${urlObj.origin}${image_url.startsWith('/') ? '' : '/'}${image_url}`
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image_url,
    })
  } catch (error) {
    console.error('Fetch meta error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
