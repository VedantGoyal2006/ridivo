/**
 * Custom Production-Grade Security Headers Middleware
 * Provides equivalent protections as Helmet without requiring third-party library installations.
 */
export const securityHeaders = (req, res, next) => {
    // 1. Prevent MIME type sniffing (nosniff)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // 2. Prevent Clickjacking (X-Frame-Options)
    res.setHeader('X-Frame-Options', 'DENY');
    
    // 3. Prevent Reflected XSS (X-XSS-Protection)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // 4. Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // 5. DNS Prefetch Control
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    
    // 6. Enforce HTTPS (Strict-Transport-Security) - active in production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // 7. Content-Security-Policy (CSP) - allow self and required CDNs (Cloudinary, OpenStreetMap, Fonts)
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https://res.cloudinary.com https://*.tile.openstreetmap.org https://unpkg.com; " +
        "connect-src 'self' ws: wss: http://localhost:5000 http://localhost:5173; " +
        "frame-ancestors 'none';"
    );

    next();
};
