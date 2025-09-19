import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Shield,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AdminAuth, { checkAdminAuth } from './AdminAuth';
import EventSubmissionForm from '../forms/EventSubmissionForm';
import { LiberationEvent, eventsAPI } from '../../services/events-api';

const AdminEventsInterface: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [events, setEvents] = useState<LiberationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<LiberationEvent | null>(null);

  // Check authentication on load
  useEffect(() => {
    const authStatus = checkAdminAuth();
    setIsAuthenticated(authStatus.isAuthenticated);
    if (authStatus.isAuthenticated) {
      loadEvents();
    }
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await eventsAPI.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setCurrentView('create');
  };

  const handleEditEvent = (event: LiberationEvent) => {
    setSelectedEvent(event);
    setCurrentView('edit');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        // Mock API call - replace with actual endpoint
        console.log('Deleting event:', eventId);
        setEvents(prev => prev.filter(event => event.id !== eventId));
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleEventSubmitSuccess = () => {
    setCurrentView('list');
    loadEvents();
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-green-400 border-green-400';
      case 'happening-now': return 'text-yellow-400 border-yellow-400';
      case 'completed': return 'text-gray-400 border-gray-400';
      case 'cancelled': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mutual-aid': return '🤝';
      case 'organizing': return '✊';
      case 'education': return '📚';
      case 'celebration': return '🎉';
      case 'support': return '💙';
      case 'action': return '⚡';
      default: return '📅';
    }
  };

  if (!isAuthenticated) {
    return showAuth ? (
      <AdminAuth
        onAuthenticated={() => {
          setIsAuthenticated(true);
          setShowAuth(false);
          loadEvents();
        }}
        onCancel={() => setShowAuth(false)}
        requiredAction="Access Events Administration"
      />
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-liberation-sovereignty-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Events Administration</h2>
          <p className="text-gray-400 mb-6">Authentication required to manage community events</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300"
          >
            Authenticate for Events Access
          </button>
        </div>
      </div>
    );
  }

  // Create Event View
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <header className="border-b border-liberation-sovereignty-gold/20 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white">
                  CREATE <span className="text-liberation-sovereignty-gold">EVENT</span>
                </h1>
                <p className="text-gray-400 mt-1">Add new community liberation event</p>
              </div>
              <button
                onClick={() => setCurrentView('list')}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
              >
                Back to Events
              </button>
            </div>
          </div>
        </header>
        <EventSubmissionForm
          onSubmitSuccess={handleEventSubmitSuccess}
          onCancel={() => setCurrentView('list')}
        />
      </div>
    );
  }

  // Main Events List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-liberation-sovereignty-gold/20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">
                EVENTS <span className="text-liberation-sovereignty-gold">ADMINISTRATION</span>
              </h1>
              <p className="text-gray-400 mt-1">Manage community liberation events</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-liberation-sovereignty-gold/20 px-4 py-2 rounded-lg">
                <span className="text-liberation-sovereignty-gold font-bold text-sm">
                  {filteredEvents.length} Events
                </span>
              </div>
              <button
                onClick={handleCreateEvent}
                className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-2 px-4 rounded-lg font-bold transition-all duration-300 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <section className="px-6 py-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    filter === filterOption
                      ? 'bg-liberation-sovereignty-gold text-gray-900'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4 inline mr-1" />
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-liberation-sovereignty-gold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-liberation-sovereignty-gold/30 border-t-liberation-sovereignty-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-liberation-sovereignty-gold font-bold">Loading events...</div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-liberation-sovereignty-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
              <p className="text-gray-400 mb-6">Create your first community liberation event.</p>
              <button
                onClick={handleCreateEvent}
                className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300"
              >
                Create First Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gradient-to-r from-gray-900 to-gray-800 border border-liberation-sovereignty-gold/10 rounded-2xl p-6 hover:border-liberation-sovereignty-gold/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getTypeIcon(event.type)}</span>
                        <span className="bg-liberation-sovereignty-gold/20 text-liberation-sovereignty-gold px-3 py-1 rounded-full text-xs font-bold">
                          {event.type.toUpperCase().replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(event.status)}`}>
                          {event.status.toUpperCase().replace('-', ' ')}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ID: {event.id}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {event.title}
                      </h3>

                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location.type} - {event.location.details.substring(0, 30)}...
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.organizer.name}
                        </div>
                      </div>

                      {event.traumaInformed && (
                        <div className="mt-3 flex items-center text-green-400">
                          <Shield className="h-4 w-4 mr-2" />
                          <span className="text-sm">Trauma-informed practices</span>
                        </div>
                      )}

                      {event.accessibilityFeatures.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {event.accessibilityFeatures.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                          {event.accessibilityFeatures.length > 3 && (
                            <span className="text-blue-300 text-xs px-2 py-1">
                              +{event.accessibilityFeatures.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => console.log('View event details:', event.id)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-300"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all duration-300"
                        title="Edit Event"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all duration-300"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEventsInterface;