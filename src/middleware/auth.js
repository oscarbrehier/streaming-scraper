import 'dotenv/config';
import jwt from 'jsonwebtoken';
import config from '../config.js';

const SECRET = config.SCRAPER_SECRET;
const API_KEY = config.SCRAPER_API_KEY;
const BASE_URL = config.BASE_URL;

// Helper to properly decode query values
function decodeQueryString(str) {
    return decodeURIComponent(str.replace(/\+/g, ' '));
};

export function validateSignedToken(req, res, next) {

    const { token: queryToken } = req.query;

    // For internal unsigned requests from m3u8 proxy
    if (!queryToken) {
        return next();
    };

    try {

        const payload = jwt.verify(queryToken, SECRET);
        const pathname = req.path;

        // Build query string without the token
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(req.query)) {
            if (key !== 'token') {
                queryParams.append(key, value);
            }
        }

        const reconstructedUrl = `${BASE_URL}${pathname}?${queryParams.toString()}`;

        const normalizedExpected = decodeQueryString(payload.url);
        const normalizedReconstructed = decodeQueryString(reconstructedUrl);

        if (normalizedExpected !== normalizedReconstructed) {
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

    };

};

export function authMiddleware(req, res, next) {

    // For API routes (/movie, /tv), check Bearer token
    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header'
        });

    };

    const token = authHeader.split(' ')[1];

    if (token !== API_KEY) {

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid API key'
        });

    };

    next();

};