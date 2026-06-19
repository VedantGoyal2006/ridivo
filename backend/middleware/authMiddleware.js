export const protect = (req, res, next) => {
    // Passport session attaches user to req and adds req.isAuthenticated() helper
    if (req.isAuthenticated() && req.user) {
        // Check if account is active
        if (!req.user.is_active) {
            return res.status(403).json({ 
                message: 'Your account has been deactivated' 
            });
        }
        return next();
    }

    return res.status(401).json({ 
        message: 'Not authorized, please login' 
    });
};