import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import { useLanguage } from '@/components/context/LanguageContext';

export default function Subscription() {
  const { language } = useLanguage();

  const labels = {
    en: { backHome: 'Back to Home' },
    es: { backHome: 'Volver al Inicio' },
    ru: { backHome: 'Назад на Главную' }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t.backHome}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <SubscriptionManager language={language} />
      </main>
    </div>
  );
}