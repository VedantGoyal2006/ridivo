import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../utils/socket';
import { calculateRouteOSRM } from '../services/geocodeService';
import Map from '../components/Map';
import { Skeleton } from '../components/Skeleton';
import {
  ShieldAlert,
  Car,
  User,
  MapPin,
  Clock,
  Activity,
  Compass
} from 'lucide-react';

export default function PublicSOSTrackingPage() {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [routePolyline, setRoutePolyline] = useState(null);
  const [driverLiveLoc, setDriverLiveLoc] = useState(null);

  useEffect(() => {
    const fetchSOSDetails = async () => {
      try {
        setLoading(true);
        // Call public endpoint
        const res = await axios.get(`http://localhost:5000/api/bookings/${bookingId}/sos/public-details`);
        const data = res.data.details;
        setDetails(data);

        // Fetch OSRM route mapping polyline
        const coords = [
          { lat: parseFloat(data.origin_lat), lng: parseFloat(data.origin_lng) },
          { lat: parseFloat(data.destination_lat), lng: parseFloat(data.destination_lng) }
        ];
        const routeData = await calculateRouteOSRM(coords);
        if (routeData) {
          setRoutePolyline(routeData.polyline);
        }

        // Connect to Socket.IO and listen for live broadcasts
        const socket = getSocket();
        socket.emit('join-ride', data.ride_id);

        socket.on('location-update', (loc) => {
          setDriverLiveLoc({ lat: loc.lat, lng: loc.lng });
        });

      } catch (err) {
        console.error("Public tracking failed:", err);
        setError(err.response?.data?.message || "Emergency safety tracking link has expired or is invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchSOSDetails();

    // Clean up socket listeners on unmount
    return () => {
      const socket = getSocket();
      socket.off('location-update');
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
        <p className="text-sm font-semibold tracking-wide uppercase">Establishing Secure Safety Connection...</p>
        <Skeleton variant="rect" className="h-44 w-full max-w-md bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold">Safety Link Expired</h3>
        <p className="text-xs text-slate-400 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Dynamic Header */}
      <header className="bg-red-950/80 border-b border-red-900/40 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-red-400">Ridivo Safety Monitor</h1>
              <p className="text-[10px] text-red-300 font-semibold uppercase tracking-widest mt-0.5">Emergency SOS Signal Dispatched</p>
            </div>
          </div>
          
          <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Live
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Map preview (7 columns) */}
        <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-4">
          <div className="relative">
            <Map
              height="400px"
              routePolyline={routePolyline}
              markers={[
                { lat: parseFloat(details.origin_lat), lng: parseFloat(details.origin_lng), color: '#10B981', label: 'Start' },
                { lat: parseFloat(details.destination_lat), lng: parseFloat(details.destination_lng), color: '#EF4444', label: 'End' },
                ...(driverLiveLoc ? [{ lat: driverLiveLoc.lat, lng: driverLiveLoc.lng, color: '#0D8AD8', label: 'Live Location', popupText: 'Passenger Current Location' }] : [])
              ]}
              fitBoundsOnChange={!driverLiveLoc}
            />
            
            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full z-50 flex items-center gap-1.5 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-red-500 animate-spin" />
              {driverLiveLoc ? "Receiving live location pings..." : "Awaiting driver mobile location pings..."}
            </div>
          </div>
        </div>

        {/* Right column: Trip details (5 columns) */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Passenger details */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Co-Traveler Info</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-200">
                {details.passenger_name[0]}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{details.passenger_name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Booking ID: <span className="font-mono text-slate-300">{details.booking_id.substring(0,8)}...</span></p>
              </div>
            </div>
          </div>

          {/* Ride / Driver Info */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ride & Vehicle Info</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Driver</span>
                  <span className="font-semibold text-slate-200">{details.driver_name}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Car className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Vehicle Details</span>
                  <span className="font-semibold text-slate-200">
                    {details.vehicle_color || ''} {details.vehicle_name || ''} ({details.vehicle_number || ''})
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Trip Route</span>
                  <span className="font-semibold text-slate-200">{details.origin} ➔ {details.destination}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alert Info */}
          <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-300 rounded-3xl text-[11px] leading-relaxed shadow-lg">
            <p className="font-bold text-red-400">Emergency Protocol Active</p>
            <p className="mt-1">
              Local authorities and Admin coordinators have been alerted with this tracking payload. Keep this browser page open to trace location pings.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}
