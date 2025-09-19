import React, { useState, useEffect } from 'react';
import { Heart, Star, ThumbsUp, Share2, BookmarkPlus, TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface ContentRatingProps {
  contentType: 'article' | 'event';
  contentId: string;
  title: string;
  showTransparency?: boolean;
  compact?: boolean;
}

interface RatingData {
  totalRatings: number;
  averageRating: number;
  recommendationCount: number;
  userRating?: number;
  hasRecommended?: boolean;
  weeklyRank?: number;
  totalViews?: number;
}

const RATING_TYPES = {
  recommend: { icon: Heart, label: 'Recommend', color: 'text-liberation-pride-pink' },
  helpful: { icon: ThumbsUp, label: 'Helpful', color: 'text-liberation-gold' },
  inspiring: { icon: Star, label: 'Inspiring', color: 'text-liberation-pride-purple' }
};

export default function ContentRating({
  contentType,
  contentId,
  title,
  showTransparency = true,
  compact = false
}: ContentRatingProps) {
  const [ratingData, setRatingData] = useState<RatingData>({
    totalRatings: 0,
    averageRating: 0,
    recommendationCount: 0
  });
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Generate anonymous user ID that persists in session
  const getUserId = () => {
    let userId = sessionStorage.getItem('anonymous_user_id');
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('anonymous_user_id', userId);
    }
    return userId;
  };

  useEffect(() => {
    fetchRatingData();
    fetchUserRatings();
  }, [contentType, contentId]);

  const fetchRatingData = async () => {
    if (!supabase) return;

    try {
      // Get overall rating statistics
      const { data: ratings } = await supabase
        .from('content_ratings')
        .select('rating_type, rating_value')
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      // Get analytics data
      const { data: analytics } = await supabase
        .from('content_analytics')
        .select('total_views, total_ratings, average_rating, recommendation_count')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      // Check weekly highlights
      const weekStart = getWeekStart(new Date());
      const { data: highlight } = await supabase
        .from('weekly_highlights')
        .select('highlight_type')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('week_start', weekStart.toISOString().split('T')[0]);

      const recommendCount = ratings?.filter(r => r.rating_type === 'recommend').length || 0;
      const avgRating = ratings?.length ? ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length : 0;

      setRatingData({
        totalRatings: ratings?.length || 0,
        averageRating: Math.round(avgRating * 10) / 10,
        recommendationCount: recommendCount,
        weeklyRank: highlight?.length || 0,
        totalViews: analytics?.total_views || 0
      });

    } catch (error) {
      console.error('Error fetching rating data:', error);
    }
  };

  const fetchUserRatings = async () => {
    if (!supabase) return;

    const userId = getUserId();

    try {
      const { data: userRatings } = await supabase
        .from('content_ratings')
        .select('rating_type, rating_value')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', userId);

      const ratingsMap: Record<string, number> = {};
      userRatings?.forEach(rating => {
        ratingsMap[rating.rating_type] = rating.rating_value;
      });

      setUserRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

  const handleRate = async (ratingType: string, value: number) => {
    if (!supabase) return;

    setIsLoading(true);
    const userId = getUserId();

    try {
      // Upsert rating (update if exists, insert if not)
      const { error } = await supabase
        .from('content_ratings')
        .upsert({
          content_type: contentType,
          content_id: contentId,
          user_id: userId,
          rating_type: ratingType,
          rating_value: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Track engagement
      await supabase
        .from('content_engagement')
        .upsert({
          content_type: contentType,
          content_id: contentId,
          user_id: userId,
          engagement_type: 'rating',
          engagement_data: { rating_type: ratingType, rating_value: value }
        });

      // Update analytics
      await updateAnalytics();

      // Refresh data
      await fetchRatingData();
      await fetchUserRatings();

      setFeedbackMessage(`Thank you for rating this ${contentType}! Your feedback helps our community.`);
      setTimeout(() => setFeedbackMessage(''), 3000);

    } catch (error) {
      console.error('Error submitting rating:', error);
      setFeedbackMessage('Unable to submit rating. Please try again.');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnalytics = async () => {
    if (!supabase) return;

    const today = new Date().toISOString().split('T')[0];

    // Get fresh rating data for analytics
    const { data: allRatings } = await supabase
      .from('content_ratings')
      .select('rating_value, rating_type')
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    const totalRatings = allRatings?.length || 0;
    const avgRating = totalRatings > 0
      ? (allRatings || []).reduce((sum, r) => sum + r.rating_value, 0) / totalRatings
      : 0;
    const recommendCount = (allRatings || []).filter(r => r.rating_type === 'recommend').length;

    // Upsert analytics
    await supabase
      .from('content_analytics')
      .upsert({
        content_type: contentType,
        content_id: contentId,
        date: today,
        total_ratings: totalRatings,
        average_rating: Math.round(avgRating * 100) / 100,
        recommendation_count: recommendCount,
        updated_at: new Date().toISOString()
      });
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const renderRatingButton = (type: string, config: any) => {
    const Icon = config.icon;
    const userRating = userRatings[type] || 0;
    const hasRated = userRating > 0;

    return (
      <div key={type} className="flex items-center space-x-2">
        <button
          onClick={() => handleRate(type, hasRated ? 0 : 5)}
          disabled={isLoading}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
            hasRated
              ? `bg-liberation-gold/20 ${config.color} border border-liberation-gold`
              : 'bg-gray-100 text-gray-600 hover:bg-liberation-gold/10 border border-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{config.label}</span>
          {hasRated && (
            <span className="text-xs bg-liberation-gold text-liberation-black px-1 rounded">
              {userRating}
            </span>
          )}
        </button>
      </div>
    );
  };

  const renderTransparencyData = () => {
    if (!showTransparency || compact) return null;

    return (
      <div className="mt-4 p-3 bg-liberation-cream/30 rounded-lg border border-liberation-gold/20">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-liberation-gold" />
          <span className="text-sm font-semibold text-liberation-black">Community Insights</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="font-bold text-liberation-pride-purple">{ratingData.totalRatings}</div>
            <div className="text-gray-600">Total Ratings</div>
          </div>

          <div className="text-center">
            <div className="font-bold text-liberation-pride-pink">{ratingData.recommendationCount}</div>
            <div className="text-gray-600">Recommendations</div>
          </div>

          {ratingData.averageRating > 0 && (
            <div className="text-center">
              <div className="font-bold text-liberation-gold">{ratingData.averageRating}/5</div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          )}

          {ratingData.totalViews && (
            <div className="text-center">
              <div className="font-bold text-liberation-healing-sage">{ratingData.totalViews}</div>
              <div className="text-gray-600">Views</div>
            </div>
          )}
        </div>

        {ratingData.weeklyRank && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center px-2 py-1 bg-liberation-gold text-liberation-black text-xs font-medium rounded-full">
              <Star className="h-3 w-3 mr-1" />
              Community Favorite This Week
            </span>
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {Object.entries(RATING_TYPES).map(([type, config]) => {
            const Icon = config.icon;
            const hasRated = userRatings[type] > 0;
            return (
              <button
                key={type}
                onClick={() => handleRate(type, hasRated ? 0 : 5)}
                className={`p-1 rounded ${hasRated ? config.color : 'text-gray-400 hover:text-gray-600'}`}
                title={`${config.label} this ${contentType}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {ratingData.totalRatings > 0 && (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>{ratingData.recommendationCount}</span>
            <Heart className="h-3 w-3" />
            <span>•</span>
            <span>{ratingData.totalRatings} ratings</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {feedbackMessage && (
        <div className="mb-4 p-3 bg-liberation-pride-pink/10 border border-liberation-pride-pink/20 rounded-lg">
          <p className="text-sm text-liberation-pride-pink font-medium">{feedbackMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-liberation-black mb-3">
            How would you rate this {contentType}?
          </h4>

          <div className="flex flex-wrap gap-3">
            {Object.entries(RATING_TYPES).map(([type, config]) =>
              renderRatingButton(type, config)
            )}
          </div>
        </div>

        {renderTransparencyData()}

        <div className="text-xs text-gray-500 mt-4">
          Your ratings help IVOR learn community preferences and improve recommendations.
          All rating data is transparent and helps drive our weekly community highlights.
        </div>
      </div>
    </div>
  );
}