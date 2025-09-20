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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get community stories - try newsroom_articles with story category first
      const { data: stories, error } = await supabase
        .from('newsroom_articles')
        .select(`
          id,
          title,
          excerpt,
          content,
          published_at
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch stories' });
      }

      // Transform data for frontend
      const transformedStories = stories?.map(story => ({
        id: story.id,
        title: story.title || 'Untitled Story',
        excerpt: story.excerpt || story.content?.substring(0, 200) + '...' || '',
        content: story.content || '',
        author: 'Community Member',
        publishedAt: story.published_at || new Date().toISOString(),
        featured: false,
        category: 'story'
      })) || [];

      return res.status(200).json({ stories: transformedStories });

    } else if (req.method === 'POST') {
      // Create community story
      const { title, content, excerpt, author } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('newsroom_articles')
        .insert([{
          title,
          content,
          excerpt: excerpt || content.substring(0, 200) + '...',
          status: 'published',
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to create story' });
      }

      return res.status(201).json({ story: data[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}