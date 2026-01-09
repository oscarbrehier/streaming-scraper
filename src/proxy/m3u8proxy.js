// M3U8 proxy function based on the working implementation
import fetch from 'node-fetch';
import { DEFAULT_USER_AGENT } from '../routes/proxy.js';
import { proxiedFetch } from '../helpers/proxiedFetch.js';

export async function proxyM3U8(targetUrl, headers, res, serverUrl) {

    try {

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

        if (res.req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const response = await proxiedFetch(targetUrl, {
            headers: {
                'User-Agent': DEFAULT_USER_AGENT,
                ...headers
            }
        });

        if (!response.ok) {
            res.writeHead(response.status);
            res.end(`M3U8 fetch failed: ${response.status}`);
            return;
        }

        const m3u8Content = await response.text();

        // Process M3U8 content line by line - key difference from our previous implementation
        const processedLines = m3u8Content.split('\n').map((line) => {
            line = line.trim();

            if (!line) return null; // skip empty
            if (line.startsWith('#EXT-X-I-FRAME-STREAM-')) return null; // remove I-frame lines
            if (line.startsWith('#') && !line.includes('URI=')) return line; // keep other comments

            // Handle EXT-X-MEDIA URIs (audio/subs)
            if (line.startsWith('#EXT-X-MEDIA:') && line.includes('URI=')) {
                const uriMatch = line.match(/URI="([^"]+)"/);
                if (uriMatch) {
                    const mediaUrl = new URL(uriMatch[1], targetUrl).href;
                    const proxyUrl = `${serverUrl}/m3u8-proxy?url=${encodeURIComponent(mediaUrl)}`;
                    return line.replace(uriMatch[1], proxyUrl);
                }
                return line;
            }

            // Handle EXT-X-KEY
            if (line.startsWith('#EXT-X-KEY:') && line.includes('URI=')) {
                const uriMatch = line.match(/URI="([^"]+)"/);
                if (uriMatch) {
                    const keyUrl = new URL(uriMatch[1], targetUrl).href;
                    const proxyUrl = `${serverUrl}/ts-proxy?url=${encodeURIComponent(keyUrl)}`;
                    return line.replace(uriMatch[1], proxyUrl);
                }
                return line;
            }

            // Handle segments and nested m3u8 files
            if (!line.startsWith('#')) {
                try {
                    const cleanLine = line.split(',')[0].trim(); // remove trailing JSON/extra
                    const segmentUrl = new URL(cleanLine, targetUrl).href;

                    return segmentUrl.includes('.m3u8')
                        ? `${serverUrl}/m3u8-proxy?url=${encodeURIComponent(segmentUrl)}`
                        : `${serverUrl}/ts-proxy?url=${encodeURIComponent(segmentUrl)}`;
                } catch (e) {
                    return null;
                }
            }

            return line;
        });

        const processedContent = processedLines.filter(Boolean).join('\n');

        // Set proper headers
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        // res.setHeader('Content-Length', Buffer.byteLength(processedContent));
        res.setHeader('Cache-Control', 'no-cache');

        res.writeHead(200);
        res.end(processedContent);

    } catch (error) {

        console.error('[M3U8 Proxy Error]:', error.message);
        res.writeHead(500);
        res.end(`M3U8 Proxy error: ${error.message}`);

    };
    
};
