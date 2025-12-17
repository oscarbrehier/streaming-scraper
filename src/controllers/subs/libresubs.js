import { proxiedFetch } from "../../helpers/proxiedFetch.js";

export async function getLibre(media) {
    const DOMAIN = `https://libre-subs.fifthwit.net/search?id=${media.tmdb}`;

    let url;
    if (media.type === 'movie') {
        url = DOMAIN;
    } else {
        url = `${DOMAIN}&season=${media.season}&episode=${media.episode}`;
    }
    let request = await proxiedFetch(url);

    let subtitlesWithNerdyAmountOfInformation = await request.json();

    return {
        files: [],
        subtitles: subtitlesWithNerdyAmountOfInformation.map((sub) => ({
            url: sub.url,
            lang: sub.language,
            type: sub.format
        }))
    };
}
