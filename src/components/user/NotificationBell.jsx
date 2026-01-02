import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Home, Sparkles, TrendingDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

// Mock notifications - will be replaced with real data later
const mockNotifications = {
  en: [
    {
      id: 1,
      type: 'new_property',
      title: 'New property matches your search',
      message: '3-room apartment in Malasaña for €1,200/mo',
      time: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      icon: Home
    },
    {
      id: 2,
      type: 'price_drop',
      title: 'Price dropped on saved property',
      message: 'Property in Chamberí now €100 cheaper',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      icon: TrendingDown
    },
    {
      id: 3,
      type: 'ai_insight',
      title: 'AI found a great deal',
      message: 'Property 15% below market price in Retiro',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      icon: Sparkles
    }
  ],
  es: [
    {
      id: 1,
      type: 'new_property',
      title: 'Nueva propiedad coincide con tu búsqueda',
      message: 'Apartamento de 3 habitaciones en Malasaña por €1,200/mes',
      time: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      icon: Home
    },
    {
      id: 2,
      type: 'price_drop',
      title: 'Bajó el precio de una propiedad guardada',
      message: 'Propiedad en Chamberí ahora €100 más barata',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      icon: TrendingDown
    },
    {
      id: 3,
      type: 'ai_insight',
      title: 'IA encontró una gran oferta',
      message: 'Propiedad 15% por debajo del precio de mercado en Retiro',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      icon: Sparkles
    }
  ],
  ru: [
    {
      id: 1,
      type: 'new_property',
      title: 'Новая недвижимость подходит под ваш поиск',
      message: '3-комнатная квартира в Маласанья за €1,200/мес',
      time: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      icon: Home
    },
    {
      id: 2,
      type: 'price_drop',
      title: 'Цена снизилась на сохраненную недвижимость',
      message: 'Недвижимость в Чамбери теперь на €100 дешевле',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      icon: TrendingDown
    },
    {
      id: 3,
      type: 'ai_insight',
      title: 'AI нашел отличное предложение',
      message: 'Недвижимость на 15% ниже рыночной цены в Ретиро',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      icon: Sparkles
    }
  ]
};

export default function NotificationBell({ language = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications[language] || mockNotifications.en);
  const menuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Update notifications when language changes
  useEffect(() => {
    setNotifications(mockNotifications[language] || mockNotifications.en);
  }, [language]);

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

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const labels = {
    en: { 
      title: 'Notifications', 
      markAllRead: 'Mark all as read', 
      noNotifications: 'No notifications',
      justNow: 'Just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago'
    },
    es: { 
      title: 'Notificaciones', 
      markAllRead: 'Marcar todo como leído', 
      noNotifications: 'Sin notificaciones',
      justNow: 'Justo ahora',
      minutesAgo: 'minutos atrás',
      hoursAgo: 'horas atrás',
      daysAgo: 'días atrás'
    },
    ru: { 
      title: 'Уведомления', 
      markAllRead: 'Отметить все прочитанными', 
      noNotifications: 'Нет уведомлений',
      justNow: 'Только что',
      minutesAgo: 'минут назад',
      hoursAgo: 'часов назад',
      daysAgo: 'дней назад'
    }
  };

  const t = labels[language] || labels.en;

  const getTimeAgo = (time) => {
    const diff = Date.now() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.justNow;
    if (minutes < 60) return `${minutes} ${t.minutesAgo}`;
    if (hours < 24) return `${hours} ${t.hoursAgo}`;
    return `${days} ${t.daysAgo}`;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20 hover:bg-white hover:shadow-lg transition-all duration-300"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">{unreadCount}</span>
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-[9999]"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t.title}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-black hover:underline font-medium"
                >
                  {t.markAllRead}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t.noNotifications}</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </button>

                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'new_property' ? 'bg-blue-100' :
                          notification.type === 'price_drop' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            notification.type === 'new_property' ? 'text-blue-600' :
                            notification.type === 'price_drop' ? 'text-green-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{getTimeAgo(notification.time)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}