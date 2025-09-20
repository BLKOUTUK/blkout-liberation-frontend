import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ivorIntegration } from '../src/services/ivor-integration';

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

      // If auto-approved, sync to IVOR immediately
      if (autoApprove && createdEvent.status === 'approved') {
        try {
          const eventForIVOR = {
            id: createdEvent.id,
            title: createdEvent.title,
            description: createdEvent.description,
            status: 'upcoming' as 'upcoming' | 'happening-now' | 'completed' | 'cancelled',
            type: 'education' as 'action' | 'mutual-aid' | 'organizing' | 'education' | 'celebration' | 'support',
            communityValue: 'community-healing',
            traumaInformed: true,
            accessibilityFeatures: [],
            location: {
              type: 'in-person',
              details: createdEvent.location || 'Community space'
            },
            organizer: { id: 'api', name: 'Community Organizer' },
            date: createdEvent.date,
            created: createdEvent.created_at,
            updated: createdEvent.updated_at || createdEvent.created_at,
            registration: {
              required: false,
              capacity: undefined,
              currentAttendees: 0
            }
          };

          await ivorIntegration.syncEventToIVOR(eventForIVOR);
          console.log('✅ Event auto-synced to IVOR knowledge base:', createdEvent.id);

          // Also trigger BLKOUTHUB webhook for auto-approved events
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

        } catch (ivorError) {
          console.error('Failed to sync auto-approved event to IVOR:', ivorError);
        }
      }

      return res.status(201).json({
        event: createdEvent,
        message: autoApprove
          ? 'Event created and approved, synced to IVOR and BLKOUTHUB'
          : 'Event created and submitted for moderation'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}