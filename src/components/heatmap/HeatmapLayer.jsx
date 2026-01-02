import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points = [], intensity = 0.5 }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Convert points to [lat, lng, intensity] format
    const heatPoints = points.map(p => [p.lat, p.lng, p.intensity || 1]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 35,
      maxZoom: 17,
      max: intensity,
      gradient: {
        0.0: 'blue',
        0.5: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, intensity]);

  return null;
}