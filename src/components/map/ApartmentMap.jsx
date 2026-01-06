import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function createPriceMarker(price, isSelected = false, riskScore = 5) {
  // Color code by risk score (lower is better)
  let bgColor = '#10b981'; // default green
  if (riskScore <= 3) bgColor = '#10b981'; // green - BEST (low risk)
  else if (riskScore <= 6) bgColor = '#f59e0b'; // orange - MEDIUM
  else if (riskScore >= 7) bgColor = '#ef4444'; // red - BAD (high risk)

  if (isSelected) bgColor = '#8b5cf6'; // purple for selected

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        padding: 6px 12px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        white-space: nowrap;
        border: 3px solid white;
        transition: all 0.3s ease;
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
      ">
        €${price?.toLocaleString() || '?'}
      </div>
    `,
    iconSize: [90, 34],
    iconAnchor: [45, 17],
  });
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function ApartmentMap({ 
  apartments = [], 
  center = [40.4168, -3.7038], 
  zoom = 12,
  onApartmentClick,
  selectedId,
  language = 'en'
}) {
  React.useEffect(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🗺️ [STAGE 5: MAP RENDER] Received data');
    console.log(`   Total apartments: ${apartments.length}`);
    console.log(`   With coordinates: ${apartments.filter(a => a.lat && a.lng).length}`);
    console.log('═══════════════════════════════════════════════════════');
    
    if (apartments.length === 20) {
      console.error('🚨 MAP: Received exactly 20 apartments - possible upstream truncation! (Sheets source)');
    }
  }, [apartments]);
  const labels = {
    en: {
      properties: 'properties',
      property: 'property',
      found: 'found',
      viewDetails: 'View Details'
    },
    es: {
      properties: 'propiedades',
      property: 'propiedad',
      found: 'encontradas',
      viewDetails: 'Ver Detalles'
    },
    ru: {
      properties: 'объектов',
      property: 'объект',
      found: 'найдено',
      viewDetails: 'Подробнее'
    }
  };

  const t = labels[language] || labels.en;
  return (
    <motion.div 
      className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >


      {/* Properties Counter */}
      <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {apartments.length} {apartments.length === 1 ? t.property : t.properties}
        </p>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} zoom={zoom} />

        {/* Direct marker rendering - NO CLUSTERING, NO LIMITS */}
        {(() => {
          const markersToRender = apartments.filter(apt => {
            const hasValidLat = apt.lat !== undefined && apt.lat !== null && !isNaN(parseFloat(apt.lat));
            const hasValidLng = apt.lng !== undefined && apt.lng !== null && !isNaN(parseFloat(apt.lng));
            return hasValidLat && hasValidLng;
          });

          console.log('═══════════════════════════════════════════════════════');
          console.log(`🗺️ [STAGE 6: MAP MARKERS] Rendering`);
          console.log(`   Total input: ${apartments.length}`);
          console.log(`   Valid coordinates: ${markersToRender.length}`);
          console.log(`   Will render ${markersToRender.length} markers`);
          console.log('═══════════════════════════════════════════════════════');
          
          if (markersToRender.length === 20 && apartments.length > 20) {
            console.error('🚨 MAP MARKERS: Rendering exactly 20 despite more input!');
          }

          return markersToRender.map((apt) => {
            return (
              <Marker
                key={apt.id}
                position={[parseFloat(apt.lat), parseFloat(apt.lng)]}
                icon={createPriceMarker(apt.price, selectedId === apt.id, apt.riskScore)}
                eventHandlers={{
                  click: () => onApartmentClick?.(apt)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[240px]">
                    {apt.photos?.[0] && (
                      <img 
                        src={apt.photos[0]} 
                        alt={apt.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{apt.title}</h3>
                    <p className="text-lg font-bold text-black mb-1">
                      €{apt.price?.toLocaleString()}{apt.listing_type === 'sale' ? '' : '/mo'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <span>{apt.rooms} rooms</span>
                      <span>•</span>
                      <span>{apt.size}m²</span>
                      {apt.floor && (
                        <>
                          <span>•</span>
                          <span>Floor {apt.floor}</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {/* Risk score badge */}
                      <span className={`px-2 py-0.5 rounded text-xs ${apt.riskScore <= 3 ? 'bg-green-100 text-green-800' : apt.riskScore <= 6 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        Risk {apt.riskScore ?? '—'}
                      </span>
                      {apt.hasElevator && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Elevator</span>
                      )}
                      {apt.furnished && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Furnished</span>
                      )}
                      {apt.pets_allowed && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">Pets OK</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{apt.address}</p>
                    <button
                      onClick={() => onApartmentClick?.(apt)}
                      className="w-full bg-black text-white text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          });
        })()}
      </MapContainer>
    </motion.div>
  );
}