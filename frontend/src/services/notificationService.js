import axiosInstance from '../utils/axiosInstance';

export const getNotifications = async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
};

export const markAllRead = async () => {
    const response = await axiosInstance.put('/notifications/mark-all-read');
    return response.data;
};

export const markRead = async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
};
