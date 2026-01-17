import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, MapPin, TrendingUp, Users, Leaf, 
  Utensils, GraduationCap, AlertCircle 
} from "lucide-react";

export default function EnrichedDataPanel({ apartment, language = 'en' }) {
  const labels = {
    en: {
      tax: 'Property Tax',
      zoning: 'Zoning',
      sales: 'Comparable Sales',
      market: 'Market Analysis',
      neighborhood: 'Neighborhood',
      noData: 'Data not available'
    },
    es: {
      tax: 'Impuesto de Propiedad',
      zoning: 'Zonificación',
      sales: 'Ventas Comparables',
      market: 'Análisis de Mercado',
      neighborhood: 'Barrio',
      noData: 'Datos no disponibles'
    },
    ru: {
      tax: 'Налог на имущество',
      zoning: 'Зонирование',
      sales: 'Сравнимые продажи',
      market: 'Анализ рынка',
      neighborhood: 'Окрестности',
      noData: 'Данные недоступны'
    }
  };

  const t = labels[language] || labels.en;

  if (!apartment) return null;

  return (
    <div className="space-y-4">
      {/* Tax & Zoning */}
      {(apartment.propertyTax || apartment.zoning) && (
        <Card className="glass-card dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t.tax} & {t.zoning}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {apartment.propertyTax && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Annual IBI Tax:</span>
                <span className="font-semibold">${apartment.propertyTax}/year</span>
              </div>
            )}
            {apartment.zoning && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zoning:</span>
                <Badge variant="outline" className="capitalize">{apartment.zoningStatus || 'residential'}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparable Sales */}
      {apartment.comparableSales?.length > 0 && (
        <Card className="glass-card dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.sales}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {apartment.comparableSales.slice(0, 2).map((sale, idx) => (
              <div key={idx} className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">€{sale.price?.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">€{Math.round(sale.pricePerM2)}/m²</span>
                </div>
                <div className="text-xs text-gray-500">{sale.distance}km away</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Market Analysis */}
      {apartment.rentMarketAnalysis && (
        <Card className="glass-card dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.market}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Rent/m²:</span>
              <span className="font-semibold">€{apartment.rentMarketAnalysis.avgRentM2}/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trend:</span>
              <Badge className="bg-green-500/30 text-green-700 dark:text-green-400 capitalize">
                {apartment.rentMarketAnalysis.marketTrend}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Demand:</span>
              <span className="capitalize text-sm">{apartment.rentMarketAnalysis.demandLevel}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Neighborhood Data */}
      {apartment.neighborhoodData && (
        <Card className="glass-card dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t.neighborhood}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {apartment.neighborhoodData.safetyScore && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Safety</div>
                  <div className="font-bold text-red-600 dark:text-red-400">
                    {apartment.neighborhoodData.safetyScore}/10
                  </div>
                </div>
              )}
              {apartment.neighborhoodData.walkabilityScore && (
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Walkable</div>
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {apartment.neighborhoodData.walkabilityScore}%
                  </div>
                </div>
              )}
              {apartment.neighborhoodData.transitScore && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Transit</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {apartment.neighborhoodData.transitScore}%
                  </div>
                </div>
              )}
              {apartment.neighborhoodData.populationDensity && (
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Density</div>
                  <div className="font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(apartment.neighborhoodData.populationDensity / 1000)}k/km²
                  </div>
                </div>
              )}
            </div>

            {/* Nearby Amenities */}
            {(apartment.neighborhoodData.nearbySchools || 
              apartment.neighborhoodData.nearbyParks || 
              apartment.neighborhoodData.nearbyRestaurants) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Nearby Amenities</div>
                <div className="flex gap-3 flex-wrap">
                  {apartment.neighborhoodData.nearbySchools > 0 && (
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {apartment.neighborhoodData.nearbySchools} schools
                    </Badge>
                  )}
                  {apartment.neighborhoodData.nearbyParks > 0 && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {apartment.neighborhoodData.nearbyParks} parks
                    </Badge>
                  )}
                  {apartment.neighborhoodData.nearbyRestaurants > 0 && (
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center gap-1">
                      <Utensils className="h-3 w-3" />
                      {apartment.neighborhoodData.nearbyRestaurants} restaurants
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!apartment.propertyTax && !apartment.comparableSales && !apartment.neighborhoodData && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{t.noData}</p>
          </div>
        </div>
      )}
    </div>
  );
}