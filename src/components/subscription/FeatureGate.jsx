import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function FeatureGate({ 
  isLocked, 
  onUpgradeClick, 
  children, 
  featureName,
  language = 'en',
  showOverlay = true 
}) {
  const labels = {
    en: {
      upgrade: 'Upgrade to unlock',
      lockedFeature: 'feature requires'
    },
    es: {
      upgrade: 'Mejorar para desbloquear',
      lockedFeature: 'función requiere'
    },
    ru: {
      upgrade: 'Улучшить для разблокировки',
      lockedFeature: 'функция требует'
    }
  };

  const t = labels[language] || labels.en;

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className={showOverlay ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>
      
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"
        >
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Lock className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {featureName} {t.lockedFeature}
            </p>
            <Button
              size="sm"
              className="bg-black hover:bg-gray-800"
              onClick={onUpgradeClick}
            >
              {t.upgrade}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}