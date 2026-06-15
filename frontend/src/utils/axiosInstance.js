import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

// Response interceptor to handle token refresh automatically on 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If the request returns 401 and it hasn't been retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Avoid infinite loops
            if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
                return Promise.reject(error);
            }
            
            originalRequest._retry = true;
            try {
                // Call the refresh endpoint to get new cookie-based accessToken
                await axiosInstance.post('/auth/refresh');
                // Retry the original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log out the user
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;