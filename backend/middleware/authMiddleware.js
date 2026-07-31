export const protect = (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
        //This method is provided by Passport.js.It checks whether Passport has successfully authenticated the current request.
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