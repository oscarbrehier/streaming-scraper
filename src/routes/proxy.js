import { proxyM3U8 } from "../proxy/m3u8proxy.js"
import { proxyTs } from '../proxy/proxyTs.js';
import { proxiedFetch } from '../helpers/proxiedFetch.js';
import { authMiddleware, validateSignedToken } from '../middleware/auth.js';
import { handleCors } from '../proxy/handleCors.js';
import { Router } from "express";
import config from "../config.js";

const router = Router();

// Default user agent
export const DEFAULT_USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const BASE_URL = config.BASE_URL;

// Test endpoint to verify proxy is working
router.get('/proxy/status', authMiddleware, (req, res) => {
	if (handleCors(req, res)) return;

	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(
		JSON.stringify({
			status: 'Proxy server is working',
			timestamp: new Date().toISOString(),
			userAgent: req.headers['user-agent']
		})
	);
});

// Simplified M3U8 Proxy endpoint based on working implementation
router.get('/m3u8-proxy', validateSignedToken, (req, res) => {
	if (handleCors(req, res)) return;

	const targetUrl = req.query.url;
	let headers = {};

	try {
		headers = JSON.parse(req.query.headers || '{}');
	} catch (e) {
		// Invalid headers JSON
	}

	if (!targetUrl) {
		res.writeHead(400, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'URL parameter required' }));
		return;
	}

	// Get server URL for building proxy URLs
	const protocol =
		req.headers['x-forwarded-proto'] || req.protocol || 'http';
	const host = req.headers.host;
	const serverUrl = `${protocol}://${host}`;

	proxyM3U8(targetUrl, headers, res, BASE_URL);
});

// Simplified TS/Segment Proxy endpoint
router.get('/ts-proxy', validateSignedToken, (req, res) => {
	if (handleCors(req, res)) return;

	const targetUrl = req.query.url;
	let headers = {};

	try {
		headers = JSON.parse(req.query.headers || '{}');
	} catch (e) {
		// Invalid headers JSON
	}

	if (!targetUrl) {
		res.writeHead(400, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'URL parameter required' }));
		return;
	}

	proxyTs(targetUrl, headers, req, res).then((r) => r);
});

// HLS Proxy endpoint (alternative endpoint)
router.get('/proxy/hls', (req, res) => {
	if (handleCors(req, res)) return;

	const targetUrl = req.query.link;
	let headers = {};

	try {
		headers = JSON.parse(req.query.headers || '{}');
	} catch (e) {
		// Invalid headers JSON
	}

	if (!targetUrl) {
		res.writeHead(400, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Link parameter is required' }));
		return;
	}

	const protocol =
		req.headers['x-forwarded-proto'] || req.protocol || 'http';
	const host = req.headers.host;
	const serverUrl = `${protocol}://${host}`;

	proxyM3U8(targetUrl, headers, res, BASE_URL);
});

router.options('/sub-proxy', (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.sendStatus(200);
});

// Subtitle Proxy endpoint
router.get('/sub-proxy', (req, res) => {

	if (handleCors(req, res)) return;

	const targetUrl = req.query.url;
	let headers = {};

	try {
		headers = JSON.parse(req.query.headers || '{}');
	} catch (e) {
		// Invalid headers JSON
	}

	if (!targetUrl) {
		res.writeHead(400, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'url parameter required' }));
		return;
	}

	proxiedFetch(targetUrl, {
		headers: {
			'User-Agent': DEFAULT_USER_AGENT,
			...headers
		}
	})
		.then((response) => {
			if (!response.ok) {
				res.writeHead(response.status);
				res.end(`Subtitle fetch failed: ${response.status}`);
				return;
			}

			res.setHeader(
				'Content-Type',
				response.headers.get('content-type') || 'text/vtt'
			);
			res.setHeader('Cache-Control', 'public, max-age=3600');

			res.writeHead(200);
			response.body.pipe(res);
		})
		.catch((error) => {
			console.error('[Sub Proxy Error]:', error.message);
			res.writeHead(500);
			res.end(`Subtitle Proxy error: ${error.message}`);
		});
});

export default router;