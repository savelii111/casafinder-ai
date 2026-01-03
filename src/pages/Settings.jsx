import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, Bell, Lock, Palette, Globe, CreditCard, 
  Shield, Activity, Trash2, Mail, Key, Smartphone,
  Save, Check, ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/components/context/LanguageContext';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Settings() {
  const { language, setLanguage } = useLanguage();
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

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newPropertyAlerts, setNewPropertyAlerts] = useState(true);
  const [sponsoredAlerts, setSponsoredAlerts] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showProfile, setShowProfile] = useState(true);

  const labels = {
    en: {
      backToHome: 'Back to Home',
      settings: 'Settings',
      account: 'Account',
      notifications: 'Notifications',
      preferences: 'Preferences',
      security: 'Security & Privacy',
      billing: 'Billing',
      accountManagement: 'Account Management',
      email: 'Email',
      changeEmail: 'Change Email',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'Permanently delete your account and all data',
      twoFactor: 'Two-Factor Authentication',
      twoFactorDesc: 'Add an extra layer of security',
      connectedAccounts: 'Connected Accounts',
      notificationSettings: 'Notification Settings',
      emailNotif: 'Email Notifications',
      pushNotif: 'Push Notifications',
      priceChanges: 'Price Change Alerts',
      newProperties: 'New Property Alerts',
      sponsored: 'Featured & Sponsored Listings',
      languagePrefs: 'Language & Region',
      selectLanguage: 'Select Language',
      themeSettings: 'Theme Settings',
      displayDensity: 'Display Density',
      compact: 'Compact',
      standard: 'Standard',
      mapDefaults: 'Map Defaults',
      privacySettings: 'Privacy Settings',
      showProfileInfo: 'Show profile information to other users',
      loginActivity: 'Login Activity',
      sessions: 'Active Sessions',
      currentPlan: 'Current Plan',
      managePlan: 'Manage Subscription',
      paymentMethod: 'Payment Method',
      usageStats: 'Usage Statistics',
      aiQueries: 'AI Queries Used',
      savedFavorites: 'Saved Favorites',
      saveChanges: 'Save Changes',
      changesSaved: 'Changes saved successfully!'
    },
    es: {
      backToHome: 'Volver al Inicio',
      settings: 'Configuración',
      account: 'Cuenta',
      notifications: 'Notificaciones',
      preferences: 'Preferencias',
      security: 'Seguridad y Privacidad',
      billing: 'Facturación',
      accountManagement: 'Gestión de Cuenta',
      email: 'Correo',
      changeEmail: 'Cambiar Correo',
      changePassword: 'Cambiar Contraseña',
      deleteAccount: 'Eliminar Cuenta',
      deleteAccountDesc: 'Eliminar permanentemente tu cuenta y todos los datos',
      twoFactor: 'Autenticación de Dos Factores',
      twoFactorDesc: 'Añade una capa extra de seguridad',
      connectedAccounts: 'Cuentas Conectadas',
      notificationSettings: 'Configuración de Notificaciones',
      emailNotif: 'Notificaciones por Correo',
      pushNotif: 'Notificaciones Push',
      priceChanges: 'Alertas de Cambio de Precio',
      newProperties: 'Alertas de Nuevas Propiedades',
      sponsored: 'Listados Patrocinados y Destacados',
      languagePrefs: 'Idioma y Región',
      selectLanguage: 'Seleccionar Idioma',
      themeSettings: 'Configuración de Tema',
      displayDensity: 'Densidad de Visualización',
      compact: 'Compacto',
      standard: 'Estándar',
      mapDefaults: 'Valores Predeterminados del Mapa',
      privacySettings: 'Configuración de Privacidad',
      showProfileInfo: 'Mostrar información de perfil a otros usuarios',
      loginActivity: 'Actividad de Inicio de Sesión',
      sessions: 'Sesiones Activas',
      currentPlan: 'Plan Actual',
      managePlan: 'Gestionar Suscripción',
      paymentMethod: 'Método de Pago',
      usageStats: 'Estadísticas de Uso',
      aiQueries: 'Consultas IA Utilizadas',
      savedFavorites: 'Favoritos Guardados',
      saveChanges: 'Guardar Cambios',
      changesSaved: '¡Cambios guardados con éxito!'
    },
    ru: {
      backToHome: 'Вернуться на Главную',
      settings: 'Настройки',
      account: 'Аккаунт',
      notifications: 'Уведомления',
      preferences: 'Предпочтения',
      security: 'Безопасность и Конфиденциальность',
      billing: 'Оплата',
      accountManagement: 'Управление Аккаунтом',
      email: 'Email',
      changeEmail: 'Изменить Email',
      changePassword: 'Изменить Пароль',
      deleteAccount: 'Удалить Аккаунт',
      deleteAccountDesc: 'Навсегда удалить аккаунт и все данные',
      twoFactor: 'Двухфакторная Аутентификация',
      twoFactorDesc: 'Добавить дополнительный уровень безопасности',
      connectedAccounts: 'Подключенные Аккаунты',
      notificationSettings: 'Настройки Уведомлений',
      emailNotif: 'Email Уведомления',
      pushNotif: 'Push Уведомления',
      priceChanges: 'Оповещения об Изменении Цены',
      newProperties: 'Оповещения о Новых Объектах',
      sponsored: 'Рекомендуемые и Спонсируемые Объекты',
      languagePrefs: 'Язык и Регион',
      selectLanguage: 'Выбрать Язык',
      themeSettings: 'Настройки Темы',
      displayDensity: 'Плотность Отображения',
      compact: 'Компактный',
      standard: 'Стандартный',
      mapDefaults: 'Настройки Карты по Умолчанию',
      privacySettings: 'Настройки Конфиденциальности',
      showProfileInfo: 'Показывать информацию профиля другим пользователям',
      loginActivity: 'Активность Входа',
      sessions: 'Активные Сеансы',
      currentPlan: 'Текущий План',
      managePlan: 'Управление Подпиской',
      paymentMethod: 'Способ Оплаты',
      usageStats: 'Статистика Использования',
      aiQueries: 'Использовано AI Запросов',
      savedFavorites: 'Сохраненные Избранные',
      saveChanges: 'Сохранить Изменения',
      changesSaved: 'Изменения успешно сохранены!'
    }
  };

  const t = labels[language] || labels.en;

  const planNames = {
    free: language === 'es' ? 'Gratis' : language === 'ru' ? 'Бесплатно' : 'Free',
    pro1: 'Pro',
    pro2: 'Pro+',
    ultimate: 'Ultimate'
  };

  const handleSaveChanges = () => {
    toast.success(t.changesSaved);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t.settings}</h1>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t.account}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{t.notifications}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t.preferences}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">{t.security}</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{t.billing}</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.accountManagement}</CardTitle>
                <CardDescription>Manage your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t.email}</Label>
                  <div className="flex gap-2">
                    <Input value={user?.email || ''} disabled className="flex-1" />
                    <Button variant="outline" size="sm">{t.changeEmail}</Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.changePassword}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    {t.changePassword}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-red-600 dark:text-red-400">{t.deleteAccount}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.deleteAccountDesc}</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.deleteAccount}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.notificationSettings}</CardTitle>
                <CardDescription>Control how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.emailNotif}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.pushNotif}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Browser push notifications</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.priceChanges}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when prices change</p>
                  </div>
                  <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.newProperties}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alert when new properties match your criteria</p>
                  </div>
                  <Switch checked={newPropertyAlerts} onCheckedChange={setNewPropertyAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.sponsored}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Featured and sponsored property alerts</p>
                  </div>
                  <Switch checked={sponsoredAlerts} onCheckedChange={setSponsoredAlerts} />
                </div>

                <Button onClick={handleSaveChanges} className="w-full mt-6">
                  <Save className="h-4 w-4 mr-2" />
                  {t.saveChanges}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.languagePrefs}</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t.selectLanguage}</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={language === 'en' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setLanguage('en')}
                    >
                      🇬🇧 English
                    </Button>
                    <Button 
                      variant={language === 'es' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setLanguage('es')}
                    >
                      🇪🇸 Español
                    </Button>
                    <Button 
                      variant={language === 'ru' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setLanguage('ru')}
                    >
                      🇷🇺 Русский
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>{t.themeSettings}</Label>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode</span>
                  </div>
                </div>

                <Button onClick={handleSaveChanges} className="w-full mt-6">
                  <Save className="h-4 w-4 mr-2" />
                  {t.saveChanges}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.security}</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.twoFactor}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.twoFactorDesc}</p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>{t.connectedAccounts}</Label>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Google Account (Not Connected)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Apple ID (Not Connected)
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{t.privacySettings}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.showProfileInfo}</p>
                  </div>
                  <Switch checked={showProfile} onCheckedChange={setShowProfile} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>{t.loginActivity}</Label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Active now</p>
                        </div>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveChanges} className="w-full mt-6">
                  <Save className="h-4 w-4 mr-2" />
                  {t.saveChanges}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.currentPlan}</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {planNames[subscription?.plan || 'free']}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {subscription?.plan === 'free' ? 'Free forever' : 'Active subscription'}
                      </p>
                    </div>
                    <Link to={createPageUrl('Subscription')}>
                      <Button size="sm">{t.managePlan}</Button>
                    </Link>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>{t.usageStats}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.aiQueries}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {subscription?.ai_requests_today || 0}
                        {subscription?.plan === 'free' && <span className="text-sm text-gray-500"> / 3</span>}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.savedFavorites}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}