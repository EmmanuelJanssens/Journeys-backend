const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const poiService = require('../services/poiService');

router.use(require('body-parser').json());

// get all pois arround a certain locationnnnn
router.get('/', asyncHandler(async (req, res, next) => {
  const {
    page, pageSize, sort, radius, lat, lng,
  } = req.query;

  if (!Number(lat) || !Number(lng) || !Number(radius)) {
    return next('Bad request format, required lat,lng,radius');
  }

  const pageNumber = Number(page) ? Number(page) : 0;
  const pageSizeNumber = Number(pageSize) ? Number(pageSize) : 10;

  const result = await poiService.getPois(pageNumber, pageSizeNumber, sort, radius, lat, lng);
  return res.json(result).end();
}));

// get poi by id
router.get('/:id', asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (id == null) {
    return next('Id is required');
  }

  const result = await poiService.getPoi(id);
  return res.json(result).end();
}));

// get experience list from poi
router.get('/:id/experiences', asyncHandler(async (req, res, next) => {
  const { id, cursor, pageSize } = req.params;

  if (id == null) {
    return next('Id is required');
  }

  const pageSizeNumber = Number(pageSize) ? Number(pageSize) : 10;
  const cursorStr = cursor === undefined ? null : cursor;
  const result = await poiService.getPoiExperiences(id, cursorStr, pageSizeNumber);
  return res.json(result).end();
}));

// create a new poi
router.post('/', asyncHandler(async (req, res, next) => {
  try {
    const result = await poiService.addPoi(req.body);
    return res.json(result).end();
  } catch (e) {
    return next(e);
  }
}));

// update a poi
router.put('/:id', asyncHandler(async (req, res, next) => {
  try {
    const result = await poiService.updatePoi(req.body);
    return res.json(result).end();
  } catch (e) {
    return next(e);
  }
}));
module.exports = router;
