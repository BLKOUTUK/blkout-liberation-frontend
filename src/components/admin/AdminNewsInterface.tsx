import React, { useState, useEffect } from 'react';
import {
  Plus,
  FileText,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import AdminAuth, { checkAdminAuth } from './AdminAuth';
import NewsSubmissionForm from '../forms/NewsSubmissionForm';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'pending' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readTime: string;
  moderationNotes?: string;
}

const AdminNewsInterface: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending' | 'published' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Check authentication on load
  useEffect(() => {
    const authStatus = checkAdminAuth();
    setIsAuthenticated(authStatus.isAuthenticated);
    if (authStatus.isAuthenticated) {
      loadArticles();
    }
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockArticles: NewsArticle[] = [
        {
          id: 'news-001',
          title: 'Community Organizing Victory: Tenant Rights Expansion Approved',
          content: 'After months of grassroots organizing, the city council approved expanded tenant protections...',
          excerpt: 'Grassroots organizing leads to expanded tenant protections in the city.',
          author: 'Community Organizing Committee',
          category: 'organizing',
          tags: ['housing', 'organizing', 'victory'],
          status: 'published',
          publishedAt: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-14T15:30:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          readTime: '5 min read'
        },
        {
          id: 'news-002',
          title: 'Mutual Aid Network Expansion: Supporting 500+ Families',
          content: 'Our community mutual aid network has grown to support over 500 families with food, housing assistance...',
          excerpt: 'Mutual aid network reaches new milestone in community support.',
          author: 'Mutual Aid Collective',
          category: 'mutual-aid',
          tags: ['mutual-aid', 'community', 'support'],
          status: 'pending',
          createdAt: '2024-01-16T09:00:00Z',
          updatedAt: '2024-01-16T09:00:00Z',
          readTime: '3 min read'
        },
        {
          id: 'news-003',
          title: 'Liberation Workshop Series: Digital Security for Activists',
          content: 'Join us for a comprehensive workshop series on digital security, privacy tools, and safe communication...',
          excerpt: 'Learn essential digital security skills for community organizing.',
          author: 'Tech Liberation Squad',
          category: 'education',
          tags: ['education', 'digital-security', 'workshop'],
          status: 'draft',
          createdAt: '2024-01-17T14:20:00Z',
          updatedAt: '2024-01-17T16:45:00Z',
          readTime: '7 min read'
        }
      ];
      setArticles(mockArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = () => {
    setCurrentView('create');
  };

  const handleEditArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setCurrentView('edit');
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        // Mock API call - replace with actual endpoint
        console.log('Deleting article:', articleId);
        setArticles(prev => prev.filter(article => article.id !== articleId));
      } catch (error) {
        console.error('Failed to delete article:', error);
      }
    }
  };

  const handlePublishArticle = async (articleId: string) => {
    try {
      // Mock API call - replace with actual endpoint
      console.log('Publishing article:', articleId);
      setArticles(prev =>
        prev.map(article =>
          article.id === articleId
            ? {
                ...article,
                status: 'published' as const,
                publishedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : article
        )
      );
    } catch (error) {
      console.error('Failed to publish article:', error);
    }
  };

  const handleArchiveArticle = async (articleId: string) => {
    try {
      // Mock API call - replace with actual endpoint
      console.log('Archiving article:', articleId);
      setArticles(prev =>
        prev.map(article =>
          article.id === articleId
            ? { ...article, status: 'archived' as const, updatedAt: new Date().toISOString() }
            : article
        )
      );
    } catch (error) {
      console.error('Failed to archive article:', error);
    }
  };

  const handleArticleSubmitSuccess = () => {
    setCurrentView('list');
    loadArticles();
  };

  const filteredArticles = articles.filter(article => {
    const matchesFilter = filter === 'all' || article.status === filter;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
      case 'published': return 'text-green-400 border-green-400';
      case 'pending': return 'text-yellow-400 border-yellow-400';
      case 'draft': return 'text-blue-400 border-blue-400';
      case 'archived': return 'text-gray-400 border-gray-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organizing': return '✊';
      case 'mutual-aid': return '🤝';
      case 'education': return '📚';
      case 'celebration': return '🎉';
      case 'health': return '💙';
      case 'politics': return '🗳️';
      case 'culture': return '🎭';
      case 'economics': return '💰';
      default: return '📰';
    }
  };

  const getStatusActions = (article: NewsArticle) => {
    switch (article.status) {
      case 'draft':
        return (
          <button
            onClick={() => handlePublishArticle(article.id)}
            className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-all duration-300"
            title="Publish Article"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        );
      case 'pending':
        return (
          <>
            <button
              onClick={() => handlePublishArticle(article.id)}
              className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-all duration-300"
              title="Approve & Publish"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleArchiveArticle(article.id)}
              className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all duration-300"
              title="Reject Article"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </>
        );
      case 'published':
        return (
          <button
            onClick={() => handleArchiveArticle(article.id)}
            className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition-all duration-300"
            title="Archive Article"
          >
            <XCircle className="h-4 w-4" />
          </button>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return showAuth ? (
      <AdminAuth
        onAuthenticated={() => {
          setIsAuthenticated(true);
          setShowAuth(false);
          loadArticles();
        }}
        onCancel={() => setShowAuth(false)}
        requiredAction="Access News Administration"
      />
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-liberation-sovereignty-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">News Administration</h2>
          <p className="text-gray-400 mb-6">Authentication required to manage newsroom content</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300"
          >
            Authenticate for News Access
          </button>
        </div>
      </div>
    );
  }

  // Create Article View
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <header className="border-b border-liberation-sovereignty-gold/20 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white">
                  CREATE <span className="text-liberation-sovereignty-gold">ARTICLE</span>
                </h1>
                <p className="text-gray-400 mt-1">Add new liberation journalism piece</p>
              </div>
              <button
                onClick={() => setCurrentView('list')}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
              >
                Back to Articles
              </button>
            </div>
          </div>
        </header>
        <NewsSubmissionForm
          onSubmitSuccess={handleArticleSubmitSuccess}
          onCancel={() => setCurrentView('list')}
        />
      </div>
    );
  }

  // Main Articles List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-liberation-sovereignty-gold/20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">
                NEWS <span className="text-liberation-sovereignty-gold">ADMINISTRATION</span>
              </h1>
              <p className="text-gray-400 mt-1">Manage liberation newsroom content</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-liberation-sovereignty-gold/20 px-4 py-2 rounded-lg">
                <span className="text-liberation-sovereignty-gold font-bold text-sm">
                  {filteredArticles.length} Articles
                </span>
              </div>
              <button
                onClick={handleCreateArticle}
                className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-2 px-4 rounded-lg font-bold transition-all duration-300 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Article
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
              {(['all', 'draft', 'pending', 'published', 'archived'] as const).map((filterOption) => (
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
                  {filterOption === 'pending' && (
                    <span className="ml-1 bg-yellow-500 text-gray-900 px-1 rounded-full text-xs">
                      {articles.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-liberation-sovereignty-gold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-liberation-sovereignty-gold/30 border-t-liberation-sovereignty-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-liberation-sovereignty-gold font-bold">Loading articles...</div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-liberation-sovereignty-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-gray-400 mb-6">Create your first liberation journalism piece.</p>
              <button
                onClick={handleCreateArticle}
                className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300"
              >
                Create First Article
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-gradient-to-r from-gray-900 to-gray-800 border border-liberation-sovereignty-gold/10 rounded-2xl p-6 hover:border-liberation-sovereignty-gold/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getCategoryIcon(article.category)}</span>
                        <span className="bg-liberation-sovereignty-gold/20 text-liberation-sovereignty-gold px-3 py-1 rounded-full text-xs font-bold">
                          {article.category.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(article.status)}`}>
                          {article.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ID: {article.id}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {article.title}
                      </h3>

                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {article.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {article.readTime}
                        </div>
                      </div>

                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs flex items-center"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 4 && (
                            <span className="text-blue-300 text-xs px-2 py-1">
                              +{article.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {article.moderationNotes && (
                        <div className="mt-3 bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-2">
                          <div className="flex items-center text-yellow-400 text-sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="font-bold">Moderation Notes:</span>
                          </div>
                          <p className="text-yellow-300 text-sm mt-1">{article.moderationNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => console.log('View article details:', article.id)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-300"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all duration-300"
                        title="Edit Article"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {getStatusActions(article)}
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all duration-300"
                        title="Delete Article"
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

export default AdminNewsInterface;