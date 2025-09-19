import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Users, ThumbsUp, MessageSquare } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface EventReviewProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  showReviews?: boolean;
  compact?: boolean;
}

interface Review {
  id: string;
  attended: boolean;
  star_rating: number;
  review_text: string;
  would_recommend: boolean;
  accessibility_rating: number;
  organization_rating: number;
  helpful_count: number;
  created_at: string;
  reviewer_id: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  attendanceRate: number;
  recommendationRate: number;
  averageAccessibility: number;
  averageOrganization: number;
}

export default function EventReview({
  eventId,
  eventTitle,
  eventDate,
  showReviews = true,
  compact = false
}: EventReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    attendanceRate: 0,
    recommendationRate: 0,
    averageAccessibility: 0,
    averageOrganization: 0
  });
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Review form state
  const [formData, setFormData] = useState({
    attended: false,
    star_rating: 5,
    review_text: '',
    would_recommend: true,
    accessibility_rating: 5,
    organization_rating: 5
  });

  const getUserId = () => {
    let userId = sessionStorage.getItem('anonymous_user_id');
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('anonymous_user_id', userId);
    }
    return userId;
  };

  useEffect(() => {
    fetchReviews();
    fetchUserReview();
  }, [eventId]);

  const fetchReviews = async () => {
    if (!supabase) return;

    try {
      const { data: reviewsData } = await supabase
        .from('event_reviews')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);
      calculateStats(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUserReview = async () => {
    if (!supabase) return;

    const userId = getUserId();

    try {
      const { data: userReviewData } = await supabase
        .from('event_reviews')
        .select('*')
        .eq('event_id', eventId)
        .eq('reviewer_id', userId)
        .single();

      setUserReview(userReviewData);
      if (userReviewData) {
        setFormData({
          attended: userReviewData.attended,
          star_rating: userReviewData.star_rating || 5,
          review_text: userReviewData.review_text || '',
          would_recommend: userReviewData.would_recommend || true,
          accessibility_rating: userReviewData.accessibility_rating || 5,
          organization_rating: userReviewData.organization_rating || 5
        });
      }
    } catch (error) {
      // User hasn't reviewed yet, which is fine
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        attendanceRate: 0,
        recommendationRate: 0,
        averageAccessibility: 0,
        averageOrganization: 0
      });
      return;
    }

    const attended = reviewsData.filter(r => r.attended);
    const withRatings = reviewsData.filter(r => r.star_rating);
    const withRecommendations = reviewsData.filter(r => r.would_recommend !== null);
    const withAccessibility = reviewsData.filter(r => r.accessibility_rating);
    const withOrganization = reviewsData.filter(r => r.organization_rating);

    setStats({
      totalReviews: reviewsData.length,
      averageRating: withRatings.length ? withRatings.reduce((sum, r) => sum + r.star_rating, 0) / withRatings.length : 0,
      attendanceRate: reviewsData.length ? (attended.length / reviewsData.length) * 100 : 0,
      recommendationRate: withRecommendations.length ? (withRecommendations.filter(r => r.would_recommend).length / withRecommendations.length) * 100 : 0,
      averageAccessibility: withAccessibility.length ? withAccessibility.reduce((sum, r) => sum + r.accessibility_rating, 0) / withAccessibility.length : 0,
      averageOrganization: withOrganization.length ? withOrganization.reduce((sum, r) => sum + r.organization_rating, 0) / withOrganization.length : 0
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsLoading(true);
    const userId = getUserId();

    try {
      const reviewData = {
        event_id: eventId,
        reviewer_id: userId,
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('event_reviews')
        .upsert(reviewData);

      if (error) throw error;

      // Track engagement
      await supabase
        .from('content_engagement')
        .upsert({
          content_type: 'event',
          content_id: eventId,
          user_id: userId,
          engagement_type: 'review',
          engagement_data: { attended: formData.attended, star_rating: formData.star_rating }
        });

      await fetchReviews();
      await fetchUserReview();
      setShowReviewForm(false);

      setFeedbackMessage('Thank you for your review! Your feedback helps our community.');
      setTimeout(() => setFeedbackMessage(''), 3000);

    } catch (error) {
      console.error('Error submitting review:', error);
      setFeedbackMessage('Unable to submit review. Please try again.');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-liberation-gold fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStarInput = (value: number, onChange: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-liberation-black">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? 'text-liberation-gold fill-current' : 'text-gray-300 hover:text-liberation-gold/50'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{value}/5</span>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-center space-x-4">
        {stats.totalReviews > 0 && (
          <>
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(stats.averageRating))}
              <span className="text-sm text-gray-600">
                {stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
              </span>
            </div>

            {stats.attendanceRate > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{Math.round(stats.attendanceRate)}% attended</span>
              </div>
            )}
          </>
        )}

        {!userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="text-sm text-liberation-pride-purple hover:text-liberation-pride-purple/80 font-medium"
          >
            Review Event
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {feedbackMessage && (
        <div className="p-3 bg-liberation-pride-pink/10 border border-liberation-pride-pink/20 rounded-lg">
          <p className="text-sm text-liberation-pride-pink font-medium">{feedbackMessage}</p>
        </div>
      )}

      {/* Event Review Stats */}
      {stats.totalReviews > 0 && (
        <div className="bg-liberation-cream/30 rounded-lg p-4 border border-liberation-gold/20">
          <h4 className="font-semibold text-liberation-black mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Community Feedback
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                {renderStars(Math.round(stats.averageRating), 'md')}
              </div>
              <div className="font-bold text-liberation-pride-purple">{stats.averageRating.toFixed(1)}/5</div>
              <div className="text-sm text-gray-600">Overall Rating</div>
            </div>

            <div className="text-center">
              <div className="font-bold text-liberation-pride-pink">{Math.round(stats.attendanceRate)}%</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>

            <div className="text-center">
              <div className="font-bold text-liberation-gold">{Math.round(stats.recommendationRate)}%</div>
              <div className="text-sm text-gray-600">Would Recommend</div>
            </div>

            <div className="text-center">
              <div className="font-bold text-liberation-healing-sage">{stats.totalReviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
          </div>

          {stats.averageAccessibility > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="font-bold text-liberation-pride-purple">{stats.averageAccessibility.toFixed(1)}/5</div>
                <div className="text-sm text-gray-600">Accessibility</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-liberation-pride-purple">{stats.averageOrganization.toFixed(1)}/5</div>
                <div className="text-sm text-gray-600">Organization</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Form */}
      {!userReview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-liberation-black">
              Did you attend this event?
            </h4>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-liberation-gold text-liberation-black rounded-lg hover:bg-liberation-gold/80 transition-colors"
            >
              {showReviewForm ? 'Cancel' : 'Leave Review'}
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="space-y-6 p-4 bg-white rounded-lg border border-liberation-gold/20">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-liberation-black">Did you attend?</label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.attended}
                    onChange={(e) => setFormData({ ...formData, attended: e.target.checked })}
                    className="rounded border-liberation-gold/20"
                  />
                  <span className="text-sm">Yes, I attended this event</span>
                </label>
              </div>

              {formData.attended && (
                <>
                  {renderStarInput(formData.star_rating, (rating) => setFormData({ ...formData, star_rating: rating }), 'Overall Rating')}

                  <div className="grid md:grid-cols-2 gap-4">
                    {renderStarInput(formData.accessibility_rating, (rating) => setFormData({ ...formData, accessibility_rating: rating }), 'Accessibility')}
                    {renderStarInput(formData.organization_rating, (rating) => setFormData({ ...formData, organization_rating: rating }), 'Organization')}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-liberation-black">Would you recommend this event?</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={formData.would_recommend}
                          onChange={() => setFormData({ ...formData, would_recommend: true })}
                          className="border-liberation-gold/20"
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={!formData.would_recommend}
                          onChange={() => setFormData({ ...formData, would_recommend: false })}
                          className="border-liberation-gold/20"
                        />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-liberation-black">
                  Share your experience (optional)
                </label>
                <textarea
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="What did you think of the event? How could it be improved?"
                  className="w-full p-3 border border-liberation-gold/20 rounded-lg focus:outline-none focus:border-liberation-gold resize-none"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-liberation-gold text-liberation-black rounded-lg hover:bg-liberation-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Existing Reviews */}
      {showReviews && reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-liberation-black">Community Reviews</h4>

          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-white rounded-lg border border-liberation-gold/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {review.attended && (
                    <span className="inline-flex items-center px-2 py-1 bg-liberation-pride-pink/10 text-liberation-pride-pink text-xs font-medium rounded-full">
                      Attended
                    </span>
                  )}
                  {review.star_rating && renderStars(review.star_rating)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>

              {review.review_text && (
                <p className="text-gray-700 mb-3">{review.review_text}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {review.would_recommend !== null && (
                    <span className={`${review.would_recommend ? 'text-liberation-pride-pink' : 'text-gray-500'}`}>
                      {review.would_recommend ? '👍 Recommends' : '👎 Doesn\'t recommend'}
                    </span>
                  )}
                  {review.accessibility_rating && (
                    <span className="text-gray-600">
                      Accessibility: {review.accessibility_rating}/5
                    </span>
                  )}
                </div>

                <button className="flex items-center space-x-1 text-gray-500 hover:text-liberation-gold">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{review.helpful_count || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Reviews help IVOR learn about event quality and community preferences.
        All feedback is used to improve future events and recommendations.
      </div>
    </div>
  );
}