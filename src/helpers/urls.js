import 'dotenv/config';
import jwt from "jsonwebtoken";
import config from '../config.js';

const SECRET = config.SCRAPER_SECRET;
const ENABLE_SIGNING = false; // Toggle this to enable/disable

/**
 * Generate a signed URL with a JWT token appended as query parameter.
 * When ENABLE_SIGNING, returns URL with a token that exprires after 10 minutes.
 * If disabled returns the original URL unchanged.
 * @param {string} baseUrl
 * @returns {string}
 */
export function generateSignedURL(baseUrl) {

	if (!ENABLE_SIGNING) return baseUrl;

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