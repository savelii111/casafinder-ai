import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PriceChart({ apartments, language = 'en' }) {
  // Group by neighborhood and calculate average price
  const neighborhoodData = apartments.reduce((acc, apt) => {
    const neighborhood = apt.neighborhood || 'Other';
    if (!acc[neighborhood]) {
      acc[neighborhood] = { total: 0, count: 0 };
    }
    acc[neighborhood].total += apt.price;
    acc[neighborhood].count += 1;
    return acc;
  }, {});

  const chartData = Object.entries(neighborhoodData)
    .map(([name, data]) => ({
      name,
      avgPrice: Math.round(data.total / data.count),
      count: data.count
    }))
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, 8);

  const labels = {
    en: { title: 'Average Prices by Neighborhood', price: 'Avg Price (€)', properties: 'Properties' },
    es: { title: 'Precios Promedio por Barrio', price: 'Precio Medio (€)', properties: 'Propiedades' },
    ru: { title: 'Средние Цены по Районам', price: 'Средняя Цена (€)', properties: 'Объекты' }
  };

  const t = labels[language] || labels.en;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgPrice" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name={t.price}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}