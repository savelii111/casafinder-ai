import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Home, Activity, Settings, Crown, 
  TrendingUp, DollarSign, Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPanel({ language = 'en' }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: user?.role === 'admin'
  });

  const { data: apartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.UserSubscription.list(),
    enabled: user?.role === 'admin'
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['allActivities'],
    queryFn: () => base44.entities.UserActivity.list('-created_date', 50),
    enabled: user?.role === 'admin'
  });

  const labels = {
    en: {
      title: 'Admin Dashboard',
      users: 'Users',
      properties: 'Properties',
      activities: 'Recent Activities',
      revenue: 'Revenue',
      overview: 'Overview',
      totalUsers: 'Total Users',
      activeListings: 'Active Listings',
      aiQueries: 'AI Queries Today',
      conversions: 'Conversions',
      freeUsers: 'Free',
      proUsers: 'Pro',
      ultimateUsers: 'Ultimate',
      accessDenied: 'Admin Access Required',
      contactAdmin: 'Please contact an administrator for access'
    },
    es: {
      title: 'Panel de Administración',
      users: 'Usuarios',
      properties: 'Propiedades',
      activities: 'Actividades Recientes',
      revenue: 'Ingresos',
      overview: 'Resumen',
      totalUsers: 'Usuarios Totales',
      activeListings: 'Listados Activos',
      aiQueries: 'Consultas IA Hoy',
      conversions: 'Conversiones',
      freeUsers: 'Gratis',
      proUsers: 'Pro',
      ultimateUsers: 'Ultimate',
      accessDenied: 'Acceso de Administrador Requerido',
      contactAdmin: 'Por favor contacte a un administrador para acceso'
    },
    ru: {
      title: 'Панель Администратора',
      users: 'Пользователи',
      properties: 'Объекты',
      activities: 'Недавние Действия',
      revenue: 'Доход',
      overview: 'Обзор',
      totalUsers: 'Всего Пользователей',
      activeListings: 'Активные Объявления',
      aiQueries: 'AI Запросов Сегодня',
      conversions: 'Конверсии',
      freeUsers: 'Бесплатно',
      proUsers: 'Pro',
      ultimateUsers: 'Ultimate',
      accessDenied: 'Требуется Доступ Администратора',
      contactAdmin: 'Пожалуйста, свяжитесь с администратором для доступа'
    }
  };

  const t = labels[language] || labels.en;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.accessDenied}</h2>
              <p className="text-gray-600">{t.contactAdmin}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: allUsers.length,
    activeListings: apartments.length,
    aiQueries: subscriptions.reduce((sum, sub) => sum + (sub.ai_requests_today || 0), 0),
    conversions: subscriptions.filter(s => s.plan !== 'free').length
  };

  const planDistribution = {
    free: subscriptions.filter(s => s.plan === 'free').length,
    pro: subscriptions.filter(s => ['pro1', 'pro2'].includes(s.plan)).length,
    ultimate: subscriptions.filter(s => s.plan === 'ultimate').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            {t.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t.totalUsers}
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t.activeListings}
                </CardTitle>
                <Home className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeListings}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t.aiQueries}
                </CardTitle>
                <Zap className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.aiQueries}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t.conversions}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversions}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.conversions / stats.totalUsers) * 100).toFixed(1)}% rate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="users">{t.users}</TabsTrigger>
            <TabsTrigger value="activities">{t.activities}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.freeUsers}</span>
                  <Badge variant="secondary">{planDistribution.free}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.proUsers}</span>
                  <Badge className="bg-blue-500">{planDistribution.pro}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.ultimateUsers}</span>
                  <Badge className="bg-purple-500">{planDistribution.ultimate}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t.users}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allUsers.slice(0, 10).map(u => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">{u.email}</span>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>{t.activities}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activities.slice(0, 15).map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b text-sm">
                      <span className="text-gray-600">{activity.user_email}</span>
                      <Badge variant="outline">{activity.action}</Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.created_date).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}