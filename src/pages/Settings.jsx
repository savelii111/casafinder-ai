import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Bell, Globe, Crown, ArrowLeft, Save, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';

export default function Settings() {
  const [language, setLanguage] = useState('en');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const { plan } = useFeatureAccess();

  // Load language from subscription
  useEffect(() => {
    if (subscription?.language) {
      setLanguage(subscription.language);
    }
  }, [subscription]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save language to subscription
      if (user?.email) {
        const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
        if (subs.length > 0) {
          await base44.entities.UserSubscription.update(subs[0].id, { 
            language,
            // In real implementation, save notification preferences too
          });
        } else {
          await base44.entities.UserSubscription.create({ 
            user_email: user.email, 
            language,
            plan: 'free'
          });
        }
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }

      toast.success(labels[language].saveSuccess);
    } catch (error) {
      toast.error(labels[language].saveError);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const labels = {
    en: {
      title: 'Settings',
      backToHome: 'Back to Home',
      accountInfo: 'Account Information',
      name: 'Name',
      email: 'Email',
      currentPlan: 'Current Plan',
      languagePreferences: 'Language Preferences',
      selectLanguage: 'Select your language',
      notificationSettings: 'Notification Settings',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive updates via email',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Browser notifications for new properties',
      priceAlerts: 'Price Drop Alerts',
      priceAlertsDesc: 'Get notified when prices drop',
      weeklyDigest: 'Weekly Digest',
      weeklyDigestDesc: 'Summary of new properties each week',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      saveSuccess: 'Settings saved successfully!',
      saveError: 'Failed to save settings'
    },
    es: {
      title: 'Configuración',
      backToHome: 'Volver al Inicio',
      accountInfo: 'Información de Cuenta',
      name: 'Nombre',
      email: 'Correo',
      currentPlan: 'Plan Actual',
      languagePreferences: 'Preferencias de Idioma',
      selectLanguage: 'Selecciona tu idioma',
      notificationSettings: 'Configuración de Notificaciones',
      emailNotifications: 'Notificaciones por Correo',
      emailNotificationsDesc: 'Recibir actualizaciones por correo',
      pushNotifications: 'Notificaciones Push',
      pushNotificationsDesc: 'Notificaciones del navegador para nuevas propiedades',
      priceAlerts: 'Alertas de Bajada de Precio',
      priceAlertsDesc: 'Recibir notificación cuando bajen los precios',
      weeklyDigest: 'Resumen Semanal',
      weeklyDigestDesc: 'Resumen de nuevas propiedades cada semana',
      saveChanges: 'Guardar Cambios',
      saving: 'Guardando...',
      saveSuccess: '¡Configuración guardada exitosamente!',
      saveError: 'Error al guardar configuración'
    },
    ru: {
      title: 'Настройки',
      backToHome: 'Назад на Главную',
      accountInfo: 'Информация об Аккаунте',
      name: 'Имя',
      email: 'Email',
      currentPlan: 'Текущий План',
      languagePreferences: 'Языковые Настройки',
      selectLanguage: 'Выберите язык',
      notificationSettings: 'Настройки Уведомлений',
      emailNotifications: 'Email Уведомления',
      emailNotificationsDesc: 'Получать обновления по email',
      pushNotifications: 'Push Уведомления',
      pushNotificationsDesc: 'Уведомления браузера о новой недвижимости',
      priceAlerts: 'Оповещения о Снижении Цен',
      priceAlertsDesc: 'Получать уведомления при снижении цен',
      weeklyDigest: 'Еженедельная Сводка',
      weeklyDigestDesc: 'Обзор новой недвижимости каждую неделю',
      saveChanges: 'Сохранить Изменения',
      saving: 'Сохранение...',
      saveSuccess: 'Настройки успешно сохранены!',
      saveError: 'Ошибка сохранения настроек'
    }
  };

  const t = labels[language] || labels.en;

  const planNames = {
    free: 'Starter',
    pro1: 'Pro 1',
    pro2: 'Pro 2',
    ultimate: 'Ultimate'
  };

  const languageOptions = [
    { code: 'en', name: '🇬🇧 English', flag: '🇬🇧' },
    { code: 'es', name: '🇪🇸 Español', flag: '🇪🇸' },
    { code: 'ru', name: '🇷🇺 Русский', flag: '🇷🇺' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                {t.backToHome}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.accountInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.name}
                  </label>
                  <Input 
                    value={user?.full_name || ''} 
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t.email}
                  </label>
                  <Input 
                    value={user?.email || ''} 
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    {t.currentPlan}
                  </label>
                  <Badge className={`${plan === 'free' ? 'bg-gray-100 text-gray-700' : 'bg-black text-white'} text-sm py-2 px-4`}>
                    {planNames[plan]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Language Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t.languagePreferences}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{t.selectLanguage}</p>
                <div className="grid grid-cols-3 gap-3">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        language === lang.code
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{lang.flag}</div>
                      <div className="text-sm font-medium">
                        {lang.name.split(' ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t.notificationSettings}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{t.emailNotifications}</p>
                    <p className="text-sm text-gray-500">{t.emailNotificationsDesc}</p>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{t.pushNotifications}</p>
                    <p className="text-sm text-gray-500">{t.pushNotificationsDesc}</p>
                  </div>
                  <Switch 
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{t.priceAlerts}</p>
                    <p className="text-sm text-gray-500">{t.priceAlertsDesc}</p>
                  </div>
                  <Switch 
                    checked={priceAlerts}
                    onCheckedChange={setPriceAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{t.weeklyDigest}</p>
                    <p className="text-sm text-gray-500">{t.weeklyDigestDesc}</p>
                  </div>
                  <Switch 
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg"
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Save className="h-5 w-5" />
                  </motion.div>
                  {t.saving}
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  {t.saveChanges}
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}