import axios from 'axios';

/**
 * OpenStreetMap Nominatim Geocoding & Routing Services
 */

// Search location autocomplete using Nominatim API (Defaults search to India)
export const searchPlaces = async (query) => {
  if (!query || query.length < 3) return [];
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        countrycodes: 'in', // Restrict to India intercity points
        limit: 5
      },
      headers: {
        'Accept-Language': 'en'
      }
    });
    return response.data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city: item.address.city || item.address.town || item.address.state_district || item.address.state
    }));
  } catch (err) {
    console.error("Geocoding failed:", err);
    return [];
  }
};

// Calculate route route points (polyline list), distance, and duration using OSRM OSRM Routing API
export const calculateRouteOSRM = async (coordinates) => {
  // coordinates parameter is an array of {lat, lng} objects, at least 2 points
  if (!coordinates || coordinates.length < 2) return null;
  
  try {
    // Format coordinate pairs as "lng,lat;lng,lat"
    const coordString = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}`;
    
    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: false
      }
    });

    if (response.data.code !== 'Ok') {
      throw new Error("OSRM path finding failed");
    }

    const route = response.data.routes[0];
    // Convert GeoJSON Coordinates [lng, lat] to Leaflet polyline format [lat, lng]
    const polyline = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    const distanceKm = route.distance / 1000;
    const durationMinutes = route.duration / 60;

    return {
      polyline,
      distance: Math.round(distanceKm * 10) / 10, // round to 1 decimal
      duration: Math.round(durationMinutes),
      summary: route.legs.map(leg => leg.summary).filter(Boolean).join(' -> ')
    };
  } catch (err) {
    console.error("Routing calculation failed:", err);
    // Simple line fallback between coordinates if OSRM is offline
    return {
      polyline: coordinates.map(c => [c.lat, c.lng]),
      distance: Math.round(coordinates.reduce((acc, curr, idx) => {
        if (idx === 0) return acc;
        const prev = coordinates[idx - 1];
        // Calculate basic straight distance
        const R = 6371;
        const dLat = (curr.lat - prev.lat) * Math.PI / 180;
        const dLon = (curr.lng - prev.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(prev.lat*Math.PI/180) * Math.cos(curr.lat*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return acc + (R * c);
      }, 0) * 10) / 10,
      duration: Math.round(coordinates.length * 45), // Mock 45 mins per segment
      summary: "Direct coordinates route fallback"
    };
  }
};

// Reverse geocode lat, lng to a location name using Nominatim
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'Accept-Language': 'en'
      }
    });
    const addr = response.data.address;
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || addr.state;
    return response.data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};
