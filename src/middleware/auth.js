import 'dotenv/config';
import jwt from 'jsonwebtoken';

const SECRET = process.env.SCRAPER_SECRET;
const API_KEY = process.env.SCRAPER_API_KEY;

function authMiddleware(req, res, next) {
    const { token: queryToken, url } = req.query;

    console.log('TOKEN', queryToken);

    if (req.url.endsWith('.m3u8')) {
        console.log('Playlist request', queryToken);
    } else {
        console.log('Segment request', queryToken);
    }

    if (queryToken) {
        try {
            const payload = jwt.verify(queryToken, SECRET);

            const protocol =
                req.headers['x-forwarded-proto'] || req.protocol || 'http';
            const host = req.headers.host;
            const pathname = req.path;

            const queryParams = new URLSearchParams();
            for (const [key, value] of Object.entries(req.query)) {
                if (key !== 'token') {
                    queryParams.append(key, value);
                }
            }

            const reconstructedUrl = `${protocol}://${host}${pathname}?${queryParams.toString()}`;

            if (payload.url !== reconstructedUrl) {
                console.log('URL mismatch:');
                console.log('Expected:', payload.url);
                console.log('Got:', reconstructedUrl);

                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Token not valid for this URL'
                });
            };

            return next();
        } catch (err) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Invalid or expired token'
            });
        }
    }

    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header'
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
