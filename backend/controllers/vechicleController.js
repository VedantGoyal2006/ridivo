import {
    createVehicle,
    getVehiclesByDriverId,
    getVehicleById,
    setActiveVehicle,
    deleteVehicle
} from '../models/vehicleModel.js';
import { getVerificationByUserId } from '../models/verificationModel.js';

// POST /api/vehicles
export const addVehicle = async (req, res) => {
    try {
        const { vehicle_name, vehicle_number, vehicle_type, total_seats, color, vehicle_image_url } = req.body;

        // 1. Check all fields
        if (!vehicle_name || !vehicle_number || !vehicle_type || !total_seats) {
            return res.status(400).json({ 
                message: 'Vehicle name, number, type and seats are required' 
            });
        }

        // 2. Check if user is verified driver
        const verification = await getVerificationByUserId(req.user.id);
        if (!verification || verification.status !== 'APPROVED') {
            return res.status(403).json({ 
                message: 'You must be a verified driver to add a vehicle' 
            });
        }

        // 3. Create vehicle
        const vehicle = await createVehicle(
            req.user.id,
            vehicle_name,
            vehicle_number,
            vehicle_type,
            total_seats,
            color,
            vehicle_image_url
        );

        return res.status(201).json({
            message: 'Vehicle added successfully',
            vehicle
        });

    } catch (err) {
        console.error('Add vehicle error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/vehicles
export const getMyVehicles = async (req, res) => {
    try {
        const vehicles = await getVehiclesByDriverId(req.user.id);

        return res.status(200).json({ vehicles });

    } catch (err) {
        console.error('Get vehicles error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/vehicles/:id/active
export const makeVehicleActive = async (req, res) => {
    try {
        const { id } = req.params;

        // Check vehicle belongs to this driver
        const vehicle = await getVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (vehicle.driver_id !== req.user.id) {
            return res.status(403).json({ message: 'Not your vehicle' });
        }

        const updatedVehicle = await setActiveVehicle(req.user.id, id);

        return res.status(200).json({
            message: 'Active vehicle updated',
            vehicle: updatedVehicle
        });

    } catch (err) {
        console.error('Set active vehicle error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/vehicles/:id
export const removeVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        // Check vehicle belongs to this driver
        const vehicle = await getVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (vehicle.driver_id !== req.user.id) {
            return res.status(403).json({ message: 'Not your vehicle' });
        }

        await deleteVehicle(id, req.user.id);

        return res.status(200).json({ 
            message: 'Vehicle removed successfully' 
        });

    } catch (err) {
        console.error('Remove vehicle error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};