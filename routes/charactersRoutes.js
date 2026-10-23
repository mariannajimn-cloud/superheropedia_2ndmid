import express from 'express';
import { searchCharacters, getCharacterById } from '../services/charactersServices.js';
import { ApiError } from '../middleware/errors.js';

const router = express.Router();

// route of sction search
router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search === undefined ? '' : req.query.search;

    if (typeof search !== 'string' || search.trim().length > 100) {
      throw new ApiError(400, 'Search must be a single name of at most 100 characters.'); 
    }

    const results = await searchCharacters(search.trim());
    res.json(results);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const idText = req.params.id;
    const id = Number(idText);
    const isPositiveInteger = Number.isSafeInteger(id) && id > 0;
    const hasStandardFormat = String(id) === idText;

    if (!isPositiveInteger || !hasStandardFormat) {
      throw new ApiError(400, 'Character ID must be a positive integer.');
    }

    const character = await getCharacterById(id);
    res.json(character);
  } catch (error) {
    next(error);
  }
});

export default router;
