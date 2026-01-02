import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Calculator, Sparkles, Languages } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PropertyTabs({ 
  apartment, 
  language = 'en',
  onTranslate,
  userPlan = 'free'
}) {
  const [includeFood, setIncludeFood] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);

  const trueCost = apartment.trueCost || { 
    rent: apartment.price, 
    utilities: 80, 
    internet: 30, 
    food: 200 
  };
  const totalCost = trueCost.rent + trueCost.utilities + trueCost.internet + (includeFood ? trueCost.food : 0);

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-500';
    if (score <= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskBgColor = (score) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const labels = {
    en: {
      risk: 'Risk Detector',
      trueCost: 'True Cost',
      aiActions: 'AI Actions',
      translate: 'Translate',
      riskScore: 'Risk Score',
      lowRisk: 'Low Risk',
      mediumRisk: 'Medium Risk',
      highRisk: 'High Risk',
      rent: 'Rent',
      utilities: 'Utilities',
      internet: 'Internet',
      food: 'Food (optional)',
      total: 'Total Monthly',
      askAI: 'Ask AI',
      compare: 'Compare',
      translateDesc: 'Translate Description'
    },
    es: {
      risk: 'Detector de Riesgo',
      trueCost: 'Coste Real',
      aiActions: 'Acciones IA',
      translate: 'Traducir',
      riskScore: 'Puntuación de Riesgo',
      lowRisk: 'Bajo Riesgo',
      mediumRisk: 'Riesgo Medio',
      highRisk: 'Alto Riesgo',
      rent: 'Alquiler',
      utilities: 'Servicios',
      internet: 'Internet',
      food: 'Comida (opcional)',
      total: 'Total Mensual',
      askAI: 'Preguntar IA',
      compare: 'Comparar',
      translateDesc: 'Traducir Descripción'
    },
    ru: {
      risk: 'Детектор Рисков',
      trueCost: 'Реальная Стоимость',
      aiActions: 'AI Действия',
      translate: 'Перевести',
      riskScore: 'Оценка Риска',
      lowRisk: 'Низкий Риск',
      mediumRisk: 'Средний Риск',
      highRisk: 'Высокий Риск',
      rent: 'Аренда',
      utilities: 'Коммунальные',
      internet: 'Интернет',
      food: 'Еда (опционально)',
      total: 'Итого в Месяц',
      askAI: 'Спросить AI',
      compare: 'Сравнить',
      translateDesc: 'Перевести Описание'
    }
  };

  const t = labels[language] || labels.en;

  return (
    <Tabs defaultValue="risk" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-gray-100">
        <TabsTrigger value="risk">
          <Shield className="h-4 w-4 mr-1" />
          {t.risk}
        </TabsTrigger>
        <TabsTrigger value="cost">
          <Calculator className="h-4 w-4 mr-1" />
          {t.trueCost}
        </TabsTrigger>
        <TabsTrigger value="ai">
          <Sparkles className="h-4 w-4 mr-1" />
          {t.aiActions}
        </TabsTrigger>
        <TabsTrigger value="translate">
          <Languages className="h-4 w-4 mr-1" />
          {t.translate}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="risk" className="space-y-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{t.riskScore}</span>
          <span className={`font-bold ${getRiskColor(apartment.riskScore)}`}>
            {apartment.riskScore || 5}/10
          </span>
        </div>
        <Progress 
          value={(apartment.riskScore || 5) * 10} 
          className={`h-3 ${getRiskBgColor(apartment.riskScore)}`}
        />
        {apartment.aiInsight && (
          <p className="text-sm text-gray-600 mt-3 italic bg-gray-50 rounded-lg p-3">
            <Sparkles className="h-4 w-4 inline mr-1 text-gray-400" />
            {apartment.aiInsight}
          </p>
        )}
      </TabsContent>

      <TabsContent value="cost" className="space-y-3 mt-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">{t.rent}</span>
          <span className="font-medium">€{trueCost.rent}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">{t.utilities}</span>
          <span className="font-medium">€{trueCost.utilities}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">{t.internet}</span>
          <span className="font-medium">€{trueCost.internet}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <Label htmlFor="food-toggle" className="text-sm text-gray-600">{t.food}</Label>
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-400">€{trueCost.food}</span>
            <Switch id="food-toggle" checked={includeFood} onCheckedChange={setIncludeFood} />
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="font-semibold text-gray-900">{t.total}</span>
          <span className="text-2xl font-bold text-black">€{totalCost}</span>
        </div>
      </TabsContent>

      <TabsContent value="ai" className="space-y-3 mt-4">
        <Button variant="outline" className="w-full justify-start">
          <Sparkles className="h-4 w-4 mr-2" />
          {t.askAI}
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          disabled={!['pro1', 'pro2', 'ultimate'].includes(userPlan)}
        >
          {t.compare}
        </Button>
      </TabsContent>

      <TabsContent value="translate" className="space-y-3 mt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onTranslate?.(apartment)}
        >
          <Languages className="h-4 w-4 mr-2" />
          {t.translateDesc}
        </Button>
        {translatedText && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            {translatedText}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}