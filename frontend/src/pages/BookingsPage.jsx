import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    getMyBookings,
    getMyRides,
    getBookingsForRide,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    triggerSOS
} from '../services/rideService';
import { calculateRouteOSRM } from '../services/geocodeService';
import { getSocket } from '../utils/socket';
import axiosInstance from '../utils/axiosInstance';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Skeleton } from '../components/Skeleton';
import Map from '../components/Map';
import { toast } from 'react-hot-toast';
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
    ShieldAlert,
    Key,
    Compass,
    Sparkles,
    CreditCard,
    Play,
    StopCircle,
    Map as MapIcon,
    Locate
} from "lucide-react";

export default function BookingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const params = new URLSearchParams(location.search);
    const defaultTab = params.get('tab') || 'traveler';

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [travelerBookings, setTravelerBookings] = useState([]);
    const [driverRides, setDriverRides] = useState([]);
    const [rideBookings, setRideBookings] = useState({});
    const [loadingBookings, setLoadingBookings] = useState({});
    const [expandedRides, setExpandedRides] = useState({});
    const [loading, setLoading] = useState(true);

    // OTP verification modal state
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [selectedBookingForOtp, setSelectedBookingForOtp] = useState(null);
    const [otpInput, setOtpInput] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    // SOS modal state
    const [sosModalOpen, setSosModalOpen] = useState(false);
    const [sosBooking, setSosBooking] = useState(null);
    const [sosAlertText, setSosAlertText] = useState('');
    const [dispatchingSos, setDispatchingSos] = useState(false);

    // Sandbox payment simulation modal
    const [sandboxPaymentOpen, setSandboxPaymentOpen] = useState(false);
    const [paymentOrderInfo, setPaymentOrderInfo] = useState(null); 
    const [processingSandboxPayment, setProcessingSandboxPayment] = useState(false);

    // ── REAL-TIME LOCATION TRACKING STATES ──
    const [trackingBooking, setTrackingBooking] = useState(null); // booking passenger is tracking
    const [liveTrackingOpen, setLiveTrackingOpen] = useState(false);
    const [passengerRouteCoords, setPassengerRouteCoords] = useState(null);
    const [driverLiveLoc, setDriverLiveLoc] = useState(null); // { lat, lng } from socket

    // Driver simulation states
    const [simulatingRideId, setSimulatingRideId] = useState(null);
    const [simulationRoute, setSimulationRoute] = useState([]);
    const [simIndex, setSimIndex] = useState(0);
    const [simActive, setSimActive] = useState(false);
    
    const simIntervalRef = useRef(null);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const travRes = await getMyBookings();
            setTravelerBookings(travRes.bookings || []);

            const driverRes = await getMyRides();
            const activeRides = driverRes.rides || [];
            setDriverRides(activeRides);

            for (const ride of activeRides) {
                fetchRideBookings(ride.id);
            }
        } catch (err) {
            console.error("Failed to load bookings:", err);
            toast.error("Failed to retrieve booking records.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRideBookings = async (rideId) => {
        setLoadingBookings(prev => ({ ...prev, [rideId]: true }));
        try {
            const data = await getBookingsForRide(rideId);
            setRideBookings(prev => ({ ...prev, [rideId]: data.bookings || [] }));
        } catch (err) {
            console.error(`Failed to load bookings for ride ${rideId}`, err);
        } finally {
            setLoadingBookings(prev => ({ ...prev, [rideId]: false }));
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        const tab = params.get('tab') || 'traveler';
        if (['traveler', 'driver'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        navigate(`/bookings?tab=${tabName}`);
    };

    // Driver: Accept Request
    const handleAccept = async (bookingId, rideId) => {
        try {
            await acceptBooking(bookingId);
            toast.success("Seat request accepted! OTP boarding token generated.");
            fetchRideBookings(rideId);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept booking.");
        }
    };

    // Driver: Reject Request
    const handleReject = async (bookingId, rideId) => {
        if (!window.confirm("Reject this passenger seat request?")) return;
        try {
            await rejectBooking(bookingId);
            toast.success("Seat request rejected.");
            fetchRideBookings(rideId);
        } catch (err) {
            toast.error("Failed to reject request.");
        }
    };

    // Traveler: Cancel Booking
    const handleCancel = async (bookingId) => {
        const reason = window.prompt("Please input cancellation reason:");
        if (reason === null) return;

        try {
            await cancelBooking(bookingId, reason);
            toast.success("Booking cancelled successfully.");
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel booking.");
        }
    };

    // Driver: Arrive at pickup
    const handleArriveAtPickup = async (rideId) => {
        try {
            await axiosInstance.put(`/rides/${rideId}/arrive`);
            toast.success("Driver arrival marked! Confirmed passengers alerted.");
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to mark arrival.");
        }
    };

    // Driver: Start Ride
    const handleStartRide = async (rideId) => {
        try {
            await axiosInstance.put(`/rides/${rideId}/start`);
            toast.success("Ride marked as ongoing! Live tracking enabled.");
            loadData();
        } catch (err) {
            toast.error("Failed to start ride.");
        }
    };

    // Driver: Complete Ride
    const handleCompleteRide = async (rideId) => {
        if (!window.confirm("Complete this journey? This will settle co-traveler cost shares.")) return;
        
        // Stop simulation if active
        if (simulatingRideId === rideId) {
            stopLocationSimulation();
        }

        try {
            await completeRide(rideId);
            toast.success("Journey marked as completed successfully!");
            loadData();
        } catch (err) {
            toast.error("Failed to complete journey.");
        }
    };

    // Traveler: Razorpay Checkout Integration
    const handlePaymentCheckout = async (bookingId) => {
        try {
            const res = await axiosInstance.post('/payments/order', { booking_id: bookingId });
            
            if (res.data.is_sandbox) {
                setPaymentOrderInfo({
                    order_id: res.data.order_id,
                    amount: res.data.amount,
                    booking_id: bookingId
                });
                setSandboxPaymentOpen(true);
            } else {
                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    return toast.error("Failed to load Razorpay payment SDK.");
                }

                const options = {
                    key: res.data.key_id,
                    amount: Math.round(res.data.amount * 100),
                    currency: res.data.currency,
                    name: 'Ridivo Cost Sharing',
                    description: 'Intercity Ride Cost Splitting',
                    order_id: res.data.order_id,
                    handler: async (response) => {
                        try {
                            await axiosInstance.post('/payments/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            toast.success("Payment splits verified! Seat is now PAID.");
                            loadData();
                        } catch (err) {
                            toast.error("Payment validation check failed.");
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email
                    },
                    theme: {
                        color: '#093C5D'
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to initialize payment order.");
        }
    };

    // Traveler: Confirm Sandbox Checkout
    const submitSandboxPayment = async (e) => {
        e.preventDefault();
        setProcessingSandboxPayment(true);
        try {
            await axiosInstance.post('/payments/verify', {
                razorpay_order_id: paymentOrderInfo.order_id,
                razorpay_payment_id: `mock_pay_${Date.now()}`,
                razorpay_signature: `mock_sig_${Date.now()}`
            });
            toast.success("Sandbox mock checkout completed successfully!");
            setSandboxPaymentOpen(false);
            loadData();
        } catch (err) {
            toast.error("Simulated signature validation failed.");
        } finally {
            setProcessingSandboxPayment(false);
        }
    };

    // Driver: Open verify OTP modal
    const openOtpModal = (booking) => {
        setSelectedBookingForOtp(booking);
        setOtpInput('');
        setOtpModalOpen(true);
    };

    // Driver: Verify Boarding OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpInput) return toast.error("Please enter the boarding OTP.");

        setVerifyingOtp(true);
        try {
            await axiosInstance.post(`/bookings/${selectedBookingForOtp.id}/verify-otp`, {
                otp: otpInput
            });
            toast.success("OTP verified successfully! Passenger boarded.");
            setOtpModalOpen(false);
            fetchRideBookings(selectedBookingForOtp.ride_id);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP code. Please retry.");
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Passenger: Trigger Emergency SOS
    const handleTriggerSOS = async (booking) => {
        setSosBooking(booking);
        setSosAlertText('');
        setSosModalOpen(true);
    };

    const handleConfirmSOS = async () => {
        setDispatchingSos(true);
        try {
            const res = await triggerSOS(sosBooking.id);
            setSosAlertText(res.alertText);
            toast.success("SOS Alert Dispatched to Emergency Contacts!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to dispatch SOS alert.");
        } finally {
            setDispatchingSos(false);
        }
    };

    // ── TRAVELER LIVE TRACKING ACTIONS ──
    const startLiveTracking = async (booking) => {
        setTrackingBooking(booking);
        setDriverLiveLoc(null);
        setPassengerRouteCoords(null);
        setLiveTrackingOpen(true);

        // Fetch OSRM route mapping polyline
        const coords = [
            { lat: parseFloat(booking.origin_lat), lng: parseFloat(booking.origin_lng) },
            { lat: parseFloat(booking.destination_lat), lng: parseFloat(booking.destination_lng) }
        ];
        const routeData = await calculateRouteOSRM(coords);
        if (routeData) {
            setPassengerRouteCoords(routeData.polyline);
        }

        // Establish Socket connection and join room
        const socket = getSocket(user.id);
        socket.emit('join-ride', booking.ride_id);

        // Listen for live location broadcasts
        socket.on('location-update', (data) => {
            setDriverLiveLoc({ lat: data.lat, lng: data.lng });
        });
    };

    const closeLiveTracking = () => {
        if (trackingBooking) {
            const socket = getSocket(user.id);
            socket.emit('leave-ride', trackingBooking.ride_id);
            socket.off('location-update');
        }
        setLiveTrackingOpen(false);
        setTrackingBooking(null);
    };

    // ── DRIVER LOCATION SIMULATION ACTIONS ──
    const startLocationSimulation = async (ride) => {
        setSimulatingRideId(ride.id);
        setSimActive(true);
        setSimIndex(0);

        // 1. Fetch route coordinates
        const coords = [
            { lat: parseFloat(ride.origin_lat), lng: parseFloat(ride.origin_lng) },
            { lat: parseFloat(ride.destination_lat), lng: parseFloat(ride.destination_lng) }
        ];

        const routeData = await calculateRouteOSRM(coords);
        if (!routeData || routeData.polyline.length === 0) {
            toast.error("Failed to generate simulation path.");
            return;
        }

        const polylineCoords = routeData.polyline.map(c => ({ lat: c[0], lng: c[1] }));
        setSimulationRoute(polylineCoords);

        // 2. Establish Socket connection and join room
        const socket = getSocket(user.id);
        socket.emit('join-ride', ride.id);

        // 3. Start simulation ticks every 4 seconds
        let currentIndex = 0;
        simIntervalRef.current = setInterval(() => {
            if (currentIndex >= polylineCoords.length) {
                clearInterval(simIntervalRef.current);
                toast.success("Simulation complete. Destination reached!");
                setSimActive(false);
                return;
            }

            const currentPos = polylineCoords[currentIndex];
            socket.emit('update-location', {
                ride_id: ride.id,
                lat: currentPos.lat,
                lng: currentPos.lng
            });

            setSimIndex(currentIndex);
            currentIndex += 1;
        }, 4000);

        toast.success("Live driving dispatcher started!");
    };

    const stopLocationSimulation = () => {
        if (simIntervalRef.current) {
            clearInterval(simIntervalRef.current);
        }
        if (simulatingRideId) {
            const socket = getSocket(user.id);
            socket.emit('leave-ride', simulatingRideId);
        }
        setSimActive(false);
        setSimulatingRideId(null);
        setSimulationRoute([]);
        toast.error("Location simulation stopped.");
    };

    // Ensure simulation cleanup on unmount
    useEffect(() => {
        return () => {
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        };
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto py-8">
                <Skeleton variant="rect" className="h-16 w-full" />
                <Skeleton variant="rect" className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Cost-Sharing Trips Queue</h2>
                <p className="text-xs text-slate-500 mt-1">Review active bookings, access secure boarding keys, or verify co-traveler entries.</p>
            </div>

            {/* TAB BAR */}
            <div className="flex border-b border-slate-200 gap-6">
                <button
                    onClick={() => handleTabChange('traveler')}
                    className={`py-3.5 text-sm font-semibold border-b-2 transition-all focus:outline-none ${
                        activeTab === 'traveler' ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-500'
                    }`}
                >
                    Booked Trips (As Traveler)
                </button>
                <button
                    onClick={() => handleTabChange('driver')}
                    className={`py-3.5 text-sm font-semibold border-b-2 transition-all focus:outline-none ${
                        activeTab === 'driver' ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-500'
                    }`}
                >
                    Offered Trips (As Driver)
                </button>
            </div>

            {/* ── 1. TRAVELER BOOKINGS TAB ── */}
            {activeTab === 'traveler' && (
                <div className="space-y-4">
                    {travelerBookings.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
                            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-800 mt-4">No Booking Records Found</h4>
                            <p className="text-xs text-slate-500 mt-1">Search for active intercity rides to book your first cost-split seat!</p>
                        </div>
                    ) : (
                        travelerBookings.map((b) => (
                            <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start flex-wrap gap-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                            {b.origin} ➔ {b.destination}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                b.status === 'CONFIRMED' || b.status === 'RESERVED' ? 'bg-yellow-50 text-yellow-600' :
                                                b.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                                b.status === 'STARTED' ? 'bg-indigo-50 text-indigo-600' :
                                                b.status === 'PENDING' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Leaves: <span className="font-semibold text-slate-700">{new Date(b.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fare Share</p>
                                        <p className="text-base font-extrabold text-slate-800 mt-0.5">₹{Math.round(b.total_fare)}</p>
                                    </div>
                                </div>

                                {/* Information grid */}
                                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Driver</span>
                                        <span className="font-bold text-slate-700 mt-0.5 block">{b.driver_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Seats Booked</span>
                                        <span className="font-bold text-slate-700 mt-0.5 block">{b.seats_booked} seat(s)</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Vehicle</span>
                                        <span className="font-bold text-slate-700 mt-0.5 block truncate">{b.vehicle_name || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Stepper Progress */}
                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking Progress Stepper</span>
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 flex-wrap gap-2">
                                        <span className="text-primary-600 font-bold">1. Requested</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                        <span className={['CONFIRMED', 'PAID', 'STARTED', 'COMPLETED'].includes(b.status) ? 'text-primary-600 font-bold' : ''}>
                                            2. Accepted
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                        <span className={['PAID', 'STARTED', 'COMPLETED'].includes(b.status) ? 'text-primary-600 font-bold' : ''}>
                                            3. Paid
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                        <span className={['STARTED', 'COMPLETED'].includes(b.status) ? 'text-primary-600 font-bold' : ''}>
                                            4. Boarded
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                        <span className={b.status === 'COMPLETED' ? 'text-emerald-600 font-bold' : ''}>
                                            5. Arrived
                                        </span>
                                    </div>
                                </div>

                                {/* Boarding OTP Pass Card */}
                                {['CONFIRMED', 'PAID', 'RESERVED'].includes(b.status) && b.otp_code && (
                                    <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
                                        <div className="space-y-1">
                                            <h5 className="text-xs font-bold text-primary-900 flex items-center gap-1">
                                                <Key className="w-4 h-4 text-primary-600" /> Secure Boarding Pass
                                            </h5>
                                            <p className="text-[11px] text-slate-600">
                                                {b.status === 'PAID' 
                                                    ? "Payment Verified. Share this OTP with the driver upon boarding." 
                                                    : "Awaiting payment. Please pay your fare share below to confirm."}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-primary-200 px-4 py-2 rounded-xl text-center shadow-inner">
                                            <span className={`text-lg font-black tracking-wider font-mono ${b.status === 'PAID' ? 'text-primary-700' : 'text-slate-400 blur-[2px]'}`}>
                                                {b.otp_code}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-between items-center gap-3 border-t border-slate-100 pt-4">
                                    <div>
                                        {['CONFIRMED', 'RESERVED'].includes(b.status) && (
                                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> Payment Required to boarding
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {['PENDING', 'CONFIRMED', 'RESERVED', 'PAID'].includes(b.status) && (
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleCancel(b.id)}>
                                                Cancel Booking
                                            </Button>
                                        )}

                                        {['CONFIRMED', 'RESERVED'].includes(b.status) && (
                                            <Button variant="primary" size="sm" onClick={() => handlePaymentCheckout(b.id)}>
                                                <CreditCard className="w-4 h-4" /> Pay Fare Share
                                            </Button>
                                        )}

                                        {b.status === 'STARTED' && (
                                            <>
                                                <Button variant="accent" size="sm" onClick={() => startLiveTracking(b)}>
                                                    <Locate className="w-4 h-4 animate-pulse" /> Track Live Journey
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleTriggerSOS(b)}>
                                                    <ShieldAlert className="w-4 h-4" /> Trigger SOS
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── 2. DRIVER RIDES TAB ── */}
            {activeTab === 'driver' && (
                <div className="space-y-4">
                    {driverRides.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
                            <Car className="w-12 h-12 text-slate-300 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-800 mt-4">No Rides Published</h4>
                            <p className="text-xs text-slate-500 mt-1">Publish an intercity trip offer to start receiving seat requests.</p>
                        </div>
                    ) : (
                        driverRides.map((ride) => {
                            const expanded = expandedRides[ride.id];
                            const bookings = rideBookings[ride.id] || [];
                            const loadBook = loadingBookings[ride.id];
                            const isThisRideSimulating = simulatingRideId === ride.id;

                            return (
                                <div key={ride.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                                    
                                    {/* Header Summary */}
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                                {ride.origin} ➔ {ride.destination}
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    ride.status === 'PUBLISHED' || ride.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                                    ride.status === 'ARRIVED' ? 'bg-yellow-50 text-yellow-600' :
                                                    ride.status === 'ONGOING' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {ride.status}
                                                </span>
                                            </h4>
                                            <p className="text-xs text-slate-500">
                                                Leaves: <span className="font-semibold text-slate-700">{new Date(ride.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Driver Lifecycle Actions */}
                                            {ride.status === 'ACTIVE' || ride.status === 'PUBLISHED' ? (
                                                <Button variant="primary" size="sm" onClick={() => handleArriveAtPickup(ride.id)}>
                                                    Arrive at Pickup
                                                </Button>
                                            ) : ride.status === 'ARRIVED' ? (
                                                <Button variant="primary" size="sm" onClick={() => handleStartRide(ride.id)}>
                                                    Start Journey
                                                </Button>
                                            ) : ride.status === 'ONGOING' ? (
                                                <>
                                                    {simActive && isThisRideSimulating ? (
                                                        <Button variant="danger" size="sm" onClick={stopLocationSimulation}>
                                                            <StopCircle className="w-4 h-4" /> Stop Simulator
                                                        </Button>
                                                    ) : (
                                                        <Button variant="secondary" size="sm" onClick={() => startLocationSimulation(ride)}>
                                                            <Play className="w-4 h-4 text-primary-600" /> Start GPS Simulator
                                                        </Button>
                                                    )}
                                                    <Button variant="success" size="sm" onClick={() => handleCompleteRide(ride.id)}>
                                                        Complete Journey
                                                    </Button>
                                                </>
                                            ) : null}

                                            <button onClick={() => toggleRideExpand(ride.id)} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable bookings queue */}
                                    {expanded && (
                                        <div className="border-t border-slate-100 pt-4 space-y-4 animate-fade-in">
                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Traveler Seat Requests</h5>

                                            {loadBook ? (
                                                <Skeleton variant="text" className="h-10 w-full" />
                                            ) : bookings.length === 0 ? (
                                                <p className="text-xs text-slate-500">No bookings exist for this trip offer yet.</p>
                                            ) : (
                                                <div className="divide-y divide-slate-100">
                                                    {bookings.map((book) => (
                                                        <div key={book.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 flex-wrap gap-4">
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
                                                                        <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded-full ${
                                                                            book.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                                                            book.status === 'CONFIRMED' || book.status === 'RESERVED' ? 'bg-yellow-50 text-yellow-600' :
                                                                            book.status === 'STARTED' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                                                                        }`}>
                                                                            {book.status}
                                                                        </span>
                                                                    </h5>
                                                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                                                        Seats: <span className="font-semibold text-slate-700">{book.seats_booked} seat(s)</span> · Pickup: <span className="font-semibold text-slate-700">{book.pickup_point || 'Start'}</span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                {book.status === 'PENDING' && (
                                                                    <>
                                                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 text-xs" onClick={() => handleReject(book.id, ride.id)}>
                                                                            Reject
                                                                        </Button>
                                                                        <Button variant="success" size="sm" className="text-xs" onClick={() => handleAccept(book.id, ride.id)}>
                                                                            Accept
                                                                        </Button>
                                                                    </>
                                                                )}

                                                                {/* OTP verification trigger */}
                                                                {['CONFIRMED', 'PAID', 'RESERVED'].includes(book.status) && ride.status === 'ARRIVED' && (
                                                                    <Button 
                                                                        variant="primary" 
                                                                        size="sm" 
                                                                        className="text-xs font-bold" 
                                                                        disabled={book.status !== 'PAID'}
                                                                        onClick={() => openOtpModal(book)}
                                                                    >
                                                                        {book.status !== 'PAID' ? 'Awaiting Payment' : 'Verify Boarding OTP'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
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

            {/* ── TRAVELER LIVE LOCATION TRACKING DRAWER/MODAL ── */}
            {liveTrackingOpen && trackingBooking && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Car className="w-5 h-5 text-primary-600 animate-bounce" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Tracking Ride Creator Live Location</h3>
                                    <p className="text-[10px] text-slate-500">Trip: {trackingBooking.origin} ➔ {trackingBooking.destination}</p>
                                </div>
                            </div>
                            <button onClick={closeLiveTracking} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                        </div>

                        {/* Interactive map tracking coordinates */}
                        <div className="relative">
                            <Map
                                height="380px"
                                routePolyline={passengerRouteCoords}
                                markers={[
                                    { lat: parseFloat(trackingBooking.origin_lat), lng: parseFloat(trackingBooking.origin_lng), color: '#10B981', label: 'Origin' },
                                    { lat: parseFloat(trackingBooking.destination_lat), lng: parseFloat(trackingBooking.destination_lng), color: '#EF4444', label: 'Destination' },
                                    ...(driverLiveLoc ? [{ lat: driverLiveLoc.lat, lng: driverLiveLoc.lng, color: '#0D8AD8', label: 'Live Car Position', popupText: 'Driver Current Location' }] : [])
                                ]}
                                fitBoundsOnChange={!driverLiveLoc} // Only fit bounds initially, let user pan/zoom as car moves!
                            />

                            {/* Tracking Status indicator */}
                            <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-50">
                                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                {driverLiveLoc ? "Receiving live location coordinates..." : "Connecting to driver's mobile GPS transmitter..."}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 flex-wrap gap-2 bg-slate-50 p-3 rounded-xl">
                            <p>Driver: <span className="font-semibold text-slate-800">{trackingBooking.driver_name}</span></p>
                            <p>Vehicle Plate: <span className="font-semibold text-slate-800">{trackingBooking.vehicle_number}</span></p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SANDBOX PAYMENT SIMULATION MODAL ── */}
            {sandboxPaymentOpen && paymentOrderInfo && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
                        <div className="text-center space-y-2 pb-2 border-b border-slate-100">
                            <Sparkles className="w-8 h-8 text-primary-600 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-800">Ridivo Payment Sandbox</h3>
                            <p className="text-[11px] text-slate-500">Developer sandbox checkout simulation</p>
                        </div>

                        <form onSubmit={submitSandboxPayment} className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mock Order ID</span>
                                    <span className="font-mono text-slate-700 font-semibold">{paymentOrderInfo.order_id}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Fare Splitting Contribution</span>
                                    <span className="text-base font-extrabold text-slate-800">₹{Math.round(paymentOrderInfo.amount)}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Input label="Mock Cardholder Name" defaultValue={user.name} required />
                                <Input label="Mock Card Number" placeholder="4111 1111 1111 1111" required />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="Expiry Date" placeholder="12/28" required />
                                    <Input label="CVV" placeholder="123" maxLength={3} required />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setSandboxPaymentOpen(false)}>
                                    Decline
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={processingSandboxPayment}>
                                    Authorize Payment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── OTP VERIFICATION MODAL ── */}
            {otpModalOpen && selectedBookingForOtp && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800">Verify Passenger Boarding</h3>
                            <button onClick={() => setOtpModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Enter the 4-digit code shown on passenger <span className="font-semibold text-slate-800">{selectedBookingForOtp.traveler_name}</span>'s screen to verify their seating.
                            </p>

                            <Input
                                label="4-Digit Boarding OTP"
                                placeholder="e.g. 1234"
                                maxLength={4}
                                required
                                className="text-center text-xl font-bold tracking-widest font-mono"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            />

                            <div className="pt-2 flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setOtpModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1" isLoading={verifyingOtp}>
                                    Confirm Boarding
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── SOS DISPATCH DETAILS MODAL ── */}
            {sosModalOpen && sosBooking && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                                <ShieldAlert className="w-5 h-5" /> Emergency SOS Dispatcher
                            </h3>
                            <button onClick={() => setSosModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Pressing the dispatch button below will instantly alert the Ridivo admin dashboard and send Twilio SMS emergency details (GPS, vehicle details, driver verification credentials) to your emergency contacts.
                            </p>

                            {sosAlertText ? (
                                <div className="bg-red-50 border border-red-100 text-red-900 p-4 rounded-2xl font-mono text-[10px] whitespace-pre-wrap leading-relaxed shadow-inner">
                                    {sosAlertText}
                                </div>
                            ) : (
                                <Button variant="danger" className="w-full font-bold" onClick={handleConfirmSOS} isLoading={dispatchingSos}>
                                    Dispatch Emergency Alerts Now
                                </Button>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button variant="secondary" size="sm" onClick={() => setSosModalOpen(false)}>
                                    Close Panel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
