import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const envVars = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeVersion: process.version,
      platform: process.platform
    };

    return res.status(200).json({
      message: 'API test successful',
      environment: envVars,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}