import 'dotenv/config';
import { extractOriginalUrl, getOriginFromUrl } from './parser.js';
import { generateSignedURL } from '../helpers/urls.js';

export function processApiResponse(apiResponse, serverUrl) {
    if (!apiResponse.files) return apiResponse;

    const processedFiles = apiResponse.files
        .map((file) => {
            if (!file.file || typeof file.file !== 'string') return file;

            let finalUrl = file.file;
            let proxyHeaders = file.headers || {};

            // Extract original URL if it's wrapped in external proxy
            finalUrl = extractOriginalUrl(finalUrl);

            // Handle fallback URLs - split by " or " and find first valid one
            if (finalUrl.includes(' or ')) {
                const urls = finalUrl.split(' or ').map(u => u.trim());

                // Filter out URLs with unresolved placeholders
                const validUrls = urls.filter(url => !url.includes('{v'));

                if (validUrls.length === 0) {
                    console.warn(`All fallback URLs contain placeholders, skipping file`);
                    return null; // Skip this file entirely
                }

                finalUrl = validUrls[0];
                console.log(`Multiple fallback URLs found, using first valid: ${finalUrl}`);
            }

            // Skip URLs with unresolved placeholders
            if (finalUrl.includes('{v')) {
                console.warn(`Skipping URL with unresolved placeholder: ${finalUrl}`);
                return null;
            }

            // proxy ALL URLs through our system
            if (
                finalUrl.includes('.m3u8') ||
                finalUrl.includes('m3u8') ||
                (!finalUrl.includes('.mp4') &&
                    !finalUrl.includes('.mkv') &&
                    !finalUrl.includes('.webm') &&
                    !finalUrl.includes('.avi'))
            ) {
                // Use M3U8 proxy for HLS streams and unknown formats
                const m3u8Origin = getOriginFromUrl(finalUrl);
                if (m3u8Origin) {
                    proxyHeaders = {
                        ...proxyHeaders,
                        Referer: proxyHeaders.Referer || m3u8Origin,
                        Origin: proxyHeaders.Origin || m3u8Origin
                    };
                }

                const localProxyUrl = generateSignedURL(`${serverUrl}/m3u8-proxy?url=${encodeURIComponent(finalUrl)}&headers=${encodeURIComponent(JSON.stringify(proxyHeaders))}`);

                return {
                    ...file,
                    file: localProxyUrl,
                    type: 'hls',
                    headers: proxyHeaders
                };
            } else {
                // Use TS proxy for direct video files (.mp4, .mkv, .webm, .avi)
                const videoOrigin = getOriginFromUrl(finalUrl);
                if (videoOrigin) {
                    proxyHeaders = {
                        ...proxyHeaders,
                        Referer: proxyHeaders.Referer || videoOrigin,
                        Origin: proxyHeaders.Origin || videoOrigin
                    };
                }

                const localProxyUrl = generateSignedURL(`${serverUrl}/ts-proxy?url=${encodeURIComponent(finalUrl)}&headers=${encodeURIComponent(JSON.stringify(proxyHeaders))}`);

                return {
                    ...file,
                    file: localProxyUrl,
                    type: file.type || 'mp4',
                    headers: proxyHeaders
                };
            }
        })
        .filter(file => file !== null); // Remove null entries (invalid URLs)

    const processedSubtitles = (apiResponse.subtitles || []).map((sub) => {
        if (!sub.url || typeof sub.url !== 'string') return sub;

        const localProxyUrl = generateSignedURL(`${serverUrl}/sub-proxy?url=${encodeURIComponent(sub.url)}`);
        return {
            ...sub,
            url: localProxyUrl
        };
    });

    return {
        ...apiResponse,
        files: processedFiles,
        subtitles: processedSubtitles
    };
}