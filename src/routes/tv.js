import { Router } from 'express';
import { scrapeMedia } from '../api.js';
import { processApiResponse } from '../proxy/proxyserver.js';
import { getTvFromTmdb } from '../helpers/tmdb.js';
import { strings } from '../strings.js';
import { checkIfPossibleTmdbId, handleErrorResponse } from '../helpers/helper.js';
import { ErrorObject } from '../helpers/ErrorObject.js';
import { authMiddleware } from "../middleware/auth.js";
import config from '../config.js';

const router = Router();

router.get('/:tmdbId', authMiddleware, async (req, res) => {
	if (
		!checkIfPossibleTmdbId(req.params.tmdbId) ||
		!checkIfPossibleTmdbId(req.query.s) ||
		!checkIfPossibleTmdbId(req.query.e)
	) {
		return handleErrorResponse(
			res,
			new ErrorObject(
				strings.INVALID_TV_ID,
				'user',
				405,
				strings.INVALID_TV_ID_HINT,
				true,
				false
			)
		);
	}

	const media = await getTvFromTmdb(
		req.params.tmdbId,
		req.query.s,
		req.query.e
	);

	if (media instanceof ErrorObject) {
		return handleErrorResponse(res, media);
	}

	const output = await scrapeMedia(media);

	if (output instanceof ErrorObject) {
		return handleErrorResponse(res, output);
	}

	const BASE_URL =
		config.BASE_URL || `${req.protocol}://${req.get('host')}`;
	const processedOutput = processApiResponse(output, BASE_URL);

	res.status(200).json(processedOutput);
});

router.get('/', (req, res) => {

	handleErrorResponse(
		res,
		new ErrorObject(
			strings.INVALID_TV_ID,
			'user',
			405,
			strings.INVALID_TV_ID_HINT,
			true,
			false
		)
	);

});

export default router;