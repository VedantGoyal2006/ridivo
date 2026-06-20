 import axiosInstance from '../utils/axiosInstance';

// Create a new ride
export const createRide = async (rideData) => {
    const response = await axiosInstance.post('/rides', rideData);
    return response.data;
};

// Search rides
export const searchRides = async (origin, destination, date, seats) => {
    const response = await axiosInstance.get(
        `/rides/search?origin=${origin}&destination=${destination}&date=${date}&seats=${seats}`
    );
    return response.data;
};

// Get my rides (as driver)
export const getMyRides = async () => {
    const response = await axiosInstance.get('/rides/my-rides');
    return response.data;
};

// Get single ride
export const getRideById = async (id) => {
    const response = await axiosInstance.get(`/rides/${id}`);
    return response.data;
};

// Create a booking
export const createBooking = async (bookingData) => {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response.data;
};

// Get my bookings (as traveler)
export const getMyBookings = async () => {
    const response = await axiosInstance.get('/bookings/my-bookings');
    return response.data;
};

// Get bookings for a ride (as driver)
export const getBookingsForRide = async (rideId) => {
    const response = await axiosInstance.get(`/bookings/ride/${rideId}`);
    return response.data;
};

// Accept a booking
export const acceptBooking = async (bookingId) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/accept`);
    return response.data;
};

// Reject a booking
export const rejectBooking = async (bookingId) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/reject`);
    return response.data;
};

// Cancel a booking
export const cancelBooking = async (bookingId, cancellation_reason) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`, {
        cancellation_reason
    });
    return response.data;
};

// Complete a ride (as driver)
export const completeRide = async (id) => {
    const response = await axiosInstance.put(`/rides/${id}/complete`);
    return response.data;
};

// Cancel a ride (as driver)
export const cancelRide = async (id) => {
    const response = await axiosInstance.delete(`/rides/${id}`);
    return response.data;
};

// Trigger Emergency SOS alert (as passenger)
export const triggerSOS = async (bookingId) => {
    const response = await axiosInstance.post(`/bookings/${bookingId}/sos`);
    return response.data;
};