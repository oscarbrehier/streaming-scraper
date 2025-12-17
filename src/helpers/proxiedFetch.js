import nodeFetch from 'node-fetch';

const PROXY_TOKEN = process.env.PROXY_API_TOKEN;
const BASE_PROXY_URL = 'https://api.scrape.do/';

export async function proxiedFetch(url, options = {}) {

	// const proxyUrl = new URL(BASE_PROXY_URL);
	// proxyUrl.searchParams.append('token', PROXY_TOKEN);
	// proxyUrl.searchParams.append('url', url);

	// console.log('[proxiedFetch] Fetching via proxy:', proxyUrl.toString());
	return nodeFetch(url, options);

};