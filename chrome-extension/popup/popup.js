// BLKOUT Liberation Moderator Tools - Content Scraping & Queue Submission
// Advanced content extraction and moderation queue management

class ModeratorTool {
  constructor() {
    this.extractedData = {};
    this.selectedType = 'event';
    this.apiEndpoint = 'https://blkout-backend-ppl502bwq-robs-projects-54d653d3.vercel.app/api';
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.extractPageContent();
    this.loadModeratorStats();
  }

  bindEvents() {
    // Content type selection
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectContentType(e.target.dataset.type));
    });

    // Action buttons
    document.getElementById('submitToQueue').addEventListener('click', () => this.submitToQueue());
    document.getElementById('saveDraft').addEventListener('click', () => this.saveDraft());
    document.getElementById('markRejected').addEventListener('click', () => this.markRejected());

    // Auto-save on input changes
    document.querySelectorAll('.field-input, .field-textarea').forEach(input => {
      input.addEventListener('input', () => this.autoSave());
    });
  }

  async extractPageContent() {
    try {
      // Get current tab information
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Extract content from the active tab
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.extractContentFromPage
      });

      if (results && results[0] && results[0].result) {
        this.extractedData = results[0].result;
        this.populateExtractedContent();
      }
    } catch (error) {
      console.error('Content extraction failed:', error);
      this.showError('Failed to extract content from page');
    }
  }

  // This function runs in the context of the web page
  extractContentFromPage() {
    const extractedData = {
      title: '',
      summary: '',
      url: window.location.href,
      images: [],
      eventData: {
        date: null,
        location: '',
        capacity: null
      },
      content: '',
      domain: window.location.hostname
    };

    // Extract title - try multiple sources
    extractedData.title =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('[property="og:title"]')?.content ||
      document.querySelector('title')?.textContent?.trim() ||
      'Untitled';

    // Extract description/summary
    const metaDescription = document.querySelector('[name="description"]')?.content ||
                           document.querySelector('[property="og:description"]')?.content;

    if (metaDescription) {
      extractedData.summary = metaDescription.trim();
    } else {
      // Fallback: extract from first paragraph or content
      const firstP = document.querySelector('p');
      if (firstP) {
        extractedData.summary = firstP.textContent.trim().substring(0, 200) + '...';
      }
    }

    // Extract images
    const images = [];
    // OG image first
    const ogImage = document.querySelector('[property="og:image"]')?.content;
    if (ogImage) images.push(ogImage);

    // Other prominent images
    document.querySelectorAll('img').forEach(img => {
      if (img.src && img.width > 200 && img.height > 200) {
        images.push(img.src);
      }
    });
    extractedData.images = images.slice(0, 3); // Limit to 3 images

    // Event-specific extraction
    extractedData.eventData = this.extractEventData();

    // Extract main content for analysis
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.article-content',
      'main',
      '.description'
    ];

    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = document.querySelector(selector);
      if (contentElement) break;
    }

    if (contentElement) {
      extractedData.content = contentElement.textContent.trim().substring(0, 500);
    }

    return extractedData;
  }

  extractEventData() {
    const eventData = { date: null, location: '', capacity: null };

    // Look for date patterns in text
    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})|(\w+\s+\d{1,2},?\s+\d{4})/g;
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/g;

    const bodyText = document.body.textContent;
    const dateMatches = bodyText.match(dateRegex);
    const timeMatches = bodyText.match(timeRegex);

    if (dateMatches && dateMatches.length > 0) {
      // Try to parse the first date found
      try {
        const date = new Date(dateMatches[0]);
        if (!isNaN(date.getTime())) {
          eventData.date = date.toISOString().slice(0, 16); // Format for datetime-local
        }
      } catch (e) {
        console.log('Date parsing failed:', e);
      }
    }

    // Look for location indicators
    const locationKeywords = ['location', 'venue', 'address', 'where', 'at'];
    const locationRegex = new RegExp(`(${locationKeywords.join('|')}):\\s*([^\\n\\r]{1,100})`, 'gi');
    const locationMatch = bodyText.match(locationRegex);
    if (locationMatch) {
      eventData.location = locationMatch[0].split(':')[1]?.trim().substring(0, 100);
    }

    // Look for capacity/attendance numbers
    const capacityRegex = /(\d+)\s*(people|attendees|spots|seats|capacity)/gi;
    const capacityMatch = bodyText.match(capacityRegex);
    if (capacityMatch) {
      const numbers = capacityMatch[0].match(/\d+/);
      if (numbers) {
        eventData.capacity = parseInt(numbers[0]);
      }
    }

    return eventData;
  }

  populateExtractedContent() {
    // Update UI with extracted data
    document.getElementById('extractedTitle').textContent = this.extractedData.title || 'No title found';
    document.getElementById('extractedUrl').textContent = this.extractedData.url;
    document.getElementById('extractedSummary').textContent = this.extractedData.summary || 'No summary available';

    // Populate manual override fields
    document.getElementById('manualTitle').value = this.extractedData.title || '';
    document.getElementById('manualSummary').value = this.extractedData.summary || '';

    // Event-specific fields
    if (this.extractedData.eventData.date) {
      document.getElementById('eventDate').value = this.extractedData.eventData.date;
    }
    document.getElementById('eventLocation').value = this.extractedData.eventData.location || '';
    if (this.extractedData.eventData.capacity) {
      document.getElementById('eventCapacity').value = this.extractedData.eventData.capacity;
    }

    // Handle images
    if (this.extractedData.images && this.extractedData.images.length > 0) {
      const previewImage = document.getElementById('previewImage');
      previewImage.innerHTML = `<img src="${this.extractedData.images[0]}" alt="Preview" style="width: 100%; height: 60px; object-fit: cover; border-radius: 4px;">`;
    }

    // Auto-suggest content type based on content
    this.suggestContentType();
  }

  suggestContentType() {
    const content = this.extractedData.content?.toLowerCase() || '';
    const title = this.extractedData.title?.toLowerCase() || '';
    const combined = content + ' ' + title;

    // Event indicators
    const eventKeywords = ['event', 'workshop', 'meetup', 'conference', 'gathering', 'celebration', 'march', 'protest', 'rally'];
    const newsKeywords = ['breaking', 'news', 'report', 'announces', 'statement', 'response', 'crisis'];
    const storyKeywords = ['story', 'journey', 'experience', 'narrative', 'testimony', 'memoir'];

    let eventScore = 0;
    let newsScore = 0;
    let storyScore = 0;

    eventKeywords.forEach(keyword => {
      if (combined.includes(keyword)) eventScore++;
    });

    newsKeywords.forEach(keyword => {
      if (combined.includes(keyword)) newsScore++;
    });

    storyKeywords.forEach(keyword => {
      if (combined.includes(keyword)) storyScore++;
    });

    // Also check for date indicators for events
    if (this.extractedData.eventData.date || this.extractedData.eventData.location) {
      eventScore += 2;
    }

    // Determine best type
    if (eventScore > newsScore && eventScore > storyScore) {
      this.selectContentType('event');
    } else if (newsScore > storyScore) {
      this.selectContentType('news');
    } else if (storyScore > 0) {
      this.selectContentType('story');
    }
  }

  selectContentType(type) {
    this.selectedType = type;

    // Update UI
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    // Show/hide event-specific fields
    const eventFields = document.getElementById('eventFields');
    if (type === 'event') {
      eventFields.style.display = 'block';
    } else {
      eventFields.style.display = 'none';
    }
  }

  async submitToQueue() {
    const contentData = this.gatherContentData();

    try {
      const response = await fetch(`${this.apiEndpoint}/moderation-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: this.selectedType,
          data: contentData,
          moderatorId: await this.getModeratorId(),
          status: 'pending',
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.showSuccess('Content submitted to moderation queue!');
        this.updateStats('submitted');
      } else {
        // Fallback: store locally if API fails
        this.saveToLocalStorage('submitted', contentData);
        this.showSuccess('Content saved locally (API unavailable)');
      }
    } catch (error) {
      console.error('Submit failed:', error);
      this.saveToLocalStorage('submitted', contentData);
      this.showSuccess('Content saved locally for later submission');
    }
  }

  async saveDraft() {
    const contentData = this.gatherContentData();
    this.saveToLocalStorage('draft', contentData);
    this.showSuccess('Draft saved successfully!');
  }

  async markRejected() {
    const contentData = this.gatherContentData();
    this.saveToLocalStorage('rejected', contentData);
    this.showSuccess('Marked as not suitable');
  }

  gatherContentData() {
    return {
      original: this.extractedData,
      edited: {
        title: document.getElementById('manualTitle').value || this.extractedData.title,
        summary: document.getElementById('manualSummary').value || this.extractedData.summary,
        tags: document.getElementById('manualTags').value.split(',').map(t => t.trim()).filter(t => t),
        eventDate: document.getElementById('eventDate').value,
        eventLocation: document.getElementById('eventLocation').value,
        eventCapacity: document.getElementById('eventCapacity').value
      },
      metadata: {
        url: this.extractedData.url,
        domain: this.extractedData.domain,
        extractedAt: new Date().toISOString(),
        images: this.extractedData.images
      }
    };
  }

  saveToLocalStorage(status, contentData) {
    const key = `moderator_${status}_${Date.now()}`;
    chrome.storage.local.set({ [key]: contentData });
  }

  async getModeratorId() {
    // Get or generate moderator ID
    const result = await chrome.storage.local.get(['moderatorId']);
    if (!result.moderatorId) {
      const moderatorId = 'mod_' + Math.random().toString(36).substr(2, 9);
      await chrome.storage.local.set({ moderatorId });
      return moderatorId;
    }
    return result.moderatorId;
  }

  async loadModeratorStats() {
    try {
      // Load local stats
      const result = await chrome.storage.local.get(['moderatorStats']);
      const stats = result.moderatorStats || { submittedToday: 0, totalSubmitted: 0, approvalRate: 0 };

      document.getElementById('submittedToday').textContent = stats.submittedToday || 0;
      document.getElementById('approvalRate').textContent = stats.approvalRate ? `${stats.approvalRate}%` : '--';

      // Try to get queue size from API
      try {
        const response = await fetch(`${this.apiEndpoint}/moderation-queue/size`);
        if (response.ok) {
          const data = await response.json();
          document.getElementById('queueSize').textContent = data.size || 0;
        }
      } catch (e) {
        document.getElementById('queueSize').textContent = '--';
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  updateStats(action) {
    chrome.storage.local.get(['moderatorStats']).then(result => {
      const stats = result.moderatorStats || { submittedToday: 0, totalSubmitted: 0 };

      if (action === 'submitted') {
        stats.submittedToday = (stats.submittedToday || 0) + 1;
        stats.totalSubmitted = (stats.totalSubmitted || 0) + 1;
      }

      chrome.storage.local.set({ moderatorStats: stats });
      this.loadModeratorStats();
    });
  }

  showSuccess(message) {
    this.showStatus(message, 'success', '✅');
  }

  showError(message) {
    this.showStatus(message, 'error', '❌');
  }

  showStatus(message, type, icon) {
    const statusEl = document.getElementById('statusMessage');
    const statusIcon = statusEl.querySelector('.status-icon');
    const statusText = statusEl.querySelector('.status-text');

    statusIcon.textContent = icon;
    statusText.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';

    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  autoSave() {
    // Auto-save draft every few seconds
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      const contentData = this.gatherContentData();
      this.saveToLocalStorage('autosave', contentData);
    }, 2000);
  }
}

// Initialize the moderator tool when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  new ModeratorTool();
});