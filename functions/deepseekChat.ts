import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { query, language = 'en', apartments = [] } = body;
    
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      // Fallback to basic analysis
      return Response.json({
        success: true,
        response: `Found ${apartments.length} properties matching your criteria.`,
        properties_found: apartments.length,
        source: 'fallback'
      });
    }

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert real estate advisor in Madrid, Spain. Provide detailed, natural, conversational responses in ${language === 'es' ? 'Spanish' : language === 'ru' ? 'Russian' : 'English'}.

When responding to property searches:
1. Start with a warm, natural greeting acknowledging their search
2. State the number of properties found clearly
3. Describe the general location and neighborhood characteristics
4. Mention the price range of available properties
5. Provide neighborhood insights (safety, transport, amenities, schools if relevant)
6. Suggest 2-3 top property highlights
7. Offer helpful advice or considerations
8. End with an encouraging note

Be conversational, detailed, and helpful. Use multi-line responses (3-5 paragraphs). Make it feel like talking to a knowledgeable local real estate expert.`
          },
          {
            role: 'user',
            content: `User is searching for: "${query}"

I found ${apartments.length} properties matching their criteria.

${apartments.length > 0 ? `Here are some details about available properties:
${apartments.slice(0, 5).map((apt, i) => `
${i + 1}. ${apt.neighborhood || 'Madrid'} - €${apt.price}/month - ${apt.rooms} rooms${apt.size ? ` - ${apt.size}m²` : ''}`).join('')}

Average price: €${Math.round(apartments.reduce((sum, a) => sum + a.price, 0) / apartments.length)}
Price range: €${Math.min(...apartments.map(a => a.price))} - €${Math.max(...apartments.map(a => a.price))}` : ''}

Provide a detailed, natural response about these properties and the Madrid rental market for their search.`
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!deepseekResponse.ok) {
      console.error('DeepSeek API error:', deepseekResponse.status);
      return Response.json({
        success: true,
        response: `Found ${apartments.length} properties matching your criteria.`,
        properties_found: apartments.length,
        source: 'fallback'
      });
    }

    const data = await deepseekResponse.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Properties found';

    return Response.json({
      success: true,
      response: aiResponse,
      properties_found: apartments.length,
      source: 'deepseek'
    });

  } catch (error) {
    console.error('deepseekChat error:', error);
    
    // Fallback
    const body = await req.json().catch(() => ({}));
    const apartments = body.apartments || [];
    
    return Response.json({
      success: true,
      response: `Found ${apartments.length} properties matching your criteria.`,
      properties_found: apartments.length,
      source: 'error_fallback'
    });
  }
});