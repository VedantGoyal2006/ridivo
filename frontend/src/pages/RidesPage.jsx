import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    searchRides,
    createRide,
    getMyRides,
    createBooking,
    getBookingsForRide,
    getMyBookings,
    completeRide,
    cancelRide
} from '../services/rideService';
import axiosInstance from '../utils/axiosInstance';
import {
  Search,
  PlusCircle,
  Car,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  Flag,
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
} from "lucide-react";

const theme = {
    bgCard: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#093C5D',
    textSecondary: '#6B7280',
    accent: '#3B7597',
    accentDark: '#093C5D',
    accentLight: '#EFF6FF',
    success: '#10B981',
    successBg: '#EFFDF4',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
};

const badgeStyle = (status) => {
    const map = {
        ACTIVE: { bg: theme.successBg, color: theme.success },
        FULL: { bg: theme.dangerBg, color: theme.danger },
        CANCELLED: { bg: '#F3F4F6', color: theme.textSecondary },
        COMPLETED: { bg: theme.accentLight, color: theme.accentDark },
        ONGOING: { bg: theme.warningBg, color: theme.warning },
    };
    return map[status] || { bg: '#F3F4F6', color: theme.textSecondary };
};

export default function RidesPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const defaultTab = params.get('tab') || 'search';
    
    // Parse query params for search redirection from Dashboard
    const initialOrigin = params.get('origin') || '';
    const initialDestination = params.get('destination') || '';

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [searchForm, setSearchForm] = useState({
        origin: initialOrigin, destination: initialDestination, date: '', seats: 1
    });
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [postForm, setPostForm] = useState({
        vehicle_id: '', origin: '', destination: '',
        departure_time: '', total_seats: '',
        total_trip_cost: '', description: '',
        waypoints: []
    });
    const [posting, setPosting] = useState(false);

    const [myRides, setMyRides] = useState([]);
    const [myVehicles, setMyVehicles] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [expandedRides, setExpandedRides] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rideBookings, setRideBookings] = useState({});
    const [loadingBookings, setLoadingBookings] = useState({});
    const [aiLoading, setAiLoading] = useState(false);

    const toggleRideExpand = (rideId) => {
        setExpandedRides(prev => ({
            ...prev,
            [rideId]: !prev[rideId]
        }));
    };

    const handleCompleteRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to mark this ride as completed?')) return;
        try {
            setError('');
            setSuccess('');
            await completeRide(rideId);
            setSuccess('Ride marked as completed successfully!');
            await fetchMyRides();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete ride');
        }
    };

    const handleCancelRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to cancel this ride? Co-travelers will be notified.')) return;
        try {
            setError('');
            setSuccess('');
            await cancelRide(rideId);
            setSuccess('Ride cancelled successfully!');
            await fetchMyRides();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel ride');
        }
    };

    const fetchMyBookings = async () => {
        try {
            const data = await getMyBookings();
            setMyBookings(data.bookings || []);
        } catch (err) {
            console.error('Failed to fetch traveler bookings:', err);
        }
    };
    const [aiSuggestion, setAiSuggestion] = useState(null);

    // Sync tab with URL search parameter changes
    useEffect(() => {
        const tab = params.get('tab') || 'search';
        setActiveTab(tab);
    }, [location.search]);

    useEffect(() => {
        if (user) {
            fetchMyRides();
            fetchMyVehicles();
            fetchMyBookings();
        }
    }, [user]);

    // Perform auto search if redirect params are present
    useEffect(() => {
        if (initialOrigin && initialDestination) {
            autoSearch();
        }
    }, [initialOrigin, initialDestination]);

    const autoSearch = async () => {
        setSearching(true);
        setError('');
        try {
            const data = await searchRides(initialOrigin, initialDestination, '', 1);
            setSearchResults(data.rides);
            if (data.rides.length === 0) {
                setError('No rides found for this route');
            }
        } catch (err) {
            setError('Failed to search rides');
        }
        setSearching(false);
    };

    const fetchMyRides = async () => {
        try {
            const data = await getMyRides();
            setMyRides(data.rides);
            data.rides.forEach(ride => {
                fetchRideBookings(ride.id);
            });
        } catch (err) {
            console.error('Failed to fetch rides');
        }
    };

    const fetchMyVehicles = async () => {
        try {
            const response = await axiosInstance.get('/vehicles');
            setMyVehicles(response.data.vehicles);
        } catch (err) {
            console.error('Failed to fetch vehicles');
        }
    };

    const fetchRideBookings = async (rideId) => {
        setLoadingBookings(prev => ({ ...prev, [rideId]: true }));
        try {
            const data = await getBookingsForRide(rideId);
            setRideBookings(prev => ({ ...prev, [rideId]: data.bookings }));
        } catch (err) {
            console.error('Failed to fetch ride bookings');
        }
        setLoadingBookings(prev => ({ ...prev, [rideId]: false }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setSearching(true);
        setSearchResults([]);
        try {
            const data = await searchRides(
                searchForm.origin,
                searchForm.destination,
                searchForm.date,
                searchForm.seats
            );
            setSearchResults(data.rides);
            if (data.rides.length === 0) {
                setError('No rides found for this route');
            }
        } catch (err) {
            setError('Failed to search rides');
        }
        setSearching(false);
    };

    const handlePostRide = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setPosting(true);
        try {
            const rideData = { ...postForm };
            const response = await createRide(rideData);

            if (postForm.waypoints && postForm.waypoints.length > 0) {
                const validWaypoints = postForm.waypoints.filter(wp => wp.location_name.trim() !== '');
                if (validWaypoints.length > 0) {
                    await axiosInstance.post(`/rides/${response.ride.id}/waypoints`, {
                        waypoints: validWaypoints
                    });
                }
            }

            setSuccess('Ride posted successfully!');
            setPostForm({
                vehicle_id: '', origin: '', destination: '',
                departure_time: '', total_seats: '',
                total_trip_cost: '', description: '',
                waypoints: []
            });
            await fetchMyRides();
            navigate('/rides?tab=my');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post ride');
        }
        setPosting(false);
    };

    const handleBookRide = async (rideId) => {
        try {
            setError('');
            await createBooking({
                ride_id: rideId,
                seats_booked: parseInt(searchForm.seats || 1)
            });
            setSuccess('Booking request sent successfully!');
            fetchMyBookings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book ride');
        }
    };

    const addWaypoint = () => {
        setPostForm({
            ...postForm,
            waypoints: [...postForm.waypoints, { location_name: '', lat: null, lng: null }]
        });
    };

    const removeWaypoint = (index) => {
        setPostForm({
            ...postForm,
            waypoints: postForm.waypoints.filter((_, i) => i !== index)
        });
    };

    const updateWaypoint = (index, value) => {
        const newWaypoints = [...postForm.waypoints];
        newWaypoints[index].location_name = value;
        setPostForm({ ...postForm, waypoints: newWaypoints });
    };

    const handleAISuggest = async () => {
        setAiLoading(true);
        setAiSuggestion(null);
        try {
            const response = await axiosInstance.post('/ai/suggest-price', {
                origin: postForm.origin,
                destination: postForm.destination
            });
            setAiSuggestion(response.data);
        } catch (err) {
            setError('AI suggestion failed. Please enter price manually.');
            console.error('AI error:', err);
        }
        setAiLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '11px 14px',
        border: `1.5px solid ${theme.border}`,
        borderRadius: '10px',
        fontSize: '14px',
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none',
        color: theme.textPrimary,
        backgroundColor: '#F9FAFB',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: theme.textSecondary,
        marginBottom: '8px',
        fontFamily: "'DM Sans', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Hero Header */}
                <div style={{
                    background: `linear-gradient(135deg, ${theme.accentDark} 0%, ${theme.accent} 100%)`,
                    borderRadius: '20px',
                    padding: '36px 32px',
                    marginBottom: '28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(9, 60, 93, 0.05)',
                }}>
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)', borderRadius: '50%' }} />
                    
                    <div style={{ position: 'relative', zIndex: 1, color: "white" }}>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '28px', fontWeight: '800', color: 'white', margin: '0 0 8px' }}>
                            🚙 Find Your Perfect Ride
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>
                            Share rides, split costs fairly, and travel smarter across India.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {[
                                { value: '10K+', label: 'Happy Travelers' },
                                { value: '5K+', label: 'Rides Shared' },
                                { value: '4.8★', label: 'Avg Rating' },
                            ].map((stat) => (
                                <div key={stat.label} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 18px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', backgroundColor: 'rgba(9,60,93,0.03)', padding: '4px', borderRadius: '12px', border: `1px solid ${theme.border}`, width: 'fit-content' }}>
                    {[
                        { id: 'search', label: 'Find a Ride', icon: Search },
                        { id: 'post', label: 'Offer a Ride', icon: PlusCircle },
                        { id: 'my', label: 'My Rides', icon: ClipboardList },
                    ].map((tab) => {
                        const IconComp = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { navigate(`/rides?tab=${tab.id}`); setError(''); setSuccess(''); }}
                                style={{
                                    padding: '9px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '13.5px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.2s ease',
                                    backgroundColor: isActive ? theme.bgCard : 'transparent',
                                    color: isActive ? theme.textPrimary : theme.textSecondary,
                                    boxShadow: isActive ? `0 4px 10px rgba(9, 60, 93, 0.03)` : 'none',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <IconComp size={14} style={{ color: isActive ? theme.textPrimary : theme.textSecondary }} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Status Messages */}
                {error && (
                    <div style={{ backgroundColor: theme.dangerBg, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: theme.danger, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: "600" }}>
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div style={{ backgroundColor: theme.successBg, border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: theme.success, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: "600" }}>
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                {/* ── SEARCH TAB ── */}
                {activeTab === 'search' && (
                    <div>
                        <div style={{ backgroundColor: theme.bgCard, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(9, 60, 93, 0.01)' }}>
                            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 20px' }}>Search Available Rides</h2>
                            <form onSubmit={handleSearch}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>From</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '0 14px', backgroundColor: '#F9FAFB' }}>
                                            <MapPin size={16} style={{ color: theme.textSecondary }} />
                                            <input placeholder="Departure city (e.g. Indore)" value={searchForm.origin} onChange={(e) => setSearchForm({ ...searchForm, origin: e.target.value })} required style={{ ...inputStyle, border: "none", padding: "12px 0", background: "transparent" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>To</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '0 14px', backgroundColor: '#F9FAFB' }}>
                                            <Flag size={16} style={{ color: theme.textSecondary }} />
                                            <input placeholder="Destination city (e.g. Bhopal)" value={searchForm.destination} onChange={(e) => setSearchForm({ ...searchForm, destination: e.target.value })} required style={{ ...inputStyle, border: "none", padding: "12px 0", background: "transparent" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Date</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '0 14px', backgroundColor: '#F9FAFB' }}>
                                            <Calendar size={16} style={{ color: theme.textSecondary }} />
                                            <input type="date" value={searchForm.date} onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })} required style={{ ...inputStyle, border: "none", padding: "12px 0", background: "transparent" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Seats Needed</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '0 14px', backgroundColor: '#F9FAFB' }}>
                                            <Users size={16} style={{ color: theme.textSecondary }} />
                                            <input type="number" min="1" value={searchForm.seats} onChange={(e) => setSearchForm({ ...searchForm, seats: e.target.value })} required style={{ ...inputStyle, border: "none", padding: "12px 0", background: "transparent" }} />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={searching} style={{ width: '100%', padding: '13px', backgroundColor: theme.textPrimary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: searching ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(9, 60, 93, 0.15)' }}>
                                    {searching ? 'Searching...' : '🔍 Search Rides'}
                                </button>
                            </form>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div>
                                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px' }}>
                                    {searchResults.length} Ride{searchResults.length > 1 ? 's' : ''} Found
                                </h2>
                                {searchResults.map((ride) => (
                                    <div key={ride.id} style={{ backgroundColor: theme.bgCard, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '20px 24px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(9,60,93,0.01)', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 60, 93, 0.04)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(9,60,93,0.01)'; }}
                                    >
                                        {/* Route header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>{ride.origin}</span>
                                            <span style={{ color: theme.accent, fontSize: '18px', fontWeight: "700" }}>→</span>
                                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>{ride.destination}</span>
                                            <span style={{ marginLeft: 'auto', padding: '6px 14px', backgroundColor: theme.accentLight, color: theme.textPrimary, borderRadius: '100px', fontSize: '13px', fontWeight: '700', border: `1px solid rgba(9, 60, 93, 0.08)` }}>
                                                ₹{ride.price_per_seat}/seat
                                            </span>
                                        </div>

                                        {/* Stops Along the Route */}
                                        {ride.waypoints && ride.waypoints.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', backgroundColor: theme.accentLight, borderRadius: '10px', border: `1px solid rgba(9, 60, 93, 0.04)`, marginBottom: '16px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: '700', textTransform: "uppercase" }}>📍 Route:</span>
                                                <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: "600" }}>{ride.origin}</span>
                                                {ride.waypoints.map((wp) => (
                                                    <span key={wp.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                        <span style={{ fontSize: '11px', color: theme.textPrimary, backgroundColor: 'white', padding: '2px 8px', borderRadius: '100px', border: `1px solid ${theme.border}`, fontWeight: "500" }}>
                                                            {wp.location_name}
                                                        </span>
                                                    </span>
                                                ))}
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                    <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: "600" }}>{ride.destination}</span>
                                                </span>
                                            </div>
                                        )}

                                        {/* Details row */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                            {[
                                                { icon: Clock, text: new Date(ride.departure_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) },
                                                { icon: Users, text: `${ride.available_seats} seats available` },
                                                { icon: Car, text: `${ride.vehicle_name} · ${ride.vehicle_number}` },
                                            ].map((detail, index) => {
                                                const IconComp = detail.icon;
                                                return (
                                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '10px 12px', border: `1px solid ${theme.border}` }}>
                                                        <IconComp size={14} style={{ color: theme.textSecondary }} />
                                                        <span style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: "600" }}>{detail.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Driver details + booking action */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${theme.border}`, paddingTop: "16px" }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: 'white' }}>
                                                    {ride.driver_name?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: theme.textPrimary }}>{ride.driver_name}</div>
                                                    <div style={{ fontSize: '11.5px', color: theme.textSecondary, display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <Star size={11.5} fill="#FCD34D" stroke="#FCD34D" />
                                                        <span>{ride.avg_rating} · Driver</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user && ride.driver_id !== user.id && (() => {
                                                const existingBooking = myBookings.find(b => b.ride_id === ride.id);
                                                
                                                let buttonText = "Book Ride";
                                                let isDisabled = false;
                                                let buttonStyle = {
                                                    padding: '10px 20px',
                                                    backgroundColor: theme.textPrimary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    fontFamily: "'DM Sans', sans-serif",
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: "0 4px 10px rgba(9, 60, 93, 0.15)"
                                                };

                                                if (existingBooking) {
                                                    isDisabled = true;
                                                    if (existingBooking.status === 'PENDING') {
                                                        buttonText = "Request Sent";
                                                        buttonStyle = {
                                                            ...buttonStyle,
                                                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                            color: '#10B981',
                                                            border: '1px solid rgba(16, 185, 129, 0.25)',
                                                            cursor: 'not-allowed',
                                                            boxShadow: 'none'
                                                        };
                                                    } else if (existingBooking.status === 'ACCEPTED') {
                                                        buttonText = "Booked";
                                                        buttonStyle = {
                                                            ...buttonStyle,
                                                            backgroundColor: '#10B981',
                                                            color: 'white',
                                                            cursor: 'not-allowed',
                                                            boxShadow: 'none'
                                                        };
                                                    } else if (existingBooking.status === 'REJECTED') {
                                                        buttonText = "Rejected";
                                                        buttonStyle = {
                                                            ...buttonStyle,
                                                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                                            color: '#EF4444',
                                                            border: '1px solid rgba(239, 68, 68, 0.25)',
                                                            cursor: 'not-allowed',
                                                            boxShadow: 'none'
                                                        };
                                                    }
                                                }

                                                return (
                                                    <button 
                                                        onClick={() => !isDisabled && handleBookRide(ride.id)} 
                                                        disabled={isDisabled}
                                                        style={buttonStyle}
                                                        onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.backgroundColor = '#07304b'; }}
                                                        onMouseLeave={(e) => { if (!isDisabled) e.currentTarget.style.backgroundColor = theme.textPrimary; }}
                                                    >
                                                        {buttonText}
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── POST RIDE TAB ── */}
                {activeTab === 'post' && user && (
                    <div style={{ backgroundColor: theme.bgCard, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '28px', boxShadow: '0 4px 20px rgba(9, 60, 93, 0.01)' }}>
                        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 24px' }}>Offer a Ride</h2>

                        <form onSubmit={handlePostRide}>
                            {/* Vehicle selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Select Vehicle</label>
                                <select value={postForm.vehicle_id} onChange={(e) => setPostForm({ ...postForm, vehicle_id: e.target.value })} required style={inputStyle}>
                                    <option value="">Choose registered vehicle</option>
                                    {myVehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.vehicle_name} · {v.vehicle_number} ({v.vehicle_type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Origin & Destination */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>From</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '0 14px', backgroundColor: '#F9FAFB' }}>
                                        <MapPin size={16} style={{ color: theme.textSecondary }} />
                                        <input placeholder="Origin city" value={postForm.origin} onChange={(e) => { setPostForm({ ...postForm, origin: e.target.value }); setAiSuggestion(null); }} required style={{ ...inputStyle, border: "none", padding: "12px 0", background: "transparent" }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>To</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '0 14px', backgroundColor: '#F9FAFB' }}>
                                        <Flag size={16} style={{ color: theme.textSecondary }} />
                                        <input placeholder="Destination city" value={postForm.destination} onChange={(e) => { setPostForm({ ...postForm, destination: e.target.value }); setAiSuggestion(null); }} required style={{ ...inputStyle, border: "none", padding: "12px 0", background: "transparent" }} />
                                    </div>
                                </div>

                                {/* AI suggestions */}
                                <div style={{ gridColumn: 'span 2' }}>
                                    <button
                                        type="button"
                                        onClick={handleAISuggest}
                                        disabled={!postForm.origin || !postForm.destination || aiLoading}
                                        style={{
                                            width: '100%', padding: '11px',
                                            backgroundColor: aiLoading ? theme.accentLight : 'rgba(9, 60, 93, 0.03)',
                                            color: theme.textPrimary,
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: '10px', fontSize: '13.5px',
                                            fontWeight: '700', cursor: (!postForm.origin || !postForm.destination) ? 'not-allowed' : 'pointer',
                                            fontFamily: "'DM Sans', sans-serif",
                                            transition: 'all 0.2s ease',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '8px',
                                        }}
                                    >
                                        <Sparkles size={16} /> {aiLoading ? 'Calculating suggested fare...' : 'AI Price Suggestion'}
                                    </button>
                                </div>

                                {aiSuggestion && (
                                    <div style={{
                                        gridColumn: 'span 2',
                                        padding: '20px',
                                        backgroundColor: theme.accentLight,
                                        borderRadius: '12px',
                                        border: `1px solid rgba(9, 60, 93, 0.1)`,
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Sparkles size={14} /> AI Price Suggestion
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                            {[
                                                { label: 'Distance', value: aiSuggestion.distance },
                                                { label: 'Est. Fuel Cost', value: aiSuggestion.petrol_cost },
                                                { label: 'Est. Tolls', value: aiSuggestion.toll_cost },
                                            ].map((item) => (
                                                <div key={item.label} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px', border: `1px solid ${theme.border}` }}>
                                                    <div style={{ fontSize: '10px', color: theme.textSecondary, fontWeight: "600", textTransform: "uppercase", marginBottom: '4px' }}>{item.label}</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyStyle: "space-between", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                            <div>
                                                <div style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: "600" }}>Suggested Total Trip Cost</div>
                                                <div style={{ fontSize: '22px', fontWeight: '800', color: theme.textPrimary, fontFamily: "'Sora', sans-serif" }}>
                                                    {aiSuggestion.suggested_total}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPostForm({ ...postForm, total_trip_cost: aiSuggestion.raw_total })}
                                                style={{
                                                    padding: '10px 20px',
                                                    backgroundColor: theme.textPrimary,
                                                    color: 'white', border: 'none',
                                                    borderRadius: '8px', fontSize: '13px',
                                                    fontWeight: '700', cursor: 'pointer',
                                                    fontFamily: "'DM Sans', sans-serif",
                                                }}
                                            >
                                                Use Suggestion
                                            </button>
                                        </div>
                                        <div style={{ marginTop: '12px', fontSize: '12px', color: theme.textSecondary, fontStyle: 'italic', borderTop: `1px solid ${theme.border}`, paddingTop: "10px" }}>
                                            {aiSuggestion.explanation}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Waypoints / Stops */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Intermediate Stops (Optional)</label>
                                <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif" }}>
                                    Add towns or checkposts along your route to let travelers board there.
                                </p>

                                {(postForm.origin || postForm.waypoints.length > 0 || postForm.destination) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', backgroundColor: theme.accentLight, borderRadius: '10px', border: `1px solid rgba(9, 60, 93, 0.05)`, marginBottom: '12px', flexWrap: 'wrap' }}>
                                        {postForm.origin && <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: '700' }}>{postForm.origin}</span>}
                                        {postForm.waypoints.map((wp, i) => (
                                            wp.location_name && (
                                                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                    <span style={{ fontSize: '11px', color: theme.textPrimary, backgroundColor: 'white', padding: '2px 8px', borderRadius: '100px', border: `1px solid ${theme.border}`, fontWeight: "500" }}>{wp.location_name}</span>
                                                </span>
                                            )
                                        ))}
                                        {postForm.destination && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: '700' }}>{postForm.destination}</span>
                                            </span>
                                        )}
                                    </div>
                                )}

                                {postForm.waypoints.map((wp, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ color: theme.textSecondary, fontSize: '12px', minWidth: '60px', fontWeight: "600" }}>Stop {index + 1}</span>
                                        <input
                                            placeholder={`e.g. Dewas`}
                                            value={wp.location_name}
                                            onChange={(e) => updateWaypoint(index, e.target.value)}
                                            style={{ ...inputStyle, flex: 1 }}
                                        />
                                        <button type="button" onClick={() => removeWaypoint(index)} style={{ padding: '10px 14px', backgroundColor: theme.dangerBg, color: theme.danger, border: `1px solid rgba(239, 68, 68, 0.15)`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <button type="button" onClick={addWaypoint} style={{ padding: '8px 16px', backgroundColor: theme.accentLight, color: theme.textPrimary, border: `1px solid rgba(9, 60, 93, 0.1)`, borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                                    + Add Intermediate Stop
                                </button>
                            </div>

                            {/* Departure & Pricing details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Departure Date & Time</label>
                                    <input type="datetime-local" value={postForm.departure_time} onChange={(e) => setPostForm({ ...postForm, departure_time: e.target.value })} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Total Seats Offered</label>
                                    <input type="number" min="1" max="7" placeholder="e.g. 3" value={postForm.total_seats} onChange={(e) => setPostForm({ ...postForm, total_seats: e.target.value })} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Total Trip Cost (₹)</label>
                                    <input type="number" min="1" placeholder="e.g. 600" value={postForm.total_trip_cost} onChange={(e) => setPostForm({ ...postForm, total_trip_cost: e.target.value })} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Price Per Co-traveler (Calculated)</label>
                                    <input
                                        placeholder="Calculated automatically"
                                        value={postForm.total_trip_cost && postForm.total_seats ? `₹${(postForm.total_trip_cost / (parseInt(postForm.total_seats) + 1)).toFixed(2)}` : ''}
                                        disabled
                                        style={{ ...inputStyle, color: theme.success, fontWeight: '700', cursor: 'not-allowed', backgroundColor: '#F3F4F6' }}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Description / Notes (Optional)</label>
                                <textarea placeholder="e.g. No heavy luggage allowed, carrying water, scheduled stop for tea." value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>

                            <button type="submit" disabled={posting} style={{ width: '100%', padding: '13px', backgroundColor: theme.textPrimary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: posting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease', boxShadow: "0 4px 12px rgba(9, 60, 93, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <Car size={16} />
                                {posting ? 'Posting Ride...' : 'Post Ride Offer'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── MY RIDES TAB ── */}
                {activeTab === 'my' && user && (
                    <div>
                        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px' }}>My Ride Offers</h2>

                        {myRides.length === 0 ? (
                            <div style={{ backgroundColor: theme.bgCard, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '60px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(9, 60, 93, 0.01)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', color: '#94A3B8', marginBottom: '16px' }}>
                                    <Car size={48} />
                                </div>
                                <p style={{ color: theme.textSecondary, fontSize: '15px', margin: '0 0 20px', fontWeight: "500" }}>You haven't offered any rides yet.</p>
                                <button onClick={() => navigate('/rides?tab=post')} style={{ padding: '11px 28px', backgroundColor: theme.textPrimary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 12px rgba(9, 60, 93, 0.15)" }}>
                                    Offer Your First Ride
                                </button>
                            </div>
                        ) : (
                            myRides.map((ride) => {
                                const isExpanded = !!expandedRides[ride.id];
                                return (
                                    <div key={ride.id} style={{ backgroundColor: theme.bgCard, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '20px 24px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(9,60,93,0.01)', transition: 'all 0.25s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; }}
                                    >
                                        {/* Basic details header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExpanded ? '16px' : '0px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>{ride.origin}</span>
                                                <span style={{ color: theme.accent, fontSize: '16px', fontWeight: "700" }}>→</span>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>{ride.destination}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ padding: '4px 12px', backgroundColor: badgeStyle(ride.status).bg, color: badgeStyle(ride.status).color, borderRadius: '100px', fontSize: '11px', fontWeight: '700', border: `1px solid rgba(9, 60, 93, 0.08)` }}>
                                                    {ride.status}
                                                </span>
                                                <button 
                                                    onClick={() => toggleRideExpand(ride.id)}
                                                    style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                                                >
                                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Basic details row (always visible) */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: isExpanded ? '0px' : '12px' }}>
                                            {[
                                                { icon: Clock, text: new Date(ride.departure_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) },
                                                { icon: Users, text: `${ride.available_seats}/${ride.total_seats} seats` },
                                                { icon: IndianRupee, text: `₹${ride.price_per_seat}/seat` },
                                            ].map((detail, idx) => {
                                                const IconComp = detail.icon;
                                                return (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px 12px', border: `1px solid ${theme.border}` }}>
                                                        <IconComp size={13} style={{ color: theme.textSecondary }} />
                                                        <span style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: "600" }}>{detail.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Collapsible expanded section */}
                                        {isExpanded && (
                                            <div style={{ marginTop: '16px', borderTop: `1px solid ${theme.border}`, paddingTop: '16px' }}>
                                                
                                                {/* Intermediate stops (Waypoints) */}
                                                {ride.waypoints && ride.waypoints.length > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: theme.accentLight, borderRadius: '8px', border: `1px solid rgba(9, 60, 93, 0.05)`, marginBottom: '16px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: "700" }}>📍 Stops:</span>
                                                        {ride.waypoints.map((wp) => (
                                                            <span key={wp.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <span style={{ color: theme.textSecondary, fontSize: '9px' }}>→</span>
                                                                <span style={{ fontSize: '11px', color: theme.textPrimary, backgroundColor: 'white', padding: '2px 8px', borderRadius: '100px', border: `1px solid ${theme.border}`, fontWeight: "500" }}>{wp.location_name}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Co-travelers and Requests list */}
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '11.5px', fontWeight: '700', color: theme.textSecondary, letterSpacing: '0.5px', marginBottom: '12px', textTransform: 'uppercase' }}>
                                                        👥 Confirmed Co-travelers
                                                    </div>
                                                    
                                                    {rideBookings[ride.id] && rideBookings[ride.id].filter(b => b.status === 'CONFIRMED').map((booking) => (
                                                        <div key={booking.id} style={{
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '10px 14px',
                                                            backgroundColor: theme.successBg,
                                                            borderRadius: '10px',
                                                            border: `1px solid rgba(16, 185, 129, 0.15)`,
                                                            marginBottom: '8px',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{
                                                                    width: '32px', height: '32px',
                                                                    borderRadius: '8px',
                                                                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                                                                    display: 'flex', alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: '700', fontSize: '13px',
                                                                    color: 'white',
                                                                    flexShrink: 0,
                                                                }}>
                                                                    {booking.traveler_name?.[0] || 'T'}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
                                                                        {booking.traveler_name}
                                                                    </div>
                                                                    <div style={{ fontSize: '11px', color: theme.textSecondary, display: "flex", alignItems: "center", gap: "4px" }}>
                                                                        <Star size={11} fill="#FCD34D" stroke="#FCD34D" />
                                                                        <span>{booking.traveler_rating} · {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ fontSize: '13px', fontWeight: '700', color: theme.success }}>
                                                                    ₹{booking.total_fare}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {(!rideBookings[ride.id] || rideBookings[ride.id].filter(b => b.status === 'CONFIRMED').length === 0) && (
                                                        <div style={{ fontSize: '12px', color: theme.textSecondary, padding: '4px 0', fontStyle: "italic", marginBottom: '8px' }}>
                                                            No confirmed co-travelers yet
                                                        </div>
                                                    )}

                                                    {/* Pending booking requests */}
                                                    {rideBookings[ride.id] && rideBookings[ride.id].filter(b => b.status === 'PENDING').length > 0 && (
                                                        <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: theme.warningBg, borderRadius: '8px', border: `1px solid rgba(245, 158, 11, 0.15)`, cursor: 'pointer' }}
                                                            onClick={() => navigate('/bookings')}>
                                                            <span style={{ fontSize: '12px', color: theme.warningText, fontWeight: '700', display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <Clock size={13} /> {rideBookings[ride.id].filter(b => b.status === 'PENDING').length} booking request(s) pending approval →
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {loadingBookings[ride.id] && (
                                                    <div style={{ marginBottom: '16px', fontSize: '11px', color: theme.textSecondary, textAlign: 'center' }}>
                                                        Loading details...
                                                    </div>
                                                )}

                                                {/* Availability footer bar */}
                                                <div style={{
                                                    padding: '10px 14px',
                                                    backgroundColor: ride.available_seats === 0 ? theme.dangerBg : theme.successBg,
                                                    borderRadius: '8px',
                                                    border: `1px solid ${ride.available_seats === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`,
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    marginBottom: ride.status === 'ACTIVE' ? '16px' : '0px'
                                                }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: ride.available_seats === 0 ? theme.danger : theme.success }}>
                                                        {ride.available_seats === 0
                                                            ? 'Ride is FULL — no remaining seats'
                                                            : `${ride.available_seats} seat${ride.available_seats > 1 ? 's' : ''} available`
                                                        }
                                                    </span>
                                                </div>

                                                {/* Action Buttons: Complete / Cancel */}
                                                {ride.status === 'ACTIVE' && (
                                                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: `1px solid ${theme.border}`, paddingTop: '16px' }}>
                                                        <button 
                                                            onClick={() => handleCompleteRide(ride.id)}
                                                            style={{ flex: 1, padding: '10px 16px', backgroundColor: theme.success, color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                                                        >
                                                            Complete Ride
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCancelRide(ride.id)}
                                                            style={{ padding: '10px 16px', backgroundColor: 'transparent', color: theme.danger, border: `1px solid ${theme.danger}`, borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                                                        >
                                                            Cancel Ride
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
