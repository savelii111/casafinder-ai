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
import ApartmentCard from '@/components/apartment/ApartmentCard';
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
import SavedSearches from '@/components/search/SavedSearches';
import PriceChart from '@/components/analytics/PriceChart';
import GoogleAnalytics, { trackPropertySearch, trackUpgradeClick } from '@/components/analytics/GoogleAnalytics';
import PipelineValidator from '@/components/utils/pipelineValidator';
import PipelineDebugger from '@/components/debug/PipelineDebugger';

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
  const [hasSearched, setHasSearched] = useState(false);
  const [propertiesFoundCount, setPropertiesFoundCount] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [orchestratorResults, setOrchestratorResults] = useState([]);
  const [paginationStats, setPaginationStats] = useState(null);
  
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

  // BACKEND FUNCTION - Bypass SDK 20-item limit via service role
  const { data: dbApartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: async () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔷 [BACKEND FETCH] Calling backend function');
      console.log('═══════════════════════════════════════════════════════');
      
      const startTime = Date.now();
      
      try {
        const result = await base44.functions.invoke('fetchAllApartments');
        
        const stats = {
          method: 'Backend Service Role',
          totalFetched: result.data.apartments.length,
          duration: Date.now() - startTime,
          backendDuration: result.data.duration
        };
        
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ [BACKEND FETCH] Complete`);
        console.log(`   Total apartments: ${stats.totalFetched}`);
        console.log(`   Frontend duration: ${stats.duration}ms`);
        console.log(`   Backend duration: ${stats.backendDuration}ms`);
        console.log('═══════════════════════════════════════════════════════');
        
        // CRITICAL VALIDATION
        if (stats.totalFetched === 20) {
          console.error('🚨🚨🚨 BACKEND STILL LIMITED TO 20 🚨🚨🚨');
        } else if (stats.totalFetched > 20) {
          console.log('✅✅✅ SUCCESS: Backend bypassed 20-item limit ✅✅✅');
        }
        
        setPaginationStats(stats);
        return result.data.apartments;
        
      } catch (error) {
        console.error('[BACKEND FETCH] Error:', error);
        setPaginationStats({
          method: 'Backend Service Role',
          totalFetched: 0,
          duration: Date.now() - startTime,
          error: error.message
        });
        return [];
      }
    },
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
      console.log('🔵 [STATE UPDATE] Setting apartments state:', dbApartments.length);
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
    setHasSearched(true);

    // Automatically show map when user searches
    setShowMap(true);
    setMapLoading(true);

    // Retry logic for API calls
    const fetchWithRetry = async (fn, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    };

    try {
      // Track search activity
      trackSearch(content, 0);
      updateAIRequestsMutation.mutate();

      console.log('🚀🚀🚀 NEW SEARCH PIPELINE START 🚀🚀🚀');
      console.log('═══════════════════════════════════════════════════════');

      // STEP 1: Use pre-fetched aggregated apartments from useQuery
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔍 [SEARCH PIPELINE] Using aggregated apartments from cache');
      const allDbApartments = apartments;
      console.log(`📊 [STEP 1] Total apartments available: ${allDbApartments.length}`);
      console.log('═══════════════════════════════════════════════════════');

      // STEP 2: Filter AFTER full aggregation
      console.log('🔍 [STEP 2] Applying filters to FULL dataset');
      const filtered = allDbApartments.filter(apt => {
        if (filters.priceMin && apt.price < filters.priceMin) return false;
        if (filters.priceMax && apt.price > filters.priceMax) return false;
        if (filters.rooms !== 'any') {
          const roomFilter = parseInt(filters.rooms);
          if (roomFilter === 4 && apt.rooms < 4) return false;
          if (roomFilter < 4 && apt.rooms !== roomFilter) return false;
        }
        return true;
      });
      console.log(`📊 [STEP 2] Filtered: ${allDbApartments.length} → ${filtered.length}`);

      // STEP 3: Sort by AI score
      console.log('⚡ [STEP 3] Sorting by AI score');
      const sorted = [...filtered].sort((a, b) => {
        const scoreA = (10 - (a.riskScore || 5)) + (a.marketPriceDiff < 0 ? 5 : 0);
        const scoreB = (10 - (b.riskScore || 5)) + (b.marketPriceDiff < 0 ? 5 : 0);
        return scoreB - scoreA;
      });
      console.log(`📊 [STEP 3] Sorted: ${sorted.length} items`);

      // STEP 4: Set orchestrator results
      console.log('💾 [STEP 4] Setting orchestratorResults');
      setOrchestratorResults(sorted);
      setPropertiesFoundCount(sorted.length);

      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ [PIPELINE COMPLETE]');
      console.log(`   Source: ${allDbApartments.length} apartments`);
      console.log(`   After filters: ${filtered.length}`);
      console.log(`   Final sorted: ${sorted.length}`);
      console.log(`   Valid coords: ${sorted.filter(a => a.lat && a.lng).length}`);
      console.log('═══════════════════════════════════════════════════════');

      console.log('═══════════════════════════════════════════════════════');

      // STEP 5: Call DeepSeek - pass totalCount only
      console.log('🤖 [STEP 5] Calling DeepSeek with totalCount:', sorted.length);
      const deepseekResult = await fetchWithRetry(() =>
        base44.functions.invoke('deepseekChat', {
          query: content,
          language,
          totalCount: sorted.length,
          sampleApartments: sorted.slice(0, 10).map(apt => ({
            price: apt.price,
            rooms: apt.rooms,
            neighborhood: apt.neighborhood,
            size: apt.size
          }))
        })
      );

      const assistantMessage = { 
        role: 'assistant', 
        content: deepseekResult.data?.response || `Found exactly ${sorted.length} properties. All ${sorted.length} are shown on the map and list below.`
      };

      console.log('💬 [STEP 5] AI Response generated. Count mentioned:', sorted.length);
      setMessages(prev => [...prev, assistantMessage]);

      // Save search to history
      if (user?.email) {
        await base44.entities.SearchHistory.create({
          user_email: user.email,
          query: content,
          filters: filters,
          results_count: sorted.length
        });
      }

      // Track in Google Analytics
      trackPropertySearch(content, sorted.length);

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

  const filteredApartments = React.useMemo(() => {
    const result = apartments.filter(apt => {
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
    
    console.log('🔄 [FILTERED_APARTMENTS MEMO] Input:', apartments.length, '→ Output:', result.length);
    if (result.length === 20) console.error('❌❌❌ FILTERED_APARTMENTS TRUNCATED TO 20 ❌❌❌');
    
    return result;
  }, [apartments, filters, userPlan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <GoogleAnalytics />
      {/* Header */}
      {/* DEBUG MODE - Remove after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
          <PipelineDebugger />
        </div>
      )}

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
              {/* Sync Idealista Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    console.log('🔄 Syncing from Idealista...');
                    const result = await base44.functions.invoke('fetchListingsZenrows', {
                      city: 'Madrid',
                      listing_type: 'both'
                    });
                    console.log('✅ Sync complete:', result.data);
                    queryClient.invalidateQueries({ queryKey: ['apartments'] });
                    alert(`✅ Синхронизировано ${result.data?.count || 0} объектов с Idealista`);
                  } catch (error) {
                    console.error('Sync error:', error);
                    alert('❌ Ошибка синхронизации');
                  }
                }}
                className="gap-2 hidden lg:flex"
              >
                <Search className="h-4 w-4" />
                {language === 'es' ? 'Sincronizar Idealista' : language === 'ru' ? 'Загрузить с Idealista' : 'Sync Idealista'}
              </Button>

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

      {/* Cursor Pagination Stats Display */}
      {paginationStats && (
        <div className="fixed top-20 left-4 z-[60] bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/95 dark:to-blue-900/95 border-2 border-purple-400 dark:border-purple-600 rounded-xl shadow-2xl max-w-md backdrop-blur-sm">
          <div className="px-4 py-3">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
              🚀 Backend Service Role
            </h3>
            <div className="space-y-1 text-xs font-mono text-purple-800 dark:text-purple-200">
              <div className="flex justify-between border-b border-purple-200 dark:border-purple-700 pb-1">
                <span>Method:</span>
                <strong>{paginationStats.method}</strong>
              </div>
              <div className="border-t-2 border-green-400 dark:border-green-600 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>TOTAL FETCHED:</span>
                  <span className={paginationStats.totalFetched === 20 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>
                    {paginationStats.totalFetched}
                  </span>
                </div>
              </div>
              {paginationStats.totalFetched === 20 && (
                <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded px-2 py-1 mt-1">
                  <p className="text-red-800 dark:text-red-200 font-bold">⚠️ Всё ещё лимит 20!</p>
                </div>
              )}
              {paginationStats.totalFetched > 20 && (
                <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded px-2 py-1 mt-1">
                  <p className="text-green-800 dark:text-green-200 font-bold">✅ Лимит снят!</p>
                </div>
              )}
              {paginationStats.error && (
                <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded px-2 py-1 mt-1">
                  <p className="text-red-800 dark:text-red-200 text-xs">❌ {paginationStats.error}</p>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Frontend:</span>
                <span>{paginationStats.duration}ms</span>
              </div>
              {paginationStats.backendDuration && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Backend:</span>
                  <span>{paginationStats.backendDuration}ms</span>
                </div>
              )}
            </div>
          </div>
          {orchestratorResults.length > 0 && (
            <div className="bg-green-100 dark:bg-green-900/60 border-t-2 border-green-400 dark:border-green-600 px-4 py-2 rounded-b-xl">
              <div className="space-y-1 text-xs font-mono font-bold">
                <div className="flex justify-between text-green-900 dark:text-green-100">
                  <span>→ Чат:</span>
                  <span className="bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded">{propertiesFoundCount}</span>
                </div>
                <div className="flex justify-between text-green-900 dark:text-green-100">
                  <span>→ Карта:</span>
                  <span className="bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded">{orchestratorResults.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop: Split Layout | Mobile: Stacked Layout */}
      <main className="relative">
        {/* Mobile Layout */}
        <div className="lg:hidden">
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
              <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto">
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

              {/* Demo Mode Banner */}
              {isDemoMode && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ {language === 'es' ? 'Modo Demo - Datos de ejemplo' : language === 'ru' ? 'Демо режим - Примерные данные' : 'Demo Mode - Sample data'}
                  </p>
                </div>
              )}

              {/* Mobile Map */}
              {showMap && orchestratorResults.length > 0 && (
                <div className="h-[300px] rounded-2xl overflow-hidden mb-4">
                  <ApartmentMap
                    apartments={orchestratorResults}
                    center={mapCenter}
                    zoom={13}
                    onApartmentClick={handleApartmentClick}
                    selectedId={selectedApartment?.id}
                    language={language}
                  />
                </div>
              )}

              {/* Mobile Results Counter */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {propertiesFoundCount || filteredApartments.length} {language === 'es' ? 'propiedades encontradas' : language === 'ru' ? 'объектов найдено' : 'properties found'}
                </p>
                <Badge className={orchestratorResults.length === 20 ? "bg-red-500" : "bg-green-500"}>
                  {orchestratorResults.length} на карте
                </Badge>
              </div>

              {/* Mobile Apartment List */}
              <ApartmentList
                apartments={orchestratorResults.length > 0 ? orchestratorResults : filteredApartments}
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
        <div className="hidden lg:block">
          {!hasSearched ? (
            /* Landing Page */
            <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <HeroSection 
                onSearch={handleSendMessage}
                isLoading={isLoading}
                language={language}
              />
              <FeaturedProperties language={language} />
            </div>
          ) : (
            /* Search Results Layout */
            <div>
              {/* Top Section: Chat + Map Side-by-Side */}
              <div className="flex min-h-[70vh] border-b border-gray-200 dark:border-gray-700">
                {/* Left Panel - Chat (35%) */}
                <div className="w-[35%] flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {language === 'es' ? 'Búsqueda AI' : language === 'ru' ? 'Поиск с AI' : 'AI Search'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {propertiesFoundCount || filteredApartments.length} {language === 'es' ? 'propiedades' : language === 'ru' ? 'объектов' : 'properties'}
                    </p>
                  </div>

                  {/* Chat Messages */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 p-4 space-y-3 max-h-[50vh] overflow-y-auto"
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

                {/* Right Panel - Map (65%) */}
                <div className="w-[65%] relative">
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
                    
                    {/* Map Markers Counter Badge */}
                    <Badge className={`text-lg px-4 py-2 ${orchestratorResults.length === 20 ? 'bg-red-500' : 'bg-green-500'} text-white font-bold shadow-xl`}>
                      🗺️ {orchestratorResults.length} маркеров
                    </Badge>
                  </div>

                  {/* Demo Mode Banner */}
                  {isDemoMode && (
                    <div className="absolute top-20 left-4 right-4 z-10">
                      <div className="bg-yellow-50 dark:bg-yellow-900/90 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-2 shadow-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ {language === 'es' ? 'Modo Demo - Datos de ejemplo' : language === 'ru' ? 'Демо режим - Примерные данные' : 'Demo Mode - Sample data'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Full-Height Map */}
                  <div className="h-full w-full">
                    {orchestratorResults.length > 0 ? (
                      <ApartmentMap
                        apartments={orchestratorResults}
                        center={mapCenter}
                        zoom={13}
                        onApartmentClick={handleApartmentClick}
                        selectedId={selectedApartment?.id}
                        language={language}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No properties to display on map
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section: All Properties */}
              <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {language === 'es' ? `🏠 Todas las Propiedades Encontradas` : 
                           language === 'ru' ? `🏠 Все Найденные Объекты` : 
                           `🏠 All Properties Found`}
                        </h2>
                        <Badge className={`text-xl px-4 py-2 ${orchestratorResults.length === 20 ? 'bg-red-500' : 'bg-green-500'} text-white font-bold`}>
                          {orchestratorResults.length}
                        </Badge>
                      </div>
                      <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                        {language === 'es' ? 'IA Ordenado' : language === 'ru' ? 'Сортировано ИИ' : 'AI Sorted'}
                      </Badge>
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Ordenadas por mejor puntuación IA, precio y ubicación. Todas están en el mapa arriba.' : 
                       language === 'ru' ? 'Отсортировано по лучшему рейтингу ИИ, цене и расположению. Все на карте выше.' : 
                       'Sorted by best AI score, price and location. All shown on map above.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orchestratorResults.map((apt, index) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.05, 0.5) }}
                        >
                          <div className="relative">
                            {index < 3 && (
                              <div className="absolute -top-3 -left-3 z-10 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                #{index + 1}
                              </div>
                            )}
                            <ApartmentCard
                              apartment={apt}
                              onClick={handleApartmentClick}
                              isSelected={selectedApartment?.id === apt.id}
                              language={language}
                              onUpgradeClick={() => setShowUpgradeModal(true)}
                            />
                          </div>
                        </motion.div>
                      ))}
                  </div>
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