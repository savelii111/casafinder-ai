import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  User, Settings, Bell, Activity, Crown, LogOut, 
  ChevronDown, Sparkles, Mail, Globe, Heart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';
import { useLanguage } from '@/components/context/LanguageContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { plan, aiRequestsToday } = useFeatureAccess();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const labels = {
    en: {
      myAccount: 'My Account',
      plan: 'Plan',
      starter: 'Starter',
      aiRequests: 'AI Requests Today',
      unlimited: 'Unlimited AI',
      settings: 'Settings',
      notifications: 'Notifications',
      activity: 'My Activity',
      upgrade: 'Upgrade Plan',
      logout: 'Logout',
      language: 'Language'
    },
    es: {
      myAccount: 'Mi Cuenta',
      plan: 'Plan',
      starter: 'Inicial',
      aiRequests: 'Solicitudes IA Hoy',
      unlimited: 'Ilimitado',
      settings: 'Configuración',
      notifications: 'Notificaciones',
      activity: 'Mi Actividad',
      upgrade: 'Mejorar Plan',
      logout: 'Cerrar Sesión',
      language: 'Idioma'
    },
    ru: {
      myAccount: 'Мой Аккаунт',
      plan: 'План',
      starter: 'Бесплатно',
      aiRequests: 'AI Запросов Сегодня',
      unlimited: 'Безлимитный AI',
      settings: 'Настройки',
      notifications: 'Уведомления',
      activity: 'Моя Активность',
      upgrade: 'Улучшить План',
      logout: 'Выйти',
      language: 'Язык'
    }
  };

  const t = labels[language] || labels.en;

  const planNames = {
    free: language === 'es' ? 'Gratis' : language === 'ru' ? 'Бесплатно' : 'Free',
    pro1: 'Pro',
    pro2: 'Pro+',
    ultimate: 'Ultimate'
  };

  const languageNames = {
    en: '🇬🇧 English',
    es: '🇪🇸 Español',
    ru: '🇷🇺 Русский'
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20 hover:bg-white hover:shadow-lg transition-all duration-300"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white font-bold text-sm">
          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 glass-card rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-[9999]"
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white font-bold text-lg">
                  {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Plan Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {plan === 'free' ? (
                    <Sparkles className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">{t.plan}:</span>
                </div>
                <Badge className={`${plan === 'free' ? 'bg-gray-100 text-gray-700' : 'bg-black text-white'}`}>
                  {planNames[plan]}
                </Badge>
              </div>

              {/* AI Requests Counter */}
              {plan === 'free' && (
                <div className="mt-2 p-2 bg-white rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{t.aiRequests}</span>
                    <span className="font-semibold text-gray-900">{aiRequestsToday}/3</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-black to-gray-700 transition-all duration-300"
                      style={{ width: `${(aiRequestsToday / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {plan !== 'free' && (
                <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg text-center border border-purple-200 dark:border-purple-700">
                  <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">✨ {t.unlimited}</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Language Selector */}
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {t.language}
                </div>
                <div className="flex gap-1">
                  {Object.entries(languageNames).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code);
                      }}
                      className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                        language === code
                          ? 'bg-black text-white font-semibold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-200 my-2" />

              {/* Settings */}
              <Link to={createPageUrl('Settings')} onClick={() => setIsOpen(false)}>
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{t.settings}</span>
                </button>
              </Link>

              {/* Notifications */}
              <Link to={createPageUrl('Settings')} onClick={() => setIsOpen(false)}>
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                  <Bell className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{t.notifications}</span>
                </button>
              </Link>

              {/* Activity */}
              <Link to={createPageUrl('Activity')} onClick={() => setIsOpen(false)}>
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{t.activity}</span>
                </button>
              </Link>

              {/* Favorites */}
              <Link to={createPageUrl('Favorites')} onClick={() => setIsOpen(false)}>
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                  <Heart className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Favorites</span>
                </button>
              </Link>

              <div className="h-px bg-gray-200 my-2" />

              {/* Upgrade Plan or Unlimited Badge */}
              {plan === 'ultimate' ? (
                <div className="px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-amber-50 mx-2 rounded-lg">
                  <div className="flex items-center gap-2 justify-center">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-900">{t.unlimited} AI</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate(createPageUrl('Subscription'));
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gradient-to-r hover:from-black hover:to-gray-800 transition-all text-left group"
                >
                  <Crown className="h-4 w-4 text-yellow-500 group-hover:text-yellow-300" />
                  <span className="text-sm text-gray-700 group-hover:text-white font-medium">{t.upgrade}</span>
                </button>
              )}

              <div className="h-px bg-gray-200 my-2" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left group"
              >
                <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                <span className="text-sm text-gray-700 group-hover:text-red-600">{t.logout}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}