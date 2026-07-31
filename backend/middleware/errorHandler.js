/**
 * Centralized Global Error Handler Middleware
 * Standardizes API error responses and handles database-specific errors.
 */
export const errorHandler = (err, req, res, next) => {
    console.error('ERROR LOG:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        code: err.code,
        detail: err.detail
    });

    let statusCode = err.status || err.statusCode || 500;
    let errorId = 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'An unexpected error occurred';
    let details = [];

    // 1. PostgreSQL Specific Error Mapping
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                statusCode = 409;
                errorId = 'DUPLICATE_RESOURCE';
                message = 'A resource with these details already exists.';
                if (err.detail) {
                    const match = err.detail.match(/\((.*?)\)=\((.*?)\)/);
                    if (match) {
                        message = `${match[1].charAt(0).toUpperCase() + match[1].slice(1)} '${match[2]}' is already registered.`;
                    }
                }
                break;
            case '23503': // Foreign key violation
                statusCode = 400;
                errorId = 'FOREIGN_KEY_VIOLATION';
                message = 'Referenced resource does not exist or is associated with another entity.';
                break;
            case '22P02': // Invalid text representation (e.g., malformed UUID)
                statusCode = 400;
                errorId = 'BAD_REQUEST';
                message = 'Invalid data identifier format.';
                break;
            case '40P01': // Deadlock detected
                statusCode = 409;
                errorId = 'TRANSACTION_DEADLOCK';
                message = 'A concurrency lock conflict occurred. Please retry your request.';
                break;
            default:
                break;
        }
    }

    // 2. Custom validation or operational errors
    if (err.name === 'ValidationError') {
        statusCode = 422;
        errorId = 'VALIDATION_FAILED';
        message = 'The input validation failed.';
        details = err.errors || [];
    }

    res.status(statusCode).json({
        success: false,
        error: errorId,
        message,
        details: details.length > 0 ? details : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
