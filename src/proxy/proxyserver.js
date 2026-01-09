import 'dotenv/config';
import crypto from 'crypto';
import { extractOriginalUrl, getOriginFromUrl } from './parser.js';
import { generateSignedURL } from '../helpers/urls.js';

export function processApiResponse(apiResponse, serverUrl) {

    if (!apiResponse.files) return apiResponse;

    const processedFiles = apiResponse.files
        .map((file) => {

            if (!file.file || typeof file.file !== 'string') return null;

            const id = crypto.randomUUID();
            let finalUrl = extractOriginalUrl(file.file);
            let proxyHeaders = file.headers || {};

            // Handle fallback URLs
            if (finalUrl.includes(' or ')) {

                const urls = finalUrl.split(' or ').map(u => u.trim());
                const validUrls = urls.filter(url => !url.includes('{v}'));

                if (!validUrls.length) return null;

                finalUrl = validUrls[0];

            };

            if (finalUrl.includes('{v')) return null;

            // Decide proxy type
            let type = 'mp4';
            let localProxyUrl = '';

            if (finalUrl.includes('.m3u8') || finalUrl.includes('m3u8')) {

                type = 'hls';
                const m3u8Origin = getOriginFromUrl(finalUrl);

                if (m3u8Origin) {

                    proxyHeaders = {
                        ...proxyHeaders,
                        Referer: proxyHeaders.Referer || m3u8Origin,
                        Origin: proxyHeaders.Origin || m3u8Origin
                    };

                }

                localProxyUrl = generateSignedURL(
                    `${serverUrl}/m3u8-proxy?url=${encodeURIComponent(finalUrl)}&headers=${encodeURIComponent(JSON.stringify(proxyHeaders))}`
                );

            } else {

                const videoOrigin = getOriginFromUrl(finalUrl);

                if (videoOrigin) {

                    proxyHeaders = {
                        ...proxyHeaders,
                        Referer: proxyHeaders.Referer || videoOrigin,
                        Origin: proxyHeaders.Origin || videoOrigin
                    };

                };

                localProxyUrl = generateSignedURL(
                    `${serverUrl}/ts-proxy?url=${encodeURIComponent(finalUrl)}&headers=${encodeURIComponent(JSON.stringify(proxyHeaders))}`
                );

            };

            return {
                ...file,
                id,
                file: localProxyUrl,
                type,
                headers: proxyHeaders
            };

        })
        .filter(Boolean);

    const processedSubtitles = (apiResponse.subtitles || []).map((sub) => {

        if (!sub.url || typeof sub.url !== 'string') return null;

        const id = crypto.randomUUID();
        const localProxyUrl = generateSignedURL(
            `/sub-proxy?url=${encodeURIComponent(sub.url)}`
        );

        return {
            ...sub,
            id,
            url: localProxyUrl
        };

    }).filter(Boolean);

    return {
        ...apiResponse,
        files: processedFiles,
        subtitles: processedSubtitles
    };

};