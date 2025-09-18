import React, { useState, useEffect } from 'react';
import { Heart, Calendar, User, ArrowRight, ArrowLeft, BookOpen, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryArchiveItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
  originalUrl?: string; // For blkoutuk.com articles
}

interface StoryDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
}

const StoryArchive: React.FC = () => {
  const [stories, setStories] = useState<StoryArchiveItem[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      try {
        // Fetch real articles from the database via API
        const response = await fetch('/api/story-archive');
        const data = await response.json();

        if (response.ok) {
          setStories(data.articles || []);
        } else {
          console.error('API Error:', data.error);
          setStories([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load story archive:', error);
        setStories([]);
        setLoading(false);
      }
    };

    loadStories();
  }, []);


  const categories = ['all', 'liberation', 'identity', 'community', 'culture', 'politics', 'personal'];
  const allTags = ['all', 'black-joy', 'queer-liberation', 'community-power', 'narrative-sovereignty', 'healing', 'resistance'];

  const filteredStories = stories.filter(story => {
    const categoryMatch = selectedCategory === 'all' || story.category.toLowerCase() === selectedCategory;
    const tagMatch = selectedTag === 'all' || story.tags.includes(selectedTag);
    return categoryMatch && tagMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageStories = filteredStories
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedTag]);

  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;

    setPageLoading(true);
    // Simulate loading delay for page transitions
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentPage(newPage);
    setPageLoading(false);

    // Scroll to top of stories section
    const storiesSection = document.querySelector('#stories-section');
    if (storiesSection) {
      storiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStoryClick = async (storyId: string) => {
    try {
      // TODO: Replace with actual API call to get full story content
      // const response = await fetch(`/api/story-archive/${storyId}`);
      // const storyDetail = await response.json();
      // setSelectedStory(storyDetail);

      // For now, find the story in our list and show full content
      const story = stories.find(s => s.id === storyId);
      if (story) {
        setSelectedStory({
          id: story.id,
          title: story.title,
          content: story.content,
          category: story.category,
          author: story.author,
          publishedAt: story.publishedAt,
          readTime: story.readTime,
          tags: story.tags,
          imageUrl: story.imageUrl
        });
      }
    } catch (error) {
      console.error('Failed to load story details:', error);
    }
  };

  const handleBackToArchive = () => {
    setSelectedStory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-liberation-healing-sage/30 border-t-liberation-healing-sage rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-liberation-healing-sage font-bold">Loading Liberation Stories...</div>
        </div>
      </div>
    );
  }

  // Story Detail View
  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Article Header */}
        <header className="border-b border-liberation-healing-sage/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <button
              onClick={handleBackToArchive}
              className="flex items-center text-gray-400 hover:text-liberation-healing-sage transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Story Archive
            </button>
          </div>
        </header>

        {/* Article Content */}
        <main className="py-12 px-8">
          <div className="max-w-4xl mx-auto">
            <article className="bg-gradient-to-br from-gray-900 to-gray-800 border border-liberation-healing-sage/20 rounded-3xl p-12">
              {/* Article Meta */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="bg-liberation-healing-sage/20 text-liberation-healing-sage px-4 py-2 rounded-full text-sm font-bold">
                    {selectedStory.category.toUpperCase()}
                  </span>
                  <span className="text-gray-500 text-sm">{selectedStory.readTime}</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  {selectedStory.title}
                </h1>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-8">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {selectedStory.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(selectedStory.publishedAt)}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedStory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedStory.tags.map((tag) => (
                      <span key={tag} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Image */}
              {selectedStory.imageUrl && (
                <div className="mb-8">
                  <img
                    src={selectedStory.imageUrl}
                    alt={selectedStory.title}
                    className="w-full h-64 md:h-96 object-cover rounded-2xl"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedStory.content}
                </div>
              </div>
            </article>
          </div>
        </main>
      </div>
    );
  }

  // Archive List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-liberation-healing-sage/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-400 hover:text-liberation-healing-sage transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Platform
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-black text-white mb-2">
                LIBERATION <span className="text-liberation-healing-sage">STORY ARCHIVE</span>
              </h1>
              <p className="text-gray-400">Preserved narratives from blkoutuk.com and community voices</p>
            </div>

            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="py-8 px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-liberation-healing-sage font-bold text-sm mb-3">CATEGORIES</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-liberation-healing-sage text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <h3 className="text-liberation-healing-sage font-bold text-sm mb-3">TAGS</h3>
              <div className="flex flex-wrap gap-3">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                      selectedTag === tag
                        ? 'bg-liberation-healing-sage/20 text-liberation-healing-sage border border-liberation-healing-sage'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <main id="stories-section" className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Pagination Info */}
          {filteredStories.length > 0 && (
            <div className="text-center mb-8">
              <p className="text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredStories.length)} of {filteredStories.length} stories
                {totalPages > 1 && (
                  <span className="text-liberation-healing-sage ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </p>
            </div>
          )}

          {filteredStories.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-liberation-healing-sage/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-liberation-healing-sage" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Loading Liberation Stories</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Connecting to our archive of migrated articles and community narratives.
                If you're seeing this, please check your connection or try refreshing.
              </p>
              <div className="bg-liberation-healing-sage/10 border border-liberation-healing-sage/20 rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-liberation-healing-sage font-bold text-lg mb-4">Story Archive Features</h3>
                <div className="text-gray-300 text-left space-y-2">
                  <div>• Preserved narratives from blkoutuk.com</div>
                  <div>• Community-submitted liberation stories</div>
                  <div>• Full article content within this platform</div>
                  <div>• Searchable by category and tags</div>
                  <div>• Chronological and thematic organization</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Loading Overlay for Page Transitions */}
              {pageLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-liberation-healing-sage/30 border-t-liberation-healing-sage rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-liberation-healing-sage font-bold">Loading Page {currentPage}...</div>
                  </div>
                </div>
              )}

              {/* Stories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPageStories.map((story) => (
                <article
                  key={story.id}
                  onClick={() => handleStoryClick(story.id)}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-liberation-healing-sage/10 rounded-2xl p-6 hover:border-liberation-healing-sage/30 transition-all duration-300 group cursor-pointer"
                >
                  {/* Story Image */}
                  {story.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-liberation-healing-sage/20 text-liberation-healing-sage px-3 py-1 rounded-full font-bold">
                        {story.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{story.readTime}</span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-liberation-healing-sage transition-colors">
                      {story.title}
                    </h2>

                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                      {story.excerpt}
                    </p>

                    {/* Tags */}
                    {story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {story.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs text-gray-500">
                            #{tag}
                          </span>
                        ))}
                        {story.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{story.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {story.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(story.publishedAt)}
                      </div>
                    </div>

                    <div className="flex items-center text-liberation-healing-sage group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </article>
              ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-liberation-healing-sage/20 rounded-2xl p-6">
                    <div className="flex items-center justify-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || pageLoading}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          currentPage === 1 || pageLoading
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-liberation-healing-sage/20 text-liberation-healing-sage hover:bg-liberation-healing-sage hover:text-black'
                        }`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {generatePageNumbers().map((pageNum, index) => (
                          <React.Fragment key={index}>
                            {pageNum === '...' ? (
                              <span className="px-3 py-2 text-gray-500">...</span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(pageNum as number)}
                                disabled={pageLoading}
                                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                                  currentPage === pageNum
                                    ? 'bg-liberation-healing-sage text-black'
                                    : pageLoading
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-800 text-gray-300 hover:bg-liberation-healing-sage/20 hover:text-liberation-healing-sage'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || pageLoading}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          currentPage === totalPages || pageLoading
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-liberation-healing-sage/20 text-liberation-healing-sage hover:bg-liberation-healing-sage hover:text-black'
                        }`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Pagination Info */}
                    <div className="text-center mt-4 text-sm text-gray-500">
                      Jump to page:
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const newPage = parseInt(e.target.value);
                          if (newPage >= 1 && newPage <= totalPages) {
                            handlePageChange(newPage);
                          }
                        }}
                        disabled={pageLoading}
                        className="ml-2 w-16 px-2 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded text-center"
                      />
                      <span className="ml-2">of {totalPages}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Call to Action */}
      <section className="py-16 px-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Share Your <span className="text-liberation-healing-sage">Liberation Story</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Every voice matters in our collective liberation narrative.
          </p>
          <button
            className="bg-liberation-healing-sage hover:bg-liberation-healing-sage/90 text-black py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
            onClick={() => {
              // TODO: Implement story submission form
              console.log('Navigate to story submission form');
            }}
          >
            Share Your Story
          </button>
        </div>
      </section>
    </div>
  );
};

export default StoryArchive;