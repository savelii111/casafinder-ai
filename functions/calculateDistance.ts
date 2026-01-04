import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from, to } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      return Response.json({ 
        distance: '~5 km',
        duration: '~15 min',
        note: 'Google Maps API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(from)}&destinations=${encodeURIComponent(to)}&mode=transit&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      return Response.json({
        distance: element.distance.text,
        duration: element.duration.text
      });
    }

    return Response.json({ error: 'Could not calculate distance' }, { status: 400 });

  } catch (error) {
    console.error('Distance calculation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});