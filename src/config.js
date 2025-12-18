import "dotenv/config";

const config = {
PORT: process.env.PORT || '3002',
ALLOWED_ORIGINS: JSON.parse(process.env.ALLOWED_ORIGINS) || ['apps/streaming', 'apps/api'],
BASE_URL: process.env.BASE_URL || 'http://localhost:3002',
SCRAPER_API_KEY: process.env.SCRAPER_API_KEY || '',
SCRAPER_SECRET: process.env.SCRAPER_SECRET || '',
TMDB_API_KEY: process.env.TMDB_API_KEY || ''
};

export default config;