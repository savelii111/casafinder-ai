import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 Measurement ID

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
}

// Track custom events
export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Track property view
export function trackPropertyView(apartmentId, price) {
  trackEvent('view_property', {
    property_id: apartmentId,
    price: price,
    currency: 'EUR'
  });
}

// Track search
export function trackPropertySearch(query, results) {
  trackEvent('search', {
    search_term: query,
    results_count: results
  });
}

// Track upgrade click
export function trackUpgradeClick(plan) {
  trackEvent('upgrade_click', {
    plan_name: plan
  });
}

export default GoogleAnalytics;