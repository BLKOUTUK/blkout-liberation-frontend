// BLKOUT Liberation Moderator Tools - Content Script
// Enhanced page analysis and quick moderation features

class LiberationContentAnalyzer {
  constructor() {
    this.isAnalyzing = false;
    this.quickModeButton = null;
    this.init();
  }

  init() {
    this.injectQuickModeButton();
    this.setupEventListeners();
    this.monitorContentChanges();
  }

  injectQuickModeButton() {
    // Only inject on pages that look like they have moderatable content
    if (!this.isModerableContent()) return;

    // Create floating quick-moderate button
    this.quickModeButton = document.createElement('div');
    this.quickModeButton.id = 'liberation-quick-moderate';
    this.quickModeButton.innerHTML = `
      <div class="liberation-quick-btn" title="Quick Moderate for BLKOUT Liberation Platform">
        <span class="liberation-icon">⚖️</span>
        <span class="liberation-text">MODERATE</span>
      </div>
    `;

    // Position button
    this.quickModeButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      background: linear-gradient(135deg, #FF69B4, #8B008B);
      color: white;
      border-radius: 8px;
      padding: 0;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 0, 139, 0.3);
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      user-select: none;
    `;

    const btn = this.quickModeButton.querySelector('.liberation-quick-btn');
    btn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
    `;

    // Add hover effects
    this.quickModeButton.addEventListener('mouseenter', () => {
      this.quickModeButton.style.transform = 'scale(1.05)';
      this.quickModeButton.style.boxShadow = '0 6px 20px rgba(139, 0, 139, 0.4)';
    });

    this.quickModeButton.addEventListener('mouseleave', () => {
      this.quickModeButton.style.transform = 'scale(1)';
      this.quickModeButton.style.boxShadow = '0 4px 12px rgba(139, 0, 139, 0.3)';
    });

    // Click handler
    this.quickModeButton.addEventListener('click', () => {
      this.openQuickModerator();
    });

    document.body.appendChild(this.quickModeButton);
  }

  isModerableContent() {
    // Check if page has content worth moderating
    const indicators = [
      document.querySelector('article'),
      document.querySelector('.post'),
      document.querySelector('.event'),
      document.querySelector('.news'),
      document.querySelector('[itemtype*="Event"]'),
      document.querySelector('[itemtype*="Article"]'),
      document.querySelector('h1'),
      document.querySelector('.content'),
      document.querySelector('.description')
    ];

    // Check for event-specific indicators
    const eventKeywords = ['event', 'workshop', 'meetup', 'conference', 'gathering', 'march', 'protest'];
    const newsKeywords = ['news', 'article', 'report', 'announcement', 'statement'];
    const bodyText = document.body.textContent.toLowerCase();

    const hasEventContent = eventKeywords.some(keyword => bodyText.includes(keyword));
    const hasNewsContent = newsKeywords.some(keyword => bodyText.includes(keyword));
    const hasStructure = indicators.some(el => el !== null);
    const hasSubstantialContent = document.body.textContent.trim().length > 500;

    return hasStructure && hasSubstantialContent && (hasEventContent || hasNewsContent);
  }

  setupEventListeners() {
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + M for quick moderate
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        this.openQuickModerator();
      }
    });

    // Listen for selection changes to highlight moderatable content
    document.addEventListener('selectionchange', () => {
      this.handleSelectionChange();
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  openQuickModerator() {
    // Send message to open popup
    chrome.runtime.sendMessage({
      type: 'OPEN_QUICK_MODERATOR',
      url: window.location.href,
      title: document.title
    });

    // Visual feedback
    if (this.quickModeButton) {
      this.quickModeButton.style.background = 'linear-gradient(135deg, #10B981, #059669)';
      setTimeout(() => {
        this.quickModeButton.style.background = 'linear-gradient(135deg, #FF69B4, #8B008B)';
      }, 500);
    }
  }

  handleSelectionChange() {
    const selection = window.getSelection();
    if (selection.toString().trim().length > 50) {
      // User selected substantial text - could be useful for moderation
      this.highlightSelection(selection);
    }
  }

  highlightSelection(selection) {
    // Add subtle visual indicator that selected text could be extracted
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Show temporary extraction hint
      this.showExtractionHint(rect);
    }
  }

  showExtractionHint(rect) {
    // Remove existing hint
    const existing = document.getElementById('liberation-extraction-hint');
    if (existing) existing.remove();

    const hint = document.createElement('div');
    hint.id = 'liberation-extraction-hint';
    hint.innerHTML = '✂️ Extract for moderation';
    hint.style.cssText = `
      position: fixed;
      top: ${rect.top - 30}px;
      left: ${rect.left}px;
      background: rgba(139, 0, 139, 0.9);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      z-index: 999998;
      pointer-events: none;
      animation: fadeInOut 2s ease-in-out;
    `;

    document.body.appendChild(hint);

    // Auto-remove after animation
    setTimeout(() => {
      if (hint.parentNode) hint.remove();
    }, 2000);
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'ANALYZE_CONTENT':
        this.performDeepAnalysis().then(analysis => {
          sendResponse({ success: true, analysis });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        break;

      case 'EXTRACT_SELECTION':
        const selection = window.getSelection().toString().trim();
        sendResponse({ success: true, selection });
        break;

      case 'GET_PAGE_METADATA':
        const metadata = this.getEnhancedMetadata();
        sendResponse({ success: true, metadata });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  async performDeepAnalysis() {
    if (this.isAnalyzing) {
      throw new Error('Analysis already in progress');
    }

    this.isAnalyzing = true;

    try {
      const analysis = {
        contentQuality: this.assessContentQuality(),
        moderationSuggestions: this.generateModerationSuggestions(),
        extractedEntities: this.extractNamedEntities(),
        sentimentAnalysis: this.performBasicSentiment(),
        accessibilityCheck: this.checkAccessibility(),
        communityRelevance: this.assessCommunityRelevance()
      };

      return analysis;
    } finally {
      this.isAnalyzing = false;
    }
  }

  assessContentQuality() {
    const quality = {
      score: 0,
      factors: {},
      recommendations: []
    };

    // Check for title
    const hasTitle = document.querySelector('h1, .title, .headline');
    quality.factors.hasTitle = !!hasTitle;
    if (hasTitle) quality.score += 20;
    else quality.recommendations.push('Add clear title/headline');

    // Check for description/summary
    const hasDescription = document.querySelector('[name="description"], .summary, .excerpt');
    quality.factors.hasDescription = !!hasDescription;
    if (hasDescription) quality.score += 15;
    else quality.recommendations.push('Add description or summary');

    // Check for images
    const images = document.querySelectorAll('img');
    const hasQualityImages = Array.from(images).some(img => img.width > 200 && img.height > 200);
    quality.factors.hasImages = hasQualityImages;
    if (hasQualityImages) quality.score += 15;

    // Check for structured content
    const hasStructure = document.querySelector('article, .content, .post, section');
    quality.factors.hasStructure = !!hasStructure;
    if (hasStructure) quality.score += 20;

    // Check content length
    const wordCount = document.body.textContent.trim().split(/\s+/).length;
    quality.factors.wordCount = wordCount;
    if (wordCount > 100) quality.score += 10;
    if (wordCount > 300) quality.score += 10;
    if (wordCount < 50) quality.recommendations.push('Content seems too brief for moderation');

    // Check for contact/location info (important for events)
    const hasContact = /contact|email|phone|\@|\.com/.test(document.body.textContent);
    quality.factors.hasContactInfo = hasContact;
    if (hasContact) quality.score += 10;

    quality.score = Math.min(quality.score, 100);
    return quality;
  }

  generateModerationSuggestions() {
    const suggestions = [];
    const bodyText = document.body.textContent.toLowerCase();

    // Event detection
    const eventKeywords = ['event', 'workshop', 'meetup', 'conference', 'gathering', 'march', 'protest', 'rally'];
    if (eventKeywords.some(keyword => bodyText.includes(keyword))) {
      suggestions.push({
        type: 'event',
        confidence: 0.8,
        message: 'This appears to be event content - consider extracting date, location, and capacity'
      });
    }

    // News detection
    const newsKeywords = ['breaking', 'news', 'report', 'announces', 'statement', 'response'];
    if (newsKeywords.some(keyword => bodyText.includes(keyword))) {
      suggestions.push({
        type: 'news',
        confidence: 0.7,
        message: 'This appears to be news content - focus on key facts and impact'
      });
    }

    // Community relevance
    const communityKeywords = ['community', 'black', 'queer', 'liberation', 'justice', 'mutual aid', 'solidarity'];
    if (communityKeywords.some(keyword => bodyText.includes(keyword))) {
      suggestions.push({
        type: 'community',
        confidence: 0.9,
        message: 'High community relevance detected - prioritize for moderation'
      });
    }

    return suggestions;
  }

  extractNamedEntities() {
    // Basic named entity extraction
    const text = document.body.textContent;
    const entities = {
      dates: [],
      locations: [],
      organizations: [],
      people: []
    };

    // Extract dates
    const datePatterns = [
      /\b\w+\s+\d{1,2},?\s+\d{4}\b/g,
      /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g
    ];

    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.dates.push(...matches.slice(0, 3));
      }
    });

    // Extract potential locations (simplified)
    const locationPattern = /\b[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Center|Centre|Hall|Park|Square)\b/g;
    const locationMatches = text.match(locationPattern);
    if (locationMatches) {
      entities.locations.push(...locationMatches.slice(0, 3));
    }

    return entities;
  }

  performBasicSentiment() {
    const text = document.body.textContent.toLowerCase();

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'celebration', 'joy', 'victory', 'success'];
    const negativeWords = ['bad', 'terrible', 'awful', 'crisis', 'problem', 'issue', 'concern', 'danger', 'threat'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    let sentiment = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    return {
      sentiment,
      confidence: Math.abs(positiveCount - negativeCount) / (positiveCount + negativeCount + 1),
      positiveCount,
      negativeCount
    };
  }

  checkAccessibility() {
    const accessibility = {
      score: 0,
      issues: []
    };

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length === 0 && images.length > 0) {
      accessibility.score += 25;
    } else if (imagesWithoutAlt.length > 0) {
      accessibility.issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    // Check for heading structure
    const hasH1 = document.querySelector('h1');
    if (hasH1) accessibility.score += 25;
    else accessibility.issues.push('Missing main heading (h1)');

    // Check for semantic structure
    const hasSemanticElements = document.querySelector('main, article, section, nav, header, footer');
    if (hasSemanticElements) accessibility.score += 25;

    // Check for skip links or similar
    const hasSkipLink = document.querySelector('a[href*="#"], .skip-link');
    if (hasSkipLink) accessibility.score += 25;

    return accessibility;
  }

  assessCommunityRelevance() {
    const text = document.body.textContent.toLowerCase();
    const relevance = {
      score: 0,
      keywords: [],
      reasons: []
    };

    const liberationKeywords = {
      'black liberation': 30,
      'queer': 25,
      'community': 20,
      'mutual aid': 25,
      'solidarity': 20,
      'justice': 20,
      'organizing': 20,
      'activism': 15,
      'collective': 15,
      'cooperative': 15
    };

    Object.keys(liberationKeywords).forEach(keyword => {
      if (text.includes(keyword)) {
        relevance.score += liberationKeywords[keyword];
        relevance.keywords.push(keyword);
        relevance.reasons.push(`Contains "${keyword}" - high community relevance`);
      }
    });

    relevance.score = Math.min(relevance.score, 100);
    return relevance;
  }

  getEnhancedMetadata() {
    return {
      title: document.title,
      url: window.location.href,
      domain: window.location.hostname,
      language: document.documentElement.lang || 'en',
      wordCount: document.body.textContent.trim().split(/\s+/).length,
      lastModified: document.lastModified,
      charset: document.characterSet,
      viewport: document.querySelector('[name="viewport"]')?.content,
      hasJsonLd: !!document.querySelector('script[type="application/ld+json"]'),
      hasOpenGraph: !!document.querySelector('[property^="og:"]'),
      hasTwitterCard: !!document.querySelector('[name^="twitter:"]')
    };
  }

  monitorContentChanges() {
    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      let significantChange = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node;
              if (element.tagName === 'ARTICLE' ||
                  element.tagName === 'SECTION' ||
                  element.classList?.contains('post') ||
                  element.classList?.contains('event')) {
                significantChange = true;
              }
            }
          });
        }
      });

      if (significantChange && !this.quickModeButton && this.isModerableContent()) {
        this.injectQuickModeButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// CSS for animations and transitions
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  #liberation-quick-moderate:hover {
    transform: scale(1.05) !important;
  }

  #liberation-extraction-hint {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
  }
`;
document.head.appendChild(style);

// Initialize the content analyzer
new LiberationContentAnalyzer();