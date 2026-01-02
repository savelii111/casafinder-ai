// ========================================
// INTEGRATION HOOKS - Ready for BuilderPlan
// ========================================
// Toggle between mock and real APIs by changing USE_MOCK_DATA flag
// After BuilderPlan upgrade: Set USE_MOCK_DATA = false and add API keys

const USE_MOCK_DATA = true; // Set to false to enable real APIs

// API Configuration - Add your keys here after BuilderPlan
const API_KEYS = {
  ZENROWS_API_KEY: 'YOUR_ZENROWS_KEY',
  DEEPSEEK_API_KEY: 'YOUR_DEEPSEEK_KEY', 
  IDEALISTA_API_KEY: 'YOUR_IDEALISTA_KEY',
  STRIPE_SECRET_KEY: 'YOUR_STRIPE_SECRET',
  WHATSAPP_API_KEY: 'YOUR_WHATSAPP_KEY'
};

// ========================================
// ZENROWS - Web Scraping with Premium Proxy
// ========================================

async function fetchWithZenRowsReal(url, options = {}) {
  const zenrowsUrl = `https://api.zenrows.com/v1/?url=${encodeURIComponent(url)}&apikey=${API_KEYS.ZENROWS_API_KEY}&js_render=true&premium_proxy=true&autoparse=true`;
  
  const response = await fetch(zenrowsUrl, options);
  if (!response.ok) {
    throw new Error(`ZenRows API error: ${response.status}`);
  }
  return response.json();
}

async function fetchWithZenRowsMock(url, options = {}) {
  // Mock response - simulate ZenRows scraping
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    data: {
      properties: [],
      message: "Mock ZenRows data - activate real API in BuilderPlan"
    }
  };
}

export const fetchWithZenRows = USE_MOCK_DATA ? fetchWithZenRowsMock : fetchWithZenRowsReal;

// ========================================
// DEEPSEEK - AI Responses
// ========================================

async function getDeepSeekResponseReal(prompt, options = {}) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEYS.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      ...options
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function getDeepSeekResponseMock(prompt, options = {}) {
  // Use existing mock AI responses
  const { mockAskAI } = await import('../utils/mockAI');
  return mockAskAI({}, options.language || 'en');
}

export const getDeepSeekResponse = USE_MOCK_DATA ? getDeepSeekResponseMock : getDeepSeekResponseReal;

// ========================================
// IDEALISTA - Property Data (Madrid & Barcelona)
// ========================================

async function fetchIdealistaPropertiesReal(city = 'madrid', filters = {}) {
  const params = new URLSearchParams({
    country: 'es',
    locationId: city === 'madrid' ? '0-EU-ES-28' : '0-EU-ES-08',
    propertyType: 'homes',
    operation: 'rent',
    maxItems: filters.limit || 50,
    ...filters
  });

  const response = await fetch(`https://api.idealista.com/3.5/es/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${API_KEYS.IDEALISTA_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Idealista API error: ${response.status}`);
  }

  return response.json();
}

async function fetchIdealistaPropertiesMock(city = 'madrid', filters = {}) {
  // Return mock data - will be replaced with real API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    elementList: [],
    total: 0,
    message: "Mock Idealista data - activate real API in BuilderPlan"
  };
}

export const fetchIdealistaProperties = USE_MOCK_DATA ? fetchIdealistaPropertiesMock : fetchIdealistaPropertiesReal;

// ========================================
// STRIPE - Payment Processing
// ========================================

async function createStripeCheckoutReal(planId, userEmail) {
  // This would be called from a backend function for security
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      planId, 
      userEmail,
      successUrl: window.location.origin + '/subscription?success=true',
      cancelUrl: window.location.origin + '/subscription?canceled=true'
    })
  });

  if (!response.ok) {
    throw new Error(`Stripe API error: ${response.status}`);
  }

  return response.json();
}

async function createStripeCheckoutMock(planId, userEmail) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    url: '#',
    sessionId: 'mock_session_' + Date.now(),
    message: "Mock Stripe checkout - activate real payments in BuilderPlan"
  };
}

export const createStripeCheckout = USE_MOCK_DATA ? createStripeCheckoutMock : createStripeCheckoutReal;

// ========================================
// NOTIFICATIONS - WhatsApp & Email
// ========================================

async function sendWhatsAppNotificationReal(phoneNumber, message) {
  const response = await fetch('https://api.whatsapp.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEYS.WHATSAPP_API_KEY}`
    },
    body: JSON.stringify({
      to: phoneNumber,
      type: 'text',
      text: { body: message }
    })
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status}`);
  }

  return response.json();
}

async function sendWhatsAppNotificationMock(phoneNumber, message) {
  console.log(`[MOCK] WhatsApp to ${phoneNumber}: ${message}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, message: "Mock WhatsApp sent" };
}

export const sendWhatsAppNotification = USE_MOCK_DATA ? sendWhatsAppNotificationMock : sendWhatsAppNotificationReal;

async function sendEmailNotificationReal(email, subject, body) {
  // Use Base44's built-in email integration
  const { base44 } = await import('@/api/base44Client');
  return base44.integrations.Core.SendEmail({
    to: email,
    subject: subject,
    body: body
  });
}

async function sendEmailNotificationMock(email, subject, body) {
  console.log(`[MOCK] Email to ${email}: ${subject}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, message: "Mock email sent" };
}

export const sendEmailNotification = USE_MOCK_DATA ? sendEmailNotificationMock : sendEmailNotificationReal;

// ========================================
// PROPERTY SYNC - Combined ZenRows + Idealista
// ========================================

export async function syncPropertiesFromSources(city = 'madrid') {
  if (USE_MOCK_DATA) {
    console.log('[MOCK] Property sync - would fetch from ZenRows + Idealista');
    return {
      success: true,
      newProperties: 0,
      message: "Activate real APIs in BuilderPlan to sync live property data"
    };
  }

  try {
    // Fetch from both sources
    const [idealistaData, zenrowsData] = await Promise.all([
      fetchIdealistaProperties(city),
      fetchWithZenRows(`https://www.idealista.com/alquiler-viviendas/${city}/`)
    ]);

    // Merge and deduplicate data
    const properties = mergePropertyData(idealistaData, zenrowsData);

    // Save to database
    const { base44 } = await import('@/api/base44Client');
    const saved = await base44.entities.Apartment.bulkCreate(properties);

    return {
      success: true,
      newProperties: saved.length,
      message: `Synced ${saved.length} new properties from ${city}`
    };
  } catch (error) {
    console.error('Property sync error:', error);
    throw error;
  }
}

function mergePropertyData(idealista, zenrows) {
  // Merge logic - deduplicate based on address
  const properties = [];
  const seenAddresses = new Set();

  // Process Idealista data
  idealista.elementList?.forEach(prop => {
    if (!seenAddresses.has(prop.address)) {
      properties.push(transformIdealistaProperty(prop));
      seenAddresses.add(prop.address);
    }
  });

  // Process ZenRows data
  zenrows.data?.properties?.forEach(prop => {
    if (!seenAddresses.has(prop.address)) {
      properties.push(transformZenRowsProperty(prop));
      seenAddresses.add(prop.address);
    }
  });

  return properties;
}

function transformIdealistaProperty(prop) {
  return {
    title: prop.propertyCode,
    price: prop.price,
    address: prop.address,
    rooms: prop.rooms,
    size: prop.size,
    lat: prop.latitude,
    lng: prop.longitude,
    photos: prop.thumbnail ? [prop.thumbnail] : [],
    source_url: prop.url,
    city: prop.municipality,
    neighborhood: prop.district
  };
}

function transformZenRowsProperty(prop) {
  return {
    title: prop.title || prop.address,
    price: parseFloat(prop.price),
    address: prop.address,
    rooms: prop.rooms,
    size: prop.size,
    lat: prop.coordinates?.lat,
    lng: prop.coordinates?.lng,
    photos: prop.images || [],
    source_url: prop.url
  };
}

// ========================================
// USAGE EXAMPLES
// ========================================

/*

// After BuilderPlan activation, simply change USE_MOCK_DATA to false:

import { 
  fetchWithZenRows, 
  getDeepSeekResponse, 
  fetchIdealistaProperties,
  syncPropertiesFromSources,
  sendWhatsAppNotification,
  sendEmailNotification 
} from '@/components/services/integrations';

// Fetch properties
const properties = await fetchIdealistaProperties('madrid', { maxPrice: 1500 });

// Get AI response
const aiResponse = await getDeepSeekResponse('Analyze this apartment...', { language: 'en' });

// Sync all data
await syncPropertiesFromSources('madrid');

// Send notifications
await sendWhatsAppNotification('+34123456789', 'New property match found!');
await sendEmailNotification('user@example.com', 'New Property Alert', 'Check out this apartment...');

*/

export default {
  fetchWithZenRows,
  getDeepSeekResponse,
  fetchIdealistaProperties,
  createStripeCheckout,
  sendWhatsAppNotification,
  sendEmailNotification,
  syncPropertiesFromSources,
  USE_MOCK_DATA
};