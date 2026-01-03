import React from 'react';
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, X, Sparkles, Zap, Crown, Shield, Bell, 
  ArrowLeftRight, Filter, MapPin
} from "lucide-react";

const plans = {
  en: [
    {
      id: 'free',
      name: 'Free',
      price: '€0',
      period: '/forever',
      features: [
        { text: '3 AI requests/day', included: true },
        { text: 'Demo map (mock data)', included: true },
        { text: 'Basic property cards', included: true },
        { text: 'Live data', included: false },
        { text: 'Save favorites', included: false },
      ],
      icon: Sparkles,
      popular: false
    },
    {
      id: 'pro1',
      name: 'Pro',
      price: '€20',
      period: '/month',
      features: [
        { text: 'Unlimited AI queries', included: true },
        { text: 'Live map (ZenRows)', included: true },
        { text: 'True Cost calculator', included: true },
        { text: 'Compare apartments', included: true },
        { text: 'Save favorites', included: true },
      ],
      icon: Zap,
      popular: true
    },
    {
      id: 'pro2',
      name: 'Pro+',
      price: '€29',
      period: '/month',
      features: [
        { text: 'Everything in Pro 1', included: true },
        { text: 'Advanced AI analysis', included: true },
        { text: 'WhatsApp concierge', included: true },
        { text: 'Real-time alerts', included: true },
        { text: 'Portfolio management', included: true },
      ],
      icon: Crown,
      popular: false
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: '€49',
      period: '/month',
      features: [
        { text: 'Everything in Pro 2', included: true },
        { text: 'DeepSeek integration', included: true },
        { text: 'PDF/CSV export', included: true },
        { text: 'Heatmaps', included: true },
        { text: 'Priority support', included: true },
      ],
      icon: Crown,
      popular: false
    }
  ],
  es: [
    {
      id: 'free',
      name: 'Gratis',
      price: '€0',
      period: '/siempre',
      features: [
        { text: '3 solicitudes IA/día', included: true },
        { text: 'Mapa demo (datos falsos)', included: true },
        { text: 'Tarjetas básicas', included: true },
        { text: 'Datos en vivo', included: false },
        { text: 'Guardar favoritos', included: false },
      ],
      icon: Sparkles,
      popular: false
    },
    {
      id: 'pro1',
      name: 'Pro',
      price: '€20',
      period: '/mes',
      features: [
        { text: 'Consultas IA ilimitadas', included: true },
        { text: 'Mapa en vivo (ZenRows)', included: true },
        { text: 'Calculadora de Coste Real', included: true },
        { text: 'Comparar apartamentos', included: true },
        { text: 'Guardar favoritos', included: true },
      ],
      icon: Zap,
      popular: true
    },
    {
      id: 'pro2',
      name: 'Pro+',
      price: '€29',
      period: '/mes',
      features: [
        { text: 'Todo en Pro 1', included: true },
        { text: 'Análisis IA avanzado', included: true },
        { text: 'Conserje WhatsApp', included: true },
        { text: 'Alertas en tiempo real', included: true },
        { text: 'Gestión de portafolio', included: true },
      ],
      icon: Crown,
      popular: false
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: '€49',
      period: '/mes',
      features: [
        { text: 'Todo en Pro 2', included: true },
        { text: 'Integración DeepSeek', included: true },
        { text: 'Exportar PDF/CSV', included: true },
        { text: 'Mapas de calor', included: true },
        { text: 'Soporte prioritario', included: true },
      ],
      icon: Crown,
      popular: false
    }
  ],
  ru: [
    {
      id: 'free',
      name: 'Бесплатно',
      price: '€0',
      period: '/навсегда',
      features: [
        { text: '3 AI запроса/день', included: true },
        { text: 'Демо карта (тест данные)', included: true },
        { text: 'Базовые карточки', included: true },
        { text: 'Живые данные', included: false },
        { text: 'Сохранение избранного', included: false },
      ],
      icon: Sparkles,
      popular: false
    },
    {
      id: 'pro1',
      name: 'Pro',
      price: '€20',
      period: '/месяц',
      features: [
        { text: 'Безлимитные AI запросы', included: true },
        { text: 'Живая карта (ZenRows)', included: true },
        { text: 'Калькулятор Реальной Стоимости', included: true },
        { text: 'Сравнение квартир', included: true },
        { text: 'Сохранение избранного', included: true },
      ],
      icon: Zap,
      popular: true
    },
    {
      id: 'pro2',
      name: 'Pro+',
      price: '€29',
      period: '/месяц',
      features: [
        { text: 'Всё из Pro 1', included: true },
        { text: 'Расширенный AI анализ', included: true },
        { text: 'WhatsApp консьерж', included: true },
        { text: 'Оповещения в реальном времени', included: true },
        { text: 'Управление портфелем', included: true },
      ],
      icon: Crown,
      popular: false
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: '€49',
      period: '/месяц',
      features: [
        { text: 'Всё из Pro 2', included: true },
        { text: 'Интеграция DeepSeek', included: true },
        { text: 'Экспорт PDF/CSV', included: true },
        { text: 'Тепловые карты', included: true },
        { text: 'Приоритетная поддержка', included: true },
      ],
      icon: Crown,
      popular: false
    }
  ]
};

const titles = {
  en: { title: 'Upgrade Your Plan', subtitle: 'Unlock all features and find your perfect apartment' },
  es: { title: 'Mejora Tu Plan', subtitle: 'Desbloquea todas las funciones y encuentra tu apartamento perfecto' },
  ru: { title: 'Улучшите Ваш План', subtitle: 'Разблокируйте все функции и найдите идеальную квартиру' }
};

export default function UpgradeModal({ isOpen, onClose, currentPlan = 'free', onSelectPlan, language = 'en' }) {
  const t = titles[language] || titles.en;
  const plansList = plans[language] || plans.en;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 glass-card border-white/30 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 text-white">
          <DialogTitle className="text-3xl font-bold mb-2">{t.title}</DialogTitle>
          <p className="text-gray-300">{t.subtitle}</p>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plansList.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl p-6 transition-all duration-300 ${
                    plan.popular 
                      ? 'glass-dark text-white shadow-2xl scale-105 hover:scale-110' 
                      : 'glass-card border-gray-200 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white font-semibold border border-white/20 shadow-lg">
                      {language === 'es' ? 'Más Popular' : language === 'ru' ? 'Популярный' : 'Most Popular'}
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${plan.popular ? 'bg-white/20' : 'bg-gray-100'}`}>
                      <Icon className={`h-6 w-6 ${plan.popular ? 'text-white' : 'text-gray-700'}`} />
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className={`h-4 w-4 ${plan.popular ? 'text-green-400' : 'text-green-500'}`} />
                        ) : (
                          <X className={`h-4 w-4 ${plan.popular ? 'text-gray-500' : 'text-gray-300'}`} />
                        )}
                        <span className={!feature.included ? (plan.popular ? 'text-gray-500' : 'text-gray-400') : ''}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-white text-black hover:bg-gray-100' 
                        : isCurrentPlan 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                    }`}
                    onClick={() => !isCurrentPlan && onSelectPlan?.(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan 
                      ? (language === 'es' ? 'Plan Actual' : language === 'ru' ? 'Текущий План' : 'Current Plan')
                      : plan.id === 'free' 
                        ? (language === 'es' ? 'Comenzar' : language === 'ru' ? 'Начать' : 'Get Started')
                        : (language === 'es' ? 'Mejorar' : language === 'ru' ? 'Улучшить' : 'Upgrade')
                    }
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}