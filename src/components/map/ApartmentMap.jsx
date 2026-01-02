import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from "framer-motion";
import { Home, MapPin } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function createPriceMarker(price, riskScore) {
  const color = riskScore <= 3 ? '#22c55e' : riskScore <= 6 ? '#f59e0b' : '#ef4444';
  
  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        white-space: nowrap;
        border: 2px solid white;
      ">
        €${price?.toLocaleString() || '?'}
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
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
  selectedId 
}) {
  return (
    <motion.div 
      className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-4 left-4 z-[1000] backdrop-blur-xl bg-white/80 rounded-xl px-4 py-2 shadow-lg border border-white/20">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">
            {apartments.length} properties found
          </span>
        </div>
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
        
        {apartments.map((apt) => (
          apt.lat && apt.lng && (
            <Marker
              key={apt.id}
              position={[apt.lat, apt.lng]}
              icon={createPriceMarker(apt.price, apt.riskScore)}
              eventHandlers={{
                click: () => onApartmentClick?.(apt)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  {apt.photos?.[0] && (
                    <img 
                      src={apt.photos[0]} 
                      alt={apt.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 text-sm">{apt.title}</h3>
                  <p className="text-lg font-bold text-black">€{apt.price?.toLocaleString()}/mo</p>
                  <p className="text-xs text-gray-500 mt-1">{apt.address}</p>
                  {apt.aiInsight && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{apt.aiInsight}</p>
                  )}
                  <button
                    onClick={() => onApartmentClick?.(apt)}
                    className="w-full mt-2 bg-black text-white text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </motion.div>
  );
}