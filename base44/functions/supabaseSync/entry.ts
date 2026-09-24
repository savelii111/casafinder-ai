import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_KEY')
);

Deno.serve(async (req) => {
  try {
    const { action, data, filters, limit = 100 } = await req.json();

    switch (action) {
      case 'upsert': {
        // Upsert apartments (insert or update)
        const { data: result, error } = await supabase
          .from('apartments')
          .upsert(data, { onConflict: 'external_id' });

        if (error) throw error;
        return Response.json({ success: true, count: data.length, data: result });
      }

      case 'fetch': {
        // Fetch apartments with filters
        let query = supabase
          .from('apartments')
          .select('*')
          .eq('listing_status', 'active')
          .order('updated_date', { ascending: false })
          .limit(limit);

        if (filters) {
          if (filters.city) query = query.ilike('city', `%${filters.city}%`);
          if (filters.priceMin) query = query.gte('price', filters.priceMin);
          if (filters.priceMax) query = query.lte('price', filters.priceMax);
          if (filters.rooms) query = query.eq('rooms', filters.rooms);
          if (filters.listing_type) query = query.eq('listing_type', filters.listing_type);
        }

        const { data: apartments, error } = await query;
        if (error) throw error;

        return Response.json({ 
          success: true, 
          count: apartments.length, 
          data: apartments 
        });
      }

      case 'mark_inactive': {
        // Mark old listings as inactive
        const { external_ids } = data;
        const { error } = await supabase
          .from('apartments')
          .update({ listing_status: 'removed' })
          .not('external_id', 'in', `(${external_ids.join(',')})`);

        if (error) throw error;
        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Supabase error:', error);
    return Response.json({ 
      error: error.message,
      details: error.details || error.hint 
    }, { status: 500 });
  }
});