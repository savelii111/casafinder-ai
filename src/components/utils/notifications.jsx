import { base44 } from '@/api/base44Client';

export async function createNotification({ userEmail, title, message, type, apartmentId = null }) {
  try {
    await base44.entities.Notification.create({
      user_email: userEmail,
      title,
      message,
      type,
      apartment_id: apartmentId
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function notifyAILimitReached(userEmail, language = 'en') {
  const messages = {
    en: {
      title: 'AI Request Limit Reached',
      message: 'You\'ve used all 3 AI requests for today. Upgrade to Pro for unlimited access!'
    },
    es: {
      title: 'Límite de Solicitudes IA Alcanzado',
      message: '¡Has usado todas las 3 solicitudes IA de hoy! Mejora a Pro para acceso ilimitado.'
    },
    ru: {
      title: 'Достигнут Лимит AI Запросов',
      message: 'Вы использовали все 3 AI запроса на сегодня. Улучшите до Pro для безлимитного доступа!'
    }
  };

  const t = messages[language] || messages.en;
  
  await createNotification({
    userEmail,
    title: t.title,
    message: t.message,
    type: 'ai_limit'
  });
}

export async function notifyNewProperty(userEmail, apartment, language = 'en') {
  const messages = {
    en: {
      title: 'New Property Available',
      message: `A new property matching your criteria is available: ${apartment.title}`
    },
    es: {
      title: 'Nueva Propiedad Disponible',
      message: `Una nueva propiedad que coincide con tus criterios está disponible: ${apartment.title}`
    },
    ru: {
      title: 'Новая Квартира Доступна',
      message: `Доступна новая квартира по вашим критериям: ${apartment.title}`
    }
  };

  const t = messages[language] || messages.en;
  
  await createNotification({
    userEmail,
    title: t.title,
    message: t.message,
    type: 'new_property',
    apartmentId: apartment.id
  });
}

export async function notifyPriceChange(userEmail, apartment, oldPrice, newPrice, language = 'en') {
  const diff = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
  const isIncrease = newPrice > oldPrice;

  const messages = {
    en: {
      title: isIncrease ? 'Price Increased' : 'Price Dropped! 🎉',
      message: `${apartment.title} changed from €${oldPrice} to €${newPrice} (${isIncrease ? '+' : ''}${diff}%)`
    },
    es: {
      title: isIncrease ? 'Precio Aumentado' : '¡Precio Reducido! 🎉',
      message: `${apartment.title} cambió de €${oldPrice} a €${newPrice} (${isIncrease ? '+' : ''}${diff}%)`
    },
    ru: {
      title: isIncrease ? 'Цена Выросла' : 'Цена Снизилась! 🎉',
      message: `${apartment.title} изменилась с €${oldPrice} на €${newPrice} (${isIncrease ? '+' : ''}${diff}%)`
    }
  };

  const t = messages[language] || messages.en;
  
  await createNotification({
    userEmail,
    title: t.title,
    message: t.message,
    type: 'price_change',
    apartmentId: apartment.id
  });
}

export async function notifySystemUpdate(userEmail, title, message) {
  await createNotification({
    userEmail,
    title,
    message,
    type: 'system'
  });
}