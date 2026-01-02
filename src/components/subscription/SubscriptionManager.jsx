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
      { name: 'Map view with mock data', included: true },
      { name: 'Property cards', included: true },
      { name: 'Daily notifications', included: false },
      { name: 'Save favorites', included: false },
      { name: 'Advanced AI analysis', included: false },
      { name: 'Live property data', included: false }
    ]
  },
  builder: {
    name: 'Builder',
    price: 9,
    features: [
      { name: 'View all properties', included: true },
      { name: 'Unlimited AI queries', included: true },
      { name: 'Advanced filters', included: true },
      { name: 'Daily notifications', included: true },
      { name: 'Save favorites', included: true },
      { name: 'True Cost calculator', included: true },
      { name: 'Fast sorting', included: true },
      { name: 'Advanced AI analysis', included: false },
      { name: 'Live property data (ZenRows)', included: false }
    ]
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: [
      { name: 'Everything in Builder', included: true },
      { name: 'Instant notifications', included: true },
      { name: 'Advanced AI comparisons', included: true },
      { name: 'Neighborhood analysis', included: true },
      { name: 'Risk assessment', included: true },
      { name: 'Live property data (ZenRows + Idealista)', included: true },
      { name: 'Detailed reports', included: true },
      { name: 'AI WhatsApp concierge', included: true },
      { name: 'Personalized recommendations', included: true }
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
      // Create Stripe checkout session
      // In production, this would call a backend function to create the session
      toast.info('Stripe integration required. This would redirect to checkout.');
      
      // Mock implementation:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ planId, userEmail: user.email })
      // });
      // const session = await response.json();
      // const stripe = await stripePromise;
      // await stripe.redirectToCheckout({ sessionId: session.id });
      
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
      <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLAN_FEATURES).map(([planId, plan]) => {
          const isCurrent = currentPlan === planId;
          const isUpgrade = ['builder', 'pro'].indexOf(planId) > ['free', 'builder', 'pro'].indexOf(currentPlan);
          
          return (
            <Card 
              key={planId}
              className={`relative ${isCurrent ? 'ring-2 ring-black' : ''}`}
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
                <div className="text-3xl font-bold">
                  €{plan.price}
                  {planId !== 'free' && (
                    <span className="text-sm font-normal text-gray-500">/{t.perMonth}</span>
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
                        <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {isUpgrade && (
                  <Button
                    className="w-full bg-black hover:bg-gray-800"
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
    canSaveFavorites: plan !== 'free',
    canReceiveNotifications: plan !== 'free',
    canUseAdvancedFilters: plan === 'pro',
    canCompareProperties: plan === 'pro',
    canAccessLiveData: plan === 'pro',
    canUseWhatsApp: plan === 'pro',
    subscription
  };
}