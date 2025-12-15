const API_KEY = process.env.SCRAPER_API_KEY;

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid token'
        });
    }

    const token = authHeader.split(' ')[1];

    if (token !== API_KEY) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid token'
        });
    }

    next();
}

export default authMiddleware;
