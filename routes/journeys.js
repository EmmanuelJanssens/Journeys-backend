const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const journeyService = require('../services/journeyService');
const auth = require('./authentication');

router.use(require('body-parser').json());

router.get('/', asyncHandler(async (req, res) => {
  const { offset, limit, sort } = req.query;

  const result = await journeyService.getJourneys(offset, limit, sort);
  return res.json(result).end();
}));

router.get('/:id', asyncHandler(async (req, res) => {
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
