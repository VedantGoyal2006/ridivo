import axiosInstance from '../utils/axiosInstance';

export const getMyProfile = async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
};

export const updateMyProfile = async (name, phone, profile_pic) => {
    const response = await axiosInstance.put('/users/profile', { name, phone, profile_pic });
    return response.data;
};

export const changeMyPassword = async (oldPassword, newPassword) => {
    const response = await axiosInstance.put('/users/change-password', { oldPassword, newPassword });
    return response.data;
};