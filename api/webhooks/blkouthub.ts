import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const blkouthubApiKey = process.env.BLKOUTHUB_API_KEY;
const heartbeatChatWebhook = process.env.HEARTBEAT_CHAT_WEBHOOK_URL;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * BLKOUTHUB Webhook Endpoint
 * Sends approved content to BLKOUTHUB via Heartbeat.chat
 * Triggered when content is approved in moderation queue
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, contentType, contentId, moderatorId } = req.body;

    if (action !== 'approved') {
      return res.status(200).json({ message: 'Only approved content is sent to BLKOUTHUB' });
    }

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'Missing required fields: contentType, contentId' });
    }

    // Fetch content details based on type
    let content: any = null;
    if (contentType === 'event') {
      content = await fetchEventDetails(contentId);
    } else if (contentType === 'article') {
      content = await fetchArticleDetails(contentId);
    } else {
      return res.status(400).json({ error: 'Invalid content type. Must be "event" or "article"' });
    }

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Send to BLKOUTHUB via Heartbeat.chat
    const heartbeatResult = await sendToHeartbeatChat(content, contentType);

    // Log the publication
    await logPublicationToBlkouthub(contentType, contentId, moderatorId, heartbeatResult);

    return res.status(200).json({
      success: true,
      message: `${contentType} successfully posted to BLKOUTHUB`,
      blkouthubMessageId: heartbeatResult.messageId,
      heartbeatChatUrl: heartbeatResult.chatUrl
    });

  } catch (error) {
    console.error('BLKOUTHUB webhook error:', error);
    return res.status(500).json({
      error: 'Failed to post to BLKOUTHUB',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Fetch event details from Supabase
 */
async function fetchEventDetails(eventId: string): Promise<any> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      community_members!events_organizer_id_fkey(full_name, email)
    `)
    .eq('id', eventId)
    .eq('status', 'approved')
    .single();

  if (error) {
    console.error('Failed to fetch event:', error);
    return null;
  }

  return data;
}

/**
 * Fetch article details from Supabase
 */
async function fetchArticleDetails(articleId: string): Promise<any> {
  const { data, error } = await supabase
    .from('newsroom_articles')
    .select(`
      *,
      categories(name),
      community_members!newsroom_articles_author_id_fkey(full_name, email),
      article_tags(tags(name))
    `)
    .eq('id', articleId)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }

  return data;
}

/**
 * Send content to BLKOUTHUB via Heartbeat.chat
 */
async function sendToHeartbeatChat(content: any, contentType: string): Promise<{ messageId: string; chatUrl: string }> {
  if (!heartbeatChatWebhook) {
    throw new Error('Heartbeat.chat webhook URL not configured');
  }

  const message = formatContentForBlkouthub(content, contentType);

  const response = await fetch(heartbeatChatWebhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${blkouthubApiKey}`,
      'X-Source': 'BLKOUT-Liberation-Platform'
    },
    body: JSON.stringify({
      text: message.text,
      embeds: message.embeds,
      metadata: {
        contentType,
        contentId: content.id,
        source: 'liberation_platform',
        communityApproved: true,
        liberationValues: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Heartbeat.chat API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  return {
    messageId: result.id || 'unknown',
    chatUrl: result.url || 'https://heartbeat.chat/blkouthub'
  };
}

/**
 * Format content for BLKOUTHUB posting
 */
function formatContentForBlkouthub(content: any, contentType: string): { text: string; embeds: any[] } {
  if (contentType === 'event') {
    return formatEventForBlkouthub(content);
  } else if (contentType === 'article') {
    return formatArticleForBlkouthub(content);
  }

  throw new Error('Unsupported content type for BLKOUTHUB formatting');
}

/**
 * Format event for BLKOUTHUB
 */
function formatEventForBlkouthub(event: any): { text: string; embeds: any[] } {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const text = `🌟 **NEW COMMUNITY EVENT** 🌟

**${event.title}**

📅 ${eventDate}
${event.start_time ? `⏰ ${event.start_time}` : ''}
📍 ${event.location || 'Location TBA'}
👤 Organized by: ${event.community_members?.full_name || event.organizer}

${event.description.substring(0, 300)}${event.description.length > 300 ? '...' : ''}

${event.registration_required ? '📝 Registration required' : '🎫 Open participation'}
${event.cost && event.cost !== 'Free' ? `💰 ${event.cost}` : '🆓 Free event'}

#CommunityEvent #Liberation #BLKOUT`;

  const embeds = [{
    title: event.title,
    description: event.description,
    color: 0xFFD700, // Liberation gold
    fields: [
      { name: 'Date', value: eventDate, inline: true },
      { name: 'Location', value: event.location || 'TBA', inline: true },
      { name: 'Cost', value: event.cost || 'Free', inline: true }
    ],
    footer: {
      text: 'Community-approved event • BLKOUT Liberation Platform'
    },
    timestamp: new Date().toISOString()
  }];

  if (event.accessibility_features && event.accessibility_features.length > 0) {
    embeds[0].fields.push({
      name: 'Accessibility',
      value: event.accessibility_features.join(', '),
      inline: false
    });
  }

  return { text, embeds };
}

/**
 * Format article for BLKOUTHUB
 */
function formatArticleForBlkouthub(article: any): { text: string; embeds: any[] } {
  const text = `📰 **NEW LIBERATION ARTICLE** 📰

**${article.title}**

✍️ By: ${article.community_members?.full_name || 'BLKOUT Collective'}
📂 Category: ${article.categories?.name || 'Community'}

${article.excerpt || article.content.substring(0, 300)}${(article.excerpt || article.content).length > 300 ? '...' : ''}

#LiberationNews #CommunityJournalism #BLKOUT`;

  const embeds = [{
    title: article.title,
    description: article.excerpt || article.content.substring(0, 500),
    color: 0x2196F3, // Liberation blue
    fields: [
      { name: 'Author', value: article.community_members?.full_name || 'BLKOUT Collective', inline: true },
      { name: 'Category', value: article.categories?.name || 'Community', inline: true }
    ],
    footer: {
      text: 'Community-approved article • BLKOUT Liberation Platform'
    },
    timestamp: article.published_at || new Date().toISOString()
  }];

  if (article.article_tags && article.article_tags.length > 0) {
    const tags = article.article_tags.map((tag: any) => tag.tags.name).join(', ');
    embeds[0].fields.push({
      name: 'Tags',
      value: tags,
      inline: false
    });
  }

  if (article.liberation_score) {
    embeds[0].fields.push({
      name: 'Liberation Score',
      value: `${article.liberation_score}/10`,
      inline: true
    });
  }

  return { text, embeds };
}

/**
 * Log publication to BLKOUTHUB
 */
async function logPublicationToBlkouthub(
  contentType: string,
  contentId: string,
  moderatorId: string,
  heartbeatResult: { messageId: string; chatUrl: string }
): Promise<void> {
  try {
    await supabase
      .from('publication_log')
      .insert([{
        published_table: 'blkouthub_heartbeat',
        original_id: contentId,
        original_table: contentType === 'event' ? 'events' : 'newsroom_articles',
        approved_by: moderatorId,
        published_at: new Date().toISOString(),
        metadata: {
          platform: 'BLKOUTHUB',
          service: 'Heartbeat.chat',
          messageId: heartbeatResult.messageId,
          chatUrl: heartbeatResult.chatUrl,
          contentType
        }
      }]);

    console.log('✅ BLKOUTHUB publication logged:', contentId);
  } catch (error) {
    console.error('Failed to log BLKOUTHUB publication:', error);
  }
}