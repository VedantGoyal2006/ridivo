import pool from '../config/db.js';

// Add new vehicle
export const createVehicle = async (driver_id, vehicle_name, vehicle_number, vehicle_type, total_seats, color, vehicle_image_url) => {
    const result = await pool.query(
        `INSERT INTO vehicles 
         (driver_id, vehicle_name, vehicle_number, vehicle_type, total_seats, color, vehicle_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [driver_id, vehicle_name, vehicle_number, vehicle_type, total_seats, color, vehicle_image_url]
    );
    return result.rows[0];
};

// Get all vehicles of a driver
export const getVehiclesByDriverId = async (driver_id) => {
    const result = await pool.query(
        `SELECT * FROM vehicles WHERE driver_id = $1 ORDER BY created_at DESC`,
        [driver_id]
    );
    return result.rows;
};

// Get single vehicle by id
export const getVehicleById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

// Set active vehicle
export const setActiveVehicle = async (driver_id, vehicle_id) => {
    // First set all vehicles inactive
    await pool.query(
        `UPDATE vehicles SET is_active = false WHERE driver_id = $1`,
        [driver_id]
    );
    // Then set selected vehicle active
    const result = await pool.query(
        `UPDATE vehicles SET is_active = true WHERE id = $1 AND driver_id = $2
         RETURNING *`,
        [vehicle_id, driver_id]
    );
    return result.rows[0];
};

// Delete vehicle
export const deleteVehicle = async (id, driver_id) => {
    const result = await pool.query(
        `DELETE FROM vehicles WHERE id = $1 AND driver_id = $2
         RETURNING *`,
        [id, driver_id]
    );
    return result.rows[0];
};