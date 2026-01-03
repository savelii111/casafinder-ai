import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mic, Send } from "lucide-react";

export default function HeroSection({ onSearch, isLoading, language = 'en' }) {
  const [query, setQuery] = useState('');

  const labels = {
    en: {
      headline: "Find Your Perfect Home in Spain",
      subtitle: "AI-powered search with smart filters and real insights",
      placeholder: "Where do you want to live? (e.g. 'Madrid center, 2 bedrooms under €1200')",
      searchButton: "Search"
    },
    es: {
      headline: "Encuentra Tu Hogar Perfecto en España",
      subtitle: "Búsqueda inteligente con filtros y análisis en tiempo real",
      placeholder: "¿Dónde quieres vivir? (ej. 'Centro Madrid, 2 habitaciones menos de €1200')",
      searchButton: "Buscar"
    },
    ru: {
      headline: "Найдите Идеальный Дом в Испании",
      subtitle: "Умный поиск с фильтрами и анализом недвижимости",
      placeholder: "Где вы хотите жить? (напр. 'Центр Мадрида, 2 комнаты до €1200')",
      searchButton: "Поиск"
    }
  };

  const t = labels[language] || labels.en;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto text-center px-4 py-12 lg:py-20 relative"
    >
      {/* Ad Space Placeholder - Top Right */}
      <div className="hidden lg:block absolute top-0 right-0 w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
        Ad Space
      </div>
      {/* Headline */}
      <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 leading-tight">
        {t.headline}
      </h1>

      {/* Subtitle */}
      <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 lg:mb-12 font-light">
        {t.subtitle}
      </p>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative glass-card rounded-2xl shadow-2xl p-2 hover:shadow-3xl transition-all duration-300 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Search className="absolute left-5 h-5 w-5 text-gray-400" />
            
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 pl-12 pr-20 h-14 lg:h-16 border-0 bg-transparent focus-visible:ring-0 text-base lg:text-lg text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
              disabled={isLoading}
            />

            {/* Search Button */}
            <Button
              type="submit"
              size="lg"
              disabled={!query.trim() || isLoading}
              className="h-12 lg:h-14 px-6 lg:px-8 rounded-xl bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-semibold shadow-lg"
            >
              {isLoading ? (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white dark:bg-black rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white dark:bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-white dark:bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              ) : (
                <>
                  <span className="hidden lg:inline">{t.searchButton}</span>
                  <Send className="h-5 w-5 lg:hidden" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}