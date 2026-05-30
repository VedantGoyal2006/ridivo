import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getMyBookings,
    getMyRides,
    getBookingsForRide,
    acceptBooking,
    rejectBooking,
    cancelBooking
} from '../services/rideService';

const theme = {
    bg: '#0F0F13',
    bgCard: 'rgba(255,255,255,0.03)',
    bgCardHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.08)',
    borderGold: 'rgba(212,175,55,0.4)',
    gold: '#D4AF37',
    goldLight: 'rgba(212,175,55,0.15)',
    goldGlow: 'rgba(212,175,55,0.08)',
    textPrimary: '#F8F8F2',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    success: '#34D399',
    successBg: 'rgba(52,211,153,0.1)',
    warning: '#FBBF24',
    warningBg: 'rgba(251,191,36,0.1)',
    danger: '#F87171',
    dangerBg: 'rgba(248,113,113,0.1)',
    info: '#38BDF8',
    infoBg: 'rgba(56,189,248,0.1)',
};

const statusConfig = (status) => {
    const map = {
        CONFIRMED: { color: theme.success, bg: theme.successBg, icon: '✅' },
        PENDING: { color: theme.warning, bg: theme.warningBg, icon: '⏳' },
        CANCELLED: { color: theme.danger, bg: theme.dangerBg, icon: '❌' },
        REJECTED: { color: theme.danger, bg: theme.dangerBg, icon: '🚫' },
        COMPLETED: { color: theme.info, bg: theme.infoBg, icon: '🏁' },
    };
    return map[status] || { color: theme.textSecondary, bg: theme.bgCard, icon: '❓' };
};

function GoldDivider() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0'
        }}>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${theme.borderGold})` }} />
            <div style={{ width: '6px', height: '6px', backgroundColor: theme.gold, borderRadius: '50%', boxShadow: `0 0 8px ${theme.gold}` }} />
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${theme.borderGold})` }} />
        </div>
    );
}

function BookingCard({ booking, onCancel, isDriver = false, onAccept, onReject }) {
    const status = statusConfig(booking.status);
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            backgroundColor: theme.bgCard,
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            marginBottom: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(12px)',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid ${theme.borderGold}`;
                e.currentTarget.style.boxShadow = `0 4px 24px ${theme.goldGlow}`;
                e.currentTarget.style.backgroundColor = theme.bgCardHover;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.border = `1px solid ${theme.border}`;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = theme.bgCard;
            }}
        >
            {/* Gold top accent line */}
            <div style={{
                height: '2px',
                background: `linear-gradient(to right, transparent, ${theme.gold}, transparent)`,
                opacity: booking.status === 'CONFIRMED' ? 1 : 0.3,
            }} />

            <div style={{ padding: '20px 24px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    {/* Route */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '18px', fontWeight: '700',
                                color: theme.textPrimary,
                            }}>
                                {booking.origin}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '20px', height: '1px', backgroundColor: theme.gold }} />
                                <div style={{ color: theme.gold, fontSize: '12px' }}>✈</div>
                                <div style={{ width: '20px', height: '1px', backgroundColor: theme.gold }} />
                            </div>
                            <span style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '18px', fontWeight: '700',
                                color: theme.textPrimary,
                            }}>
                                {booking.destination}
                            </span>
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                            {new Date(booking.departure_time).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {' · '}
                            {new Date(booking.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    {/* Status badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px',
                        backgroundColor: status.bg,
                        borderRadius: '100px',
                        border: `1px solid ${status.color}30`,
                    }}>
                        <span style={{ fontSize: '12px' }}>{status.icon}</span>
                        <span style={{
                            fontSize: '12px', fontWeight: '700',
                            color: status.color,
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: '0.5px',
                        }}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                {/* Info grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '16px',
                }}>
                    {[
                        { label: isDriver ? 'TRAVELER' : 'DRIVER', value: isDriver ? booking.traveler_name : booking.driver_name, icon: '👤' },
                        { label: 'SEATS', value: `${booking.seats_booked} seat${booking.seats_booked > 1 ? 's' : ''}`, icon: '💺' },
                        { label: 'FARE', value: `₹${booking.total_fare}`, icon: '💰', gold: true },
                    ].map((item) => (
                        <div key={item.label} style={{
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            border: item.gold ? `1px solid ${theme.borderGold}` : `1px solid ${theme.border}`,
                        }}>
                            <div style={{
                                fontSize: '10px', fontWeight: '700',
                                color: item.gold ? theme.gold : theme.textMuted,
                                fontFamily: "'DM Sans', sans-serif",
                                letterSpacing: '1px',
                                marginBottom: '4px',
                            }}>
                                {item.icon} {item.label}
                            </div>
                            <div style={{
                                fontSize: '14px', fontWeight: '700',
                                color: item.gold ? theme.gold : theme.textPrimary,
                                fontFamily: "'DM Sans', sans-serif",
                            }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vehicle info */}
                {booking.vehicle_name && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        marginBottom: '16px',
                    }}>
                        <span style={{ fontSize: '14px' }}>🚗</span>
                        <span style={{ fontSize: '13px', color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                            {booking.vehicle_name} · {booking.vehicle_type} · {booking.vehicle_number}
                        </span>
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    {/* Driver actions */}
                    {isDriver && booking.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => onAccept(booking.id)}
                                style={{
                                    padding: '9px 20px',
                                    backgroundColor: theme.successBg,
                                    color: theme.success,
                                    border: `1px solid ${theme.success}40`,
                                    borderRadius: '8px',
                                    fontSize: '13px', fontWeight: '700',
                                    cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(52,211,153,0.2)'; e.currentTarget.style.boxShadow = `0 4px 12px rgba(52,211,153,0.2)`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.successBg; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                ✓ Accept
                            </button>
                            <button
                                onClick={() => onReject(booking.id)}
                                style={{
                                    padding: '9px 20px',
                                    backgroundColor: theme.dangerBg,
                                    color: theme.danger,
                                    border: `1px solid ${theme.danger}40`,
                                    borderRadius: '8px',
                                    fontSize: '13px', fontWeight: '700',
                                    cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.2)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.dangerBg; }}
                            >
                                ✕ Reject
                            </button>
                        </>
                    )}

                    {/* Traveler cancel */}
                    {!isDriver && ['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button
                            onClick={() => onCancel(booking.id)}
                            style={{
                                padding: '9px 20px',
                                backgroundColor: 'transparent',
                                color: theme.textSecondary,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                fontSize: '13px', fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; }}
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BookingsPage() {
    const { user } = useAuth();

    const [myBookings, setMyBookings] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [rideBookings, setRideBookings] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [activeTab, setActiveTab] = useState('my');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchAll();
        }
    }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const bookingsData = await getMyBookings();
            setMyBookings(bookingsData.bookings);
        } catch (err) {
            console.error('Failed to fetch bookings');
        }
        try {
            const ridesData = await getMyRides();
            setMyRides(ridesData.rides);
        } catch (err) {
            console.error('Not a driver');
        }
        setLoading(false);
    };

    const fetchRideBookings = async (rideId) => {
        try {
            setSelectedRide(rideId);
            const data = await getBookingsForRide(rideId);
            setRideBookings(data.bookings);
        } catch (err) {
            setError('Failed to fetch ride bookings');
        }
    };

    const handleAccept = async (bookingId) => {
        try {
            setError('');
            await acceptBooking(bookingId);
            setSuccess('Booking accepted successfully!');
            fetchRideBookings(selectedRide);
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept');
        }
    };

    const handleReject = async (bookingId) => {
        try {
            setError('');
            await rejectBooking(bookingId);
            setSuccess('Booking rejected');
            fetchRideBookings(selectedRide);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject');
        }
    };

    const handleCancel = async (bookingId) => {
        try {
            setError('');
            await cancelBooking(bookingId, 'Changed my plans');
            setSuccess('Booking cancelled successfully');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const tabs = [
        { id: 'my', label: 'My Bookings', count: myBookings.length },
        { id: 'driver', label: 'Ride Requests', count: myRides.length },
    ];

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{
                minHeight: '100vh',
                backgroundColor: theme.bg,
                backgroundImage: `
                    radial-gradient(ellipse at 20% 0%, rgba(212,175,55,0.06) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 100%, rgba(212,175,55,0.04) 0%, transparent 50%),
                    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 50px 50px, 50px 50px',
                backgroundAttachment: 'fixed',
                fontFamily: "'DM Sans', sans-serif",
                paddingTop: '80px',
                color: theme.textPrimary,
            }}>
                <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 20px' }}>

                    {/* Hero Header */}
                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 16px',
                            backgroundColor: theme.goldLight,
                            border: `1px solid ${theme.borderGold}`,
                            borderRadius: '100px',
                            marginBottom: '16px',
                        }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: theme.gold, borderRadius: '50%', boxShadow: `0 0 6px ${theme.gold}` }} />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: theme.gold, letterSpacing: '1px' }}>
                                BOOKING MANAGER
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '38px', fontWeight: '800',
                            color: theme.textPrimary,
                            margin: '0 0 10px',
                            lineHeight: 1.2,
                        }}>
                            Your Journey,{' '}
                            <span style={{
                                background: `linear-gradient(135deg, ${theme.gold}, #F0D060)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Managed.
                            </span>
                        </h1>
                        <p style={{ color: theme.textSecondary, fontSize: '15px', margin: 0 }}>
                            Track and manage all your ride bookings in one place
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px', marginBottom: '32px',
                    }}>
                        {[
                            {
                                label: 'Total Bookings',
                                value: myBookings.length,
                                icon: '📋',
                                color: theme.info,
                            },
                            {
                                label: 'Confirmed',
                                value: myBookings.filter(b => b.status === 'CONFIRMED').length,
                                icon: '✅',
                                color: theme.success,
                            },
                            {
                                label: 'Pending',
                                value: myBookings.filter(b => b.status === 'PENDING').length,
                                icon: '⏳',
                                color: theme.warning,
                            },
                        ].map((stat) => (
                            <div key={stat.label} style={{
                                backgroundColor: theme.bgCard,
                                backdropFilter: 'blur(12px)',
                                borderRadius: '14px',
                                border: `1px solid ${theme.border}`,
                                padding: '20px',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.border = `1px solid ${theme.borderGold}`; e.currentTarget.style.boxShadow = `0 4px 20px ${theme.goldGlow}`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.border = `1px solid ${theme.border}`; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                                <div style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '28px', fontWeight: '800',
                                    color: stat.color, lineHeight: 1,
                                    marginBottom: '4px',
                                }}>{stat.value}</div>
                                <div style={{ fontSize: '12px', color: theme.textMuted, letterSpacing: '0.5px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div style={{
                            backgroundColor: theme.dangerBg,
                            border: `1px solid ${theme.danger}30`,
                            borderRadius: '10px', padding: '12px 16px',
                            marginBottom: '20px', color: theme.danger,
                            fontSize: '13.5px', display: 'flex',
                            alignItems: 'center', gap: '8px',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            backgroundColor: theme.successBg,
                            border: `1px solid ${theme.success}30`,
                            borderRadius: '10px', padding: '12px 16px',
                            marginBottom: '20px', color: theme.success,
                            fontSize: '13.5px', display: 'flex',
                            alignItems: 'center', gap: '8px',
                        }}>
                            ✨ {success}
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{
                        display: 'flex', gap: '4px',
                        marginBottom: '24px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '4px', borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        width: 'fit-content',
                    }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); setSelectedRide(null); }}
                                style={{
                                    padding: '10px 22px',
                                    border: 'none',
                                    borderRadius: '9px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.25s ease',
                                    backgroundColor: activeTab === tab.id ? theme.goldLight : 'transparent',
                                    color: activeTab === tab.id ? theme.gold : theme.textSecondary,
                                    border: activeTab === tab.id ? `1px solid ${theme.borderGold}` : '1px solid transparent',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                            >
                                {tab.label}
                                <span style={{
                                    padding: '2px 8px',
                                    backgroundColor: activeTab === tab.id ? theme.gold : 'rgba(255,255,255,0.1)',
                                    color: activeTab === tab.id ? '#0F0F13' : theme.textMuted,
                                    borderRadius: '100px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* My Bookings Tab */}
                    {activeTab === 'my' && (
                        <div>
                            <GoldDivider />
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '60px', color: theme.textSecondary }}>
                                    Loading your bookings...
                                </div>
                            ) : myBookings.length === 0 ? (
                                <div style={{
                                    backgroundColor: theme.bgCard,
                                    borderRadius: '16px',
                                    border: `1px solid ${theme.border}`,
                                    padding: '60px 40px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                                    <p style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: '20px', color: theme.textPrimary,
                                        margin: '0 0 8px',
                                    }}>No bookings yet</p>
                                    <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                                        Find a ride and book your first journey
                                    </p>
                                </div>
                            ) : (
                                myBookings.map((booking) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onCancel={handleCancel}
                                        isDriver={false}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* Driver Tab */}
                    {activeTab === 'driver' && (
                        <div>
                            <GoldDivider />
                            {myRides.length === 0 ? (
                                <div style={{
                                    backgroundColor: theme.bgCard,
                                    borderRadius: '16px',
                                    border: `1px solid ${theme.border}`,
                                    padding: '60px 40px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
                                    <p style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: '20px', color: theme.textPrimary,
                                        margin: '0 0 8px',
                                    }}>No rides posted yet</p>
                                    <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                                        Post a ride to start receiving booking requests
                                    </p>
                                </div>
                            ) : (
                                myRides.map((ride) => (
                                    <div key={ride.id} style={{
                                        backgroundColor: theme.bgCard,
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '16px',
                                        border: `1px solid ${theme.border}`,
                                        marginBottom: '16px',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        {/* Gold accent */}
                                        <div style={{ height: '2px', background: `linear-gradient(to right, transparent, ${theme.gold}, transparent)`, opacity: 0.5 }} />

                                        <div style={{ padding: '20px 24px' }}>
                                            {/* Ride header */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '700', color: theme.textPrimary }}>{ride.origin}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <div style={{ width: '16px', height: '1px', backgroundColor: theme.gold }} />
                                                        <div style={{ color: theme.gold, fontSize: '10px' }}>✈</div>
                                                        <div style={{ width: '16px', height: '1px', backgroundColor: theme.gold }} />
                                                    </div>
                                                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '700', color: theme.textPrimary }}>{ride.destination}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '12px', color: theme.textMuted }}>
                                                        {ride.available_seats}/{ride.total_seats} seats
                                                    </span>
                                                    <button
                                                        onClick={() => selectedRide === ride.id ? setSelectedRide(null) : fetchRideBookings(ride.id)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            backgroundColor: selectedRide === ride.id ? theme.goldLight : 'rgba(0,0,0,0.3)',
                                                            color: selectedRide === ride.id ? theme.gold : theme.textSecondary,
                                                            border: `1px solid ${selectedRide === ride.id ? theme.borderGold : theme.border}`,
                                                            borderRadius: '8px',
                                                            fontSize: '13px', fontWeight: '600',
                                                            cursor: 'pointer',
                                                            fontFamily: "'DM Sans', sans-serif",
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        {selectedRide === ride.id ? 'Hide ↑' : 'View Requests ↓'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Booking requests */}
                                            {selectedRide === ride.id && (
                                                <div style={{
                                                    borderTop: `1px solid ${theme.border}`,
                                                    paddingTop: '16px',
                                                    marginTop: '4px',
                                                }}>
                                                    {rideBookings.length === 0 ? (
                                                        <p style={{ color: theme.textMuted, fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                                                            No booking requests yet
                                                        </p>
                                                    ) : (
                                                        rideBookings.map((booking) => (
                                                            <BookingCard
                                                                key={booking.id}
                                                                booking={{
                                                                    ...booking,
                                                                    origin: ride.origin,
                                                                    destination: ride.destination,
                                                                    departure_time: ride.departure_time,
                                                                    vehicle_name: ride.vehicle_name,
                                                                    vehicle_type: ride.vehicle_type,
                                                                    vehicle_number: ride.vehicle_number,
                                                                }}
                                                                isDriver={true}
                                                                onAccept={handleAccept}
                                                                onReject={handleReject}
                                                                onCancel={() => {}}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.5); }
            `}</style>
        </>
    );
}
