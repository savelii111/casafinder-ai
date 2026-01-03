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

const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      { name: 'View limited properties', included: true },
      { name: '3 AI queries per day', included: true },
      { name: 'Basic filters', included: true },
      { name: 'Demo map with mock data', included: true },
      { name: 'Basic property cards', included: true },
      { name: 'Mock AI responses', included: true },
      { name: 'Save favorites', included: false },
      { name: 'Live property data', included: false },
      { name: 'Advanced analytics', included: false }
    ]
  },
  pro1: {
    name: 'Pro',
    price: 20,
    features: [
      { name: 'View all properties', included: true },
      { name: 'Unlimited AI queries', included: true },
      { name: 'Live map (ZenRows + Idealista)', included: true },
      { name: 'True Cost calculator', included: true },
      { name: 'Risk assessment', included: true },
      { name: 'Market price analysis', included: true },
      { name: 'Compare apartments', included: true },
      { name: 'Save favorites', included: true },
      { name: 'Basic notifications', included: true },
      { name: 'Neighborhood analysis', included: true }
    ]
  },
  pro2: {
    name: 'Pro+',
    price: 29,
    features: [
      { name: 'Everything in Pro 1', included: true },
      { name: 'Advanced AI analysis', included: true },
      { name: 'Price predictions', included: true },
      { name: 'Full map with clustering', included: true },
      { name: 'Custom markers & popups', included: true },
      { name: 'Real-time notifications', included: true },
      { name: 'WhatsApp concierge', included: true },
      { name: 'Portfolio management', included: true },
      { name: 'Client reports', included: true },
      { name: 'View history tracking', included: true }
    ]
  },
  ultimate: {
    name: 'Ultimate',
    price: 49,
    features: [
      { name: 'Advanced AI models & property intelligence', included: true },
      { name: 'Full AI agent automation', included: true },
      { name: 'Priority data processing', included: true },
      { name: 'Future integrations access (Idealista, ZenRows)', included: true },
      { name: 'Professional investor-level insights', included: true },
      { name: 'Portfolio comparisons & analytics', included: true },
      { name: 'PDF/CSV export & reporting', included: true },
      { name: 'Custom filters & advanced search', included: true },
      { name: 'Unlimited leads & contacts', included: true },
      { name: 'Priority support & concierge', included: true }
    ]
  }
};

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
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {planId !== 'free' && <Crown className="h-5 w-5 text-gray-400" />}
                </CardTitle>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  €{plan.price}
                  {planId !== 'free' && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{t.perMonth}</span>
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