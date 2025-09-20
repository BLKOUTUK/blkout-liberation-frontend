import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get events
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
      }

      return res.status(200).json({ events: events || [] });

    } else if (req.method === 'POST') {
      // Create event
      const {
        title,
        description,
        date,
        location,
        category,
        status = 'pending', // Default to pending for moderation
        autoApprove = false // Allow direct approval for admin users
      } = req.body;

      if (!title || !description || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const eventData = {
        title,
        description,
        date,
        location: location || '',
        status: autoApprove ? 'approved' : status,
        source: 'API Submission',
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to create event' });
      }

      const createdEvent = data[0];

      // If auto-approved, trigger BLKOUTHUB webhook
      if (autoApprove && createdEvent.status === 'approved') {
        try {
          const response = await fetch(`${req.headers.origin}/api/webhooks/blkouthub`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'approved',
              contentType: 'event',
              contentId: createdEvent.id,
              moderatorId: 'api-auto-approval'
            })
          });

          if (response.ok) {
            console.log('✅ Auto-approved event posted to BLKOUTHUB');
          }
        } catch (webhookError) {
          console.error('BLKOUTHUB webhook failed for auto-approved event:', webhookError);
        }
      }

      return res.status(201).json({
        event: createdEvent,
        message: autoApprove
          ? 'Event created and approved, posted to BLKOUTHUB'
          : 'Event created and submitted for moderation'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}