import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity as ActivityIcon, ArrowLeft, Sparkles, Eye, Heart, MessageSquare,
  Home, Clock, TrendingUp, Play, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';
import { useLanguage } from '@/components/context/LanguageContext';
import moment from 'moment';

// Mock activity data - will be replaced with real data later
const mockActivityData = {
  en: {
    aiRequests: [
      { id: 1, type: 'ai_analysis', property: '3-room apartment in Malasaña', time: new Date(Date.now() - 1000 * 60 * 30), result: 'Good value for money' },
      { id: 2, type: 'ai_comparison', property: '2-room apartment in Chamberí', time: new Date(Date.now() - 1000 * 60 * 60 * 3), result: 'Better than 2 similar properties' },
      { id: 3, type: 'ai_translation', property: 'Studio in Retiro', time: new Date(Date.now() - 1000 * 60 * 60 * 24), result: 'Translated to English' }
    ],
    propertyViews: [
      { id: 1, property: '3-room apartment in Malasaña', price: 1200, time: new Date(Date.now() - 1000 * 60 * 45) },
      { id: 2, property: '2-room apartment in Chamberí', price: 950, time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 3, property: '4-room apartment in Salamanca', price: 1800, time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { id: 4, property: 'Studio in Centro', price: 700, time: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    ],
    favorites: [
      { id: 1, property: '3-room apartment in Malasaña', price: 1200, addedTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      { id: 2, property: '2-room apartment in Chamberí', price: 950, addedTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) }
    ]
  },
  es: {
    aiRequests: [
      { id: 1, type: 'ai_analysis', property: 'Apartamento de 3 habitaciones en Malasaña', time: new Date(Date.now() - 1000 * 60 * 30), result: 'Buena relación calidad-precio' },
      { id: 2, type: 'ai_comparison', property: 'Apartamento de 2 habitaciones en Chamberí', time: new Date(Date.now() - 1000 * 60 * 60 * 3), result: 'Mejor que 2 propiedades similares' },
      { id: 3, type: 'ai_translation', property: 'Estudio en Retiro', time: new Date(Date.now() - 1000 * 60 * 60 * 24), result: 'Traducido al Español' }
    ],
    propertyViews: [
      { id: 1, property: 'Apartamento de 3 habitaciones en Malasaña', price: 1200, time: new Date(Date.now() - 1000 * 60 * 45) },
      { id: 2, property: 'Apartamento de 2 habitaciones en Chamberí', price: 950, time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 3, property: 'Apartamento de 4 habitaciones en Salamanca', price: 1800, time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { id: 4, property: 'Estudio en Centro', price: 700, time: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    ],
    favorites: [
      { id: 1, property: 'Apartamento de 3 habitaciones en Malasaña', price: 1200, addedTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      { id: 2, property: 'Apartamento de 2 habitaciones en Chamberí', price: 950, addedTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) }
    ]
  },
  ru: {
    aiRequests: [
      { id: 1, type: 'ai_analysis', property: '3-комнатная квартира в Маласанья', time: new Date(Date.now() - 1000 * 60 * 30), result: 'Хорошее соотношение цены и качества' },
      { id: 2, type: 'ai_comparison', property: '2-комнатная квартира в Чамбери', time: new Date(Date.now() - 1000 * 60 * 60 * 3), result: 'Лучше чем 2 аналогичных предложения' },
      { id: 3, type: 'ai_translation', property: 'Студия в Ретиро', time: new Date(Date.now() - 1000 * 60 * 60 * 24), result: 'Переведено на Русский' }
    ],
    propertyViews: [
      { id: 1, property: '3-комнатная квартира в Маласанья', price: 1200, time: new Date(Date.now() - 1000 * 60 * 45) },
      { id: 2, property: '2-комнатная квартира в Чамбери', price: 950, time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 3, property: '4-комнатная квартира в Саламанка', price: 1800, time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { id: 4, property: 'Студия в Центре', price: 700, time: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    ],
    favorites: [
      { id: 1, property: '3-комнатная квартира в Маласанья', price: 1200, addedTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      { id: 2, property: '2-комнатная квартира в Чамбери', price: 950, addedTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) }
    ]
  }
};

export default function Activity() {
  const { language } = useLanguage();
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);

  const startParsing = async () => {
    setParsing(true);
    setParseResult(null);
    try {
      // Parse 20 pages of rent + 20 pages of sale
      const rentResult = await base44.functions.invoke('fetchListingsBatch', {
        city: 'Madrid',
        listing_type: 'rent',
        startPage: 1
      });
      
      const saleResult = await base44.functions.invoke('fetchListingsBatch', {
        city: 'Madrid',
        listing_type: 'sale',
        startPage: 1
      });
      
      setParseResult({
        success: true,
        count: (rentResult.data.count || 0) + (saleResult.data.count || 0),
        stats: {
          rent: rentResult.data.count || 0,
          sale: saleResult.data.count || 0,
          withCoords: (rentResult.data.count || 0) + (saleResult.data.count || 0)
        }
      });
    } catch (error) {
      setParseResult({ error: error.message });
    }
    setParsing(false);
  };

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

  const { plan, aiRequestsToday } = useFeatureAccess();

  const activityData = mockActivityData[language] || mockActivityData.en;

  const labels = {
    en: {
      title: 'My Activity',
      backToHome: 'Back to Home',
      aiRequests: 'AI Requests',
      propertyViews: 'Property Views',
      favorites: 'Favorites',
      today: 'Today',
      requestsUsed: 'requests used today',
      unlimited: 'Unlimited',
      noActivity: 'No activity yet',
      startExploring: 'Start exploring properties',
      ago: 'ago',
      addedOn: 'Added on'
    },
    es: {
      title: 'Mi Actividad',
      backToHome: 'Volver al Inicio',
      aiRequests: 'Solicitudes IA',
      propertyViews: 'Propiedades Vistas',
      favorites: 'Favoritos',
      today: 'Hoy',
      requestsUsed: 'solicitudes usadas hoy',
      unlimited: 'Ilimitado',
      noActivity: 'Sin actividad aún',
      startExploring: 'Comienza a explorar propiedades',
      ago: 'hace',
      addedOn: 'Agregado el'
    },
    ru: {
      title: 'Моя Активность',
      backToHome: 'Назад на Главную',
      aiRequests: 'AI Запросы',
      propertyViews: 'Просмотры Недвижимости',
      favorites: 'Избранное',
      today: 'Сегодня',
      requestsUsed: 'запросов использовано сегодня',
      unlimited: 'Безлимит',
      noActivity: 'Пока нет активности',
      startExploring: 'Начните изучать недвижимость',
      ago: 'назад',
      addedOn: 'Добавлено'
    }
  };

  const t = labels[language] || labels.en;

  const getTimeAgo = (time) => {
    return moment(time).fromNow();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ActivityIcon className="h-8 w-8" />
                {t.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={startParsing}
                disabled={parsing}
                className="bg-green-600 hover:bg-green-700"
              >
                {parsing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Parsing
                  </>
                )}
              </Button>
              <div className="glass-card dark:glass-dark rounded-xl px-4 py-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.today}</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {plan === 'free' ? `${aiRequestsToday}/3` : t.unlimited}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{plan === 'free' ? t.requestsUsed : 'AI requests'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Parse Result */}
        {parseResult && (
          <Card className="glass-card dark:glass-dark border-white/30 dark:border-gray-700/30 mb-6">
            <CardContent className="p-6">
              {parseResult.error ? (
                <div className="text-red-600">❌ Error: {parseResult.error}</div>
              ) : (
                <div>
                  <div className="text-lg font-bold text-green-600 mb-2">✅ Parsing Complete!</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    • Total: {parseResult.count || 0} apartments<br/>
                    • Rent: {parseResult.stats?.rent || 0}<br/>
                    • Sale: {parseResult.stats?.sale || 0}<br/>
                    • With Coordinates: {parseResult.stats?.withCoords || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="glass-card dark:glass-dark border-white/30 dark:border-gray-700/30 mb-6">
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t.aiRequests}
            </TabsTrigger>
            <TabsTrigger value="views" className="gap-2">
              <Eye className="h-4 w-4" />
              {t.propertyViews}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              {t.favorites}
            </TabsTrigger>
          </TabsList>

          {/* AI Requests Tab */}
          <TabsContent value="ai">
            <div className="space-y-4">
              {activityData.aiRequests.length === 0 ? (
                <Card className="glass-card dark:glass-dark border-white/30 dark:border-gray-700/30">
                  <CardContent className="p-12 text-center">
                    <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{t.noActivity}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t.startExploring}</p>
                  </CardContent>
                </Card>
              ) : (
                activityData.aiRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card dark:glass-dark border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{request.property}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{request.result}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {request.type === 'ai_analysis' ? '🔍 Analysis' :
                                 request.type === 'ai_comparison' ? '⚖️ Compare' : '🌐 Translate'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(request.time)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Property Views Tab */}
          <TabsContent value="views">
            <div className="space-y-4">
              {activityData.propertyViews.map((view) => (
                <motion.div
                  key={view.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-card dark:glass-dark border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{view.property}</h3>
                              <p className="text-lg font-bold text-black dark:text-white mt-1">€{view.price}/mo</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(view.time)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <div className="space-y-4">
              {activityData.favorites.length === 0 ? (
                <Card className="glass-card dark:glass-dark border-white/30 dark:border-gray-700/30">
                  <CardContent className="p-12 text-center">
                    <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{t.noActivity}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t.startExploring}</p>
                  </CardContent>
                </Card>
              ) : (
                activityData.favorites.map((fav) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card dark:glass-dark border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <Heart className="h-6 w-6 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{fav.property}</h3>
                                <p className="text-lg font-bold text-black dark:text-white mt-1">€{fav.price}/mo</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
                              <Clock className="h-3 w-3" />
                              {t.addedOn} {moment(fav.addedTime).format('MMM D, YYYY')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}