// BLKOUT Liberation Platform - IVOR Knowledge Base Integration
// Data persistence layer for moderation content to inform IVOR responses
// Connects to existing Supabase IVOR tables: ivor_resources, ivor_categories, ivor_tags

import type { LiberationEvent } from './events-api';

export interface IVORResource {
  id?: string;
  title: string;
  description: string;
  content: string;
  website_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  category_id?: string;
  keywords: string[];
  location?: string;
  is_active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface IVORCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface IVORTag {
  id?: string;
  name: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: 'liberation' | 'community' | 'organizing' | 'culture' | 'health' | 'education';
  tags: string[];
  author: {
    name: string;
    id: string;
    role: string;
  };
  status: 'draft' | 'pending' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  communityValues: string[];
  moderationNotes?: string;
  traumaInformed: boolean;
  accessibilityFeatures: string[];
  contentWarnings: string[];
  revenueSharing: {
    creatorShare: number; // Must be >= 0.75 for liberation values
    communityShare: number;
  };
}

/**
 * IVOR Integration Service
 * Syncs approved moderation content to IVOR's knowledge base via Supabase
 * Ensures IVOR has real-time access to community events and news
 */
class IVORIntegrationService {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  /**
   * Get IVOR category ID for content type
   */
  private async getOrCreateCategory(type: 'event' | 'article'): Promise<string> {
    const categoryName = type === 'event' ? 'Community Events' : 'Community News';
    const categoryIcon = type === 'event' ? '📅' : '📰';
    const categoryColor = type === 'event' ? '#FFC107' : '#2196F3';

    try {
      // Check if category exists
      const response = await fetch(`${this.supabaseUrl}/rest/v1/ivor_categories?name=eq.${encodeURIComponent(categoryName)}`, {
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const categories = await response.json();

      if (categories.length > 0) {
        return categories[0].id;
      }

      // Create new category
      const createResponse = await fetch(`${this.supabaseUrl}/rest/v1/ivor_categories`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: categoryName,
          description: `Community-submitted ${type}s approved through democratic moderation`,
          icon: categoryIcon,
          color: categoryColor
        })
      });

      const newCategory = await createResponse.json();
      return newCategory[0].id;
    } catch (error) {
      console.error('Failed to get/create IVOR category:', error);
      throw error;
    }
  }

  /**
   * Create or update tags for content
   */
  private async syncTags(keywords: string[]): Promise<string[]> {
    const tagIds: string[] = [];

    for (const keyword of keywords) {
      try {
        // Check if tag exists
        const response = await fetch(`${this.supabaseUrl}/rest/v1/ivor_tags?name=eq.${encodeURIComponent(keyword)}`, {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        const tags = await response.json();

        if (tags.length > 0) {
          tagIds.push(tags[0].id);
        } else {
          // Create new tag
          const createResponse = await fetch(`${this.supabaseUrl}/rest/v1/ivor_tags`, {
            method: 'POST',
            headers: {
              'apikey': this.supabaseAnonKey,
              'Authorization': `Bearer ${this.supabaseAnonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ name: keyword })
          });

          const newTag = await createResponse.json();
          if (newTag[0]) {
            tagIds.push(newTag[0].id);
          }
        }
      } catch (error) {
        console.error(`Failed to sync tag ${keyword}:`, error);
      }
    }

    return tagIds;
  }

  /**
   * Sync approved event to IVOR knowledge base
   */
  async syncEventToIVOR(event: LiberationEvent): Promise<void> {
    if (event.status !== 'approved' && event.status !== 'upcoming') {
      console.log('Event not in approved status, skipping IVOR sync:', event.id);
      return;
    }

    try {
      const categoryId = await this.getOrCreateCategory('event');
      const keywords = this.extractEventKeywords(event);
      const tagIds = await this.syncTags(keywords);

      const ivorResource: IVORResource = {
        title: event.title,
        description: event.description.substring(0, 500), // Limit description length
        content: this.formatEventForIVOR(event),
        website_url: event.url || undefined,
        location: `${event.location.type}: ${event.location.details}`,
        category_id: categoryId,
        keywords: keywords,
        is_active: true,
        priority: this.calculateEventPriority(event)
      };

      // Create IVOR resource
      const response = await fetch(`${this.supabaseUrl}/rest/v1/ivor_resources`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(ivorResource)
      });

      if (!response.ok) {
        throw new Error(`Failed to create IVOR resource: ${response.statusText}`);
      }

      const createdResource = await response.json();
      const resourceId = createdResource[0].id;

      // Link tags to resource
      await this.linkTagsToResource(resourceId, tagIds);

      console.log('✅ Event synced to IVOR knowledge base:', event.id, '-> IVOR:', resourceId);
    } catch (error) {
      console.error('Failed to sync event to IVOR:', error);
      throw error;
    }
  }

  /**
   * Get community insights for IVOR recommendations
   */
  async getCommunityInsights(): Promise<any> {
    try {
      const { data: insights, error } = await this.supabase
        .from('content_analytics')
        .select(`
          content_type,
          content_id,
          total_ratings,
          average_rating,
          recommendation_count,
          total_views
        `)
        .order('recommendation_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to fetch community insights:', error);
        return { trending: [], popular: [], error: error.message };
      }

      // Separate by content type and get details
      const articles = insights.filter(item => item.content_type === 'article');
      const events = insights.filter(item => item.content_type === 'event');

      // Get content details for top items
      const enrichedArticles = await Promise.all(
        articles.slice(0, 10).map(async (item) => {
          const { data: article } = await this.supabase
            .from('newsroom_articles')
            .select('title, excerpt, published_at, category_id, categories(name)')
            .eq('id', item.content_id)
            .single();

          return {
            ...item,
            title: article?.title,
            excerpt: article?.excerpt,
            category: article?.categories?.name,
            published_at: article?.published_at
          };
        })
      );

      const enrichedEvents = await Promise.all(
        events.slice(0, 10).map(async (item) => {
          const { data: event } = await this.supabase
            .from('events')
            .select('title, description, date, location, status')
            .eq('id', item.content_id)
            .single();

          return {
            ...item,
            title: event?.title,
            description: event?.description,
            event_date: event?.date,
            location: event?.location,
            status: event?.status
          };
        })
      );

      return {
        trending_articles: enrichedArticles.filter(item => item.title),
        trending_events: enrichedEvents.filter(item => item.title),
        community_preferences: {
          most_engaged_content_type: articles.length > events.length ? 'articles' : 'events',
          average_rating_threshold: 4.0,
          high_engagement_threshold: 10
        },
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting community insights:', error);
      return { trending: [], popular: [], error: 'Failed to fetch insights' };
    }
  }

  /**
   * Get personalized recommendations based on community data
   */
  async getPersonalizedRecommendations(userPreferences: any = {}): Promise<any> {
    try {
      // Get highly-rated content that matches user interests
      const { data: recommendations, error } = await this.supabase
        .from('content_analytics')
        .select(`
          content_type,
          content_id,
          average_rating,
          recommendation_count
        `)
        .gte('average_rating', 4.0)
        .gte('recommendation_count', 5)
        .order('recommendation_count', { ascending: false })
        .limit(15);

      if (error) throw error;

      // Filter and enrich based on user preferences
      const filteredRecommendations = await Promise.all(
        recommendations.map(async (item) => {
          if (item.content_type === 'article') {
            const { data: article } = await this.supabase
              .from('newsroom_articles')
              .select('title, excerpt, category_id, categories(name), liberation_score')
              .eq('id', item.content_id)
              .single();

            return {
              type: 'article',
              id: item.content_id,
              title: article?.title,
              excerpt: article?.excerpt,
              category: article?.categories?.name,
              liberation_score: article?.liberation_score,
              community_rating: item.average_rating,
              recommendation_count: item.recommendation_count,
              recommendation_reason: this.generateRecommendationReason(item, article)
            };
          } else if (item.content_type === 'event') {
            const { data: event } = await this.supabase
              .from('events')
              .select('title, description, date, location, status')
              .eq('id', item.content_id)
              .single();

            return {
              type: 'event',
              id: item.content_id,
              title: event?.title,
              description: event?.description,
              date: event?.date,
              location: event?.location,
              status: event?.status,
              community_rating: item.average_rating,
              recommendation_count: item.recommendation_count,
              recommendation_reason: this.generateRecommendationReason(item, event)
            };
          }
          return null;
        })
      );

      return {
        recommendations: filteredRecommendations.filter(item => item && item.title),
        personalization_factors: userPreferences,
        community_driven: true,
        explanation: "These recommendations are based on what our community has found most valuable and relevant."
      };

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return { recommendations: [], error: 'Failed to generate recommendations' };
    }
  }

  /**
   * Generate explanation for why content is recommended
   */
  private generateRecommendationReason(analyticsData: any, contentData: any): string {
    const reasons = [];

    if (analyticsData.average_rating >= 4.5) {
      reasons.push("highly rated by community");
    }
    
    if (analyticsData.recommendation_count >= 10) {
      reasons.push("frequently recommended");
    }

    if (contentData.liberation_score >= 8) {
      reasons.push("strong liberation values alignment");
    }

    if (contentData.category === 'Community Healing' || contentData.category === 'Mutual Aid') {
      reasons.push("supports community wellbeing");
    }

    return reasons.length > 0 
      ? `Recommended because it's ${reasons.join(', ')}.`
      : "Recommended by community members.";
  }

  /**
   * Sync approved article to IVOR knowledge base
   */
  async syncArticleToIVOR(article: NewsArticle): Promise<void> {
    if (article.status !== 'published') {
      console.log('Article not published, skipping IVOR sync:', article.id);
      return;
    }

    try {
      const categoryId = await this.getOrCreateCategory('article');
      const keywords = this.extractArticleKeywords(article);
      const tagIds = await this.syncTags(keywords);

      const ivorResource: IVORResource = {
        title: article.title,
        description: article.summary || article.content.substring(0, 500),
        content: this.formatArticleForIVOR(article),
        website_url: undefined, // Articles are internal content
        location: 'BLKOUT Liberation Platform',
        category_id: categoryId,
        keywords: keywords,
        is_active: true,
        priority: this.calculateArticlePriority(article)
      };

      // Create IVOR resource
      const response = await fetch(`${this.supabaseUrl}/rest/v1/ivor_resources`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(ivorResource)
      });

      if (!response.ok) {
        throw new Error(`Failed to create IVOR resource: ${response.statusText}`);
      }

      const createdResource = await response.json();
      const resourceId = createdResource[0].id;

      // Link tags to resource
      await this.linkTagsToResource(resourceId, tagIds);

      console.log('✅ Article synced to IVOR knowledge base:', article.id, '-> IVOR:', resourceId);
    } catch (error) {
      console.error('Failed to sync article to IVOR:', error);
      throw error;
    }
  }

  /**
   * Link tags to resource in junction table
   */
  private async linkTagsToResource(resourceId: string, tagIds: string[]): Promise<void> {
    const linkPromises = tagIds.map(tagId =>
      fetch(`${this.supabaseUrl}/rest/v1/ivor_resource_tags`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resource_id: resourceId, tag_id: tagId })
      })
    );

    await Promise.allSettled(linkPromises);
  }

  /**
   * Remove content from IVOR knowledge base (when archived/deleted)
   */
  async removeFromIVOR(contentTitle: string): Promise<void> {
    try {
      // Find resource by title
      const response = await fetch(`${this.supabaseUrl}/rest/v1/ivor_resources?title=eq.${encodeURIComponent(contentTitle)}`, {
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const resources = await response.json();

      if (resources.length === 0) {
        console.log('No IVOR resource found with title:', contentTitle);
        return;
      }

      const resourceId = resources[0].id;

      // Delete resource (cascading delete should handle tags)
      const deleteResponse = await fetch(`${this.supabaseUrl}/rest/v1/ivor_resources?id=eq.${resourceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to remove from IVOR: ${deleteResponse.statusText}`);
      }

      console.log('🗑️ Content removed from IVOR knowledge base:', contentTitle);
    } catch (error) {
      console.error('Failed to remove content from IVOR:', error);
      throw error;
    }
  }

  /**
   * Update IVOR with content engagement metrics
   */
  async updateIVOREngagement(contentId: string, engagement: Partial<IVORKnowledgeEntry['engagement']>): Promise<void> {
    try {
      const response = await fetch(`${this.ivorEndpoint}/${contentId}/engagement`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Liberation-Layer': 'moderation-sync',
          'Authorization': `Bearer ${process.env.IVOR_API_KEY}`
        },
        body: JSON.stringify(engagement)
      });

      if (!response.ok) {
        throw new Error(`Failed to update IVOR engagement: ${response.statusText}`);
      }

      console.log('📊 IVOR engagement updated:', contentId);
    } catch (error) {
      console.error('Failed to update IVOR engagement:', error);
      throw error;
    }
  }

  /**
   * Bulk sync all approved content to IVOR
   */
  async bulkSyncToIVOR(events: LiberationEvent[], articles: NewsArticle[]): Promise<void> {
    console.log('🔄 Starting bulk sync to IVOR knowledge base...');

    const syncPromises: Promise<void>[] = [];

    // Sync approved events
    events
      .filter(event => event.status === 'approved' || event.status === 'upcoming')
      .forEach(event => {
        syncPromises.push(this.syncEventToIVOR(event));
      });

    // Sync published articles
    articles
      .filter(article => article.status === 'published')
      .forEach(article => {
        syncPromises.push(this.syncArticleToIVOR(article));
      });

    await Promise.allSettled(syncPromises);
    console.log('✅ Bulk sync to IVOR completed');
  }

  /**
   * Calculate event priority for IVOR
   */
  private calculateEventPriority(event: LiberationEvent): number {
    let priority = 0;

    // High priority for organizing and action events
    if (event.type === 'organizing' || event.type === 'action') priority += 3;

    // Medium priority for mutual aid and education
    if (event.type === 'mutual-aid' || event.type === 'education') priority += 2;

    // Boost for community values
    if (event.communityValues.includes('collective-action')) priority += 2;
    if (event.communityValues.includes('community-healing')) priority += 1;

    // Trauma-informed events get slight boost
    if (event.traumaInformed) priority += 1;

    return Math.min(priority, 10); // Cap at 10
  }

  /**
   * Calculate article priority for IVOR
   */
  private calculateArticlePriority(article: NewsArticle): number {
    let priority = 0;

    // High priority for liberation and organizing content
    if (article.category === 'liberation' || article.category === 'organizing') priority += 3;

    // Medium priority for community and health content
    if (article.category === 'community' || article.category === 'health') priority += 2;

    // Boost for liberation values
    if (article.communityValues.includes('collective-action')) priority += 2;
    if (article.communityValues.includes('community-healing')) priority += 1;

    // High creator share gets boost (sovereignty value)
    if (article.revenueSharing.creatorShare >= 0.75) priority += 1;

    return Math.min(priority, 10); // Cap at 10
  }

  private formatEventForIVOR(event: LiberationEvent): string {
    return `
Event: ${event.title}
Type: ${event.type}
Date: ${new Date(event.date).toLocaleDateString()}
Location: ${event.location.type} - ${event.location.details}
Organizer: ${event.organizer.name}

Description:
${event.description}

Community Values: ${event.communityValues.join(', ')}
${event.traumaInformed ? 'This event follows trauma-informed practices.' : ''}
${event.accessibilityFeatures.length > 0 ? `Accessibility: ${event.accessibilityFeatures.join(', ')}` : ''}

Registration: ${event.registration.required ? `Required (${event.registration.type})` : 'Open participation'}
Expected Attendees: ${event.expectedAttendees || 'No limit specified'}
    `.trim();
  }

  private formatArticleForIVOR(article: NewsArticle): string {
    return `
Article: ${article.title}
Category: ${article.category}
Author: ${article.author.name} (${article.author.role})
Published: ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Draft'}

Summary:
${article.summary}

Content:
${article.content}

Tags: ${article.tags.join(', ')}
Community Values: ${article.communityValues.join(', ')}
${article.traumaInformed ? 'This content follows trauma-informed practices.' : ''}
${article.accessibilityFeatures.length > 0 ? `Accessibility: ${article.accessibilityFeatures.join(', ')}` : ''}

Creator Share: ${(article.revenueSharing.creatorShare * 100).toFixed(1)}%
    `.trim();
  }

  private extractEventKeywords(event: LiberationEvent): string[] {
    const keywords = new Set<string>();

    // Add event type and community values
    keywords.add(event.type);
    event.communityValues.forEach(value => keywords.add(value));

    // Extract keywords from title and description
    const text = `${event.title} ${event.description}`.toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];

    text.split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .forEach(word => keywords.add(word));

    // Add location type
    keywords.add(event.location.type);

    return Array.from(keywords).slice(0, 20); // Limit to 20 keywords
  }

  private extractArticleKeywords(article: NewsArticle): string[] {
    const keywords = new Set<string>();

    // Add category and tags
    keywords.add(article.category);
    article.tags.forEach(tag => keywords.add(tag));
    article.communityValues.forEach(value => keywords.add(value));

    // Extract keywords from title and summary
    const text = `${article.title} ${article.summary}`.toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];

    text.split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .forEach(word => keywords.add(word));

    return Array.from(keywords).slice(0, 20);
  }

  private calculateEventEngagement(event: LiberationEvent): 'low' | 'medium' | 'high' {
    const attendees = event.expectedAttendees || 0;
    const isHighImpact = event.communityValues.includes('collective-action') ||
                        event.communityValues.includes('community-healing') ||
                        event.type === 'organizing' ||
                        event.type === 'action';

    if (attendees > 100 || isHighImpact) return 'high';
    if (attendees > 25) return 'medium';
    return 'low';
  }
}

// Export singleton instance
export const ivorIntegration = new IVORIntegrationService();

// Export types for use in other components
export type { IVORKnowledgeEntry, NewsArticle };