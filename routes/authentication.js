const express =  require('express')
const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

const authenticationService = require('../services/authenticationService')

const router = express.Router()
router.use(express.json())
router.use(express.urlencoded({extended: true}))

var passport  = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts,function(jwt_payload,done){
  userService.findOne(jwt_payload.userName).then((user) => {
    return done(null,user)
  })
}))


router.post("/login",asyncHandler(async(req,res,next) => {

    try{
        const loginAtempt = await authenticationService.login(req.body.userName,req.body.password)
        res.json(loginAtempt).end();

    }catch(e){
        return next(e)
    }
}))


router.post("/register",asyncHandler(async(req,res,next) => {

    try{
        const registerAtempt = await authenticationService.register(req.body)
        res.json(registerAtempt).end(); 
    }catch(e){
        return next(e) 
    }
}))
module.exports= {
    router: router,
    passport: passport
}