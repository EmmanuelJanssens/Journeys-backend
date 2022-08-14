const express = require('express');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const authenticationService = require('../services/authenticationService');
const userService = require('../services/userService');

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(opts, ((jwtPayload, done) => {
  try {
    userService.findOne(jwtPayload.userName).then((user) => done(null, user));
  } catch (e) {
    done(e, null);
  }
})));

router.post('/login', asyncHandler(async (req, res, next) => {
  try {
    const loginAtempt = await authenticationService.login(req.body.userName, req.body.password);
    return res.json(loginAtempt).end();
  } catch (e) {
    return next(e);
  }
}));

router.post('/register', asyncHandler(async (req, res, next) => {
  try {
    const registerAtempt = await authenticationService.register(req.body);
    return res.json(registerAtempt).end();
  } catch (e) {
    return next(e);
  }
}));
module.exports = {
  router,
  passport,
};
