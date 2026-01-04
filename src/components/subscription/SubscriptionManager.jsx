import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, Loader2 } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { toast } from "sonner";

const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY'; // Replace with actual key
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const getPlanFeatures = (language) => ({
  free: {
    name: language === 'es' ? 'Gratis' : language === 'ru' ? 'Бесплатно' : 'Free',
    price: 0,
    features: [
      { name: language === 'es' ? 'Ver propiedades limitadas' : language === 'ru' ? 'Ограниченный просмотр' : 'View limited properties', included: true },
      { name: language === 'es' ? '3 consultas IA por día' : language === 'ru' ? '3 AI запроса в день' : '3 AI queries per day', included: true },
      { name: language === 'es' ? 'Filtros básicos' : language === 'ru' ? 'Базовые фильтры' : 'Basic filters', included: true },
      { name: language === 'es' ? 'Mapa demo' : language === 'ru' ? 'Демо карта' : 'Demo map with mock data', included: true },
      { name: language === 'es' ? 'Tarjetas básicas' : language === 'ru' ? 'Базовые карточки' : 'Basic property cards', included: true },
      { name: language === 'es' ? 'Respuestas IA demo' : language === 'ru' ? 'Демо AI ответы' : 'Mock AI responses', included: true },
      { name: language === 'es' ? 'Guardar favoritos' : language === 'ru' ? 'Сохранить избранное' : 'Save favorites', included: false },
      { name: language === 'es' ? 'Datos en vivo' : language === 'ru' ? 'Живые данные' : 'Live property data', included: false },
      { name: language === 'es' ? 'Análisis avanzado' : language === 'ru' ? 'Расширенная аналитика' : 'Advanced analytics', included: false }
    ]
  },
  pro1: {
    name: 'Pro',
    price: 9,
    features: [
      { name: language === 'es' ? 'Ver todas las propiedades' : language === 'ru' ? 'Все объекты' : 'View all properties', included: true },
      { name: language === 'es' ? 'Consultas IA ilimitadas' : language === 'ru' ? 'Безлимитный AI' : 'Unlimited AI queries', included: true },
      { name: language === 'es' ? 'Mapa en vivo' : language === 'ru' ? 'Живая карта' : 'Live map (ZenRows + Idealista)', included: true },
      { name: language === 'es' ? 'Calculadora de costo real' : language === 'ru' ? 'Калькулятор реальной стоимости' : 'True Cost calculator', included: true },
      { name: language === 'es' ? 'Evaluación de riesgo' : language === 'ru' ? 'Оценка рисков' : 'Risk assessment', included: true },
      { name: language === 'es' ? 'Análisis de precio de mercado' : language === 'ru' ? 'Рыночный анализ' : 'Market price analysis', included: true },
      { name: language === 'es' ? 'Comparar apartamentos' : language === 'ru' ? 'Сравнить квартиры' : 'Compare apartments', included: true },
      { name: language === 'es' ? 'Guardar favoritos' : language === 'ru' ? 'Сохранить избранное' : 'Save favorites', included: true },
      { name: language === 'es' ? 'Notificaciones básicas' : language === 'ru' ? 'Базовые уведомления' : 'Basic notifications', included: true },
      { name: language === 'es' ? 'Análisis de barrio' : language === 'ru' ? 'Анализ районов' : 'Neighborhood analysis', included: true }
    ]
  },
  pro2: {
    name: 'Pro+',
    price: 20,
    features: [
      { name: language === 'es' ? 'Todo en Pro' : language === 'ru' ? 'Всё из Pro' : 'Everything in Pro 1', included: true },
      { name: language === 'es' ? 'Análisis IA avanzado' : language === 'ru' ? 'Расширенный AI анализ' : 'Advanced AI analysis', included: true },
      { name: language === 'es' ? 'Predicciones de precio' : language === 'ru' ? 'Прогноз цен' : 'Price predictions', included: true },
      { name: language === 'es' ? 'Mapa completo con clustering' : language === 'ru' ? 'Полная карта с кластерами' : 'Full map with clustering', included: true },
      { name: language === 'es' ? 'Marcadores personalizados' : language === 'ru' ? 'Настраиваемые маркеры' : 'Custom markers & popups', included: true },
      { name: language === 'es' ? 'Notificaciones en tiempo real' : language === 'ru' ? 'Уведомления в реальном времени' : 'Real-time notifications', included: true },
      { name: language === 'es' ? 'Concierge WhatsApp' : language === 'ru' ? 'WhatsApp консьерж' : 'WhatsApp concierge', included: true },
      { name: language === 'es' ? 'Gestión de portafolio' : language === 'ru' ? 'Управление портфолио' : 'Portfolio management', included: true },
      { name: language === 'es' ? 'Informes de cliente' : language === 'ru' ? 'Отчеты для клиентов' : 'Client reports', included: true },
      { name: language === 'es' ? 'Historial de vistas' : language === 'ru' ? 'История просмотров' : 'View history tracking', included: true }
    ]
  },
  ultimate: {
    name: 'Ultimate',
    price: 49,
    features: [
      { name: language === 'es' ? 'Modelos IA avanzados' : language === 'ru' ? 'Продвинутые AI модели' : 'Advanced AI models & property intelligence', included: true },
      { name: language === 'es' ? 'Automatización total IA' : language === 'ru' ? 'Полная AI автоматизация' : 'Full AI agent automation', included: true },
      { name: language === 'es' ? 'Procesamiento prioritario' : language === 'ru' ? 'Приоритетная обработка' : 'Priority data processing', included: true },
      { name: language === 'es' ? 'Acceso futuras integraciones' : language === 'ru' ? 'Доступ к будущим интеграциям' : 'Future integrations access (Idealista, ZenRows)', included: true },
      { name: language === 'es' ? 'Insights nivel inversor' : language === 'ru' ? 'Инвестиционная аналитика' : 'Professional investor-level insights', included: true },
      { name: language === 'es' ? 'Comparación de portafolios' : language === 'ru' ? 'Сравнение портфолио' : 'Portfolio comparisons & analytics', included: true },
      { name: language === 'es' ? 'Exportar PDF/CSV' : language === 'ru' ? 'Экспорт PDF/CSV' : 'PDF/CSV export & reporting', included: true },
      { name: language === 'es' ? 'Filtros personalizados' : language === 'ru' ? 'Настраиваемые фильтры' : 'Custom filters & advanced search', included: true },
      { name: language === 'es' ? 'Leads ilimitados' : language === 'ru' ? 'Безлимитные лиды' : 'Unlimited leads & contacts', included: true },
      { name: language === 'es' ? 'Soporte prioritario' : language === 'ru' ? 'Приоритетная поддержка' : 'Priority support & concierge', included: true }
    ]
  }
});

export default function SubscriptionManager({ language = 'en' }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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

  const currentPlan = subscription?.plan || 'free';

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;
    
    setLoading(true);
    try {
      const { createStripeCheckout } = await import('@/components/services/integrations');
      const session = await createStripeCheckout(planId, user.email);
      
      // In production with real Stripe, redirect to checkout
      // const stripe = await stripePromise;
      // await stripe.redirectToCheckout({ sessionId: session.sessionId });
      
      // For now, simulate success and trigger confetti
      const { celebrateUpgrade } = await import('@/components/utils/confetti');
      celebrateUpgrade();
      toast.success('Upgrade Successful! 🎉');
      
      // Update subscription in database
      if (user?.email) {
        const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
        if (subs.length > 0) {
          await base44.entities.UserSubscription.update(subs[0].id, { plan: planId });
        } else {
          await base44.entities.UserSubscription.create({ user_email: user.email, plan: planId });
        }
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
      
    } catch (error) {
      toast.error('Failed to start checkout');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    en: {
      title: 'Manage Subscription',
      current: 'Current Plan',
      upgrade: 'Upgrade',
      perMonth: 'per month'
    },
    es: {
      title: 'Gestionar Suscripción',
      current: 'Plan Actual',
      upgrade: 'Mejorar',
      perMonth: 'por mes'
    },
    ru: {
      title: 'Управление Подпиской',
      current: 'Текущий План',
      upgrade: 'Улучшить',
      perMonth: 'в месяц'
    }
  };

  const t = labels[language] || labels.en;
  const PLAN_FEATURES = getPlanFeatures(language);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(PLAN_FEATURES).map(([planId, plan]) => {
          const isCurrent = currentPlan === planId;
          const isUpgrade = ['pro1', 'pro2', 'ultimate'].indexOf(planId) > ['free', 'pro1', 'pro2', 'ultimate'].indexOf(currentPlan);
          
          return (
            <Card 
              key={planId}
              className={`relative ${isCurrent ? 'ring-2 ring-black dark:ring-white' : ''} bg-white dark:bg-gray-800`}
            >
              {isCurrent && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white">
                  {t.current}
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                  <span>{plan.name}</span>
                  {planId !== 'free' && <Crown className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                </CardTitle>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plan.price === 0 ? (
                    <span className="text-2xl">{plan.name}</span>
                  ) : (
                    <>
                      €{plan.price}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{t.perMonth}</span>
                    </>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {isUpgrade && (
                  <Button
                    className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black"
                    onClick={() => handleUpgrade(planId)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.upgrade
                    )}
                  </Button>
                )}
                
                {isCurrent && (
                  <Button className="w-full" variant="outline" disabled>
                    {t.current}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Hook for checking feature access
export function useFeatureAccess() {
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

  const plan = subscription?.plan || 'free';
  const aiRequestsToday = subscription?.ai_requests_today || 0;

  return {
    plan,
    aiRequestsToday,
    canUseAI: plan === 'free' ? aiRequestsToday < 3 : true,
    canSaveFavorites: ['pro1', 'pro2', 'ultimate'].includes(plan),
    canReceiveNotifications: ['pro1', 'pro2', 'ultimate'].includes(plan),
    canUseAdvancedFilters: ['pro2', 'ultimate'].includes(plan),
    canCompareProperties: ['pro1', 'pro2', 'ultimate'].includes(plan),
    canAccessLiveData: ['pro1', 'pro2', 'ultimate'].includes(plan),
    canUseWhatsApp: ['pro2', 'ultimate'].includes(plan),
    canExportData: plan === 'ultimate',
    canUseHeatmap: plan === 'ultimate',
    canUsePortfolio: ['pro2', 'ultimate'].includes(plan),
    canUsePredictions: ['pro2', 'ultimate'].includes(plan),
    canUseClustering: ['pro2', 'ultimate'].includes(plan),
    canDragDropFavorites: ['pro1', 'pro2', 'ultimate'].includes(plan),
    canScheduleVisits: ['pro1', 'pro2', 'ultimate'].includes(plan),
    canAccessAgents: ['pro2', 'ultimate'].includes(plan),
    subscription
  };
}