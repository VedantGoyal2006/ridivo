import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Premium Custom SVG Markers matching the brand design system
const createMapMarkerIcon = (color = '#093C5D', label = '') => {
  const svgHtml = `
    <div class="relative flex flex-col items-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34" fill="${color}" class="drop-shadow-md">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      ${label ? `<span class="absolute -top-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap border border-slate-700">${label}</span>` : ''}
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [34, 40],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
};

/**
 * Reusable Leaflet Map component supporting marker pins, routes, waypoints, and click selection
 */
export default function Map({
  height = "400px",
  center = [28.6139, 77.2090], // Default Delhi coordinates
  zoom = 6,
  markers = [], // Array of { lat, lng, color, label, popupText }
  routePolyline = null, // Array of [lat, lng] or [[lat, lng], ...]
  onMapClick = null, // Callback for selecting coordinates on map
  interactive = false,
  fitBoundsOnChange = true
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polylineRef = useRef(null);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false // Disable default zoom control to place custom top-right zoom buttons
    }).setView(center, zoom);

    // Standard OpenStreetMap Tile Layer (Free & Free attribution)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add Premium Custom Zoom Control to Top Right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Create group layer for markers
    const markersGroup = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersGroupRef.current = markersGroup;

    // Handle Map Clicks if interactive
    if (interactive && onMapClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onMapClick({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
      });
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polyline dynamically
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    // Add new markers
    const leafletMarkers = [];
    markers.forEach((m) => {
      if (!m.lat || !m.lng) return;
      const icon = createMapMarkerIcon(m.color || '#093C5D', m.label || '');
      const marker = L.marker([m.lat, m.lng], { icon });
      
      if (m.popupText) {
        marker.bindPopup(`<div class="font-sans text-xs font-bold text-slate-800">${m.popupText}</div>`);
      }
      
      marker.addTo(markersGroup);
      leafletMarkers.push(marker);
    });

    // Clear previous polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Add new polyline route
    if (routePolyline && routePolyline.length > 1) {
      const polyline = L.polyline(routePolyline, {
        color: '#0D8AD8', // Primary custom blue
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        dashArray: '2, 8' // Sleek modern dashed line
      }).addTo(map);
      polylineRef.current = polyline;

      if (fitBoundsOnChange) {
        // Smoothly fit bounds to wrap the entire route path
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
    } else if (leafletMarkers.length > 0 && fitBoundsOnChange) {
      // Fit bounds to markers
      const group = L.featureGroup(leafletMarkers);
      map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, routePolyline]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full bg-slate-100 rounded-2xl border border-slate-200 shadow-inner z-10"
      style={{ height }}
    />
  );
}
