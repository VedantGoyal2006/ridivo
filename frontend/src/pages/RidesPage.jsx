import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    searchRides,
    createRide,
    getMyRides,
    createBooking,
    getBookingsForRide,
    completeRide,
    cancelRide,
    acceptBooking,
    rejectBooking
} from '../services/rideService';
import { searchPlaces, calculateRouteOSRM, reverseGeocode } from '../services/geocodeService';
import axiosInstance from '../utils/axiosInstance';
import Map from '../components/Map';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Skeleton, CardSkeleton } from '../components/Skeleton';
import { toast } from 'react-hot-toast';
import {
    Search,
    PlusCircle,
    Car,
    Calendar,
    Users,
    IndianRupee,
    MapPin,
    Clock,
    Sparkles,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    ClipboardList,
    Star,
    ChevronDown,
    ChevronUp,
    Navigation,
    Route,
    ArrowRight,
    Map as MapIcon,
    Trash2,
    DollarSign
} from "lucide-react";

export default function RidesPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const defaultTab = params.get('tab') || 'search';
    
    const [activeTab, setActiveTab] = useState(defaultTab);

    // ── SEARCH STATE ──
    const [searchForm, setSearchForm] = useState({
        origin: '',
        destination: '',
        date: '',
        seats: 1,
        origin_lat: null,
        origin_lng: null,
        destination_lat: null,
        destination_lng: null
    });
    
    const [searchSuggestions, setSearchSuggestions] = useState({ origin: [], destination: [] });
    const [activeSuggestionField, setActiveSuggestionField] = useState(null); // 'origin' | 'destination'
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedSearchRide, setSelectedSearchRide] = useState(null); // Selected ride to display route on map
    const [searchRouteCoords, setSearchRouteCoords] = useState(null);

    // ── PUBLISH (POST) STATE ──
    const [postForm, setPostForm] = useState({
        vehicle_id: '',
        origin: '',
        destination: '',
        origin_lat: null,
        origin_lng: null,
        destination_lat: null,
        destination_lng: null,
        departure_time: '',
        total_seats: '',
        total_trip_cost: '',
        description: '',
        waypoints: [] // array of { location_name, lat, lng }
    });

    const [postSuggestions, setPostSuggestions] = useState({ origin: [], destination: [], waypoints: {} });
    const [activePostSuggestionField, setActivePostSuggestionField] = useState(null); // 'origin' | 'destination' | waypointIndex
    const [posting, setPosting] = useState(false);
    const [postRouteInfo, setPostRouteInfo] = useState(null); // { polyline, distance, duration }
    const [aiLoading, setAiLoading] = useState(false);

    // ── MY TABS STATE ──
    const [myRides, setMyRides] = useState([]);
    const [myVehicles, setMyVehicles] = useState([]);
    const [expandedRides, setExpandedRides] = useState({});
    const [rideBookings, setRideBookings] = useState({});
    const [loadingBookings, setLoadingBookings] = useState({});

    // Autocomplete input debounces
    const debounceTimeout = useRef(null);

    // ── MAP CLICK INTERACTIVE SELECTION STATE ──
    const [clickedCoords, setClickedCoords] = useState(null);
    const [clickedAddress, setClickedAddress] = useState("");
    const [loadingAddress, setLoadingAddress] = useState(false);

    const handleMapClickSelection = async (coords) => {
        setClickedCoords(coords);
        setLoadingAddress(true);
        setClickedAddress("");
        try {
            const addr = await reverseGeocode(coords.lat, coords.lng);
            setClickedAddress(addr);
        } catch (err) {
            setClickedAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        } finally {
            setLoadingAddress(false);
        }
    };

    useEffect(() => {
        const tab = params.get('tab') || 'search';
        setActiveTab(tab);
    }, [location.search]);

    useEffect(() => {
        if (user) {
            fetchMyRides();
            fetchMyVehicles();
        }
    }, [user]);

    const fetchMyRides = async () => {
        try {
            const data = await getMyRides();
            setMyRides(data.rides || []);
            data.rides?.forEach(ride => {
                fetchRideBookings(ride.id);
            });
        } catch (err) {
            console.error('Failed to fetch rides:', err);
        }
    };

    const fetchMyVehicles = async () => {
        try {
            const response = await axiosInstance.get('/vehicles');
            setMyVehicles(response.data.vehicles || []);
        } catch (err) {
            console.error('Failed to fetch vehicles:', err);
        }
    };

    const fetchRideBookings = async (rideId) => {
        setLoadingBookings(prev => ({ ...prev, [rideId]: true }));
        try {
            const data = await getBookingsForRide(rideId);
            setRideBookings(prev => ({ ...prev, [rideId]: data.bookings || [] }));
        } catch (err) {
            console.error('Failed to fetch ride bookings:', err);
        } finally {
            setLoadingBookings(prev => ({ ...prev, [rideId]: false }));
        }
    };

    const toggleRideExpand = (rideId) => {
        setExpandedRides(prev => ({
            ...prev,
            [rideId]: !prev[rideId]
        }));
    };

    // ── SEARCH INTERACTIVE AUTOCOMPLETE ──
    const handleSearchFieldChange = (e, field) => {
        const val = e.target.value;
        setSearchForm(prev => ({ ...prev, [field]: val }));
        
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (val.length < 3) {
            setSearchSuggestions(prev => ({ ...prev, [field]: [] }));
            return;
        }

        debounceTimeout.current = setTimeout(async () => {
            const places = await searchPlaces(val);
            setSearchSuggestions(prev => ({ ...prev, [field]: places }));
            setActiveSuggestionField(field);
        }, 400);
    };

    const selectSearchSuggestion = (place, field) => {
        setSearchForm(prev => ({
            ...prev,
            [field]: place.name.split(',')[0],
            [`${field}_lat`]: place.lat,
            [`${field}_lng`]: place.lng
        }));
        setSearchSuggestions(prev => ({ ...prev, [field]: [] }));
        setActiveSuggestionField(null);
    };

    // ── RIDE MATCHING SEARCH ──
    const handleSearchSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!searchForm.origin || !searchForm.destination) {
            return toast.error("Please insert travel locations.");
        }

        setSearching(true);
        setSelectedSearchRide(null);
        setSearchRouteCoords(null);
        try {
            const coords = searchForm.origin_lat ? {
                origin_lat: searchForm.origin_lat,
                origin_lng: searchForm.origin_lng,
                destination_lat: searchForm.destination_lat,
                destination_lng: searchForm.destination_lng
            } : null;

            const data = await searchRides(
                searchForm.origin,
                searchForm.destination,
                searchForm.date,
                searchForm.seats,
                coords
            );
            
            setSearchResults(data.rides || []);
            if (data.rides?.length === 0) {
                toast.error('No compatible ride routes found for this search.');
            } else {
                toast.success(`Found ${data.rides?.length} matching rides!`);
            }
        } catch (err) {
            toast.error('Failed to search matching rides.');
        } finally {
            setSearching(false);
        }
    };

    // ── SELECT SEARCH CARD ──
    const handleSelectSearchRide = async (ride) => {
        setSelectedSearchRide(ride);
        
        // Compile coordinates route path
        const coords = [
            { lat: parseFloat(ride.origin_lat), lng: parseFloat(ride.origin_lng) },
            ...(ride.waypoints || []).map(wp => ({ lat: parseFloat(wp.lat), lng: parseFloat(wp.lng) })),
            { lat: parseFloat(ride.destination_lat), lng: parseFloat(ride.destination_lng) }
        ];

        const routeData = await calculateRouteOSRM(coords);
        if (routeData) {
            setSearchRouteCoords(routeData.polyline);
        }
    };

    // ── SEND BOOKING REQUEST ──
    const handleBookRide = async (rideId) => {
        try {
            await createBooking({
                ride_id: rideId,
                seats_booked: parseInt(searchForm.seats || 1)
            });
            toast.success('Your booking request has been sent to the ride creator!');
            // Refresh dashboard lists
            fetchMyRides();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit booking request.');
        }
    };

    // ── PUBLISH RIDE AUTOCOMPLETE ──
    const handlePostFieldChange = (e, field) => {
        const val = e.target.value;
        setPostForm(prev => ({ ...prev, [field]: val }));

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (val.length < 3) {
            setPostSuggestions(prev => ({ ...prev, [field]: [] }));
            return;
        }

        debounceTimeout.current = setTimeout(async () => {
            const places = await searchPlaces(val);
            setPostSuggestions(prev => ({ ...prev, [field]: places }));
            setActivePostSuggestionField(field);
        }, 400);
    };

    const selectPostSuggestion = async (place, field) => {
        const updatedForm = {
            ...postForm,
            [field]: place.name.split(',')[0],
            [`${field}_lat`]: place.lat,
            [`${field}_lng`]: place.lng
        };
        setPostForm(updatedForm);
        setPostSuggestions(prev => ({ ...prev, [field]: [] }));
        setActivePostSuggestionField(null);

        // Recompute route if both origin and destination coordinates are selected
        triggerRouteRecalculation(updatedForm);
    };

    // Waypoints autocompletes
    const handleWaypointFieldChange = (e, index) => {
        const val = e.target.value;
        const newWaypoints = [...postForm.waypoints];
        newWaypoints[index].location_name = val;
        setPostForm(prev => ({ ...prev, waypoints: newWaypoints }));

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (val.length < 3) {
            setPostSuggestions(prev => {
                const wps = { ...prev.waypoints };
                delete wps[index];
                return { ...prev, waypoints: wps };
            });
            return;
        }

        debounceTimeout.current = setTimeout(async () => {
            const places = await searchPlaces(val);
            setPostSuggestions(prev => ({
                ...prev,
                waypoints: { ...prev.waypoints, [index]: places }
            }));
            setActivePostSuggestionField(index);
        }, 400);
    };

    const selectWaypointSuggestion = (place, index) => {
        const newWaypoints = [...postForm.waypoints];
        newWaypoints[index] = {
            location_name: place.name.split(',')[0],
            lat: place.lat,
            lng: place.lng
        };
        const updatedForm = { ...postForm, waypoints: newWaypoints };
        setPostForm(updatedForm);
        
        setPostSuggestions(prev => {
            const wps = { ...prev.waypoints };
            delete wps[index];
            return { ...prev, waypoints: wps };
        });
        setActivePostSuggestionField(null);

        triggerRouteRecalculation(updatedForm);
    };

    const addWaypoint = () => {
        setPostForm(prev => ({
            ...prev,
            waypoints: [...prev.waypoints, { location_name: '', lat: null, lng: null }]
        }));
    };

    const removeWaypoint = (index) => {
        const updatedWps = postForm.waypoints.filter((_, i) => i !== index);
        const updatedForm = { ...postForm, waypoints: updatedWps };
        setPostForm(updatedForm);
        triggerRouteRecalculation(updatedForm);
    };

    const triggerRouteRecalculation = async (formState) => {
        if (!formState.origin_lat || !formState.destination_lat) return;

        const coords = [
            { lat: formState.origin_lat, lng: formState.origin_lng },
            ...formState.waypoints.filter(wp => wp.lat && wp.lng).map(wp => ({ lat: wp.lat, lng: wp.lng })),
            { lat: formState.destination_lat, lng: formState.destination_lng }
        ];

        const routeData = await calculateRouteOSRM(coords);
        if (routeData) {
            setPostRouteInfo(routeData);
        }
    };

    // ── AI COST SHARE ESTIMATOR ──
    const handleAISuggest = async () => {
        if (!postForm.origin || !postForm.destination) {
            return toast.error("Please input travel locations first.");
        }

        setAiLoading(true);
        try {
            // Call the AI suggest-price route
            const res = await axiosInstance.post('/ai/suggest-price', {
                origin: postForm.origin,
                destination: postForm.destination
            });

            // Suggested raw price sharing
            if (res.data && res.data.raw_total) {
                const totalEstimatedCost = res.data.raw_total;
                setPostForm(prev => ({ ...prev, total_trip_cost: totalEstimatedCost }));
                toast.success(`AI suggested total: ₹${res.data.suggested_total}. Details filled!`);
            }
        } catch (err) {
            toast.error("AI Price Calculator is offline. Using standard fallback estimate.");
            // Manual fallback cost estimator (₹7 per km for petrol cost share + mock ₹150 toll)
            if (postRouteInfo) {
                const fallbackCost = Math.round(postRouteInfo.distance * 7 + 150);
                setPostForm(prev => ({ ...prev, total_trip_cost: fallbackCost }));
            }
        } finally {
            setAiLoading(false);
        }
    };

    // ── SUBMIT PUBLISH RIDE ──
    const handlePostRide = async (e) => {
        e.preventDefault();
        if (!postForm.vehicle_id) return toast.error("Please register and select an active vehicle first.");
        if (!postForm.origin_lat || !postForm.destination_lat) return toast.error("Please pick valid map location points.");

        setPosting(true);
        try {
            const rideResponse = await createRide({
                vehicle_id: postForm.vehicle_id,
                origin: postForm.origin,
                destination: postForm.destination,
                origin_lat: postForm.origin_lat,
                origin_lng: postForm.origin_lng,
                destination_lat: postForm.destination_lat,
                destination_lng: postForm.destination_lng,
                departure_time: postForm.departure_time,
                total_seats: postForm.total_seats,
                total_trip_cost: postForm.total_trip_cost,
                description: postForm.description
            });

            const validWps = postForm.waypoints.filter(wp => wp.lat && wp.lng);
            if (validWps.length > 0) {
                await axiosInstance.post(`/rides/${rideResponse.ride.id}/waypoints`, {
                    waypoints: validWps
                });
            }

            toast.success("Your ride has been successfully published!");
            setPostForm({
                vehicle_id: '', origin: '', destination: '',
                origin_lat: null, origin_lng: null, destination_lat: null, destination_lng: null,
                departure_time: '', total_seats: '', total_trip_cost: '', description: '',
                waypoints: []
            });
            setPostRouteInfo(null);
            fetchMyRides();
            navigate('/rides?tab=my');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to publish ride.");
        } finally {
            setPosting(false);
        }
    };

    // ── RIDE ACTIONS (COMPLETE/CANCEL) ──
    const handleCompleteRide = async (rideId) => {
        if (!window.confirm('Mark this ride as completed?')) return;
        try {
            await completeRide(rideId);
            toast.success('Journey completed successfully! Cost splitter settled.');
            fetchMyRides();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete journey.');
        }
    };

    const handleCancelRide = async (rideId) => {
        if (!window.confirm('Cancel this ride? Passengers will be alerted.')) return;
        try {
            await cancelRide(rideId);
            toast.success('Ride cancelled successfully.');
            fetchMyRides();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel ride.');
        }
    };

    // ── AUDITING RIDE BOOKINGS (ACCEPT/REJECT) ──
    const handleAcceptRequest = async (bookingId, rideId) => {
        try {
            await acceptBooking(bookingId);
            toast.success('Passenger seat request accepted!');
            fetchRideBookings(rideId);
            fetchMyRides();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept booking.');
        }
    };

    const handleRejectRequest = async (bookingId, rideId) => {
        try {
            await rejectBooking(bookingId);
            toast.success('Seat request rejected.');
            fetchRideBookings(rideId);
        } catch (err) {
            toast.error('Failed to reject booking.');
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            
            {/* ── HEADER TABS ── */}
            <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'search', label: 'Search Rides', icon: Search },
                    { id: 'post', label: 'Offer a Ride', icon: PlusCircle },
                    { id: 'my', label: 'Offered Trips Queue', icon: Car }
                ].map(t => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            onClick={() => { setActiveTab(t.id); navigate(`/rides?tab=${t.id}`); }}
                            className={`flex items-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
                                activeTab === t.id
                                    ? 'border-primary-600 text-primary-600 font-bold'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* ── TABS RENDERING ── */}
            <div className="space-y-6">

                {/* ── 1. SEARCH RIDES TAB ── */}
                {activeTab === 'search' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* LEFT FORM & LISTING (7 Columns) */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* Search Form Card */}
                            <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {/* Origin Input */}
                                    <div className="relative">
                                        <Input
                                            label="Pickup Origin"
                                            placeholder="Enter start location..."
                                            required
                                            value={searchForm.origin}
                                            onChange={(e) => handleSearchFieldChange(e, 'origin')}
                                            icon={MapPin}
                                        />
                                        {activeSuggestionField === 'origin' && searchSuggestions.origin.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                                                {searchSuggestions.origin.map((place, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => selectSearchSuggestion(place, 'origin')}
                                                        className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl text-slate-700 truncate"
                                                    >
                                                        {place.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Destination Input */}
                                    <div className="relative">
                                        <Input
                                            label="Dropoff Destination"
                                            placeholder="Enter destination..."
                                            required
                                            value={searchForm.destination}
                                            onChange={(e) => handleSearchFieldChange(e, 'destination')}
                                            icon={Navigation}
                                        />
                                        {activeSuggestionField === 'destination' && searchSuggestions.destination.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                                                {searchSuggestions.destination.map((place, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => selectSearchSuggestion(place, 'destination')}
                                                        className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl text-slate-700 truncate"
                                                    >
                                                        {place.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                                    <Input
                                        label="Travel Date"
                                        type="date"
                                        required
                                        value={searchForm.date}
                                        onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                                        icon={Calendar}
                                    />
                                    <Input
                                        label="Requested Seats"
                                        type="number"
                                        min={1}
                                        max={7}
                                        required
                                        value={searchForm.seats}
                                        onChange={(e) => setSearchForm(prev => ({ ...prev, seats: e.target.value }))}
                                        icon={Users}
                                    />
                                    <div className="col-span-2 md:col-span-1">
                                        <Button type="submit" variant="primary" className="w-full" isLoading={searching}>
                                            Search Match
                                        </Button>
                                    </div>
                                </div>
                            </form>

                            {/* Search Results Listing */}
                            <div className="space-y-4">
                                {searching ? (
                                    <>
                                        <CardSkeleton />
                                        <CardSkeleton />
                                    </>
                                ) : searchResults.length === 0 ? (
                                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
                                        <MapIcon className="w-12 h-12 text-slate-300 mx-auto" />
                                        <h4 className="text-sm font-bold text-slate-800 mt-4">Search For Intercity Cost Sharing Rides</h4>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            Search by coordinates to get route path overlap matching.
                                        </p>
                                    </div>
                                ) : (
                                    searchResults.map((ride) => (
                                        <div
                                            key={ride.id}
                                            onClick={() => handleSelectSearchRide(ride)}
                                            className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                                                selectedSearchRide?.id === ride.id ? 'border-primary-500 ring-2 ring-primary-100' : 'border-slate-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-3">
                                                    {ride.profile_pic ? (
                                                        <img src={ride.profile_pic} alt={ride.driver_name} className="w-12 h-12 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                                            {ride.driver_name[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800">{ride.driver_name}</h4>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-bold text-yellow-500">{parseFloat(ride.avg_rating || 0).toFixed(1)}</span>
                                                            <span className="text-[10px] text-slate-400">· {ride.vehicle_name}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className="bg-primary-50 text-primary-600 text-xs font-extrabold px-3 py-1 rounded-full">
                                                        {ride.match_score ? `${ride.match_score}% route match` : 'Route overlap'}
                                                    </span>
                                                    <p className="text-xs font-semibold text-slate-400 mt-1">{ride.available_seats} seats left</p>
                                                </div>
                                            </div>

                                            {/* Route & Times */}
                                            <div className="space-y-1.5 text-xs text-slate-600">
                                                <p className="flex items-center gap-1.5 truncate"><MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" /> <span className="font-bold text-slate-800">Start:</span> {ride.origin}</p>
                                                {ride.waypoints && ride.waypoints.length > 0 && (
                                                    <p className="pl-6 text-[11px] text-primary-500 font-bold truncate">➔ Via: {ride.waypoints.map(w => w.location_name).join(', ')}</p>
                                                )}
                                                <p className="flex items-center gap-1.5 truncate"><Navigation className="w-4 h-4 text-red-500 flex-shrink-0" /> <span className="font-bold text-slate-800">End:</span> {ride.destination}</p>
                                                <p className="flex items-center gap-1.5 mt-2"><Clock className="w-4 h-4 text-slate-400" /> <span className="font-bold text-slate-800">Leaves:</span> {new Date(ride.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            </div>

                                            {/* Price & Book CTA */}
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                <div>
                                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Co-travel Cost Share</span>
                                                    <div className="flex items-baseline gap-1 mt-0.5">
                                                        <span className="text-lg font-extrabold text-slate-800">₹{Math.round(ride.price_per_seat)}</span>
                                                        <span className="text-xs text-slate-400 font-semibold">/ seat</span>
                                                    </div>
                                                </div>
                                                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleBookRide(ride.id); }}>
                                                    Request Seat
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT MAP DISPLAY (5 Columns) */}
                        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4 relative overflow-hidden">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Route className="w-4 h-4 text-primary-600" /> Route Mapping Preview
                                </h4>
                                
                                <Map
                                    height="520px"
                                    interactive={true}
                                    onMapClick={handleMapClickSelection}
                                    routePolyline={searchRouteCoords}
                                    markers={selectedSearchRide ? [
                                        { lat: parseFloat(selectedSearchRide.origin_lat), lng: parseFloat(selectedSearchRide.origin_lng), color: '#10B981', label: 'Origin' },
                                        ...(selectedSearchRide.waypoints || []).map(wp => ({ lat: parseFloat(wp.lat), lng: parseFloat(wp.lng), color: '#F59E0B', label: wp.location_name })),
                                        { lat: parseFloat(selectedSearchRide.destination_lat), lng: parseFloat(selectedSearchRide.destination_lng), color: '#EF4444', label: 'Destination' }
                                    ] : []}
                                />

                                {/* Click Selection Floating Card */}
                                {clickedCoords && activeTab === 'search' && (
                                    <div className="absolute bottom-6 left-6 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-20 space-y-3 animate-fade-in-up">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Selected Point</span>
                                                <p className="text-xs text-slate-700 font-medium mt-0.5 leading-relaxed">
                                                    {loadingAddress ? "Reverse geocoding..." : clickedAddress || "Unknown coordinates"}
                                                </p>
                                            </div>
                                            <button type="button" onClick={() => setClickedCoords(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const cleanAddr = clickedAddress ? clickedAddress.split(',').slice(0, 2).join(',') : `${clickedCoords.lat.toFixed(4)}, ${clickedCoords.lng.toFixed(4)}`;
                                                    setSearchForm(prev => ({
                                                        ...prev,
                                                        origin: cleanAddr,
                                                        origin_lat: clickedCoords.lat,
                                                        origin_lng: clickedCoords.lng
                                                    }));
                                                    setClickedCoords(null);
                                                    toast.success("Departure Origin set!");
                                                }}
                                                className="flex-1 bg-primary-600 text-white font-bold py-2 rounded-xl text-[10px] transition-colors hover:bg-primary-700"
                                                disabled={loadingAddress}
                                            >
                                                Set Origin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const cleanAddr = clickedAddress ? clickedAddress.split(',').slice(0, 2).join(',') : `${clickedCoords.lat.toFixed(4)}, ${clickedCoords.lng.toFixed(4)}`;
                                                    setSearchForm(prev => ({
                                                        ...prev,
                                                        destination: cleanAddr,
                                                        destination_lat: clickedCoords.lat,
                                                        destination_lng: clickedCoords.lng
                                                    }));
                                                    setClickedCoords(null);
                                                    toast.success("Dropoff Destination set!");
                                                }}
                                                className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-[10px] transition-colors hover:bg-emerald-700"
                                                disabled={loadingAddress}
                                            >
                                                Set Destination
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedSearchRide && (
                                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                                        <p className="font-bold text-slate-700">Driver route deviation matching details:</p>
                                        <p className="text-slate-500">· Pickup walking distance: <span className="font-semibold text-slate-800">{selectedSearchRide.pickup_deviation_km || 0} km</span></p>
                                        <p className="text-slate-500">· Dropoff walking distance: <span className="font-semibold text-slate-800">{selectedSearchRide.dropoff_deviation_km || 0} km</span></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 2. OFFER A RIDE TAB ── */}
                {activeTab === 'post' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* LEFT RIDE CREATION FORM (7 Columns) */}
                        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 tracking-tight">Offer seats in your vehicle</h3>
                                <p className="text-xs text-slate-500 mt-1">Split fuel, tolls, and parking costs fairly. No profits, community cost sharing.</p>
                            </div>

                            <form onSubmit={handlePostRide} className="space-y-4">
                                {/* Vehicle Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Select Vehicle</label>
                                    {myVehicles.length === 0 ? (
                                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl text-xs text-yellow-800 font-semibold">
                                            No verified active vehicles in your garage. Go to Profile ➔ Garage tab to register.
                                        </div>
                                    ) : (
                                        <select
                                            value={postForm.vehicle_id}
                                            onChange={(e) => setPostForm(prev => ({ ...prev, vehicle_id: e.target.value }))}
                                            required
                                            className="block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                        >
                                            <option value="">Select vehicle...</option>
                                            {myVehicles.map(v => (
                                                <option key={v.id} value={v.id}>{v.vehicle_name} ({v.vehicle_number})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Origin location */}
                                    <div className="relative">
                                        <Input
                                            label="Trip Origin (Start)"
                                            placeholder="e.g. Delhi Airport"
                                            required
                                            value={postForm.origin}
                                            onChange={(e) => handlePostFieldChange(e, 'origin')}
                                            icon={MapPin}
                                        />
                                        {activePostSuggestionField === 'origin' && postSuggestions.origin.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                                                {postSuggestions.origin.map((place, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => selectPostSuggestion(place, 'origin')}
                                                        className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl text-slate-700 truncate"
                                                    >
                                                        {place.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Destination location */}
                                    <div className="relative">
                                        <Input
                                            label="Trip Destination (End)"
                                            placeholder="e.g. Taj Mahal, Agra"
                                            required
                                            value={postForm.destination}
                                            onChange={(e) => handlePostFieldChange(e, 'destination')}
                                            icon={Navigation}
                                        />
                                        {activePostSuggestionField === 'destination' && postSuggestions.destination.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                                                {postSuggestions.destination.map((place, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => selectPostSuggestion(place, 'destination')}
                                                        className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl text-slate-700 truncate"
                                                    >
                                                        {place.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Waypoint Locations list */}
                                <div className="space-y-2.5 pt-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Intermediary Waypoint Stopovers</label>
                                        <button type="button" onClick={addWaypoint} className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline">
                                            <PlusCircle className="w-4 h-4" /> Add Stop
                                        </button>
                                    </div>

                                    {postForm.waypoints.map((wp, index) => (
                                        <div key={index} className="flex gap-2 items-end relative">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder={`Stop ${index + 1} address...`}
                                                    value={wp.location_name}
                                                    onChange={(e) => handleWaypointFieldChange(e, index)}
                                                    icon={Route}
                                                />
                                                {activePostSuggestionField === index && postSuggestions.waypoints[index] && postSuggestions.waypoints[index].length > 0 && (
                                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                                                        {postSuggestions.waypoints[index].map((place, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => selectWaypointSuggestion(place, index)}
                                                                className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl text-slate-700 truncate"
                                                            >
                                                                {place.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeWaypoint(index)}
                                                className="p-3 bg-slate-50 border border-slate-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <Input
                                        label="Departure Date & Time"
                                        type="datetime-local"
                                        required
                                        value={postForm.departure_time}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, departure_time: e.target.value }))}
                                        icon={Clock}
                                    />
                                    <Input
                                        label="Available Passenger Seats"
                                        type="number"
                                        min={1}
                                        max={7}
                                        required
                                        value={postForm.total_seats}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, total_seats: e.target.value }))}
                                        icon={Users}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <Input
                                        label="Estimated Total Cost (Petrol + Tolls)"
                                        type="number"
                                        required
                                        placeholder="e.g. 1500"
                                        value={postForm.total_trip_cost}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, total_trip_cost: e.target.value }))}
                                        icon={IndianRupee}
                                    />
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="w-full text-primary-600 font-bold border-dashed"
                                            onClick={handleAISuggest}
                                            isLoading={aiLoading}
                                        >
                                            <Sparkles className="w-4 h-4 text-primary-600" /> AI Cost Estimator
                                        </Button>
                                    </div>
                                </div>

                                <Input
                                    label="Travel Notes / Message"
                                    placeholder="e.g., Leaving early, luggage space available, splitting petrol..."
                                    value={postForm.description || ''}
                                    onChange={(e) => setPostForm(prev => ({ ...prev, description: e.target.value }))}
                                    icon={Info}
                                />

                                <div className="pt-4">
                                    <Button type="submit" variant="primary" className="w-full" isLoading={posting}>
                                        Publish Ride Offer
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT MAP ROUTE PLOTTING (5 Columns) */}
                        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4 relative overflow-hidden">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <MapIcon className="w-4 h-4 text-primary-600" /> Active Trip Polyline Map
                                </h4>

                                <Map
                                    height="520px"
                                    interactive={true}
                                    onMapClick={handleMapClickSelection}
                                    routePolyline={postRouteInfo?.polyline}
                                    markers={[
                                        ...(postForm.origin_lat ? [{ lat: postForm.origin_lat, lng: postForm.origin_lng, color: '#10B981', label: 'Origin' }] : []),
                                        ...postForm.waypoints.filter(wp => wp.lat && wp.lng).map(wp => ({ lat: wp.lat, lng: wp.lng, color: '#F59E0B', label: wp.location_name })),
                                        ...(postForm.destination_lat ? [{ lat: postForm.destination_lat, lng: postForm.destination_lng, color: '#EF4444', label: 'Destination' }] : [])
                                    ]}
                                />

                                {/* Click Selection Floating Card */}
                                {clickedCoords && activeTab === 'post' && (
                                    <div className="absolute bottom-6 left-6 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-20 space-y-3 animate-fade-in-up">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Selected Point</span>
                                                <p className="text-xs text-slate-700 font-medium mt-0.5 leading-relaxed">
                                                    {loadingAddress ? "Reverse geocoding..." : clickedAddress || "Unknown coordinates"}
                                                </p>
                                            </div>
                                            <button type="button" onClick={() => setClickedCoords(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const cleanAddr = clickedAddress ? clickedAddress.split(',').slice(0, 2).join(',') : `${clickedCoords.lat.toFixed(4)}, ${clickedCoords.lng.toFixed(4)}`;
                                                    const updated = {
                                                        ...postForm,
                                                        origin: cleanAddr,
                                                        origin_lat: clickedCoords.lat,
                                                        origin_lng: clickedCoords.lng
                                                    };
                                                    setPostForm(updated);
                                                    triggerRouteRecalculation(updated);
                                                    setClickedCoords(null);
                                                    toast.success("Departure Origin set!");
                                                }}
                                                className="bg-primary-600 text-white font-bold py-2 rounded-xl text-[9px] text-center transition-colors hover:bg-primary-700"
                                                disabled={loadingAddress}
                                            >
                                                Set Start
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const cleanAddr = clickedAddress ? clickedAddress.split(',').slice(0, 2).join(',') : `${clickedCoords.lat.toFixed(4)}, ${clickedCoords.lng.toFixed(4)}`;
                                                    const updated = {
                                                        ...postForm,
                                                        destination: cleanAddr,
                                                        destination_lat: clickedCoords.lat,
                                                        destination_lng: clickedCoords.lng
                                                    };
                                                    setPostForm(updated);
                                                    triggerRouteRecalculation(updated);
                                                    setClickedCoords(null);
                                                    toast.success("Dropoff Destination set!");
                                                }}
                                                className="bg-emerald-600 text-white font-bold py-2 rounded-xl text-[9px] text-center transition-colors hover:bg-emerald-700"
                                                disabled={loadingAddress}
                                            >
                                                Set End
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const name = clickedAddress ? clickedAddress.split(',')[0] : `Stop ${postForm.waypoints.length + 1}`;
                                                    const updated = {
                                                        ...postForm,
                                                        waypoints: [...postForm.waypoints, { location_name: name, lat: clickedCoords.lat, lng: clickedCoords.lng }]
                                                    };
                                                    setPostForm(updated);
                                                    triggerRouteRecalculation(updated);
                                                    setClickedCoords(null);
                                                    toast.success("Waypoint Stop added!");
                                                }}
                                                className="bg-amber-600 text-white font-bold py-2 rounded-xl text-[9px] text-center transition-colors hover:bg-amber-700"
                                                disabled={loadingAddress}
                                            >
                                                Add Stop
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {postRouteInfo && (
                                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Distance</span>
                                            <span className="text-sm font-bold text-slate-800">{postRouteInfo.distance} km</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Duration</span>
                                            <span className="text-sm font-bold text-slate-800">
                                                {Math.floor(postRouteInfo.duration / 60) > 0 ? `${Math.floor(postRouteInfo.duration / 60)}h ` : ''}
                                                {postRouteInfo.duration % 60}m
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 3. OFFERED TRIPS QUEUE TAB ── */}
                {activeTab === 'my' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 tracking-tight">Your Published Trips</h3>
                            <p className="text-xs text-slate-500 mt-1">Review traveler seat requests, start journeys, or complete split settlements.</p>
                        </div>

                        {myRides.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
                                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                                <h4 className="text-sm font-bold text-slate-800 mt-4">No rides published yet</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    Click "Offer a Ride" tab to register your first intercity trip.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myRides.map((ride) => {
                                    const expanded = expandedRides[ride.id];
                                    const bookings = rideBookings[ride.id] || [];
                                    const loadingBook = loadingBookings[ride.id];
                                    
                                    return (
                                        <div key={ride.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 transition-all">
                                            
                                            {/* Ride Summary Header */}
                                            <div className="flex justify-between items-start flex-wrap gap-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        {ride.origin} ➔ {ride.destination}
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                            ride.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                                            ride.status === 'COMPLETED' ? 'bg-primary-50 text-primary-600' :
                                                            ride.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' : 'bg-yellow-50 text-yellow-600'
                                                        }`}>
                                                            {ride.status}
                                                        </span>
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        Leaves: <span className="font-semibold text-slate-700">{new Date(ride.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {ride.status === 'ACTIVE' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleCancelRide(ride.id)}>
                                                                Cancel Ride
                                                            </Button>
                                                            <Button variant="primary" size="sm" onClick={() => handleCompleteRide(ride.id)}>
                                                                Mark Completed
                                                            </Button>
                                                        </>
                                                    )}
                                                    
                                                    <button onClick={() => toggleRideExpand(ride.id)} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                                                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable Booking Request Details */}
                                            {expanded && (
                                                <div className="border-t border-slate-100 pt-4 space-y-4 animate-fade-in">
                                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passenger Booking Requests</h5>
                                                    
                                                    {loadingBook ? (
                                                        <Skeleton variant="text" className="h-10 w-full" />
                                                    ) : bookings.length === 0 ? (
                                                        <p className="text-xs text-slate-500">No seat requests received for this trip yet.</p>
                                                    ) : (
                                                        <div className="divide-y divide-slate-100">
                                                            {bookings.map((book) => (
                                                                <div key={book.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                                                                    <div className="flex items-center gap-3">
                                                                        {book.traveler_pic ? (
                                                                            <img src={book.traveler_pic} alt={book.traveler_name} className="w-10 h-10 rounded-xl object-cover" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs">
                                                                                {book.traveler_name[0]}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                                                {book.traveler_name}
                                                                                <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                                                                                    {book.status}
                                                                                </span>
                                                                            </h5>
                                                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                                                Requested: <span className="font-semibold text-slate-700">{book.seats_booked} seat(s)</span> · Fare share: <span className="font-bold text-slate-700">₹{Math.round(book.total_fare)}</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {book.status === 'PENDING' && (
                                                                        <div className="flex gap-2">
                                                                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 text-xs" onClick={() => handleRejectRequest(book.id, ride.id)}>
                                                                                Reject
                                                                            </Button>
                                                                            <Button variant="success" size="sm" className="text-xs" onClick={() => handleAcceptRequest(book.id, ride.id)}>
                                                                                Accept
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                             )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
