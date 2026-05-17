import axiosInstance from '../utils/axiosInstance';

export const loginUser = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
};

export const signupUser = async (name, email, phone, password) => {
    const response = await axiosInstance.post('/auth/signup', { name, email, phone, password });
    return response.data;
};

export const logoutUser = async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
};