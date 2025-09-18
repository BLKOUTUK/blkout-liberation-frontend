// BLKOUT Liberation Moderator Tools - Background Service Worker
// Handles extension lifecycle, storage management, and API coordination

class ModerationBackground {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeStorage();
    this.setupContextMenus();
  }

  setupEventListeners() {
    // Extension installed/updated
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    // Messages from popup or content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Tab updates - monitor for content changes
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.handleTabUpdate(tabId, tab);
      }
    });

    // Storage changes - sync moderation stats
    chrome.storage.onChanged.addListener((changes, areaName) => {
      this.handleStorageChange(changes, areaName);
    });
  }

  async handleInstall(details) {
    console.log('BLKOUT Liberation Moderator Tools installed:', details.reason);

    // Initialize default settings
    const defaultSettings = {
      moderatorStats: {
        submittedToday: 0,
        totalSubmitted: 0,
        approvalRate: 0,
        lastResetDate: new Date().toISOString().slice(0, 10)
      },
      autoExtractionSettings: {
        enableImageExtraction: true,
        enableEventDetection: true,
        enableLocationExtraction: true,
        maxSummaryLength: 200
      },
      apiSettings: {
        endpoint: 'https://blkout-backend-ppl502bwq-robs-projects-54d653d3.vercel.app/api',
        timeout: 10000
      }
    };

    // Set default values if not already present
    const existing = await chrome.storage.local.get(Object.keys(defaultSettings));
    const toSet = {};

    Object.keys(defaultSettings).forEach(key => {
      if (!existing[key]) {
        toSet[key] = defaultSettings[key];
      }
    });

    if (Object.keys(toSet).length > 0) {
      await chrome.storage.local.set(toSet);
    }

    // Generate moderator ID if not exists
    const result = await chrome.storage.local.get(['moderatorId']);
    if (!result.moderatorId) {
      const moderatorId = 'mod_' + Math.random().toString(36).substr(2, 9);
      await chrome.storage.local.set({ moderatorId });
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'EXTRACT_CONTENT':
          const extractedData = await this.enhancedContentExtraction(sender.tab);
          sendResponse({ success: true, data: extractedData });
          break;

        case 'SUBMIT_TO_QUEUE':
          const submissionResult = await this.submitToModerationQueue(message.data);
          sendResponse(submissionResult);
          break;

        case 'GET_MODERATION_STATS':
          const stats = await this.getModerationStats();
          sendResponse({ success: true, stats });
          break;

        case 'SYNC_OFFLINE_SUBMISSIONS':
          const syncResult = await this.syncOfflineSubmissions();
          sendResponse(syncResult);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background message handling error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async enhancedContentExtraction(tab) {
    // Enhanced extraction with additional metadata
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: this.advancedPageAnalysis
    });

    if (results && results[0] && results[0].result) {
      const extractedData = results[0].result;

      // Add tab metadata
      extractedData.metadata = {
        ...extractedData.metadata,
        tabTitle: tab.title,
        tabFavicon: tab.favIconUrl,
        extractedByExtension: true,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      return extractedData;
    }

    throw new Error('Failed to extract content');
  }

  // This function runs in the page context for advanced analysis
  advancedPageAnalysis() {
    const analysis = {
      title: '',
      summary: '',
      url: window.location.href,
      images: [],
      eventData: null,
      content: '',
      metadata: {},
      socialMedia: {},
      structured: {}
    };

    // Enhanced title extraction
    analysis.title =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('[property="og:title"]')?.content ||
      document.querySelector('[name="twitter:title"]')?.content ||
      document.querySelector('title')?.textContent?.trim() ||
      'Untitled Content';

    // Enhanced description extraction
    const descriptions = [
      document.querySelector('[name="description"]')?.content,
      document.querySelector('[property="og:description"]')?.content,
      document.querySelector('[name="twitter:description"]')?.content,
      document.querySelector('.article-summary')?.textContent,
      document.querySelector('.post-excerpt')?.textContent,
      document.querySelector('p')?.textContent
    ].filter(desc => desc && desc.trim().length > 20);

    analysis.summary = descriptions[0]?.trim().substring(0, 300) + '...' || 'No description available';

    // Social media metadata
    analysis.socialMedia = {
      ogImage: document.querySelector('[property="og:image"]')?.content,
      ogType: document.querySelector('[property="og:type"]')?.content,
      twitterCard: document.querySelector('[name="twitter:card"]')?.content,
      twitterSite: document.querySelector('[name="twitter:site"]')?.content
    };

    // Enhanced image extraction
    const imageElements = Array.from(document.querySelectorAll('img'));
    analysis.images = imageElements
      .filter(img => img.src && img.width > 150 && img.height > 150)
      .map(img => ({
        src: img.src,
        alt: img.alt || '',
        width: img.width,
        height: img.height
      }))
      .slice(0, 5);

    // Add social media images
    if (analysis.socialMedia.ogImage) {
      analysis.images.unshift({
        src: analysis.socialMedia.ogImage,
        alt: 'Open Graph Image',
        type: 'og-image'
      });
    }

    // Structured data extraction (JSON-LD)
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'Event') {
          analysis.structured.event = data;
        } else if (data['@type'] === 'Article') {
          analysis.structured.article = data;
        }
      } catch (e) {
        // Ignore invalid JSON-LD
      }
    });

    // Enhanced event detection
    analysis.eventData = this.detectEventData();

    // Content quality scoring
    analysis.metadata.contentScore = this.calculateContentScore();
    analysis.metadata.wordCount = document.body.textContent.trim().split(/\s+/).length;
    analysis.metadata.domain = window.location.hostname;
    analysis.metadata.language = document.documentElement.lang || 'en';

    return analysis;
  }

  detectEventData() {
    const eventData = { date: null, location: '', capacity: null, price: null };

    // Enhanced date detection
    const datePatterns = [
      /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/g,
      /(\w+\s+\d{1,2},?\s+\d{4})/g,
      /(\d{4}-\d{2}-\d{2})/g
    ];

    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/g,
      /(\d{1,2})(\d{2})\s*hrs?/g
    ];

    const bodyText = document.body.textContent;

    // Check structured data first
    const eventScript = document.querySelector('script[type="application/ld+json"]');
    if (eventScript) {
      try {
        const data = JSON.parse(eventScript.textContent);
        if (data['@type'] === 'Event') {
          eventData.date = data.startDate;
          eventData.location = data.location?.name || data.location?.address?.streetAddress;
          return eventData;
        }
      } catch (e) {}
    }

    // Fallback to text analysis
    for (const pattern of datePatterns) {
      const matches = bodyText.match(pattern);
      if (matches) {
        try {
          const date = new Date(matches[0]);
          if (!isNaN(date.getTime()) && date > new Date()) {
            eventData.date = date.toISOString().slice(0, 16);
            break;
          }
        } catch (e) {}
      }
    }

    // Location extraction
    const locationKeywords = ['venue', 'location', 'address', 'where', 'at'];
    const locationRegex = new RegExp(`(${locationKeywords.join('|')})\\s*:?\\s*([^\\n\\r]{1,100})`, 'gi');
    const locationMatch = bodyText.match(locationRegex);
    if (locationMatch) {
      eventData.location = locationMatch[0].split(/[:]/)[1]?.trim().substring(0, 100);
    }

    return eventData;
  }

  calculateContentScore() {
    const factors = {
      hasTitle: document.querySelector('h1') ? 20 : 0,
      hasDescription: document.querySelector('[name="description"]') ? 15 : 0,
      hasImages: document.querySelectorAll('img').length > 0 ? 15 : 0,
      hasSocialMeta: document.querySelector('[property^="og:"]') ? 20 : 0,
      hasStructuredData: document.querySelector('script[type="application/ld+json"]') ? 20 : 0,
      contentLength: Math.min(document.body.textContent.length / 100, 10)
    };

    return Object.values(factors).reduce((sum, score) => sum + score, 0);
  }

  async submitToModerationQueue(data) {
    try {
      const settings = await chrome.storage.local.get(['apiSettings']);
      const apiEndpoint = settings.apiSettings?.endpoint ||
        'https://blkout-backend-ppl502bwq-robs-projects-54d653d3.vercel.app/api';

      const response = await fetch(`${apiEndpoint}/moderation-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          submittedVia: 'moderator-extension',
          version: chrome.runtime.getManifest().version
        })
      });

      if (response.ok) {
        await this.updateStats('submitted');
        return { success: true, message: 'Successfully submitted to moderation queue' };
      } else {
        // Store for offline sync
        await this.storeOfflineSubmission(data);
        return { success: false, message: 'Stored offline for later submission', offline: true };
      }
    } catch (error) {
      console.error('Submission error:', error);
      await this.storeOfflineSubmission(data);
      return { success: false, message: 'Stored offline for later submission', offline: true };
    }
  }

  async storeOfflineSubmission(data) {
    const key = `offline_submission_${Date.now()}`;
    await chrome.storage.local.set({ [key]: data });
  }

  async syncOfflineSubmissions() {
    const allData = await chrome.storage.local.get(null);
    const offlineSubmissions = Object.keys(allData)
      .filter(key => key.startsWith('offline_submission_'))
      .map(key => ({ key, data: allData[key] }));

    let synced = 0;
    for (const submission of offlineSubmissions) {
      const result = await this.submitToModerationQueue(submission.data);
      if (result.success) {
        await chrome.storage.local.remove(submission.key);
        synced++;
      }
    }

    return { success: true, synced, total: offlineSubmissions.length };
  }

  async updateStats(action) {
    const result = await chrome.storage.local.get(['moderatorStats']);
    const stats = result.moderatorStats || { submittedToday: 0, totalSubmitted: 0 };

    const today = new Date().toISOString().slice(0, 10);
    if (stats.lastResetDate !== today) {
      stats.submittedToday = 0;
      stats.lastResetDate = today;
    }

    if (action === 'submitted') {
      stats.submittedToday++;
      stats.totalSubmitted++;
    }

    await chrome.storage.local.set({ moderatorStats: stats });
  }

  async getModerationStats() {
    const result = await chrome.storage.local.get(['moderatorStats']);
    return result.moderatorStats || { submittedToday: 0, totalSubmitted: 0, approvalRate: 0 };
  }

  setupContextMenus() {
    // Add context menu for quick moderation
    chrome.contextMenus.create({
      id: 'moderate-content',
      title: 'Add to Moderation Queue',
      contexts: ['page', 'selection']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'moderate-content') {
        // Open popup for current tab
        chrome.action.openPopup();
      }
    });
  }

  handleTabUpdate(tabId, tab) {
    // Could add logic here to detect content changes
    // or pre-analyze pages for moderation potential
  }

  handleStorageChange(changes, areaName) {
    // Sync stats or settings changes across extension components
    if (changes.moderatorStats) {
      this.broadcastStatsUpdate(changes.moderatorStats.newValue);
    }
  }

  broadcastStatsUpdate(stats) {
    // Notify popup if open
    chrome.runtime.sendMessage({
      type: 'STATS_UPDATED',
      stats: stats
    }).catch(() => {
      // Popup not open, ignore
    });
  }
}

// Initialize background service
new ModerationBackground();