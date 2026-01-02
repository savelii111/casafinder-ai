import React from 'react';
import AdminPanel from '@/components/admin/AdminPanel';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Admin() {
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

  return <AdminPanel language={subscription?.language || 'en'} />;
}