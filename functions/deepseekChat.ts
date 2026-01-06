import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { query, language = 'en', totalCount = 0, apartmentsSummary = [], aggregatedSummary } = body;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🤖 [DEEPSEEK AI] Request received');
    console.log(`   Query: "${query}"`);
    console.log(`   Total apartments to process: ${totalCount}`);
    console.log(`   Summary entries received: ${apartmentsSummary.length}`);
    console.log(`   Language: ${language}`);
    console.log('═══════════════════════════════════════════════════════');
    
    // CRITICAL VALIDATION
    if (totalCount === 20) {
      console.error('🚨 DEEPSEEK: Received EXACTLY 20 apartments - upstream truncation!');
    } else if (totalCount === 0) {
      console.error('🚨 DEEPSEEK: No apartments provided!');
    } else {
      console.log(`✅ DEEPSEEK: Processing full dataset (${totalCount} apartments)`);
    }
    
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) {
      console.error('[DeepSeek] API key not set');
      return Response.json({ 
        response: `Your matching properties are shown on the map and sorted list below.`,
        error: 'API_KEY_MISSING'
      });
    }

    // Build context from aggregated summary (no raw objects, no exact numbers in text)
    const summaryText = (() => {
      if (aggregatedSummary) {
        const topNames = (aggregatedSummary.topNeighborhoods || []).map(n => (typeof n === 'string' ? n : n.name)).join(', ');
        return `Price trends present; neighborhoods include: ${topNames || 'n/a'}`;
      }
      if (apartmentsSummary?.length > 0) {
        return 'Price trends present based on sample.';
      }
      return 'No summary provided';
    })();

    const systemPrompt = language === 'es' 
      ? `Eres un asistente experto en bienes raíces en España. Ayudas a usuarios a encontrar el apartamento perfecto en Madrid. Sé amigable, útil y conciso. Responde SIEMPRE en español.`
      : language === 'ru'
      ? `Ты эксперт по недвижимости в Испании. Ты помогаешь пользователям найти идеальную квартиру в Мадриде. Будь дружелюбным, полезным и кратким. Отвечай ВСЕГДА на русском языке.`
      : `You are an expert real estate assistant in Spain. You help users find the perfect apartment in Madrid. Be friendly, helpful, and concise. Always respond in English.`;

    const userPrompt = `User query: "${query}"

CONTEXT (aggregated, no raw rows):
${summaryText}

TASK:
- Give a concise, helpful overview of the market and neighborhoods.
- DO NOT include any exact numbers (no counts, prices, ranges, sizes).
- Use qualitative phrasing only (e.g., "a wide range of prices", "several neighborhoods are popular").
- Confirm all results are visible on the map and list below, without specifying a number.
- Keep under 120 words, natural and agent-like.
- Language: follow the system prompt language.`;

    console.log('[DeepSeek] Calling API...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DeepSeek] API error:', response.status, errorText);
      return Response.json({ 
        response: `Your results are visible on the map and list below.`,
        error: 'API_ERROR'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || `All results are shown on the map and list below.`;

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ [DEEPSEEK AI] Response generated');
    console.log(`   Response length: ${aiResponse.length} chars`);
    console.log(`   Mentioned count: ${totalCount}`);
    console.log(`   Preview: ${aiResponse.substring(0, 100)}...`);
    console.log('═══════════════════════════════════════════════════════');

    return Response.json({
      response: aiResponse,
      totalCount,
      model: 'deepseek-chat'
    });

  } catch (error) {
    console.error('[DeepSeek] Error:', error);
    return Response.json({ 
      response: 'Found properties in Madrid. Check the map and list below for all results.',
      error: error.message 
    }, { status: 500 });
  }
});