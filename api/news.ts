import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ivorIntegration } from '../src/services/ivor-integration';

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
      // Get news articles (from newsroom_articles table)
      const { data: articles, error } = await supabase
        .from('newsroom_articles')
        .select(`
          id,
          title,
          excerpt,
          content,
          published_at,
          status,
          categories!left(name),
          authors!left(
            community_members!left(full_name)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch news' });
      }

      // Transform data for frontend
      const transformedArticles = articles?.map(article => ({
        id: article.id,
        title: article.title || 'Untitled',
        excerpt: article.excerpt || article.content?.substring(0, 200) + '...' || '',
        content: article.content || '',
        category: article.categories?.name || 'general',
        author: article.authors?.community_members?.full_name || 'BLKOUT Collective',
        publishedAt: article.published_at || new Date().toISOString(),
        featured: false
      })) || [];

      return res.status(200).json({ articles: transformedArticles });

    } else if (req.method === 'POST') {
      // Create news article
      const {
        title,
        content,
        excerpt,
        category,
        status = 'review', // Default to review for moderation
        autoApprove = false // Allow direct approval for admin users
      } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const articleData = {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        status: autoApprove ? 'published' : status,
        source: 'API Submission',
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (autoApprove) {
        articleData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('newsroom_articles')
        .insert([articleData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to create article' });
      }

      const createdArticle = data[0];

      // If auto-approved, sync to IVOR immediately
      if (autoApprove && createdArticle.status === 'published') {
        try {
          const articleForIVOR = {
            id: createdArticle.id,
            title: createdArticle.title,
            content: createdArticle.content,
            summary: createdArticle.excerpt,
            category: 'community' as any, // Default category
            tags: [],
            author: { name: 'BLKOUT Collective', id: 'api', role: 'contributor' },
            status: 'published',
            publishedAt: createdArticle.published_at,
            createdAt: createdArticle.created_at,
            updatedAt: createdArticle.updated_at,
            communityValues: ['community-healing'],
            moderationNotes: 'Auto-approved via API',
            traumaInformed: true,
            accessibilityFeatures: [],
            contentWarnings: [],
            revenueSharing: { creatorShare: 0.75, communityShare: 0.25 }
          };

          await ivorIntegration.syncArticleToIVOR(articleForIVOR);
          console.log('✅ Article auto-synced to IVOR knowledge base:', createdArticle.id);

          // Also trigger BLKOUTHUB webhook for auto-approved articles
          try {
            const response = await fetch(`${req.headers.origin}/api/webhooks/blkouthub`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'approved',
                contentType: 'article',
                contentId: createdArticle.id,
                moderatorId: 'api-auto-approval'
              })
            });

            if (response.ok) {
              console.log('✅ Auto-approved article posted to BLKOUTHUB');
            }
          } catch (webhookError) {
            console.error('BLKOUTHUB webhook failed for auto-approved article:', webhookError);
          }

        } catch (ivorError) {
          console.error('Failed to sync auto-approved article to IVOR:', ivorError);
        }
      }

      return res.status(201).json({
        article: createdArticle,
        message: autoApprove
          ? 'Article created and published, synced to IVOR and BLKOUTHUB'
          : 'Article created and submitted for moderation'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}