import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getMyBookings,
    getMyRides,
    getBookingsForRide,
    acceptBooking,
    rejectBooking,
    cancelBooking
} from '../services/rideService';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  User,
  Users,
  IndianRupee,
  Car,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const theme = {
    bgCard: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#093C5D',
    textSecondary: '#6B7280',
    textMuted: '#94A3B8',
    accent: '#3B7597',
    accentDark: '#093C5D',
    accentLight: '#EFF6FF',
    success: '#10B981',
    successBg: '#EFFDF4',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    info: '#3B7597',
    infoBg: '#EFF6FF',
};

const statusConfig = (status) => {
    const map = {
        CONFIRMED: { color: theme.success, bg: theme.successBg, icon: CheckCircle },
        PENDING: { color: theme.warning, bg: theme.warningBg, icon: Clock },
        CANCELLED: { color: theme.textSecondary, bg: '#F3F4F6', icon: XCircle },
        REJECTED: { color: theme.danger, bg: theme.dangerBg, icon: XCircle },
        COMPLETED: { color: theme.accentDark, bg: theme.accentLight, icon: CheckCircle },
    };
    return map[status] || { color: theme.textSecondary, bg: '#F3F4F6', icon: AlertCircle };
};

function BookingCard({ booking, onCancel, isDriver = false, onAccept, onReject }) {
    const status = statusConfig(booking.status);
    const StatusIcon = status.icon;
    const [hovered, setHovered] = useState(false);

    return (
        <div style={{
            backgroundColor: theme.bgCard,
            borderRadius: '16px',
            border: `1px solid ${hovered ? theme.accent : theme.border}`,
            marginBottom: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: hovered ? "0 8px 24px rgba(9, 60, 93, 0.04)" : "0 2px 12px rgba(9, 60, 93, 0.01)",
            transform: hovered ? "translateY(-2px)" : "translateY(0)"
        }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ padding: '20px 24px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: "wrap", gap: "12px" }}>
                    {/* Route */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: "wrap" }}>
                            <span style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: '16px', fontWeight: '700',
                                color: theme.textPrimary,
                            }}>
                                {booking.origin}
                            </span>
                            <span style={{ color: theme.accent, fontWeight: "700" }}>→</span>
                            <span style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: '16px', fontWeight: '700',
                                color: theme.textPrimary,
                            }}>
                                {booking.destination}
                            </span>
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={13} />
                            {new Date(booking.departure_time).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
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
                        border: `1px solid rgba(9, 60, 93, 0.03)`,
                    }}>
                        <StatusIcon size={12} style={{ color: status.color }} />
                        <span style={{
                            fontSize: '11px', fontWeight: '700',
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
                        { label: isDriver ? 'TRAVELER' : 'DRIVER', value: isDriver ? booking.traveler_name : booking.driver_name, icon: User },
                        { label: 'SEATS', value: `${booking.seats_booked} seat${booking.seats_booked > 1 ? 's' : ''}`, icon: Users },
                        { label: 'FARE', value: `₹${booking.total_fare}`, icon: IndianRupee, isFare: true },
                    ].map((item, idx) => {
                        const IconComp = item.icon;
                        return (
                            <div key={idx} style={{
                                backgroundColor: '#F9FAFB',
                                borderRadius: '10px',
                                padding: '12px',
                                border: `1px solid ${theme.border}`,
                            }}>
                                <div style={{
                                    fontSize: '10px', fontWeight: '700',
                                    color: theme.textSecondary,
                                    fontFamily: "'DM Sans', sans-serif",
                                    letterSpacing: '0.8px',
                                    marginBottom: '4px',
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}>
                                    <IconComp size={10} /> {item.label}
                                </div>
                                <div style={{
                                    fontSize: '13.5px', fontWeight: '700',
                                    color: item.isFare ? theme.success : theme.textPrimary,
                                    fontFamily: "'DM Sans', sans-serif",
                                    marginTop: "2px"
                                }}>
                                    {item.value}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Vehicle info */}
                {booking.vehicle_name && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: theme.accentLight,
                        borderRadius: '8px',
                        border: `1px solid rgba(9, 60, 93, 0.03)`,
                        marginBottom: '16px',
                    }}>
                        <Car size={14} style={{ color: theme.textPrimary }} />
                        <span style={{ fontSize: '12.5px', color: theme.textPrimary, fontFamily: "'DM Sans', sans-serif", fontWeight: "500" }}>
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
                                    padding: '9px 18px',
                                    backgroundColor: theme.successBg,
                                    color: theme.success,
                                    border: `1px solid rgba(16, 185, 129, 0.2)`,
                                    borderRadius: '8px',
                                    fontSize: '12.5px', fontWeight: '700',
                                    cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.successBg; }}
                            >
                                ✓ Accept Request
                            </button>
                            <button
                                onClick={() => onReject(booking.id)}
                                style={{
                                    padding: '9px 18px',
                                    backgroundColor: theme.dangerBg,
                                    color: theme.danger,
                                    border: `1px solid rgba(239, 68, 68, 0.2)`,
                                    borderRadius: '8px',
                                    fontSize: '12.5px', fontWeight: '700',
                                    cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; }}
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
                                padding: '9px 18px',
                                backgroundColor: 'transparent',
                                color: theme.textSecondary,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                fontSize: '12.5px', fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger; e.currentTarget.style.backgroundColor = theme.dangerBg; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.backgroundColor = "transparent"; }}
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
    const navigate = useNavigate();

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
            <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{ maxWidth: '860px', margin: '0 auto' }}>

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
                            🎫 Booking Manager
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                            Track and manage all your ride bookings and requests in one place.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px', marginBottom: '28px',
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
                            label: 'Pending Approval',
                            value: myBookings.filter(b => b.status === 'PENDING').length,
                            icon: '⏳',
                            color: theme.warning,
                        },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            backgroundColor: theme.bgCard,
                            borderRadius: '16px',
                            border: `1px solid ${theme.border}`,
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.icon}</div>
                            <div style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: '24px', fontWeight: '800',
                                color: theme.textPrimary, lineHeight: 1,
                                marginBottom: '4px',
                            }}>{stat.value}</div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: "600" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Alerts */}
                {error && (
                    <div style={{
                        backgroundColor: theme.dangerBg,
                        border: `1px solid rgba(239, 68, 68, 0.2)`,
                        borderRadius: '10px', padding: '12px 16px',
                        marginBottom: '20px', color: theme.danger,
                        fontSize: '13.5px', display: 'flex',
                        alignItems: 'center', gap: '8px',
                        fontWeight: "600",
                    }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        backgroundColor: theme.successBg,
                        border: `1px solid rgba(16, 185, 129, 0.2)`,
                        borderRadius: '10px', padding: '12px 16px',
                        marginBottom: '20px', color: theme.success,
                        fontSize: '13.5px', display: 'flex',
                        alignItems: 'center', gap: '8px',
                        fontWeight: "600",
                    }}>
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '4px',
                    marginBottom: '28px',
                    backgroundColor: 'rgba(9, 60, 93, 0.03)',
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
                                fontSize: '13.5px',
                                fontWeight: '600',
                                fontFamily: "'DM Sans', sans-serif",
                                transition: 'all 0.25s ease',
                                backgroundColor: activeTab === tab.id ? theme.bgCard : 'transparent',
                                color: activeTab === tab.id ? theme.textPrimary : theme.textSecondary,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: activeTab === tab.id ? "0 4px 10px rgba(9, 60, 93, 0.03)" : "none"
                            }}
                        >
                            {tab.label}
                            <span style={{
                                padding: '2px 8px',
                                backgroundColor: activeTab === tab.id ? theme.textPrimary : 'rgba(9, 60, 93, 0.1)',
                                color: activeTab === tab.id ? 'white' : theme.textSecondary,
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
                                boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                                <p style={{
                                    fontFamily: "'Sora', sans-serif",
                                    fontSize: '18px', color: theme.textPrimary,
                                    margin: '0 0 8px', fontWeight: "700"
                                }}>No bookings yet</p>
                                <p style={{ color: theme.textSecondary, fontSize: '14px', margin: 0 }}>
                                    Find a ride and book your first journey.
                                </p>
                                <button onClick={() => navigate('/rides')} style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: theme.textPrimary, color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Find a Ride</button>
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
                        {myRides.length === 0 ? (
                            <div style={{
                                backgroundColor: theme.bgCard,
                                borderRadius: '16px',
                                border: `1px solid ${theme.border}`,
                                padding: '60px 40px',
                                textAlign: 'center',
                                boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'center', color: '#94A3B8', marginBottom: '16px' }}>
                                    <Car size={48} />
                                </div>
                                <p style={{
                                    fontFamily: "'Sora', sans-serif",
                                    fontSize: '18px', color: theme.textPrimary,
                                    margin: '0 0 8px', fontWeight: "700"
                                }}>No rides offered yet</p>
                                <p style={{ color: theme.textSecondary, fontSize: '14px', margin: 0 }}>
                                    Offer a ride to start receiving bookings from co-travelers.
                                </p>
                                <button onClick={() => navigate('/rides?tab=post')} style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: theme.textPrimary, color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Offer a Ride</button>
                            </div>
                        ) : (
                            myRides.map((ride) => (
                                <div key={ride.id} style={{
                                    backgroundColor: theme.bgCard,
                                    borderRadius: '16px',
                                    border: `1px solid ${theme.border}`,
                                    marginBottom: '16px',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
                                }}>
                                    <div style={{ padding: '20px 24px' }}>
                                        {/* Ride header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: "wrap", gap: "12px" }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: '700', color: theme.textPrimary }}>{ride.origin}</span>
                                                <span style={{ color: theme.accent, fontWeight: "700" }}>→</span>
                                                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: '700', color: theme.textPrimary }}>{ride.destination}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: "500" }}>
                                                    {ride.available_seats}/{ride.total_seats} seats remaining
                                                </span>
                                                <button
                                                    onClick={() => selectedRide === ride.id ? setSelectedRide(null) : fetchRideBookings(ride.id)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: selectedRide === ride.id ? theme.accentLight : 'white',
                                                        color: theme.textPrimary,
                                                        border: `1px solid ${theme.border}`,
                                                        borderRadius: '8px',
                                                        fontSize: '12.5px', fontWeight: '700',
                                                        cursor: 'pointer',
                                                        fontFamily: "'DM Sans', sans-serif",
                                                        transition: 'all 0.2s ease',
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}
                                                >
                                                    {selectedRide === ride.id ? 'Hide Requests' : 'View Requests'}
                                                    {selectedRide === ride.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Booking requests list */}
                                        {selectedRide === ride.id && (
                                            <div style={{
                                                borderTop: `1px solid ${theme.border}`,
                                                paddingTop: '16px',
                                                marginTop: '4px',
                                            }}>
                                                {rideBookings.length === 0 ? (
                                                    <p style={{ color: theme.textSecondary, fontSize: '13px', textAlign: 'center', padding: '20px 0', fontStyle: "italic" }}>
                                                        No booking requests for this ride yet.
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
        </>
    );
}
