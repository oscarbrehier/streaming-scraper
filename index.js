import express from 'express';
import { strings } from './src/strings.js';
import { handleErrorResponse } from './src/helpers/helper.js';
import { ErrorObject } from './src/helpers/ErrorObject.js';
import { getCacheStats } from './src/cache/cache.js';
import { startup } from './src/utils/startup.js';
import { authMiddleware } from "./src/middleware/auth.js";
import { createCorsMiddleware } from './src/middleware/cors.js';

import proxyRoutes from "./src/routes/proxy.js";
import movieRoutes from "./src/routes/movie.js";
import tvRoutes from "./src/routes/tv.js";

const PORT = process.env.PORT || 3002;

const parseAllowedOrigins = (allowedOrigins) => {

    if (!allowedOrigins) return [];

    const stripped = allowedOrigins.trim().replace(/^\[|\]$/g, '');

    return stripped
        .split(',')
        .map((s) => s.trim().replace(/^\"|\"$|^\'|\'$/g, ''))
        .filter(Boolean);

};

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS) || [];

const app = express();

app.use(createCorsMiddleware(allowedOrigins));

app.use("", proxyRoutes);
app.use("/movie", movieRoutes);
app.use("/tv", tvRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        home: strings.HOME_NAME,
        routes: strings.ROUTES,
        information: strings.INFORMATION,
        license: strings.LICENSE,
        source: strings.SOURCE
    });
});

app.get('/cache-stats', authMiddleware, (req, res) => {
    const stats = getCacheStats();

    res.status(200).json({
        ...stats,
        cacheEnabled: true,
        ttl: '3 hours (10800 seconds)'
    });
});

app.get('/{*any}', (req, res) => {
    handleErrorResponse(
        res,
        new ErrorObject(
            strings.ROUTE_NOT_FOUND,
            'user',
            404,
            strings.ROUTE_NOT_FOUND_HINT,
            true,
            false
        )
    );
});

startup();

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    if (process.argv.includes('--debug')) {
        console.log(`Debug mode is enabled.`);
        console.log('Cache is disabled.');
    } else {
        console.log('Debug mode is disabled.');
        console.log('Cache is enabled.');
    }
});
