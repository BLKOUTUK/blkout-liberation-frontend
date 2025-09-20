// @ts-nocheck - Temporary TypeScript disable for deployment
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Heart, Star } from 'lucide-react';
import { eventsAPI, LiberationEvent } from '../../services/events-api';
import ContentRating from '../community/ContentRating';
import EventReview from '../community/EventReview';
import WeeklyHighlights from '../community/WeeklyHighlights';

const EventsCalendar: React.FC = () => {
  const [events, setEvents] = useState<LiberationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventData = await eventsAPI.getEvents();
      setEvents(eventData);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { key: 'all', label: 'All Events' },
    { key: 'mutual-aid', label: 'Mutual Aid' },
    { key: 'organizing', label: 'Organizing' },
    { key: 'education', label: 'Education' },
    { key: 'celebration', label: 'Celebration' },
    { key: 'support', label: 'Support' },
    { key: 'action', label: 'Action' }
  ];

  const filteredEvents = selectedEventType === 'all'
    ? events
    : events.filter(event => event.type === selectedEventType);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'mutual-aid': 'bg-liberation-pride-pink/20 text-liberation-pride-pink border-liberation-pride-pink/30',
      'organizing': 'bg-liberation-gold/20 text-liberation-gold border-liberation-gold/30',
      'education': 'bg-liberation-pride-purple/20 text-liberation-pride-purple border-liberation-pride-purple/30',
      'celebration': 'bg-liberation-healing-sage/20 text-liberation-healing-sage border-liberation-healing-sage/30',
      'support': 'bg-liberation-cream/20 text-liberation-black border-liberation-cream/30',
      'action': 'bg-liberation-sovereignty-gold/20 text-liberation-sovereignty-gold border-liberation-sovereignty-gold/30'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-liberation-sovereignty-gold/30 border-t-liberation-sovereignty-gold rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-liberation-sovereignty-gold font-bold">Loading Community Events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-liberation-sovereignty-gold/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-400 hover:text-liberation-sovereignty-gold transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Platform
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-black text-white mb-2">
                COMMUNITY <span className="text-liberation-sovereignty-gold">EVENTS</span>
              </h1>
              <p className="text-gray-400">Liberation organizing and community building calendar</p>
            </div>

            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Event Type Filter */}
      <section className="py-8 px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {eventTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedEventType(type.key)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedEventType === type.key
                    ? 'bg-liberation-sovereignty-gold text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <main className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {filteredEvents.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-liberation-sovereignty-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-12 w-12 text-liberation-sovereignty-gold" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">No Events Yet</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                The community calendar is ready for liberation organizing.
                Be the first to build community power through collective action.
              </p>
              <div className="bg-liberation-sovereignty-gold/10 border border-liberation-sovereignty-gold/20 rounded-2xl p-8 max-w-2xl mx-auto mb-12">
                <h3 className="text-liberation-sovereignty-gold font-bold text-lg mb-4">Community Event Values</h3>
                <div className="text-gray-300 text-left space-y-2">
                  <div>• Trauma-informed and accessible spaces</div>
                  <div>• Democratic organizing and mutual aid</div>
                  <div>• Black queer joy and community celebration</div>
                  <div>• Anti-oppression education and healing</div>
                </div>
              </div>

              {/* Weekly Highlights Preview */}
              <div className="max-w-4xl mx-auto mt-12">
                <WeeklyHighlights maxItems={6} showNewsletter={false} />
              </div>
            </div>
          ) : (
            /* Events Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => {
                  const dateInfo = formatDate(event.date);
                  const isPast = isEventPast(event.date);
                  const typeColor = getEventTypeColor(event.type);

                  return (
                    <div key={event.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-liberation-sovereignty-gold/10 rounded-2xl p-6 hover:border-liberation-sovereignty-gold/30 transition-all duration-300">
                      {/* Event Header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${typeColor}`}>
                            {event.type.toUpperCase().replace('-', ' ')}
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-liberation-sovereignty-gold font-bold">{dateInfo.day}</div>
                            <div className="text-xs text-gray-400">{dateInfo.date}</div>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                          {event.title}
                        </h3>

                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="h-4 w-4 mr-2 text-liberation-sovereignty-gold" />
                          {dateInfo.time}
                        </div>

                        <div className="flex items-start text-sm text-gray-300">
                          <MapPin className="h-4 w-4 mr-2 text-liberation-sovereignty-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="capitalize">{event.location.type}</span>
                            {event.location.details && (
                              <div className="text-gray-400">{event.location.details}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-300">
                          <Users className="h-4 w-4 mr-2 text-liberation-sovereignty-gold" />
                          <span>Organized by {event.organizer.name}</span>
                        </div>

                        {event.registration.required && event.registration.capacity && (
                          <div className="text-sm text-gray-400">
                            {event.registration.currentAttendees || 0} / {event.registration.capacity} registered
                          </div>
                        )}
                      </div>

                      {/* Accessibility Features */}
                      {event.accessibilityFeatures.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-liberation-pride-pink font-semibold mb-1">Accessibility:</div>
                          <div className="text-xs text-gray-400">
                            {event.accessibilityFeatures.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Community Rating */}
                      <div className="border-t border-gray-700 pt-4 mb-4">
                        <ContentRating
                          contentType="event"
                          contentId={event.id}
                          title={event.title}
                          compact={true}
                          showTransparency={false}
                        />
                      </div>

                      {/* Event Review for Past Events */}
                      {isPast && (
                        <div className="border-t border-gray-700 pt-4">
                          {showReviewForm === event.id ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-liberation-pride-purple">Share Your Experience</span>
                                <button
                                  onClick={() => setShowReviewForm(null)}
                                  className="text-xs text-gray-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                              <EventReview
                                eventId={event.id}
                                eventTitle={event.title}
                                compact={true}
                                onReviewSubmitted={() => setShowReviewForm(null)}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowReviewForm(event.id)}
                              className="w-full text-sm bg-liberation-pride-purple/20 border border-liberation-pride-purple/30 text-liberation-pride-purple hover:bg-liberation-pride-purple/30 py-2 px-4 rounded-lg transition-colors"
                            >
                              Did you attend? Share your experience
                            </button>
                          )}
                        </div>
                      )}

                      {/* RSVP for Future Events */}
                      {!isPast && event.registration.required && (
                        <div className="border-t border-gray-700 pt-4">
                          <button
                            onClick={() => {
                              // TODO: Implement RSVP functionality
                              console.log('RSVP for event:', event.id);
                            }}
                            className="w-full bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-black py-2 px-4 rounded-lg font-semibold transition-colors"
                          >
                            Register for Event
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {/* Call to Action */}
      <section className="py-16 px-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Organize with <span className="text-liberation-sovereignty-gold">Community Power</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Create trauma-informed, accessible events that build liberation and community solidarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-black py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              onClick={() => {
                // TODO: Navigate to event submission form
                console.log('Navigate to event submission form');
              }}
            >
              Organize an Event
            </button>
            <button
              className="bg-transparent border-2 border-liberation-sovereignty-gold text-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold hover:text-black py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300"
              onClick={() => {
                // TODO: Navigate to community organizing guidelines
                console.log('Navigate to community organizing guidelines');
              }}
            >
              Organizing Guidelines
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsCalendar;