import fetch from 'node-fetch';
import { httpsAgent } from './http';

export async function proxiedFetch(url, options = {}) {
	return fetch(url, {
		...options,
		agent: httpsAgent
	});
};