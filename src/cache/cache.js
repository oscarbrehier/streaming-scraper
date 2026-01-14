export function getCacheKey(media) {

    // if (media.type === 'tv') {
    //     return `${media.type}_${media.tmdb}_${media.season}_${media.episode}`;
    // }

    return `media-${media.tmdb}`;

};

export async function setToCache(key, data) {

    // Store the scraped data so we don't have to fetch it again
    // return cache.set(key, data);

    try {

        const res = await fetch(`${process.env.API_URL}/cache`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.API_INTERNAL_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key,
                data,
            })
        });

        if (!res.ok) {
            console.error(`Failed to sync cache to Redis: ${res.statusText}`);
        };

        console.info(`Synced response to Redis`);

        return res.ok;

    } catch (err) {
        console.error(`Redis sync error:`, err);
        return false;
    };

};