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

export const getEmergencyContacts = async () => {
    const response = await axiosInstance.get('/users/emergency-contacts');
    return response.data;
};

export const addEmergencyContact = async (contactData) => {
    const response = await axiosInstance.post('/users/emergency-contacts', contactData);
    return response.data;
};

export const updateEmergencyContact = async (id, contactData) => {
    const response = await axiosInstance.put(`/users/emergency-contacts/${id}`, contactData);
    return response.data;
};

export const deleteEmergencyContact = async (id) => {
    const response = await axiosInstance.delete(`/users/emergency-contacts/${id}`);
    return response.data;
};