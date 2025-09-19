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
      const { type } = req.query;

      switch (type) {
        case 'trending':
          return res.json(await getTrendingContent());
        case 'popular':
          return res.json(await getPopularContent());
        case 'reading-patterns':
          return res.json(await getReadingPatterns());
        case 'weekly-highlights':
          return res.json(await getWeeklyHighlights());
        case 'community-stats':
          return res.json(await getCommunityStats());
        default:
          return res.json(await getCommunityInsightsDashboard());
      }

    } else if (req.method === 'POST') {
      const { action, data } = req.body;

      switch (action) {
        case 'track-view':
          return res.json(await trackContentView(data));
        case 'submit-rating':
          return res.json(await submitContentRating(data));
        case 'generate-highlights':
          return res.json(await generateWeeklyHighlights());
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Community insights API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTrendingContent() {
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get content with highest engagement in last week
  const { data: trending, error } = await supabase
    .from('content_analytics')
    .select(`
      content_type,
      content_id,
      total_views,
      total_ratings,
      average_rating,
      recommendation_count,
      share_count
    `)
    .gte('date', lastWeek.toISOString().split('T')[0])
    .order('total_views', { ascending: false })
    .limit(10);

  if (error) throw error;

  // Enrich with content details
  const enrichedTrending = await Promise.all(
    trending.map(async (item) => {
      if (item.content_type === 'article') {
        const { data: article } = await supabase
          .from('newsroom_articles')
          .select('title, excerpt, published_at')
          .eq('id', item.content_id)
          .single();

        return { ...item, ...article };
      } else if (item.content_type === 'event') {
        const { data: event } = await supabase
          .from('events')
          .select('title, description, date, location')
          .eq('id', item.content_id)
          .single();

        return { ...item, title: event?.title, excerpt: event?.description?.substring(0, 150) };
      }
      return item;
    })
  );

  return {
    trending: enrichedTrending,
    period: 'last_7_days',
    generated_at: new Date().toISOString()
  };
}

async function getPopularContent() {
  // Get all-time most popular content
  const { data: popular, error } = await supabase
    .from('content_analytics')
    .select(`
      content_type,
      content_id,
      total_ratings,
      average_rating,
      recommendation_count
    `)
    .order('recommendation_count', { ascending: false })
    .limit(15);

  if (error) throw error;

  // Group by content type
  const articles = popular.filter(item => item.content_type === 'article');
  const events = popular.filter(item => item.content_type === 'event');

  return {
    articles: articles.slice(0, 8),
    events: events.slice(0, 7),
    total_items: popular.length
  };
}

async function getReadingPatterns() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get engagement patterns over time
  const { data: dailyStats, error } = await supabase
    .from('content_analytics')
    .select('date, total_views, total_ratings, content_type')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;

  // Process into readable patterns
  const patterns = dailyStats.reduce((acc, stat) => {
    const date = stat.date;
    if (!acc[date]) {
      acc[date] = { date, articles: 0, events: 0, total_views: 0, total_ratings: 0 };
    }

    acc[date][stat.content_type + 's'] += 1;
    acc[date].total_views += stat.total_views || 0;
    acc[date].total_ratings += stat.total_ratings || 0;

    return acc;
  }, {} as Record<string, any>);

  // Get most active days and content preferences
  const { data: topCategories } = await supabase
    .from('content_ratings')
    .select('content_type, rating_type, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const categoryPreferences = topCategories?.reduce((acc, rating) => {
    const key = `${rating.content_type}_${rating.rating_type}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    daily_patterns: Object.values(patterns),
    content_preferences: categoryPreferences,
    analysis_period: '30_days'
  };
}

async function getWeeklyHighlights() {
  const weekStart = getWeekStart(new Date());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: highlights, error } = await supabase
    .from('weekly_highlights')
    .select('*')
    .eq('week_start', weekStartStr);

  if (error) throw error;

  // If no highlights exist, generate them
  if (!highlights || highlights.length === 0) {
    await generateWeeklyHighlights();
    return await getWeeklyHighlights(); // Recursive call to get newly generated highlights
  }

  return {
    highlights,
    week_start: weekStartStr,
    total_highlights: highlights.length
  };
}

async function getCommunityStats() {
  const { data: totalRatings } = await supabase
    .from('content_ratings')
    .select('id', { count: 'exact' });

  const { data: totalEngagement } = await supabase
    .from('content_engagement')
    .select('id', { count: 'exact' });

  const { data: totalReviews } = await supabase
    .from('event_reviews')
    .select('id', { count: 'exact' });

  // Get content with highest community engagement
  const { data: topRated } = await supabase
    .from('content_analytics')
    .select('content_type, content_id, total_ratings, average_rating')
    .order('total_ratings', { ascending: false })
    .limit(1);

  const thisWeek = getWeekStart(new Date());
  const { data: weeklyActivity } = await supabase
    .from('content_ratings')
    .select('id', { count: 'exact' })
    .gte('created_at', thisWeek.toISOString());

  return {
    total_ratings: totalRatings?.[0]?.count || 0,
    total_engagement: totalEngagement?.[0]?.count || 0,
    total_reviews: totalReviews?.[0]?.count || 0,
    weekly_activity: weeklyActivity?.[0]?.count || 0,
    top_rated_content: topRated?.[0] || null,
    last_updated: new Date().toISOString()
  };
}

async function getCommunityInsightsDashboard() {
  const [trending, popular, patterns, highlights, stats] = await Promise.all([
    getTrendingContent(),
    getPopularContent(),
    getReadingPatterns(),
    getWeeklyHighlights(),
    getCommunityStats()
  ]);

  return {
    dashboard: {
      trending: trending.trending.slice(0, 5),
      popular_articles: popular.articles.slice(0, 3),
      popular_events: popular.events.slice(0, 3),
      weekly_highlights: highlights.highlights.slice(0, 4),
      community_stats: stats,
      reading_patterns: patterns.daily_patterns.slice(-7) // Last 7 days
    },
    generated_at: new Date().toISOString(),
    data_transparency: {
      total_data_points: (stats.total_ratings + stats.total_engagement + stats.total_reviews),
      community_driven: true,
      privacy_preserving: true
    }
  };
}

async function trackContentView(data: any) {
  const { content_type, content_id, user_id = 'anonymous' } = data;

  // Track the engagement
  await supabase
    .from('content_engagement')
    .upsert({
      content_type,
      content_id,
      user_id,
      engagement_type: 'view',
      engagement_data: { timestamp: new Date().toISOString() }
    });

  // Update analytics
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('content_analytics')
    .select('total_views, unique_viewers')
    .eq('content_type', content_type)
    .eq('content_id', content_id)
    .eq('date', today)
    .single();

  await supabase
    .from('content_analytics')
    .upsert({
      content_type,
      content_id,
      date: today,
      total_views: (existing?.total_views || 0) + 1,
      unique_viewers: existing?.unique_viewers || 1, // Would need more sophisticated tracking for true unique count
      updated_at: new Date().toISOString()
    });

  return { success: true, tracked: 'view' };
}

async function submitContentRating(data: any) {
  const { content_type, content_id, user_id = 'anonymous', rating_type, rating_value } = data;

  // Submit the rating
  await supabase
    .from('content_ratings')
    .upsert({
      content_type,
      content_id,
      user_id,
      rating_type,
      rating_value,
      updated_at: new Date().toISOString()
    });

  // Update analytics
  const { data: allRatings } = await supabase
    .from('content_ratings')
    .select('rating_value, rating_type')
    .eq('content_type', content_type)
    .eq('content_id', content_id);

  const totalRatings = allRatings?.length || 0;
  const avgRating = totalRatings > 0
    ? allRatings.reduce((sum, r) => sum + r.rating_value, 0) / totalRatings
    : 0;
  const recommendCount = allRatings?.filter(r => r.rating_type === 'recommend').length || 0;

  const today = new Date().toISOString().split('T')[0];

  await supabase
    .from('content_analytics')
    .upsert({
      content_type,
      content_id,
      date: today,
      total_ratings: totalRatings,
      average_rating: Math.round(avgRating * 100) / 100,
      recommendation_count: recommendCount,
      updated_at: new Date().toISOString()
    });

  return { success: true, total_ratings: totalRatings, average_rating: avgRating };
}

async function generateWeeklyHighlights() {
  const weekStart = getWeekStart(new Date());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Get top content for each category
  const highlightTypes = [
    { type: 'most_recommended', orderBy: 'recommendation_count' },
    { type: 'most_helpful', orderBy: 'total_ratings' },
    { type: 'readers_choice', orderBy: 'total_views' },
    { type: 'community_favorite', orderBy: 'average_rating' }
  ];

  const highlightsToInsert = [];

  for (const highlight of highlightTypes) {
    // Get top articles
    const { data: topArticles } = await supabase
      .from('content_analytics')
      .select('content_id, total_ratings, average_rating, recommendation_count, total_views')
      .eq('content_type', 'article')
      .gte('date', weekStartStr)
      .lt('date', weekEndStr)
      .order(highlight.orderBy, { ascending: false })
      .limit(1);

    // Get top events
    const { data: topEvents } = await supabase
      .from('content_analytics')
      .select('content_id, total_ratings, average_rating, recommendation_count, total_views')
      .eq('content_type', 'event')
      .gte('date', weekStartStr)
      .lt('date', weekEndStr)
      .order(highlight.orderBy, { ascending: false })
      .limit(1);

    if (topArticles?.length) {
      highlightsToInsert.push({
        week_start: weekStartStr,
        content_type: 'article',
        content_id: topArticles[0].content_id,
        highlight_type: highlight.type,
        total_ratings: topArticles[0].total_ratings,
        average_rating: topArticles[0].average_rating
      });
    }

    if (topEvents?.length) {
      highlightsToInsert.push({
        week_start: weekStartStr,
        content_type: 'event',
        content_id: topEvents[0].content_id,
        highlight_type: highlight.type,
        total_ratings: topEvents[0].total_ratings,
        average_rating: topEvents[0].average_rating
      });
    }
  }

  if (highlightsToInsert.length > 0) {
    await supabase
      .from('weekly_highlights')
      .insert(highlightsToInsert);
  }

  return {
    success: true,
    generated: highlightsToInsert.length,
    week_start: weekStartStr
  };
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}