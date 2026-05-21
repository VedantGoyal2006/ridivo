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

export default function BookingsPage() {
    const { user } = useAuth();

    // My bookings as traveler
    const [myBookings, setMyBookings] = useState([]);

    // My rides as driver
    const [myRides, setMyRides] = useState([]);

    // Selected ride's bookings
    const [rideBookings, setRideBookings] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);

    // Messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load data when page opens
    useEffect(() => {
        if (user) {
            fetchMyBookings();
            fetchMyRides();
        }
    }, [user]);

    const fetchMyBookings = async () => {
        try {
            const data = await getMyBookings();
            setMyBookings(data.bookings);
        } catch (err) {
            console.error('Failed to fetch bookings');
        }
    };

    const fetchMyRides = async () => {
        try {
            const data = await getMyRides();
            setMyRides(data.rides);
        } catch (err) {
            console.error('Failed to fetch rides');
        }
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
            setSuccess('Booking accepted!');
            fetchRideBookings(selectedRide);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept booking');
        }
    };

    const handleReject = async (bookingId) => {
        try {
            setError('');
            await rejectBooking(bookingId);
            setSuccess('Booking rejected');
            fetchRideBookings(selectedRide);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject booking');
        }
    };

    const handleCancel = async (bookingId) => {
        try {
            setError('');
            await cancelBooking(bookingId, 'Changed my plans');
            setSuccess('Booking cancelled');
            fetchMyBookings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getStatusColor = (status) => {
        if (status === 'CONFIRMED') return 'green';
        if (status === 'PENDING') return 'orange';
        if (status === 'CANCELLED') return 'red';
        if (status === 'REJECTED') return 'red';
        return 'black';
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Bookings</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {/* My Bookings as Traveler */}
            <div style={{ marginBottom: '30px' }}>
                <h2>My Bookings</h2>
                {myBookings.length === 0 ? (
                    <p>No bookings yet</p>
                ) : (
                    myBookings.map((booking) => (
                        <div
                            key={booking.id}
                            style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}
                        >
                            <h3>{booking.origin} → {booking.destination}</h3>
                            <p>Driver: {booking.driver_name}</p>
                            <p>Seats booked: {booking.seats_booked}</p>
                            <p>Total fare: ₹{booking.total_fare}</p>
                            <p>Departure: {new Date(booking.departure_time).toLocaleString()}</p>
                            <p style={{ color: getStatusColor(booking.status) }}>
                                Status: {booking.status}
                            </p>
                            {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                                <button
                                    onClick={() => handleCancel(booking.id)}
                                    style={{ padding: '8px 16px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* My Rides as Driver — see who booked */}
            <div>
                <h2>Booking Requests for My Rides</h2>
                {myRides.length === 0 ? (
                    <p>No rides posted yet</p>
                ) : (
                    myRides.map((ride) => (
                        <div
                            key={ride.id}
                            style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}
                        >
                            <h3>{ride.origin} → {ride.destination}</h3>
                            <p>Status: {ride.status}</p>
                            <p>Available seats: {ride.available_seats}/{ride.total_seats}</p>
                            <button
                                onClick={() => fetchRideBookings(ride.id)}
                                style={{ padding: '8px 16px', background: '#093C5D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                View Bookings
                            </button>

                            {/* Show bookings for this ride */}
                            {selectedRide === ride.id && (
                                <div style={{ marginTop: '10px' }}>
                                    {rideBookings.length === 0 ? (
                                        <p>No bookings yet</p>
                                    ) : (
                                        rideBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '8px' }}
                                            >
                                                <p>Traveler: {booking.traveler_name}</p>
                                                <p>Seats: {booking.seats_booked}</p>
                                                <p>Fare: ₹{booking.total_fare}</p>
                                                <p style={{ color: getStatusColor(booking.status) }}>
                                                    Status: {booking.status}
                                                </p>
                                                {booking.status === 'PENDING' && (
                                                    <div>
                                                        <button
                                                            onClick={() => handleAccept(booking.id)}
                                                            style={{ padding: '6px 12px', background: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(booking.id)}
                                                            style={{ padding: '6px 12px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}