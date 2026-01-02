import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PortfolioManager from '@/components/portfolio/PortfolioManager';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';

export default function Portfolio() {
  const [language, setLanguage] = useState('en');

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

  const { canUsePortfolio } = useFeatureAccess();

  React.useEffect(() => {
    if (subscription?.language) {
      setLanguage(subscription.language);
    }
  }, [subscription]);

  const labels = {
    en: {
      backToHome: 'Back to Home',
      upgrade: 'Upgrade to Pro 2 or Ultimate'
    },
    es: {
      backToHome: 'Volver al Inicio',
      upgrade: 'Mejora a Pro 2 o Ultimate'
    },
    ru: {
      backToHome: 'Назад на Главную',
      upgrade: 'Улучшите до Pro 2 или Ultimate'
    }
  };

  const t = labels[language] || labels.en;

  if (!canUsePortfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
          <div className="glass-card rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.upgrade}</h2>
            <p className="text-gray-600 mb-6">Create and manage property portfolios</p>
            <Link to={createPageUrl('Subscription')}>
              <Button className="bg-black hover:bg-gray-800">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t.backToHome}
          </Button>
        </Link>

        <PortfolioManager language={language} />
      </div>
    </div>
  );
}