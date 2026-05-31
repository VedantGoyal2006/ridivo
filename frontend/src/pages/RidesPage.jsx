import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    searchRides,
    createRide,
    getMyRides,
    createBooking
} from '../services/rideService';
import axiosInstance from '../utils/axiosInstance';

const theme = {
    bgBase: '#0B1120',
    glassCard: 'rgba(255, 255, 255, 0.03)',
    glassCardHeavy: 'rgba(15, 23, 42, 0.6)',
    glassHover: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#38BDF8',
    accentHover: '#0284C7',
    success: '#34D399',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#FBBF24',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    danger: '#F87171',
    dangerBg: 'rgba(239, 68, 68, 0.15)',
};

const badgeStyle = (status) => {
    const map = {
        ACTIVE: { bg: theme.successBg, color: theme.success },
        FULL: { bg: theme.dangerBg, color: theme.danger },
        CANCELLED: { bg: 'rgba(255,255,255,0.05)', color: theme.textSecondary },
        COMPLETED: { bg: 'rgba(56,189,248,0.15)', color: theme.accent },
        ONGOING: { bg: theme.warningBg, color: theme.warning },
    };
    return map[status] || { bg: 'rgba(255,255,255,0.05)', color: theme.textSecondary };
};

export default function RidesPage() {
    const { user } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const defaultTab = params.get('tab') || 'search';
    const [activeTab, setActiveTab] = useState(defaultTab);

    const [searchForm, setSearchForm] = useState({
        origin: '', destination: '', date: '', seats: 1
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            fetchMyRides();
            fetchMyVehicles();
        }
    }, [user]);

    const fetchMyRides = async () => {
        try {
            const data = await getMyRides();
            setMyRides(data.rides);
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

            // If waypoints exist, add them
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
            setActiveTab('my');
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
                seats_booked: parseInt(searchForm.seats)
            });
            setSuccess('Booking request sent successfully!');
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

    const inputStyle = {
        width: '100%',
        padding: '11px 14px',
        border: `1.5px solid ${theme.glassBorder}`,
        borderRadius: '10px',
        fontSize: '14px',
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none',
        color: theme.textPrimary,
        backgroundColor: 'rgba(0,0,0,0.3)',
        boxSizing: 'border-box',
        transition: 'border 0.2s ease',
        colorScheme: 'dark',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: theme.textSecondary,
        marginBottom: '6px',
        fontFamily: "'DM Sans', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

            <div style={{
                minHeight: '100vh',
                backgroundColor: theme.bgBase,
                backgroundImage: `
                    radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.08), transparent 25%),
                    radial-gradient(circle at 85% 30%, rgba(167, 139, 250, 0.08), transparent 25%),
                    radial-gradient(circle at 50% 100%, rgba(52, 211, 153, 0.05), transparent 30%),
                    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px',
                backgroundAttachment: 'fixed',
                fontFamily: "'DM Sans', sans-serif",
                paddingTop: '80px',
                color: theme.textPrimary,
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

                    {/* Hero Header */}
                    <div style={{
                        background: `linear-gradient(135deg, rgba(9,60,93,0.9) 0%, rgba(56,189,248,0.3) 100%)`,
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        padding: '40px 32px',
                        marginBottom: '28px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: `1px solid rgba(56,189,248,0.3)`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(56,189,248,0.2), transparent)', borderRadius: '50%' }} />
                        <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(56,189,248,0.1), transparent)', borderRadius: '50%' }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '32px', fontWeight: '800', color: theme.textPrimary, margin: '0 0 8px' }}>
                                🚗 Find Your Perfect Ride
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: '0 0 24px' }}>
                                Share rides, split costs, travel smarter
                            </p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {[
                                    { value: '10K+', label: 'Happy Travelers' },
                                    { value: '5K+', label: 'Rides Shared' },
                                    { value: '4.8★', label: 'Avg Rating' },
                                ].map((stat) => (
                                    <div key={stat.label} style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
                                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: '800', color: theme.textPrimary }}>{stat.value}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tab Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', backgroundColor: theme.glassCard, padding: '6px', borderRadius: '14px', border: `1px solid ${theme.glassBorder}`, width: 'fit-content', backdropFilter: 'blur(10px)' }}>
                        {[
                            { id: 'search', label: '🔍 Find a Ride' },
                            { id: 'post', label: '🚗 Offer a Ride' },
                            { id: 'my', label: '📋 My Rides' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                                style={{
                                    padding: '9px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                    fontSize: '14px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.2s ease',
                                    backgroundColor: activeTab === tab.id ? 'rgba(56,189,248,0.2)' : 'transparent',
                                    color: activeTab === tab.id ? theme.accent : theme.textSecondary,
                                    borderLeft: activeTab === tab.id ? `3px solid ${theme.accent}` : '3px solid transparent',
                                    boxShadow: activeTab === tab.id ? `0 0 12px rgba(56,189,248,0.2)` : 'none',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div style={{ backgroundColor: theme.dangerBg, border: `1px solid rgba(239,68,68,0.3)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: theme.danger, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ backgroundColor: theme.successBg, border: `1px solid rgba(52,211,153,0.3)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: theme.success, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ✅ {success}
                        </div>
                    )}

                    {/* ── SEARCH TAB ── */}
                    {activeTab === 'search' && (
                        <div>
                            <div style={{ backgroundColor: theme.glassCard, backdropFilter: 'blur(16px)', borderRadius: '20px', border: `1px solid ${theme.glassBorder}`, padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 20px' }}>Search for a Ride</h2>
                                <form onSubmit={handleSearch}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={labelStyle}>From</label>
                                            <input placeholder="e.g. Indore" value={searchForm.origin} onChange={(e) => setSearchForm({ ...searchForm, origin: e.target.value })} required style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>To</label>
                                            <input placeholder="e.g. Bhopal" value={searchForm.destination} onChange={(e) => setSearchForm({ ...searchForm, destination: e.target.value })} required style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Date</label>
                                            <input type="date" value={searchForm.date} onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })} required style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Seats Needed</label>
                                            <input type="number" min="1" value={searchForm.seats} onChange={(e) => setSearchForm({ ...searchForm, seats: e.target.value })} required style={inputStyle} />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={searching} style={{ width: '100%', padding: '13px', backgroundColor: searching ? theme.glassCard : theme.accent, color: searching ? theme.textSecondary : '#0B1120', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: searching ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease', boxShadow: searching ? 'none' : '0 4px 20px rgba(56,189,248,0.4)' }}>
                                        {searching ? 'Searching...' : '🔍 Search Rides'}
                                    </button>
                                </form>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div>
                                    <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px' }}>
                                        {searchResults.length} Ride{searchResults.length > 1 ? 's' : ''} Found
                                    </h2>
                                    {searchResults.map((ride) => (
                                        <div key={ride.id} style={{ backgroundColor: theme.glassCard, backdropFilter: 'blur(16px)', borderRadius: '16px', border: `1px solid ${theme.glassBorder}`, padding: '20px 24px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', transition: 'all 0.2s ease' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.glassHover; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.glassCard; e.currentTarget.style.borderColor = theme.glassBorder; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            {/* Route */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>{ride.origin}</span>
                                                <span style={{ color: theme.accent, fontSize: '20px' }}>→</span>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>{ride.destination}</span>
                                                <span style={{ marginLeft: 'auto', padding: '4px 14px', backgroundColor: 'rgba(56,189,248,0.15)', color: theme.accent, borderRadius: '100px', fontSize: '13px', fontWeight: '700', border: '1px solid rgba(56,189,248,0.3)' }}>
                                                    ₹{ride.price_per_seat}/seat
                                                </span>
                                            </div>

                                            {/* Waypoints */}
                                            {ride.waypoints && ride.waypoints.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'rgba(56,189,248,0.05)', borderRadius: '8px', border: `1px solid rgba(56,189,248,0.15)`, marginBottom: '16px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: '600' }}>📍 Route:</span>
                                                    <span style={{ fontSize: '12px', color: theme.accent }}>{ride.origin}</span>
                                                    {ride.waypoints.map((wp) => (
                                                        <span key={wp.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                            <span style={{ fontSize: '12px', color: theme.accent, backgroundColor: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(56,189,248,0.2)' }}>
                                                                {wp.location_name}
                                                            </span>
                                                        </span>
                                                    ))}
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                        <span style={{ fontSize: '12px', color: theme.accent }}>{ride.destination}</span>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Details */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                                {[
                                                    { icon: '🕐', text: new Date(ride.departure_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) },
                                                    { icon: '💺', text: `${ride.available_seats} seats available` },
                                                    { icon: '🚗', text: `${ride.vehicle_name} · ${ride.vehicle_number}` },
                                                ].map((detail) => (
                                                    <div key={detail.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 10px', border: `1px solid ${theme.glassBorder}` }}>
                                                        <span>{detail.icon}</span>
                                                        <span style={{ fontSize: '12px', color: theme.textSecondary }}>{detail.text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Driver + Book */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #38BDF8, #0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', color: 'white', boxShadow: '0 2px 10px rgba(56,189,248,0.3)' }}>
                                                        {ride.driver_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>{ride.driver_name}</div>
                                                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>⭐ {ride.avg_rating}</div>
                                                    </div>
                                                </div>
                                                {user && ride.driver_id !== user.id && (
                                                    <button onClick={() => handleBookRide(ride.id)} style={{ padding: '10px 24px', backgroundColor: theme.successBg, color: theme.success, border: `1px solid rgba(52,211,153,0.3)`, borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(52,211,153,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(52,211,153,0.2)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.successBg; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    >
                                                        Book Ride
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── POST RIDE TAB ── */}
                    {activeTab === 'post' && user && (
                        <div style={{ backgroundColor: theme.glassCard, backdropFilter: 'blur(16px)', borderRadius: '20px', border: `1px solid ${theme.glassBorder}`, padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 24px' }}>Post a Ride</h2>

                            <form onSubmit={handlePostRide}>
                                {/* Vehicle */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Select Vehicle</label>
                                    <select value={postForm.vehicle_id} onChange={(e) => setPostForm({ ...postForm, vehicle_id: e.target.value })} required style={inputStyle}>
                                        <option value="" style={{ background: '#0B1120' }}>Choose your vehicle</option>
                                        {myVehicles.map((v) => (
                                            <option key={v.id} value={v.id} style={{ background: '#0B1120' }}>
                                                {v.vehicle_name} · {v.vehicle_number} · {v.vehicle_type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Origin & Destination */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>From</label>
                                        <input placeholder="Origin city" value={postForm.origin} onChange={(e) => setPostForm({ ...postForm, origin: e.target.value })} required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>To</label>
                                        <input placeholder="Destination city" value={postForm.destination} onChange={(e) => setPostForm({ ...postForm, destination: e.target.value })} required style={inputStyle} />
                                    </div>
                                </div>

                                {/* Waypoints */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Stops Along the Route (Optional)</label>
                                    <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 10px', fontFamily: "'DM Sans', sans-serif" }}>
                                        Add intermediate stops so travelers can board from these locations
                                    </p>

                                    {/* Route preview */}
                                    {(postForm.origin || postForm.waypoints.length > 0 || postForm.destination) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'rgba(56,189,248,0.05)', borderRadius: '8px', border: `1px solid rgba(56,189,248,0.15)`, marginBottom: '12px', flexWrap: 'wrap' }}>
                                            {postForm.origin && <span style={{ fontSize: '12px', color: theme.accent, fontWeight: '600' }}>{postForm.origin}</span>}
                                            {postForm.waypoints.map((wp, i) => (
                                                wp.location_name && (
                                                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                        <span style={{ fontSize: '12px', color: theme.accent, backgroundColor: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '100px' }}>{wp.location_name}</span>
                                                    </span>
                                                )
                                            ))}
                                            {postForm.destination && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ color: theme.textSecondary, fontSize: '10px' }}>→</span>
                                                    <span style={{ fontSize: '12px', color: theme.accent, fontWeight: '600' }}>{postForm.destination}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {postForm.waypoints.map((wp, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                            <span style={{ color: theme.textSecondary, fontSize: '12px', minWidth: '60px' }}>Stop {index + 1}</span>
                                            <input
                                                placeholder={`e.g. Dewas`}
                                                value={wp.location_name}
                                                onChange={(e) => updateWaypoint(index, e.target.value)}
                                                style={{ ...inputStyle, flex: 1 }}
                                            />
                                            <button type="button" onClick={() => removeWaypoint(index)} style={{ padding: '10px 14px', backgroundColor: theme.dangerBg, color: theme.danger, border: `1px solid ${theme.danger}30`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    <button type="button" onClick={addWaypoint} style={{ padding: '9px 16px', backgroundColor: 'rgba(56,189,248,0.1)', color: theme.accent, border: `1px solid rgba(56,189,248,0.3)`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                                        + Add Stop
                                    </button>
                                </div>

                                {/* Departure & Seats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Departure Date & Time</label>
                                        <input type="datetime-local" value={postForm.departure_time} onChange={(e) => setPostForm({ ...postForm, departure_time: e.target.value })} required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Total Seats Available</label>
                                        <input type="number" min="1" max="7" placeholder="e.g. 3" value={postForm.total_seats} onChange={(e) => setPostForm({ ...postForm, total_seats: e.target.value })} required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Total Trip Cost (₹)</label>
                                        <input type="number" min="1" placeholder="e.g. 500" value={postForm.total_trip_cost} onChange={(e) => setPostForm({ ...postForm, total_trip_cost: e.target.value })} required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Price Per Seat (Auto)</label>
                                        <input
                                            placeholder="Auto calculated"
                                            value={postForm.total_trip_cost && postForm.total_seats ? `₹${(postForm.total_trip_cost / (parseInt(postForm.total_seats) + 1)).toFixed(2)}` : ''}
                                            disabled
                                            style={{ ...inputStyle, color: theme.success, fontWeight: '700', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Description (Optional)</label>
                                    <textarea placeholder="Any additional info for travelers..." value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>

                                <button type="submit" disabled={posting} style={{ width: '100%', padding: '13px', backgroundColor: posting ? theme.glassCard : theme.accent, color: posting ? theme.textSecondary : '#0B1120', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: posting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease', boxShadow: posting ? 'none' : '0 4px 20px rgba(56,189,248,0.4)' }}>
                                    {posting ? 'Posting...' : '🚗 Post Ride'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── MY RIDES TAB ── */}
                    {activeTab === 'my' && user && (
                        <div>
                            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px' }}>My Posted Rides</h2>

                            {myRides.length === 0 ? (
                                <div style={{ backgroundColor: theme.glassCard, backdropFilter: 'blur(16px)', borderRadius: '16px', border: `1px solid ${theme.glassBorder}`, padding: '60px 40px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
                                    <p style={{ color: theme.textSecondary, fontSize: '15px', margin: '0 0 20px' }}>You haven't posted any rides yet</p>
                                    <button onClick={() => setActiveTab('post')} style={{ padding: '11px 28px', backgroundColor: theme.accent, color: '#0B1120', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(56,189,248,0.4)' }}>
                                        Post Your First Ride
                                    </button>
                                </div>
                            ) : (
                                myRides.map((ride) => (
                                    <div key={ride.id} style={{ backgroundColor: theme.glassCard, backdropFilter: 'blur(16px)', borderRadius: '16px', border: `1px solid ${theme.glassBorder}`, padding: '20px 24px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', transition: 'all 0.2s ease' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.glassHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.glassCard; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>{ride.origin}</span>
                                                <span style={{ color: theme.accent, fontSize: '20px' }}>→</span>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>{ride.destination}</span>
                                            </div>
                                            <span style={{ padding: '4px 14px', backgroundColor: badgeStyle(ride.status).bg, color: badgeStyle(ride.status).color, borderRadius: '100px', fontSize: '12px', fontWeight: '700', border: `1px solid ${badgeStyle(ride.status).color}` }}>
                                                {ride.status}
                                            </span>
                                        </div>

                                        {/* Waypoints in my rides */}
                                        {ride.waypoints && ride.waypoints.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(56,189,248,0.05)', borderRadius: '8px', border: `1px solid rgba(56,189,248,0.15)`, marginBottom: '12px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '11px', color: theme.textSecondary }}>📍 Stops:</span>
                                                {ride.waypoints.map((wp) => (
                                                    <span key={wp.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ color: theme.textSecondary, fontSize: '9px' }}>→</span>
                                                        <span style={{ fontSize: '11px', color: theme.accent, backgroundColor: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '100px' }}>{wp.location_name}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                            {[
                                                { icon: '🕐', text: new Date(ride.departure_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) },
                                                { icon: '💺', text: `${ride.available_seats}/${ride.total_seats} seats` },
                                                { icon: '💰', text: `₹${ride.price_per_seat}/seat` },
                                            ].map((detail) => (
                                                <div key={detail.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 10px', border: `1px solid ${theme.glassBorder}` }}>
                                                    <span>{detail.icon}</span>
                                                    <span style={{ fontSize: '12px', color: theme.textSecondary }}>{detail.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                input::placeholder { color: #475569; }
                textarea::placeholder { color: #475569; }
                input:focus { border-color: #38BDF8 !important; box-shadow: 0 0 0 3px rgba(56,189,248,0.1) !important; }
                select:focus { border-color: #38BDF8 !important; }
                * { box-sizing: border-box; }
            `}</style>
        </>
    );
}
