import { base44 } from '@/api/base44Client';

let userEmail = null;

export const initActivityTracker = async () => {
  try {
    const user = await base44.auth.me();
    userEmail = user.email;
  } catch (error) {
    console.error('Failed to init activity tracker:', error);
  }
};

export const trackActivity = async (action, apartmentId = null, metadata = {}) => {
  if (!userEmail) {
    await initActivityTracker();
  }

  if (!userEmail) return;

  try {
    await base44.entities.UserActivity.create({
      user_email: userEmail,
      action,
      apartment_id: apartmentId,
      metadata
    });
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
};

// Convenience functions
export const trackPropertyView = (apartmentId) => 
  trackActivity('view_property', apartmentId);

export const trackSearch = (query, resultsCount) => 
  trackActivity('search', null, { query, results_count: resultsCount });

export const trackFavorite = (apartmentId, action = 'favorite') => 
  trackActivity(action, apartmentId);

export const trackCompare = (apartmentIds) => 
  trackActivity('compare', null, { apartment_ids: apartmentIds });

export const trackAIQuery = (apartmentId, queryType) => 
  trackActivity('ai_query', apartmentId, { query_type: queryType });

export const trackExport = (format, count) => 
  trackActivity('export', null, { format, properties_count: count });

export const trackShare = (apartmentId, method) => 
  trackActivity('share', apartmentId, { method });

export const trackScheduleVisit = (apartmentId) => 
  trackActivity('schedule_visit', apartmentId);