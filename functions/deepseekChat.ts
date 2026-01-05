import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { query, language = 'en', apartments = [], totalCount = 0 } = body;
    
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

RESPONSE STRUCTURE (MANDATORY):

1. **Warm Intro** (1-2 sentences)
   - Acknowledge their search naturally
   
2. **Total Results** (1 sentence)
   - State EXACT total count: "I found [X] properties..."
   
3. **Market Overview** (2-3 sentences)
   - Price range
   - Neighborhoods covered
   - General market insights
   
4. **Top 6 Recommendations** (DETAILED)
   - Explain WHY these 6 were selected (best value, location, safety)
   - List each property with:
     * Neighborhood
     * Price
     * Rooms & size
     * Key highlight (e.g., "Great transport links", "Bargain price")
   
5. **Neighborhood Insights** (2-3 sentences)
   - Safety, transport, amenities for mentioned areas
   
6. **Advice & Next Steps** (1-2 sentences)
   - Helpful tips or considerations
   - Encouraging close

Use 4-6 paragraphs. Be conversational, detailed, and helpful. Make it feel like talking to a knowledgeable local expert.`
          },
          {
            role: 'user',
            content: `User search query: "${query}"

TOTAL PROPERTIES FOUND: ${totalCount || apartments.length}

TOP 6 SELECTED PROPERTIES (display these):
${apartments.length > 0 ? apartments.map((apt, i) => `
${i + 1}. ${apt.neighborhood || 'Madrid'} - €${apt.price}/month - ${apt.rooms} rooms - ${apt.size || 'N/A'}m² - Risk: ${apt.riskScore}/10`).join('') : 'No properties to show'}

MARKET DATA:
- Average price: €${apartments.length > 0 ? Math.round(apartments.reduce((sum, a) => sum + a.price, 0) / apartments.length) : 'N/A'}
- Price range: €${apartments.length > 0 ? Math.min(...apartments.map(a => a.price)) : 'N/A'} - €${apartments.length > 0 ? Math.max(...apartments.map(a => a.price)) : 'N/A'}

Provide a DETAILED, NATURAL response following the structure above. Include ALL 6 properties in your response.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
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