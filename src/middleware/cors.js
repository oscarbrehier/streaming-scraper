import cors from "cors";

export const createCorsMiddleware = (allowedOrigins) => {

	return cors({
		origin: (origin, callback) => {
			if (
				!origin ||
				allowedOrigins.some((o) => origin.includes(o)) ||
				/^http:\/\/localhost/.test(origin)
			) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		}
	});

};