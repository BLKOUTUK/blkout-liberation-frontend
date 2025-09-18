import React, { useState, useEffect } from 'react';
import { Vote, Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  excerpt: string;
  readTime: string;
}

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // TODO: Replace with actual API call when backend is ready
    // For now, return empty array to show empty state
    const loadArticles = async () => {
      setLoading(true);
      try {
        // Mock API call - replace with actual endpoint
        // const response = await fetch('/api/articles');
        // const data = await response.json();

        // Return empty for now until real articles are added
        setArticles([]);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load articles:', error);
        setArticles([]);
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const categories = ['all', 'liberation', 'community', 'politics', 'culture', 'economics'];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category.toLowerCase() === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-liberation-sovereignty-gold/30 border-t-liberation-sovereignty-gold rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-liberation-sovereignty-gold font-bold">Loading Liberation News...</div>
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
                LIBERATION <span className="text-liberation-sovereignty-gold">NEWSROOM</span>
              </h1>
              <p className="text-gray-400">Community-controlled journalism and narrative sovereignty</p>
            </div>

            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <section className="py-8 px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-liberation-sovereignty-gold text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {filteredArticles.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-liberation-sovereignty-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Vote className="h-12 w-12 text-liberation-sovereignty-gold" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">No Articles Yet</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                The liberation newsroom is ready for community voices.
                Be the first to control the narrative and share liberation journalism.
              </p>
              <div className="bg-liberation-sovereignty-gold/10 border border-liberation-sovereignty-gold/20 rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-liberation-sovereignty-gold font-bold text-lg mb-4">Community Journalism Principles</h3>
                <div className="text-gray-300 text-left space-y-2">
                  <div>• Narrative sovereignty and community control</div>
                  <div>• Liberation-focused perspectives and analysis</div>
                  <div>• Democratic editorial process and transparency</div>
                  <div>• Trauma-informed reporting and community protection</div>
                </div>
              </div>
            </div>
          ) : (
            /* Articles Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                .map((article) => (
                <article key={article.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-liberation-sovereignty-gold/10 rounded-2xl p-6 hover:border-liberation-sovereignty-gold/30 transition-all duration-300 group cursor-pointer">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-liberation-sovereignty-gold/20 text-liberation-sovereignty-gold px-3 py-1 rounded-full font-bold">
                        {article.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{article.readTime}</span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-liberation-sovereignty-gold transition-colors">
                      {article.title}
                    </h2>

                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                    </div>

                    <div className="flex items-center text-liberation-sovereignty-gold group-hover:translate-x-1 transition-transform">
                      Read More <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Call to Action */}
      <section className="py-16 px-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the <span className="text-liberation-sovereignty-gold">Liberation Newsroom</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Community journalism with 75% creator sovereignty and democratic editorial control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-black py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              onClick={() => {
                // TODO: Implement admin auth for article creation
                console.log('Navigate to article creation form');
              }}
            >
              Write Your First Article
            </button>
            <button
              className="bg-transparent border-2 border-liberation-sovereignty-gold text-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold hover:text-black py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300"
              onClick={() => {
                // TODO: Implement community guidelines page
                console.log('Navigate to community journalism guidelines');
              }}
            >
              Community Guidelines
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;