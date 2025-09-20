import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, Heart, Award, Calendar, BookOpen, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface HighlightItem {
  id: string;
  content_type: 'article' | 'event';
  content_id: string;
  highlight_type: 'most_recommended' | 'most_helpful' | 'readers_choice' | 'community_favorite';
  total_ratings: number;
  average_rating: number;
  week_start: string;
  title?: string;
  excerpt?: string;
  author?: string;
  date?: string;
  location?: string;
}

interface WeeklyHighlightsProps {
  weekOffset?: number; // 0 = current week, -1 = last week, etc.
  maxItems?: number;
  showNewsletter?: boolean;
}

const HIGHLIGHT_TYPES = {
  most_recommended: {
    icon: Heart,
    label: 'Most Recommended',
    color: 'text-liberation-pride-pink',
    bg: 'bg-liberation-pride-pink/10',
    border: 'border-liberation-pride-pink/20'
  },
  most_helpful: {
    icon: Star,
    label: 'Most Helpful',
    color: 'text-liberation-gold',
    bg: 'bg-liberation-gold/10',
    border: 'border-liberation-gold/20'
  },
  readers_choice: {
    icon: Award,
    label: "Readers' Choice",
    color: 'text-liberation-pride-purple',
    bg: 'bg-liberation-pride-purple/10',
    border: 'border-liberation-pride-purple/20'
  },
  community_favorite: {
    icon: Users,
    label: 'Community Favorite',
    color: 'text-liberation-healing-sage',
    bg: 'bg-liberation-healing-sage/10',
    border: 'border-liberation-healing-sage/20'
  }
};

export default function WeeklyHighlights({
  weekOffset = 0,
  maxItems = 10,
  showNewsletter = true
}: WeeklyHighlightsProps) {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Date>(getWeekStart(new Date()));
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    const targetWeek = new Date(selectedWeek);
    targetWeek.setDate(targetWeek.getDate() + (weekOffset * 7));
    setSelectedWeek(targetWeek);
    fetchHighlights(targetWeek);
  }, [weekOffset]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  const fetchHighlights = async (weekStart: Date) => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Fetch highlights for the week
      const { data: highlightsData } = await supabase
        .from('weekly_highlights')
        .select('*')
        .eq('week_start', weekStartStr)
        .limit(maxItems);

      if (!highlightsData || highlightsData.length === 0) {
        // If no highlights exist, generate them
        await generateWeeklyHighlights(weekStart);
        return;
      }

      // Fetch content details for each highlight
      const enrichedHighlights = await Promise.all(
        highlightsData.map(async (highlight) => {
          let contentDetails = {};

          if (highlight.content_type === 'article') {
            const { data: article } = await supabase
              .from('newsroom_articles')
              .select('title, excerpt, author_id, community_members!newsroom_articles_author_id_fkey(full_name)')
              .eq('id', highlight.content_id)
              .single();

            if (article) {
              contentDetails = {
                title: article.title,
                excerpt: article.excerpt,
                author: article.community_members?.[0]?.full_name || 'Community Author'
              };
            }
          } else if (highlight.content_type === 'event') {
            const { data: event } = await supabase
              .from('events')
              .select('title, description, date, location, organizer')
              .eq('id', highlight.content_id)
              .single();

            if (event) {
              contentDetails = {
                title: event.title,
                excerpt: event.description?.substring(0, 150) + '...',
                author: event.organizer,
                date: event.date,
                location: event.location
              };
            }
          }

          return {
            ...highlight,
            ...contentDetails
          };
        })
      );

      setHighlights(enrichedHighlights);

    } catch (error) {
      console.error('Error fetching weekly highlights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyHighlights = async (weekStart: Date) => {
    if (!supabase) return;

    try {
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get top content for each category based on ratings
      const highlightTypes = ['most_recommended', 'most_helpful', 'readers_choice', 'community_favorite'];

      for (const highlightType of highlightTypes) {
        // Query articles
        const { data: topArticles } = await supabase
          .from('content_analytics')
          .select('content_id, total_ratings, average_rating, recommendation_count')
          .eq('content_type', 'article')
          .gte('date', weekStartStr)
          .lt('date', weekEndStr)
          .order('recommendation_count', { ascending: false })
          .limit(2);

        // Query events
        const { data: topEvents } = await supabase
          .from('content_analytics')
          .select('content_id, total_ratings, average_rating, recommendation_count')
          .eq('content_type', 'event')
          .gte('date', weekStartStr)
          .lt('date', weekEndStr)
          .order('recommendation_count', { ascending: false })
          .limit(2);

        // Insert highlights
        const highlightsToInsert = [];

        if (topArticles?.length) {
          highlightsToInsert.push({
            week_start: weekStartStr,
            content_type: 'article',
            content_id: topArticles[0].content_id,
            highlight_type: highlightType,
            total_ratings: topArticles[0].total_ratings,
            average_rating: topArticles[0].average_rating
          });
        }

        if (topEvents?.length) {
          highlightsToInsert.push({
            week_start: weekStartStr,
            content_type: 'event',
            content_id: topEvents[0].content_id,
            highlight_type: highlightType,
            total_ratings: topEvents[0].total_ratings,
            average_rating: topEvents[0].average_rating
          });
        }

        if (highlightsToInsert.length > 0) {
          await supabase
            .from('weekly_highlights')
            .insert(highlightsToInsert);
        }
      }

      // Fetch the newly generated highlights
      await fetchHighlights(weekStart);

    } catch (error) {
      console.error('Error generating weekly highlights:', error);
    }
  };

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // In a real implementation, this would integrate with your newsletter service
    setNewsletterStatus('Thank you! We\'ll include you in our weekly community highlights newsletter.');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus(''), 5000);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newWeek);
    fetchHighlights(newWeek);
  };

  const renderHighlightItem = (highlight: HighlightItem) => {
    const config = HIGHLIGHT_TYPES[highlight.highlight_type];
    const Icon = config.icon;

    return (
      <div
        key={highlight.id}
        className={`p-4 rounded-lg border ${config.bg} ${config.border} transition-all hover:scale-[1.02]`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            <span className={`text-sm font-semibold ${config.color}`}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Heart className="h-4 w-4" />
            <span>{highlight.total_ratings}</span>
          </div>
        </div>

        <h4 className="font-semibold text-liberation-black mb-2">
          {highlight.title || 'Untitled Content'}
        </h4>

        {highlight.excerpt && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">
            {highlight.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            {highlight.content_type === 'article' && <BookOpen className="h-4 w-4" />}
            {highlight.content_type === 'event' && <Calendar className="h-4 w-4" />}
            <span className="capitalize">{highlight.content_type}</span>
            {highlight.author && (
              <>
                <span>•</span>
                <span>{highlight.author}</span>
              </>
            )}
          </div>

          {highlight.average_rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-liberation-gold" />
              <span>{highlight.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {highlight.date && highlight.location && (
          <div className="mt-2 text-sm text-gray-600">
            {new Date(highlight.date).toLocaleDateString()} • {highlight.location}
          </div>
        )}
      </div>
    );
  };

  const getWeekDateRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-liberation-black flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-liberation-gold" />
            Weekly Community Highlights
          </h3>
          <p className="text-gray-600 mt-1">
            Content that resonated most with our community
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-liberation-black hover:bg-liberation-gold/10 rounded-lg transition-colors"
          >
            ←
          </button>

          <div className="text-center">
            <div className="font-semibold text-liberation-black">
              {getWeekDateRange(selectedWeek)}
            </div>
            <div className="text-sm text-gray-600">
              {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)} weeks ago`}
            </div>
          </div>

          <button
            onClick={() => navigateWeek('next')}
            disabled={weekOffset >= 0}
            className="p-2 text-liberation-black hover:bg-liberation-gold/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-liberation-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing community preferences...</p>
        </div>
      )}

      {/* Highlights Grid */}
      {!isLoading && highlights.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map(renderHighlightItem)}
        </div>
      )}

      {/* No Highlights */}
      {!isLoading && highlights.length === 0 && (
        <div className="text-center py-8 bg-liberation-cream/30 rounded-lg border border-liberation-gold/20">
          <TrendingUp className="h-12 w-12 text-liberation-gold mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-liberation-black mb-2">
            No highlights yet for this week
          </h4>
          <p className="text-gray-600">
            Community ratings will determine this week's most impactful content.
          </p>
        </div>
      )}

      {/* Newsletter Signup */}
      {showNewsletter && (
        <div className="bg-liberation-pride-purple/5 border border-liberation-pride-purple/20 rounded-lg p-6">
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-liberation-black mb-2">
              Weekly Community Digest
            </h4>
            <p className="text-gray-600">
              Get the week's most recommended content delivered to your inbox every Monday.
            </p>
          </div>

          {newsletterStatus ? (
            <div className="text-center text-liberation-pride-purple font-medium">
              {newsletterStatus}
            </div>
          ) : (
            <form onSubmit={handleNewsletterSignup} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-2 border border-liberation-gold/20 rounded-lg focus:outline-none focus:border-liberation-gold"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-liberation-pride-purple text-white rounded-lg hover:bg-liberation-pride-purple/80 transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Highlights are generated based on community ratings, recommendations, and engagement data.
        This transparency helps IVOR learn what content serves our community best.
      </div>
    </div>
  );
}