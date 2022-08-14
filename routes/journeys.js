const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const journeyService = require('../services/journeyService');
const auth = require('./authentication');

router.use(require('body-parser').json());

router.get('/', asyncHandler(async (req, res) => {
  const {
    page, pageSize, sort,
  } = req.query;

  const pageNumber = Number(page) ? Number(page) : 0;
  const pageSizeNumber = Number(pageSize) ? Number(pageSize) : 10;

  const result = await journeyService.getJourneys(pageNumber, pageSizeNumber, sort);
  return res.json(result).end();
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const nexp = req.query.experiences;
  const { id, cursor } = req.params;
  const cursorStr = cursor === undefined ? null : cursor;
  const result = await journeyService.getJourney(id, cursorStr, nexp);
  return res.json(result).end();
}));

router.get('/:id/experiences', asyncHandler(async (req, res) => {
  const nexp = req.query.experiences;
  const { id } = req.params;
  const result = await journeyService.getJourney(id, nexp);
  return res.json(result).end();
}));

router.post('/', auth.passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    const result = await journeyService.addJourney(req.body, req.user[0]);
    return res.json(result).end();
  } catch (e) {
    return next(e);
  }
}));

router.put('/', auth.passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    const result = await journeyService.updateJourney(req.body);
    return res.json(result).end();
  } catch (e) {
    return next(e);
  }
}));

router.post('/experience', auth.passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    const result = await journeyService.addExperience(req.body);
    return res.json(result).end();
  } catch (e) {
    return next(e);
  }
}));

module.exports = router;
