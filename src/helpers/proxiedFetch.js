import nodeFetch from 'node-fetch';

export async function proxiedFetch(url, options = {}) {
	return nodeFetch(url, options);
};