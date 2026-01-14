import "./utils/console.js";
import express from 'express';
import { strings } from './strings.js';
import { handleErrorResponse } from './helpers/helper.js';
import { ErrorObject } from './helpers/ErrorObject.js';
import { startup } from './utils/startup.js';
import { createCorsMiddleware } from './middleware/cors.js';

import proxyRoutes from "./routes/proxy.js";
import movieRoutes from "./routes/movie.js";
import tvRoutes from "./routes/tv.js";
import config from './config.js';

const PORT = config.PORT;

const allowedOrigins = config.ALLOWED_ORIGINS;

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

    console.info(`Server is running on port http://localhost:${PORT}`);

    const isDebugMode = process.argv.includes("--argv");
    const loggingDisabled = process.argv.includes("--no-log") || process.env.NO_LOG === "true";

    console.info(`Debug mode is ${isDebugMode ? "enabled" : "disabled"}`);
    console.info(`Cache is ${isDebugMode ? "disabled" : "enabled"}`);

    if (loggingDisabled) console.info("Console logs have been disabled");

});
