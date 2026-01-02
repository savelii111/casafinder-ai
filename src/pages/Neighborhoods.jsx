import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import NeighborhoodCard from '@/components/neighborhood/NeighborhoodCard';
import { motion } from 'framer-motion';

export default function Neighborhoods() {
  const [language, setLanguage] = useState('en');
  const [showMap, setShowMap] = useState(false);

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

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ['neighborhoods'],
    queryFn: () => base44.entities.NeighborhoodScore.list()
  });

  React.useEffect(() => {
    if (subscription?.language) {
      setLanguage(subscription.language);
    }
  }, [subscription]);

  const labels = {
    en: {
      title: 'Madrid Neighborhoods',
      backToHome: 'Back to Home',
      viewMap: 'View Map',
      hideMap: 'Hide Map',
      empty: 'No neighborhood data available yet'
    },
    es: {
      title: 'Barrios de Madrid',
      backToHome: 'Volver al Inicio',
      viewMap: 'Ver Mapa',
      hideMap: 'Ocultar Mapa',
      empty: 'No hay datos de barrios disponibles aún'
    },
    ru: {
      title: 'Районы Мадрида',
      backToHome: 'Назад на Главную',
      viewMap: 'Показать Карту',
      hideMap: 'Скрыть Карту',
      empty: 'Данные о районах пока недоступны'
    }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>

          <Button variant="outline" onClick={() => setShowMap(!showMap)} className="gap-2">
            <MapIcon className="h-4 w-4" />
            {showMap ? t.hideMap : t.viewMap}
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        {neighborhoods.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-gray-500">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {neighborhoods.map((neighborhood, idx) => (
              <motion.div
                key={neighborhood.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <NeighborhoodCard
                  neighborhood={neighborhood}
                  language={language}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}