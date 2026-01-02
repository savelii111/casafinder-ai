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

const SAMPLE_APARTMENTS = [
  {
    id: '1',
    title: 'Modern Studio in Sol',
    price: 950,
    address: 'Calle del Sol 15, Madrid Centro',
    rooms: 1,
    size: 45,
    lat: 40.4168,
    lng: -3.7038,
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    riskScore: 3,
    trueCost: { rent: 950, utilities: 70, internet: 35, food: 180 },
    aiInsight: 'Excellent location in the heart of Madrid. Walking distance to major attractions. Safe neighborhood with great nightlife options.'
  },
  {
    id: '2',
    title: 'Bright 2BR in Malasaña',
    price: 1400,
    address: 'Calle Fuencarral 88, Malasaña',
    rooms: 2,
    size: 75,
    lat: 40.4252,
    lng: -3.7037,
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    riskScore: 2,
    trueCost: { rent: 1400, utilities: 90, internet: 35, food: 200 },
    aiInsight: 'Trendy neighborhood popular with young professionals. Excellent restaurants and cafes. Very safe area with good metro connections.'
  },
  {
    id: '3',
    title: 'Cozy Loft in Lavapiés',
    price: 850,
    address: 'Calle Lavapiés 42, Lavapiés',
    rooms: 1,
    size: 55,
    lat: 40.4085,
    lng: -3.6995,
    photos: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'],
    riskScore: 5,
    trueCost: { rent: 850, utilities: 65, internet: 30, food: 150 },
    aiInsight: 'Multicultural neighborhood with affordable prices. Some areas can be noisy at night. Good local markets and diverse food options.'
  },
  {
    id: '4',
    title: 'Elegant 3BR in Salamanca',
    price: 2800,
    address: 'Calle Serrano 45, Salamanca',
    rooms: 3,
    size: 120,
    lat: 40.4296,
    lng: -3.6850,
    photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    riskScore: 1,
    trueCost: { rent: 2800, utilities: 150, internet: 45, food: 300 },
    aiInsight: 'Premium neighborhood with luxury shopping and dining. Extremely safe area. Higher prices but excellent quality of life.'
  },
  {
    id: '5',
    title: 'Student Flat in Moncloa',
    price: 650,
    address: 'Calle Princesa 80, Moncloa',
    rooms: 1,
    size: 35,
    lat: 40.4350,
    lng: -3.7195,
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    riskScore: 4,
    trueCost: { rent: 650, utilities: 55, internet: 25, food: 140 },
    aiInsight: 'University area with many students. Affordable prices and good nightlife. Well connected by metro and bus.'
  }
];

export default function Home() {
  const [language, setLanguage] = useState('en');
  const [showMap, setShowMap] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apartments, setApartments] = useState(SAMPLE_APARTMENTS);
  const [sortBy, setSortBy] = useState('price-asc');
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 5000,
    rooms: 'any',
    minSize: 0,
    maxRisk: 10
  });
  const [userPlan, setUserPlan] = useState('free');
  const [aiRequestsToday, setAiRequestsToday] = useState(0);
  const [mapCenter, setMapCenter] = useState([40.4168, -3.7038]);
  
  const chatContainerRef = useRef(null);
  const queryClient = useQueryClient();

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
    if (userPlan === 'free' && aiRequestsToday >= 3) {
      setShowUpgradeModal(true);
      return;
    }

    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Automatically show map when user searches
    setShowMap(true);

    // Simulate AI response
    const aiPrompt = `User is searching for apartments in Madrid. Their query: "${content}". 
    Based on this, provide a helpful response about apartment hunting in Madrid.
    Respond in ${language === 'es' ? 'Spanish' : language === 'ru' ? 'Russian' : 'English'}.
    Be concise and helpful.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
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

    const assistantMessage = { 
      role: 'assistant', 
      content: response.response || "I found some great apartments for you. Check out the map and listings below!"
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    setAiRequestsToday(prev => prev + 1);

    // Update filters based on AI suggestions
    if (response.suggested_price_range) {
      setFilters(prev => ({
        ...prev,
        priceMin: response.suggested_price_range.min || prev.priceMin,
        priceMax: response.suggested_price_range.max || prev.priceMax
      }));
    }
  };

  const handleApartmentClick = (apartment) => {
    setSelectedApartment(apartment);
    setShowPropertyModal(true);
  };

  const handleAskAI = (apartment, action = 'ask') => {
    if (userPlan === 'free' && aiRequestsToday >= 3) {
      setShowUpgradeModal(true);
      return;
    }
    
    let prompt = '';
    if (action === 'translate') {
      prompt = `Translate the description and details of this apartment to ${language === 'es' ? 'Spanish' : language === 'ru' ? 'Russian' : 'English'}`;
    } else {
      prompt = `Tell me more about this apartment at ${apartment.address}`;
    }
    
    setShowPropertyModal(false);
    handleSendMessage(prompt);
  };

  const handleCompare = (apartment) => {
    if (userPlan === 'free') {
      setShowUpgradeModal(true);
      return;
    }
    // Compare logic for Pro users
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
              {userPlan === 'free' && (
                <Badge 
                  variant="outline" 
                  className="hidden sm:flex cursor-pointer hover:bg-gray-100"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {3 - aiRequestsToday} {t.freeRequestsLeft}
                </Badge>
              )}
              
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={setLanguage} 
              />

              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black border-0 hover:from-amber-500 hover:to-orange-600"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
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

          <ApartmentFilters
            filters={filters}
            onFiltersChange={setFilters}
            isPro={userPlan === 'pro'}
            language={language}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
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
        />
      </main>

      {/* Property Modal */}
      <PropertyModal
        apartment={selectedApartment}
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onAskAI={handleAskAI}
        onCompare={handleCompare}
        language={language}
        userPlan={userPlan}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={userPlan}
        onSelectPlan={handleSelectPlan}
        language={language}
      />
    </div>
  );
}