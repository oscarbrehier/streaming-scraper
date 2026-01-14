export async function fetchViaGateway(url, options) {

	const newUrl = new URL(process.env.GATEWAY_URL);
	newUrl.searchParams.append("url", url);

	return fetch(newUrl.toString(), {
		...options,
		headers: {
			...(options?.headers || {}),
			"Authorization": `Bearer ${process.env.GATEWAY_API_KEY}`
		}
	});

};