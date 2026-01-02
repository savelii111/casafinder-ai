import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AIRequestTracker({ 
  requestsUsed = 0, 
  requestsLimit = 3, 
  plan = 'free',
  onUpgradeClick,
  language = 'en'
}) {
  const isUnlimited = ['pro1', 'pro2', 'ultimate'].includes(plan);
  const percentage = isUnlimited ? 100 : (requestsUsed / requestsLimit) * 100;
  const requestsLeft = requestsLimit - requestsUsed;

  const labels = {
    en: {
      unlimited: 'Unlimited AI',
      requestsLeft: 'AI requests left',
      used: 'used today',
      upgrade: 'Upgrade for unlimited'
    },
    es: {
      unlimited: 'AI Ilimitado',
      requestsLeft: 'Solicitudes IA restantes',
      used: 'usado hoy',
      upgrade: 'Mejora para ilimitado'
    },
    ru: {
      unlimited: 'Безлимитный AI',
      requestsLeft: 'AI запросов осталось',
      used: 'использовано сегодня',
      upgrade: 'Улучшить для безлимита'
    }
  };

  const t = labels[language] || labels.en;

  if (isUnlimited) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
      >
        <Crown className="h-4 w-4" />
        <span className="text-sm font-bold">{t.unlimited}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20"
    >
      <Sparkles className="h-4 w-4 text-blue-500" />
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold ${requestsLeft === 0 ? 'text-red-500' : 'text-gray-900'}`}>
            {requestsLeft}
          </span>
          <span className="text-xs text-gray-500">/ {requestsLimit}</span>
        </div>
        <span className="text-xs text-gray-600">{t.requestsLeft}</span>
      </div>
      
      {requestsLeft === 0 && (
        <Button
          size="sm"
          onClick={onUpgradeClick}
          className="bg-black hover:bg-gray-800 text-white h-7 text-xs"
        >
          <Crown className="h-3 w-3 mr-1" />
          {t.upgrade}
        </Button>
      )}
      
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            percentage > 66 ? 'bg-red-500' : 
            percentage > 33 ? 'bg-amber-500' : 
            'bg-green-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}