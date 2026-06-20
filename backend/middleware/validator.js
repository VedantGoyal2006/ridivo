import { body, validationResult } from 'express-validator';

// Generic helper to return validation errors back to frontend in standard JSON format
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: errors.array()[0].msg // Send the first validation error message
        });
    }
    next();
};

// 1. Signup Validation
export const validateSignup = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
    handleValidationErrors
];

// 2. Login Validation
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// 3. Driver Verification Validation
export const validateVerification = [
    body('license_number')
        .trim()
        .notEmpty().withMessage('License number is required')
        .escape(),
    body('license_expiry')
        .trim()
        .notEmpty().withMessage('License expiry date is required')
        .isISO8601().withMessage('Invalid expiry date format')
        .custom((value) => {
            const expiryDate = new Date(value);
            if (expiryDate <= new Date()) {
                throw new Error('License expiry date must be in the future');
            }
            return true;
        }),
    body('aadhar_number')
        .trim()
        .notEmpty().withMessage('Aadhar number is required')
        .isNumeric().withMessage('Aadhar number must contain digits only')
        .isLength({ min: 12, max: 12 }).withMessage('Aadhar number must be exactly 12 digits'),
    handleValidationErrors
];

// 4. Vehicle Registration Validation
export const validateVehicle = [
    body('vehicle_name')
        .trim()
        .notEmpty().withMessage('Vehicle name is required')
        .escape(),
    body('vehicle_number')
        .trim()
        .notEmpty().withMessage('Vehicle number is required')
        .matches(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i).withMessage('Invalid Indian vehicle number format (e.g. MP09AB1234)'),
    body('vehicle_type')
        .trim()
        .notEmpty().withMessage('Vehicle type is required')
        .isIn(['CAR', 'SUV', 'BIKE']).withMessage('Vehicle type must be CAR, SUV, or BIKE'),
    body('total_seats')
        .notEmpty().withMessage('Total seats is required')
        .isInt({ min: 1, max: 10 }).withMessage('Total seats must be between 1 and 10'),
    handleValidationErrors
];

// 5. Ride Creation Validation
export const validateRide = [
    body('vehicle_id')
        .notEmpty().withMessage('Vehicle ID is required'),
    body('origin')
        .trim()
        .notEmpty().withMessage('Origin is required')
        .escape(),
    body('destination')
        .trim()
        .notEmpty().withMessage('Destination is required')
        .escape(),
    body('departure_time')
        .trim()
        .notEmpty().withMessage('Departure time is required')
        .isISO8601().withMessage('Invalid departure time format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Departure time must be in the future');
            }
            return true;
        }),
    body('total_seats')
        .notEmpty().withMessage('Total seats is required')
        .isInt({ min: 1, max: 10 }).withMessage('Total seats must be between 1 and 10'),
    body('total_trip_cost')
        .notEmpty().withMessage('Total trip cost is required')
        .isFloat({ min: 1 }).withMessage('Total trip cost must be a positive number'),
    handleValidationErrors
];

// 6. Booking Creation Validation
export const validateBooking = [
    body('ride_id')
        .notEmpty().withMessage('Ride ID is required'),
    body('seats_booked')
        .notEmpty().withMessage('Seats booked is required')
        .isInt({ min: 1, max: 10 }).withMessage('Seats booked must be between 1 and 10'),
    handleValidationErrors
];
