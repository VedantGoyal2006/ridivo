import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { getEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../controllers/emergencyContactController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Emergency contacts CRUD routes
router.get('/emergency-contacts', protect, getEmergencyContacts);
router.post('/emergency-contacts', protect, addEmergencyContact);
router.put('/emergency-contacts/:id', protect, updateEmergencyContact);
router.delete('/emergency-contacts/:id', protect, deleteEmergencyContact);

export default router;