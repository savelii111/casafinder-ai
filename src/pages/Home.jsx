import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Map, MessageSquare, Sparkles, Crown, Menu, X,
  ChevronDown, Home as HomeIcon, Search
} from "lucide-react";

import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import ApartmentMap from '@/components/map/ApartmentMap';
import ApartmentList from '@/components/apartment/ApartmentList';
import ApartmentFilters from '@/components/apartment/ApartmentFilters';
import PropertyModal from '@/components/apartment/PropertyModal';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import LanguageSelector from '@/components/common/LanguageSelector';
import AILoadingModal from '@/components/chat/AILoadingModal';
import AIResponseModal from '@/components/chat/AIResponseModal';
import FeatureGate from '@/components/subscription/FeatureGate';
import LeadGenerationModal from '@/components/lead/LeadGenerationModal';
import UserMenu from '@/components/user/UserMenu';
import NotificationBell from '@/components/user/NotificationBell';
import ResultsCounter from '@/components/common/ResultsCounter';
import { mockAskAI, mockCompare, mockTranslate } from '@/components/utils/mockAI';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Sample apartments are now loaded from database

export default function Home() {
  const [language, setLanguage] = useState('en');
  const [showMap, setShowMap] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [sortBy, setSortBy] = useState('price-asc');
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 5000,
    rooms: 'any',
    minSize: 0,
    maxRisk: 10
  });
  const [mapCenter, setMapCenter] = useState([40.4168, -3.7038]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiResponseTitle, setAiResponseTitle] = useState('');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadApartment, setLeadApartment] = useState(null);
  
  const chatContainerRef = useRef(null);
  const queryClient = useQueryClient();
  
  // Use subscription hook for feature access
  const { 
    plan: userPlan, 
    aiRequestsToday,
    canUseAI,
    canSaveFavorites,
    canUseAdvancedFilters,
    canCompareProperties,
    canAccessLiveData,
    canUseWhatsApp,
    canUseClustering,
    canUsePortfolio,
    subscription
  } = useFeatureAccess();

  // Load apartments from database
  const { data: dbApartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
  });

  useEffect(() => {
    if (dbApartments.length > 0) {
      setApartments(dbApartments);
    }
  }, [dbApartments]);

  const labels = {
    en: {
      welcome: "Find Your Perfect Home in Madrid",
      subtitle: "AI-powered apartment search with risk analysis and true cost calculator",
      startChat: "Start searching with AI",
      viewMap: "View Map",
      hideMap: "Hide Map",
      freeRequestsLeft: "AI requests left today",
      upgradeForMore: "Upgrade for unlimited"
    },
    es: {
      welcome: "Encuentra Tu Hogar Perfecto en Madrid",
      subtitle: "Búsqueda de apartamentos con IA, análisis de riesgo y calculadora de coste real",
      startChat: "Buscar con IA",
      viewMap: "Ver Mapa",
      hideMap: "Ocultar Mapa",
      freeRequestsLeft: "Solicitudes IA restantes hoy",
      upgradeForMore: "Mejora para ilimitado"
    },
    ru: {
      welcome: "Найдите Идеальный Дом в Мадриде",
      subtitle: "Поиск квартир с ИИ, анализ рисков и калькулятор реальной стоимости",
      startChat: "Начать поиск с AI",
      viewMap: "Показать Карту",
      hideMap: "Скрыть Карту",
      freeRequestsLeft: "AI запросов осталось сегодня",
      upgradeForMore: "Улучшите для безлимита"
    }
  };

  const t = labels[language] || labels.en;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!canUseAI) {
      setShowUpgradeModal(true);
      return;
    }

    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Automatically show map when user searches
    setShowMap(true);

    try {
      // Simulate AI response
      const aiPrompt = `User is searching for apartments in Madrid. Their query: "${content}". 
      Based on this, provide a helpful response about apartment hunting in Madrid.
      Count how many properties match their criteria from the available ${apartments.length} properties.
      Respond in ${language === 'es' ? 'Spanish' : language === 'ru' ? 'Russian' : 'English'}.
      Be concise and helpful.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            properties_found: { type: "number" },
            suggested_price_range: { 
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" }
              }
            },
            suggested_rooms: { type: "number" }
          }
        }
      });

      const propertiesCount = response.properties_found || filteredApartments.length;
      const countText = {
        en: `We found ${propertiesCount} properties matching your request`,
        es: `Encontramos ${propertiesCount} propiedades que coinciden con tu búsqueda`,
        ru: `Мы нашли ${propertiesCount} объектов по вашему запросу`
      };

      const assistantMessage = { 
        role: 'assistant', 
        content: `${countText[language] || countText.en}. ${response.response || "Check out the map and listings below!"}`
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Update filters based on AI suggestions
      if (response.suggested_price_range) {
        setFilters(prev => ({
          ...prev,
          priceMin: response.suggested_price_range.min || prev.priceMin,
          priceMax: response.suggested_price_range.max || prev.priceMax
        }));
      }
      if (response.suggested_rooms) {
        setFilters(prev => ({
          ...prev,
          rooms: response.suggested_rooms.toString()
        }));
      }
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: "Sorry, I had trouble processing your request. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApartmentClick = (apartment) => {
    setSelectedApartment(apartment);
    setShowPropertyModal(true);
  };

  const handleAskAI = async (apartment, action = 'ask') => {
    if (!canUseAI) {
      setShowUpgradeModal(true);
      return;
    }

    const titles = {
      en: { ask: 'AI Analysis', translate: 'AI Translation' },
      es: { ask: 'Análisis IA', translate: 'Traducción IA' },
      ru: { ask: 'Анализ ИИ', translate: 'Перевод ИИ' }
    };

    const loadingMessages = {
      en: { ask: 'AI is analyzing property...', translate: 'Translating content...' },
      es: { ask: 'IA está analizando la propiedad...', translate: 'Traduciendo contenido...' },
      ru: { ask: 'ИИ анализирует недвижимость...', translate: 'Перевод контента...' }
    };

    const t = titles[language] || titles.en;
    const loadingT = loadingMessages[language] || loadingMessages.en;

    setAiLoading(true);
    setAiLoadingMessage(action === 'translate' ? loadingT.translate : loadingT.ask);
    setShowPropertyModal(false);

    try {
      let response;
      if (action === 'translate') {
        response = await mockTranslate(apartment, language);
        setAiResponseTitle(t.translate);
      } else {
        response = await mockAskAI(apartment, language);
        setAiResponseTitle(t.ask);
      }
      
      setAiResponse(response);
      setAiRequestsToday(prev => prev + 1);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCompare = async (apartment) => {
    if (!canCompareProperties) {
      setShowUpgradeModal(true);
      return;
    }

    const titles = {
      en: 'Market Comparison',
      es: 'Comparación de Mercado',
      ru: 'Рыночное Сравнение'
    };

    const loadingMessages = {
      en: 'Comparing with market data...',
      es: 'Comparando con datos del mercado...',
      ru: 'Сравнение с рыночными данными...'
    };

    setAiLoading(true);
    setAiLoadingMessage(loadingMessages[language] || loadingMessages.en);
    setShowPropertyModal(false);

    try {
      const response = await mockCompare(apartment, language);
      setAiResponseTitle(titles[language] || titles.en);
      setAiResponse(response);
      setAiRequestsToday(prev => prev + 1);
    } catch (error) {
      console.error('Compare Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleHireAgent = (apartment) => {
    if (!canUseWhatsApp) {
      setShowUpgradeModal(true);
      return;
    }
    setShowPropertyModal(false);
    setLeadApartment(apartment);
    setShowLeadModal(true);
  };

  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      setShowUpgradeModal(false);
      return;
    }
    // Here you would integrate with Stripe
    alert(`Stripe integration needed for ${planId} plan`);
    setShowUpgradeModal(false);
  };

  const filteredApartments = apartments.filter(apt => {
    if (filters.priceMin && apt.price < filters.priceMin) return false;
    if (filters.priceMax && apt.price > filters.priceMax) return false;
    if (filters.rooms !== 'any') {
      const roomFilter = parseInt(filters.rooms);
      if (roomFilter === 4 && apt.rooms < 4) return false;
      if (roomFilter < 4 && apt.rooms !== roomFilter) return false;
    }
    if (userPlan !== 'free') {
      if (filters.minSize && apt.size < filters.minSize) return false;
      if (filters.maxRisk && apt.riskScore > filters.maxRisk) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-xl">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RentAI</span>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell language={language} />

              <UserMenu 
                language={language}
                onLanguageChange={setLanguage}
                onUpgradeClick={() => setShowUpgradeModal(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {t.welcome}
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              {t.subtitle}
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg"
                className="bg-black hover:bg-gray-800 text-white gap-2 rounded-xl px-8"
                onClick={() => setShowMap(!showMap)}
              >
                <Map className="h-5 w-5" />
                {showMap ? t.hideMap : t.viewMap}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div 
            ref={chatContainerRef}
            className="mb-6 space-y-4 max-h-[300px] overflow-y-auto pr-2"
          >
            <AnimatePresence>
              {messages.map((msg, index) => (
                <ChatMessage 
                  key={index} 
                  message={msg} 
                  isUser={msg.role === 'user'} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Chat Input */}
        <div className="mb-8">
          <ChatInput 
            onSend={handleSendMessage}
            isLoading={isLoading}
            language={language}
          />
        </div>

        {/* Results Counter - Show after search */}
        {messages.length > 0 && (
          <ResultsCounter 
            count={filteredApartments.length}
            language={language}
            showBadges={true}
          />
        )}

        {/* Map Toggle & Filters */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            className="gap-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white"
          >
            <Map className="h-4 w-4" />
            {showMap ? t.hideMap : t.viewMap}
          </Button>

          <FeatureGate
            isLocked={!canUseAdvancedFilters && (filters.minSize > 0 || filters.maxRisk < 10)}
            onUpgradeClick={() => setShowUpgradeModal(true)}
            featureName="Advanced Filters"
            language={language}
            showOverlay={false}
          >
            <ApartmentFilters
              filters={filters}
              onFiltersChange={setFilters}
              isPro={canUseAdvancedFilters}
              language={language}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          </FeatureGate>
        </div>

        {/* Map */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 400 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 rounded-2xl overflow-hidden"
            >
              <ApartmentMap
                apartments={filteredApartments}
                center={mapCenter}
                zoom={13}
                onApartmentClick={handleApartmentClick}
                selectedId={selectedApartment?.id}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Apartment List */}
        <ApartmentList
          apartments={filteredApartments}
          onApartmentClick={handleApartmentClick}
          selectedId={selectedApartment?.id}
          sortBy={sortBy}
          onSortChange={setSortBy}
          language={language}
          isLoading={!apartments.length}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
      </main>

      {/* Property Modal */}
      <PropertyModal
        apartment={selectedApartment}
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onAskAI={handleAskAI}
        onCompare={handleCompare}
        onHireAgent={handleHireAgent}
        language={language}
        userPlan={userPlan}
        canCompare={canCompareProperties}
        canUseWhatsApp={canUseWhatsApp}
      />

      <LeadGenerationModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        apartment={leadApartment}
        language={language}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={userPlan}
        onSelectPlan={handleSelectPlan}
        language={language}
      />

      {/* AI Loading Modal */}
      <AILoadingModal
        isOpen={aiLoading}
        message={aiLoadingMessage}
        language={language}
      />

      {/* AI Response Modal */}
      <AIResponseModal
        isOpen={!!aiResponse}
        onClose={() => setAiResponse(null)}
        title={aiResponseTitle}
        response={aiResponse || ''}
        language={language}
      />
    </div>
  );
}