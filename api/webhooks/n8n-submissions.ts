import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ivorIntegration } from '../../src/services/ivor-integration';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * N8N Webhook Endpoint for Community Submissions
 * Receives content from N8N workflows and adds to moderation queue
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-N8N-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify N8N webhook signature
    const signature = req.headers['x-n8n-signature'] as string;
    if (n8nWebhookSecret && !verifyN8NSignature(req.body, signature, n8nWebhookSecret)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { type, submission } = req.body;

    if (!type || !submission) {
      return res.status(400).json({ error: 'Missing required fields: type, submission' });
    }

    // Process based on submission type
    if (type === 'event') {
      const eventId = await processEventSubmission(submission);
      return res.status(201).json({
        success: true,
        message: 'Event submitted to moderation queue',
        eventId,
        status: 'pending_moderation'
      });
    } else if (type === 'article') {
      const articleId = await processArticleSubmission(submission);
      return res.status(201).json({
        success: true,
        message: 'Article submitted to moderation queue',
        articleId,
        status: 'pending_moderation'
      });
    } else {
      return res.status(400).json({ error: 'Invalid submission type. Must be "event" or "article"' });
    }

  } catch (error) {
    console.error('N8N webhook error:', error);
    return res.status(500).json({
      error: 'Failed to process submission',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Process event submission from N8N
 */
async function processEventSubmission(submission: any): Promise<string> {
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    virtualLink,
    organizer,
    organizerEmail,
    cost = 'Free',
    registrationRequired = false,
    capacity,
    accessibilityFeatures = [],
    mutualAidRequested = false,
    tags = [],
    url,
    source = 'N8N Automation'
  } = submission;

  // Validate required fields
  if (!title || !description || !date || !organizer) {
    throw new Error('Missing required event fields: title, description, date, organizer');
  }

  // Insert into events table with pending status
  const { data, error } = await supabase
    .from('events')
    .insert([{
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      location: typeof location === 'string' ? location : JSON.stringify(location),
      virtual_link: virtualLink,
      organizer,
      cost,
      registration_required: registrationRequired,
      capacity,
      accessibility_features: accessibilityFeatures,
      mutual_aid_requested: mutualAidRequested,
      status: 'pending', // Goes to moderation queue
      source,
      tags,
      url,
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select();

  if (error) {
    console.error('Supabase error creating event:', error);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  console.log('✅ Event submitted to moderation queue via N8N:', title);
  return data[0].id;
}

/**
 * Process article submission from N8N
 */
async function processArticleSubmission(submission: any): Promise<string> {
  const {
    title,
    content,
    excerpt,
    category,
    author,
    authorEmail,
    tags = [],
    sourceUrl,
    communityFunded = false,
    liberationScore,
    priority = 'medium',
    source = 'N8N Automation'
  } = submission;

  // Validate required fields
  if (!title || !content || !author) {
    throw new Error('Missing required article fields: title, content, author');
  }

  // Get or create category
  let categoryId = null;
  if (category) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .limit(1);

    if (categories && categories.length > 0) {
      categoryId = categories[0].id;
    }
  }

  // Get or create author
  let authorId = null;
  if (authorEmail) {
    const { data: authors } = await supabase
      .from('community_members')
      .select('id')
      .eq('email', authorEmail)
      .limit(1);

    if (authors && authors.length > 0) {
      authorId = authors[0].id;
    } else {
      // Create community member record
      const { data: newAuthor } = await supabase
        .from('community_members')
        .insert([{
          email: authorEmail,
          full_name: author,
          role: 'member',
          created_at: new Date().toISOString()
        }])
        .select();

      if (newAuthor && newAuthor.length > 0) {
        authorId = newAuthor[0].id;
      }
    }
  }

  // Insert into newsroom_articles table with review status
  const { data, error } = await supabase
    .from('newsroom_articles')
    .insert([{
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      category_id: categoryId,
      author_id: authorId,
      status: 'review', // Goes to moderation queue
      source_url: sourceUrl,
      community_funded: communityFunded,
      liberation_score: liberationScore,
      priority,
      source,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select();

  if (error) {
    console.error('Supabase error creating article:', error);
    throw new Error(`Failed to create article: ${error.message}`);
  }

  // Handle tags if provided
  if (tags.length > 0 && data && data.length > 0) {
    await processTags(data[0].id, tags);
  }

  console.log('✅ Article submitted to moderation queue via N8N:', title);
  return data[0].id;
}

/**
 * Process and link tags to article
 */
async function processTags(articleId: string, tags: string[]): Promise<void> {
  for (const tagName of tags) {
    try {
      // Get or create tag
      let tagId = null;
      const { data: existingTags } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .limit(1);

      if (existingTags && existingTags.length > 0) {
        tagId = existingTags[0].id;
      } else {
        const { data: newTag } = await supabase
          .from('tags')
          .insert([{ name: tagName }])
          .select();

        if (newTag && newTag.length > 0) {
          tagId = newTag[0].id;
        }
      }

      // Link tag to article
      if (tagId) {
        await supabase
          .from('article_tags')
          .insert([{ article_id: articleId, tag_id: tagId }]);
      }
    } catch (error) {
      console.error(`Failed to process tag ${tagName}:`, error);
    }
  }
}

/**
 * Verify N8N webhook signature
 */
function verifyN8NSignature(payload: any, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}