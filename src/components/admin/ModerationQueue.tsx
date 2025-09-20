import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Shield,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import AdminAuth, { checkAdminAuth } from './AdminAuth';
import { ivorIntegration } from '../../services/ivor-integration';

interface PendingSubmission {
  id: string;
  type: 'article' | 'event';
  title: string;
  content: string;
  author: string;
  submittedAt: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  flaggedReasons?: string[];
  priority: 'low' | 'medium' | 'high';
}

const ModerationQueue: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'article' | 'event'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);

  // Check authentication on load
  useEffect(() => {
    const authStatus = checkAdminAuth();
    setIsAuthenticated(authStatus.isAuthenticated);
    if (authStatus.isAuthenticated) {
      loadSubmissions();
    }
  }, []);

  // Mock data for demonstration - replace with API calls
  const loadSubmissions = () => {
    setLoading(true);
    // Mock pending submissions
    const mockSubmissions: PendingSubmission[] = [
      {
        id: 'sub-001',
        type: 'article',
        title: 'Community Organizing in South London: Building Black Power',
        content: 'This article explores grassroots organizing strategies that have been effective in building community power in South London...',
        author: 'Amara Johnson',
        submittedAt: '2024-01-15T14:30:00Z',
        category: 'community',
        status: 'pending',
        priority: 'high',
        flaggedReasons: ['requires_cultural_authenticity_review']
      },
      {
        id: 'sub-002',
        type: 'event',
        title: 'Liberation Tech Workshop: Digital Security for Activists',
        content: 'Join us for a hands-on workshop covering digital security, privacy tools, and safe communication methods for community organizers...',
        author: 'Tech Collective',
        submittedAt: '2024-01-15T12:15:00Z',
        category: 'education',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'sub-003',
        type: 'article',
        title: 'Decolonizing Mental Health: Community Healing Practices',
        content: 'An examination of traditional healing practices and community-based mental health support systems...',
        author: 'Dr. Keisha Williams',
        submittedAt: '2024-01-14T16:45:00Z',
        category: 'health',
        status: 'pending',
        priority: 'high'
      }
    ];

    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  };

  const handleApprove = async (submissionId: string, notes: string = '') => {
    try {
      // Find the submission to get its details
      const submission = submissions.find(sub => sub.id === submissionId);
      if (!submission) return;

      console.log(`Approving submission ${submissionId} with notes: ${notes}`);

      // Update local state first
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId
            ? { ...sub, status: 'approved', moderationNotes: notes }
            : sub
        )
      );
      setSelectedSubmission(null);

      // Sync to IVOR knowledge base
      try {
        if (submission.type === 'event') {
          // Convert submission to LiberationEvent format for IVOR
          const eventForIVOR = {
            id: submission.id,
            title: submission.title,
            description: submission.content,
            status: 'upcoming' as 'upcoming' | 'happening-now' | 'completed' | 'cancelled',
            type: 'organizing' as 'mutual-aid' | 'organizing' | 'education' | 'celebration' | 'support' | 'action',
            communityValue: 'healing' as 'education' | 'mutual-aid' | 'organizing' | 'celebration' | 'healing',
            traumaInformed: true,
            accessibilityFeatures: [],
            location: { type: 'hybrid' as 'online' | 'in-person' | 'hybrid', details: 'Community space' },
            organizer: { name: submission.author },
            registration: { required: false, currentAttendees: 0 },
            date: new Date().toISOString(),
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          };
          await ivorIntegration.syncEventToIVOR(eventForIVOR);
        } else if (submission.type === 'article') {
          // Convert submission to NewsArticle format for IVOR
          const articleForIVOR = {
            id: submission.id,
            title: submission.title,
            content: submission.content,
            summary: submission.content.substring(0, 200),
            category: submission.category as any,
            tags: [],
            author: { name: submission.author, id: 'community', role: 'contributor' },
            status: 'published' as 'draft' | 'pending' | 'published' | 'archived',
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            communityValues: ['community-healing'],
            moderationNotes: notes,
            traumaInformed: true,
            accessibilityFeatures: [],
            contentWarnings: [],
            revenueSharing: { creatorShare: 0.75, communityShare: 0.25 }
          };
          await ivorIntegration.syncArticleToIVOR(articleForIVOR);
        }
        console.log('✅ Content synced to IVOR knowledge base');
      } catch (ivorError) {
        console.error('Failed to sync to IVOR:', ivorError);
      }

      // Trigger BLKOUTHUB webhook
      try {
        const response = await fetch('/api/webhooks/blkouthub', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'approved',
            contentType: submission.type,
            contentId: submission.id,
            moderatorId: 'admin' // Should be from auth context
          })
        });

        if (response.ok) {
          console.log('✅ Content posted to BLKOUTHUB via Heartbeat.chat');
        } else {
          console.error('Failed to post to BLKOUTHUB:', await response.text());
        }
      } catch (webhookError) {
        console.error('BLKOUTHUB webhook failed:', webhookError);
      }

    } catch (error) {
      console.error('Failed to approve submission:', error);
    }
  };

  const handleReject = async (submissionId: string, reason: string) => {
    try {
      // Mock API call - replace with actual endpoint
      console.log(`Rejecting submission ${submissionId} with reason: ${reason}`);

      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId
            ? { ...sub, status: 'rejected', moderationNotes: reason }
            : sub
        )
      );
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Failed to reject submission:', error);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'all' ||
                         filter === sub.status ||
                         filter === sub.type;
    const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.author.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  if (!isAuthenticated) {
    return showAuth ? (
      <AdminAuth
        onAuthenticated={() => {
          setIsAuthenticated(true);
          setShowAuth(false);
          loadSubmissions();
        }}
        onCancel={() => setShowAuth(false)}
        requiredAction="Access Moderation Queue"
      />
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-liberation-sovereignty-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Moderation Queue Access</h2>
          <p className="text-gray-400 mb-6">Authentication required to access the content moderation system</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300"
          >
            Authenticate for Moderation Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-liberation-sovereignty-gold/20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">
                MODERATION <span className="text-liberation-sovereignty-gold">QUEUE</span>
              </h1>
              <p className="text-gray-400 mt-1">Human-in-the-loop content approval system</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-liberation-sovereignty-gold/20 px-4 py-2 rounded-lg">
                <span className="text-liberation-sovereignty-gold font-bold text-sm">
                  {filteredSubmissions.filter(s => s.status === 'pending').length} Pending Review
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <section className="px-6 py-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              {['all', 'pending', 'article', 'event'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as any)}
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
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-liberation-sovereignty-gold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Submissions List */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-liberation-sovereignty-gold/30 border-t-liberation-sovereignty-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-liberation-sovereignty-gold font-bold">Loading submissions...</div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-liberation-sovereignty-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No submissions found</h3>
              <p className="text-gray-400">All submissions have been reviewed or no content matches your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-gradient-to-r from-gray-900 to-gray-800 border border-liberation-sovereignty-gold/10 rounded-2xl p-6 hover:border-liberation-sovereignty-gold/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(submission.priority)}`}>
                          {submission.priority.toUpperCase()}
                        </span>
                        <span className="bg-liberation-sovereignty-gold/20 text-liberation-sovereignty-gold px-3 py-1 rounded-full text-xs font-bold">
                          {submission.type.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ID: {submission.id}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {submission.title}
                      </h3>

                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {submission.content}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {submission.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(submission.submittedAt)}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {submission.category}
                        </div>
                      </div>

                      {submission.flaggedReasons && submission.flaggedReasons.length > 0 && (
                        <div className="mt-3 flex items-center text-yellow-400">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span className="text-sm">Flagged for: {submission.flaggedReasons.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-300"
                            title="Review Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(submission.id)}
                            className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-all duration-300"
                            title="Quick Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(submission.id, 'Content does not meet community guidelines')}
                            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all duration-300"
                            title="Quick Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {submission.status === 'approved' && (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span className="font-bold">Approved</span>
                        </div>
                      )}
                      {submission.status === 'rejected' && (
                        <div className="flex items-center text-red-400">
                          <XCircle className="h-5 w-5 mr-1" />
                          <span className="font-bold">Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedSubmission && (
        <ModerationDetailModal
          submission={selectedSubmission}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};

// Detailed moderation modal
interface ModerationDetailModalProps {
  submission: PendingSubmission;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, reason: string) => void;
  onClose: () => void;
}

const ModerationDetailModal: React.FC<ModerationDetailModalProps> = ({
  submission,
  onApprove,
  onReject,
  onClose
}) => {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(submission.id, notes);
    } else if (action === 'reject') {
      onReject(submission.id, notes);
    }
    setNotes('');
    setAction(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-liberation-sovereignty-gold/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Review Submission</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-liberation-sovereignty-gold mb-2">
              {submission.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>By {submission.author}</span>
              <span>•</span>
              <span>{formatDate(submission.submittedAt)}</span>
              <span>•</span>
              <span className="capitalize">{submission.type}</span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-3">Content</h4>
            <div className="bg-gray-800 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
              {submission.content}
            </div>
          </div>

          {submission.flaggedReasons && submission.flaggedReasons.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-yellow-400 mb-3">Flagged Issues</h4>
              <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
                <ul className="text-yellow-300 space-y-1">
                  {submission.flaggedReasons.map((reason, index) => (
                    <li key={index}>• {reason.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-lg font-bold text-white mb-3">Moderation Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your decision..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-liberation-sovereignty-gold focus:outline-none h-32 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setAction('approve');
                handleSubmit();
              }}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve Submission
            </button>
            <button
              onClick={() => {
                setAction('reject');
                handleSubmit();
              }}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default ModerationQueue;