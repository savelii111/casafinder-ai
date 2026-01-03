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
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
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
import CompareModal from '@/components/apartment/CompareModal';
import NewPropertyAlert from '@/components/alerts/NewPropertyAlert';
import ThemeToggle from '@/components/theme/ThemeToggle';
import SearchHistory from '@/components/search/SearchHistory';
import SmartFilters from '@/components/filters/SmartFilters';
import { trackPropertyView, trackSearch, trackFavorite, trackCompare, trackAIQuery, initActivityTracker } from '@/components/utils/activityTracker';
import AIRequestTracker from '@/components/common/AIRequestTracker';
import MapSkeleton from '@/components/map/MapSkeleton';
import StatsBar from '@/components/common/StatsBar';
import ExportManager from '@/components/export/ExportManager';
import { mockAskAI, mockCompare, mockTranslate } from '@/components/utils/mockAI';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';
import { notifyAILimitReached } from '@/components/utils/notifications';
import { useLanguage } from '@/components/context/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Sample apartments are now loaded from database

export default function Home() {
  const { language, setLanguage } = useLanguage();
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
    maxRisk: 10,
    amenities: {}
  });
  const [mapCenter, setMapCenter] = useState([40.4168, -3.7038]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiResponseTitle, setAiResponseTitle] = useState('');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadApartment, setLeadApartment] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  const chatContainerRef = useRef(null);
  const queryClient = useQueryClient();

  // Initialize activity tracker
  React.useEffect(() => {
    initActivityTracker();
  }, []);
  
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
    canExportData,
    subscription
  } = useFeatureAccess();

  // Load apartments from database
  const { data: dbApartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Favorite.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (dbApartments.length > 0) {
      setApartments(dbApartments);
    }
  }, [dbApartments]);

  // Update AI requests tracking
  const updateAIRequestsMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) return;
      const today = new Date().toISOString().split('T')[0];
      const lastRequestDate = subscription.last_request_date?.split('T')[0];
      
      const newCount = lastRequestDate === today ? (subscription.ai_requests_today || 0) + 1 : 1;
      
      await base44.entities.UserSubscription.update(subscription.id, {
        ai_requests_today: newCount,
        last_request_date: new Date().toISOString()
      });

      // Notify if limit reached
      if (newCount >= 3 && userPlan === 'free') {
        await notifyAILimitReached(user.email, language);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  });

  const labels = {
    en: {
      welcome: "Find Your Perfect Home or Apartment in Spain",
      subtitle: "AI-powered property search with risk analysis and true cost calculator",
      startChat: "Start AI Search",
      viewMap: "View Map",
      hideMap: "Hide Map",
      freeRequestsLeft: "AI requests left today",
      upgradeForMore: "Upgrade for unlimited"
    },
    es: {
      welcome: "Encuentra Tu Hogar o Apartamento Perfecto en España",
      subtitle: "Búsqueda inteligente con IA, análisis de riesgo y calculadora de coste real",
      startChat: "Buscar con IA",
      viewMap: "Ver Mapa",
      hideMap: "Ocultar Mapa",
      freeRequestsLeft: "Solicitudes IA restantes hoy",
      upgradeForMore: "Mejora para ilimitado"
    },
    ru: {
      welcome: "Найдите Идеальный Дом или Квартиру в Испании",
      subtitle: "Умный поиск недвижимости с ИИ, анализ рисков и калькулятор реальной стоимости",
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
    setMapLoading(true);

    try {
      // Track search activity
      trackSearch(content, filteredApartments.length);
      
      // Update AI request count
      updateAIRequestsMutation.mutate();
      // Simulate AI response
      const aiPrompt = `User is searching for apartments in Madrid. Their query: "${content}". 
      Based on this, provide a helpful response about apartment hunting in Madrid.
      Count how many properties match their criteria from the available ${apartments.length} properties.
      Respond in ${language === 'es' ? 'Spanish' : language === 'ru' ? 'Russian' : 'English'}.
      Be concise and helpful.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
        add_context_from_internet: false,
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

      // Save search to history
      if (user?.email) {
        await base44.entities.SearchHistory.create({
          user_email: user.email,
          query: content,
          filters: filters,
          results_count: propertiesCount
        });
      }

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
      setTimeout(() => setMapLoading(false), 1000);
    }
  };

  const handleApartmentClick = (apartment) => {
    trackPropertyView(apartment.id);
    setSelectedApartment(apartment);
    setShowPropertyModal(true);
  };

  const handleAskAI = async (apartment, action = 'ask') => {
    if (!canUseAI) {
      setShowUpgradeModal(true);
      return;
    }

    // Track AI query
    trackAIQuery(apartment.id, action);

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
      updateAIRequestsMutation.mutate();
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

    // Track comparison
    trackCompare([apartment.id, ...compareList.map(a => a.id)]);

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
      updateAIRequestsMutation.mutate();
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
    // Price filters
    if (filters.priceMin && apt.price < filters.priceMin) return false;
    if (filters.priceMax && apt.price > filters.priceMax) return false;
    
    // Room filters
    if (filters.rooms !== 'any') {
      const roomFilter = parseInt(filters.rooms);
      if (roomFilter === 4 && apt.rooms < 4) return false;
      if (roomFilter < 4 && apt.rooms !== roomFilter) return false;
    }
    
    // Basic amenities
    if (filters.furnished === 'yes' && !apt.furnished) return false;
    if (filters.furnished === 'no' && apt.furnished) return false;
    if (filters.pets_allowed === 'yes' && !apt.pets_allowed) return false;
    if (filters.pets_allowed === 'no' && apt.pets_allowed) return false;
    
    // Smart filters (amenities)
    if (filters.amenities) {
      for (const [key, value] of Object.entries(filters.amenities)) {
        if (value && !apt[key]) return false;
      }
    }
    
    // Pro filters
    if (userPlan !== 'free') {
      if (filters.minSize && apt.size < filters.minSize) return false;
      if (filters.maxRisk && apt.riskScore > filters.maxRisk) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/20">
        <div className="w-full px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="bg-black dark:bg-white p-2 rounded-xl">
                <HomeIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white dark:text-black" />
              </div>
              <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">RentAI</span>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Upgrade Plan Button - Desktop */}
              <Link to={createPageUrl('Subscription')} className="hidden lg:block">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 text-purple-900 dark:text-purple-300 font-semibold"
                >
                  <Crown className="h-4 w-4" />
                  {language === 'es' ? 'Mejorar Plan' : language === 'ru' ? 'Улучшить План' : 'Upgrade Plan'}
                </Button>
              </Link>

              {/* Upgrade Plan Button - Mobile (compact) */}
              <Link to={createPageUrl('Subscription')} className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1 text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                >
                  <Crown className="h-4 w-4" />
                </Button>
              </Link>

              <NotificationBell language={language} />

              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop: Split Layout | Mobile: Stacked Layout */}
      <main className="relative h-[calc(100vh-73px)] lg:h-[calc(100vh-81px)] overflow-hidden">
        {/* Mobile Layout */}
        <div className="lg:hidden h-full overflow-y-auto">
          {messages.length === 0 ? (
            /* Landing Page */
            <div className="min-h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <HeroSection 
                onSearch={handleSendMessage}
                isLoading={isLoading}
                language={language}
              />
              <FeaturedProperties language={language} />
            </div>
          ) : (
            /* Search Results View */
            <div className="p-4 space-y-4">

              {/* Mobile Chat Messages */}
              <div className="space-y-3 mb-4">
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

              {/* Mobile Chat Input */}
              <div className="mb-4">
                <ChatInput 
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  language={language}
                  placeholder={
                    language === 'es' ? 'Buscar apartamento...' :
                    language === 'ru' ? 'Найти квартиру...' :
                    'Search apartment...'
                  }
                />
                {isLoading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>
                      {language === 'es' ? 'Buscando...' : 
                       language === 'ru' ? 'Поиск...' : 
                       'Searching...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile Filters */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <SmartFilters filters={filters} onFiltersChange={setFilters} />
                <ApartmentFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  isPro={canUseAdvancedFilters}
                  language={language}
                  onUpgradeClick={() => setShowUpgradeModal(true)}
                />
              </div>

              {/* Mobile Map Toggle */}
              <Button 
                variant="outline"
                onClick={() => setShowMap(!showMap)}
                className="w-full gap-2 mb-4"
              >
                <Map className="h-4 w-4" />
                {showMap ? t.hideMap : t.viewMap}
              </Button>

              {/* Mobile Map */}
              {showMap && (
                <div className="h-[300px] rounded-2xl overflow-hidden mb-4">
                  <ApartmentMap
                    apartments={filteredApartments}
                    center={mapCenter}
                    zoom={13}
                    onApartmentClick={handleApartmentClick}
                    selectedId={selectedApartment?.id}
                    language={language}
                  />
                </div>
              )}

              {/* Mobile Results */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredApartments.length} {language === 'es' ? 'propiedades encontradas' : language === 'ru' ? 'объектов найдено' : 'properties found'}
                </p>
              </div>

              {/* Mobile Apartment List */}
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
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block h-full overflow-hidden">
          {messages.length === 0 ? (
            /* Landing Page */
            <div className="h-full overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <HeroSection 
                onSearch={handleSendMessage}
                isLoading={isLoading}
                language={language}
              />
              <FeaturedProperties language={language} />
            </div>
          ) : (
            /* Split Layout */
            <div className="flex h-full">
              {/* Left Panel - Chat (30%) */}
              <div className="w-[30%] flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Búsqueda AI' : language === 'ru' ? 'Поиск с AI' : 'AI Search'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredApartments.length} {language === 'es' ? 'propiedades' : language === 'ru' ? 'объектов' : 'properties'}
                  </p>
                </div>

                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
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

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70">
                  <ChatInput 
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                    language={language}
                    placeholder={
                      language === 'es' ? 'Buscar apartamento...' :
                      language === 'ru' ? 'Найти квартиру...' :
                      'Search apartment...'
                    }
                  />
                </div>
              </div>

              {/* Right Panel - Map (70%) */}
              <div className="w-[70%] relative">
                {/* Map Controls Overlay */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                  <div className="flex gap-2">
                    <SmartFilters filters={filters} onFiltersChange={setFilters} />
                    <ApartmentFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      isPro={canUseAdvancedFilters}
                      language={language}
                      onUpgradeClick={() => setShowUpgradeModal(true)}
                    />
                  </div>
                </div>

                {/* Full-Height Map */}
                <div className="h-full w-full">
                  <ApartmentMap
                    apartments={filteredApartments}
                    center={mapCenter}
                    zoom={13}
                    onApartmentClick={handleApartmentClick}
                    selectedId={selectedApartment?.id}
                    language={language}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Property Modal */}
      <PropertyModal
        apartment={selectedApartment}
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onAskAI={handleAskAI}
        onCompare={(apt) => {
          if (compareList.length < 3 && !compareList.find(a => a.id === apt.id)) {
            setCompareList([...compareList, apt]);
          }
          if (compareList.length >= 1) {
            setShowCompareModal(true);
          }
        }}
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

      <CompareModal
        apartments={compareList}
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        onRemove={(id) => setCompareList(compareList.filter(a => a.id !== id))}
        language={language}
      />

      <NewPropertyAlert
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        filters={filters}
      />
    </div>
  );
}