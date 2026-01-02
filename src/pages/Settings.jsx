import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Bell, Mail, User, Globe, Save, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import LanguageSelector from '@/components/common/LanguageSelector';

export default function Settings() {
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

  const [language, setLanguage] = useState(subscription?.language || 'en');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newPropertyAlerts, setNewPropertyAlerts] = useState(true);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (subscription) {
        await base44.entities.UserSubscription.update(subscription.id, data);
      } else {
        await base44.entities.UserSubscription.create({
          user_email: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success(t.settingsSaved);
    }
  });

  const labels = {
    en: {
      title: 'Settings',
      backToHome: 'Back to Home',
      notifications: 'Notification Preferences',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      priceAlerts: 'Price Change Alerts',
      newPropertyAlerts: 'New Property Alerts',
      language: 'Language',
      saveChanges: 'Save Changes',
      settingsSaved: 'Settings saved successfully!'
    },
    es: {
      title: 'Configuración',
      backToHome: 'Volver al Inicio',
      notifications: 'Preferencias de Notificación',
      emailNotifications: 'Notificaciones por Email',
      pushNotifications: 'Notificaciones Push',
      priceAlerts: 'Alertas de Cambio de Precio',
      newPropertyAlerts: 'Alertas de Nueva Propiedad',
      language: 'Idioma',
      saveChanges: 'Guardar Cambios',
      settingsSaved: '¡Configuración guardada!'
    },
    ru: {
      title: 'Настройки',
      backToHome: 'Назад на Главную',
      notifications: 'Настройки Уведомлений',
      emailNotifications: 'Email Уведомления',
      pushNotifications: 'Push Уведомления',
      priceAlerts: 'Оповещения о Изменении Цены',
      newPropertyAlerts: 'Оповещения о Новых Объектах',
      language: 'Язык',
      saveChanges: 'Сохранить Изменения',
      settingsSaved: 'Настройки сохранены!'
    }
  };

  const t = labels[language] || labels.en;

  const handleSave = () => {
    updateMutation.mutate({ language });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            {t.backToHome}
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        <div className="space-y-6">
          {/* Notification Preferences */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.notifications}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="email-notif" className="text-sm">{t.emailNotifications}</Label>
                </div>
                <Switch 
                  id="email-notif"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="push-notif" className="text-sm">{t.pushNotifications}</Label>
                </div>
                <Switch 
                  id="push-notif"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="price-alerts" className="text-sm">{t.priceAlerts}</Label>
                <Switch 
                  id="price-alerts"
                  checked={priceAlerts}
                  onCheckedChange={setPriceAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="new-prop-alerts" className="text-sm">{t.newPropertyAlerts}</Label>
                <Switch 
                  id="new-prop-alerts"
                  checked={newPropertyAlerts}
                  onCheckedChange={setNewPropertyAlerts}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t.language}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSelector 
                language={language}
                onLanguageChange={setLanguage}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            className="w-full bg-black hover:bg-gray-800 text-white"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t.saveChanges}
          </Button>
        </div>
      </div>
    </div>
  );
}