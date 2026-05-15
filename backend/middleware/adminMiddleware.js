export const adminOnly = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ 
            message: 'Access denied, admins only' 
        });
    }
    next();
};