import axiosInstance from '../utils/axiosInstance';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    searchRides, 
    createRide, 
    getMyRides,
    createBooking
} from '../services/rideService';

export default function RidesPage() {
    const { user } = useAuth();

    // Search state
    const [searchForm, setSearchForm] = useState({
        origin: '',
        destination: '',
        date: '',
        seats: 1
    });
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Post ride state
    const [showPostForm, setShowPostForm] = useState(false);
    const [postForm, setPostForm] = useState({
        vehicle_id: '',
        origin: '',
        destination: '',
        departure_time: '',
        total_seats: '',
        total_trip_cost: '',
        description: ''
    });

    // My rides state
    const [myRides, setMyRides] = useState([]);

    // Messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [myVehicles, setMyVehicles] = useState([]);

    const fetchMyVehicles = async () => {
    try {
        const response = await axiosInstance.get('/vehicles');
        setMyVehicles(response.data.vehicles);
    } catch (err) {
        console.error('Failed to fetch vehicles');
    }
};

    // Load my rides when page opens
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

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setSearching(true);
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
        try {
            await createRide(postForm);
            setSuccess('Ride posted successfully!');
            setShowPostForm(false);
            setPostForm({
                vehicle_id: '',
                origin: '',
                destination: '',
                departure_time: '',
                total_seats: '',
                total_trip_cost: '',
                description: ''
            });
            fetchMyRides();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post ride');
        }
    };

    const handleBookRide = async (rideId) => {
        try {
            await createBooking({
                ride_id: rideId,
                seats_booked: searchForm.seats
            });
            setSuccess('Booking request sent successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book ride');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Rides</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {/* Search Section */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>Search Rides</h2>
                <form onSubmit={handleSearch}>
                    <input
                        placeholder="From (origin)"
                        value={searchForm.origin}
                        onChange={(e) => setSearchForm({ ...searchForm, origin: e.target.value })}
                        required
                        style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                    />
                    <input
                        placeholder="To (destination)"
                        value={searchForm.destination}
                        onChange={(e) => setSearchForm({ ...searchForm, destination: e.target.value })}
                        required
                        style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                    />
                    <input
                        type="date"
                        value={searchForm.date}
                        onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                        required
                        style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                    />
                    <input
                        type="number"
                        placeholder="Seats needed"
                        value={searchForm.seats}
                        onChange={(e) => setSearchForm({ ...searchForm, seats: e.target.value })}
                        min="1"
                        required
                        style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        style={{ padding: '10px 20px', background: '#093C5D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {searching ? 'Searching...' : 'Search Rides'}
                    </button>
                </form>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h2>Available Rides</h2>
                    {searchResults.map((ride) => (
                        <div key={ride.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                            <h3>{ride.origin} → {ride.destination}</h3>
                            <p>Driver: {ride.driver_name} ⭐ {ride.avg_rating}</p>
                            <p>Vehicle: {ride.vehicle_name} ({ride.vehicle_type})</p>
                            <p>Departure: {new Date(ride.departure_time).toLocaleString()}</p>
                            <p>Available Seats: {ride.available_seats}</p>
                            <p>Price per seat: ₹{ride.price_per_seat}</p>
                            {user && ride.driver_id !== user.id && (
                                <button
                                    onClick={() => handleBookRide(ride.id)}
                                    style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Book Ride
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Post Ride Section */}
            {user && (
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setShowPostForm(!showPostForm)}
                        style={{ padding: '10px 20px', background: '#093C5D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
                    >
                        {showPostForm ? 'Cancel' : 'Post a Ride'}
                    </button>

                    {showPostForm && (
                        <form onSubmit={handlePostRide} style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                            <h2>Post a Ride</h2>
                            <select
    value={postForm.vehicle_id}
    onChange={(e) => setPostForm({ ...postForm, vehicle_id: e.target.value })}
    required
    style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
>
    <option value="">Select your vehicle</option>
    {myVehicles.map((vehicle) => (
        <option key={vehicle.id} value={vehicle.id}>
            {vehicle.vehicle_name} - {vehicle.vehicle_number}
        </option>
    ))}
</select>
                            <input
                                placeholder="From (origin)"
                                value={postForm.origin}
                                onChange={(e) => setPostForm({ ...postForm, origin: e.target.value })}
                                required
                                style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                            />
                            <input
                                placeholder="To (destination)"
                                value={postForm.destination}
                                onChange={(e) => setPostForm({ ...postForm, destination: e.target.value })}
                                required
                                style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                            />
                            <input
                                type="datetime-local"
                                value={postForm.departure_time}
                                onChange={(e) => setPostForm({ ...postForm, departure_time: e.target.value })}
                                required
                                style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                            />
                            <input
                                type="number"
                                placeholder="Total seats"
                                value={postForm.total_seats}
                                onChange={(e) => setPostForm({ ...postForm, total_seats: e.target.value })}
                                required
                                style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                            />
                            <input
                                type="number"
                                placeholder="Total trip cost (₹)"
                                value={postForm.total_trip_cost}
                                onChange={(e) => setPostForm({ ...postForm, total_trip_cost: e.target.value })}
                                required
                                style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                            />
                            <textarea
                                placeholder="Description (optional)"
                                value={postForm.description}
                                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                                style={{ display: 'block', margin: '8px 0', padding: '8px', width: '100%' }}
                            />
                            <button
                                type="submit"
                                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Post Ride
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* My Rides Section */}
            {user && myRides.length > 0 && (
                <div>
                    <h2>My Posted Rides</h2>
                    {myRides.map((ride) => (
                        <div key={ride.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                            <h3>{ride.origin} → {ride.destination}</h3>
                            <p>Status: {ride.status}</p>
                            <p>Departure: {new Date(ride.departure_time).toLocaleString()}</p>
                            <p>Available Seats: {ride.available_seats}/{ride.total_seats}</p>
                            <p>Price per seat: ₹{ride.price_per_seat}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}