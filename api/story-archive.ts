import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '12', category = 'all', tag = 'all' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Build query for published articles
    let query = supabase
      .from('newsroom_articles')
      .select(`
        id,
        title,
        excerpt,
        content,
        published_at,
        source,
        categories!left(name),
        authors!left(
          community_members!left(full_name)
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    // Apply category filter if specified
    if (category && category !== 'all') {
      query = query.eq('categories.name', category);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('newsroom_articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // Get paginated results
    const { data: articles, error } = await query
      .range(offset, offset + limitNumber - 1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    // Transform data to match StoryArchiveItem interface
    const transformedArticles = articles?.map(article => ({
      id: article.id,
      title: article.title || 'Untitled',
      excerpt: article.excerpt || article.content?.substring(0, 200) + '...' || '',
      content: article.content || '',
      category: article.categories?.name || 'general',
      author: article.authors?.community_members?.full_name || 'BLKOUT Collective',
      publishedAt: article.published_at || new Date().toISOString(),
      readTime: `${Math.ceil((article.content?.length || 1000) / 200)} min read`,
      tags: [], // TODO: Add tag support when article_tags are connected
      imageUrl: undefined, // TODO: Add featured_image support
      originalUrl: article.source_url || undefined
    })) || [];

    return res.status(200).json({
      articles: transformedArticles,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil((count || 0) / limitNumber),
        totalArticles: count || 0,
        articlesPerPage: limitNumber
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}