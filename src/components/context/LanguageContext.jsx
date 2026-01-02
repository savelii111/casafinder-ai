import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const [language, setLanguageState] = useState(() => {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_language') || 'en';
    }
    return 'en';
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLang) => {
      if (!subscription) return;
      await base44.entities.UserSubscription.update(subscription.id, {
        language: newLang
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  });

  // Sync language from user subscription on mount
  useEffect(() => {
    if (subscription?.language && subscription.language !== language) {
      setLanguageState(subscription.language);
      localStorage.setItem('app_language', subscription.language);
    }
  }, [subscription?.language]);

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('app_language', newLang);
    
    // Update in database if user is logged in
    if (user?.email && subscription) {
      updateLanguageMutation.mutate(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};