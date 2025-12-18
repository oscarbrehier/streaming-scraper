import 'dotenv/config';
import jwt from "jsonwebtoken";
import config from '../config.js';

const SECRET = config.SCRAPER_SECRET;

/**
 * Generate a signed URL with a JWT token appended as query parameter.
 * Exprires after 10 minutes.
 * @param {string} baseUrl
 * @returns {string}
 */
export function generateSignedURL(baseUrl) {

	const token = jwt.sign(
		{
			url: baseUrl,
			exp: Math.floor(Date.now() / 1000) + 60 * 10
		},
		SECRET
	);

	const url = new URL(baseUrl);
	url.searchParams.append("token", token);
	return url.toString();

};