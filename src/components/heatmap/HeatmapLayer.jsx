import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ apartments, type = 'price' }) {
  const map = useMap();

  useEffect(() => {
    if (!apartments || apartments.length === 0) return;

    // Prepare data points based on type
    const points = apartments
      .filter(apt => apt.lat && apt.lng)
      .map(apt => {
        const intensity = type === 'price' 
          ? Math.min(apt.price / 2000, 1) // Normalize price 0-1
          : type === 'risk'
          ? (apt.riskScore || 5) / 10 // Normalize risk 0-1
          : 0.5;

        return [apt.lat, apt.lng, intensity];
      });

    if (points.length === 0) return;

    // Create heatmap layer
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 35,
      maxZoom: 17,
      max: 1.0,
      gradient: type === 'price' 
        ? { 0.0: 'green', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red' }
        : type === 'risk'
        ? { 0.0: 'blue', 0.3: 'green', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
        : { 0.0: 'blue', 0.5: 'cyan', 1.0: 'lime' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [apartments, type, map]);

  return null;
}