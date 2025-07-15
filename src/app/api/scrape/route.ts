import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';
import { supabase } from '../../../lib/supabase'; // adjust path if needed

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Clean page
    $('script, style, nav, header, footer, aside, .nav, .menu, .sidebar, .ads, .ad, .social, .share, .comment').remove();

    const contentSelectors = [
      'article', '[role="main"]', 'main',
      '.post-content', '.entry-content', '.content',
      '.article-content', '.post-body',
    ];

    let mainContent = '';

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        mainContent = element.text();
        break;
      }
    }

    if (!mainContent) {
      const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
      mainContent = paragraphs.filter(p => p.length > 50).join(' ');
    }

    const cleanText = mainContent
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    const sentences = cleanText
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => {
        const trimmed = sentence.trim();
        return (
          trimmed.length > 20 &&
          trimmed.split(' ').length > 3 &&
          !trimmed.toLowerCase().includes('click here') &&
          !trimmed.toLowerCase().includes('subscribe') &&
          !trimmed.toLowerCase().includes('menu')
        );
      })
      .slice(0, 3);

    const summary = sentences.join(' ').trim();

    if (!summary || summary.length < 50) {
      return NextResponse.json({
        error: 'Could not extract meaningful sentences from the page',
      }, { status: 404 });
    }

    // ✅ Fix: Insert into correct column
    const { error } = await supabase.from('summaries').insert([
      { url, summary_en: summary }
    ]);

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Failed to save summary to Supabase' }, { status: 500 });
    }

    return NextResponse.json({ success: true, summary });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    console.error('🔴 Scrape Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
