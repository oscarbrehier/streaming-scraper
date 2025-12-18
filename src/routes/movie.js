import { Router } from 'express';
import { getMovieFromTmdb } from '../helpers/tmdb.js';
import { scrapeMedia } from '../api.js';
import { authMiddleware } from '../middleware/auth.js';
import { processApiResponse } from '../proxy/proxyserver.js';
import { handleErrorResponse, checkIfPossibleTmdbId } from '../helpers/helper.js';
import { ErrorObject } from '../helpers/ErrorObject.js';
import { strings } from '../strings.js';
import config from '../config.js';

const router = Router();

router.get('/:tmdbId', authMiddleware, async (req, res) => {
	if (!checkIfPossibleTmdbId(req.params.tmdbId)) {
		return handleErrorResponse(
			res,
			new ErrorObject(
				strings.INVALID_MOVIE_ID,
				'user',
				405,
				strings.INVALID_MOVIE_ID_HINT,
				true,
				false
			)
		);
	}

	const media = await getMovieFromTmdb(req.params.tmdbId);

	if (media instanceof ErrorObject) {
		return handleErrorResponse(res, media);
	}

	const output = await scrapeMedia(media);

	if (output instanceof ErrorObject) {
		return handleErrorResponse(res, output);
	}

	console.log('Scraper output files:', JSON.stringify(output.files, null, 2));

	const BASE_URL =
		config.BASE_URL || `${req.protocol}://${req.get('host')}`;
	const processedOutput = processApiResponse(output, BASE_URL);

	res.status(200).json(processedOutput);
});

router.get('/', (req, res) => {

	handleErrorResponse(
		res,
		new ErrorObject(
			strings.INVALID_MOVIE_ID,
			'user',
			405,
			strings.INVALID_MOVIE_ID_HINT,
			true,
			false
		)
	);

});

export default router;