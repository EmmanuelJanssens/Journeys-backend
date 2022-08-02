const express =  require('express')
const jwt = require('jsonwebtoken');
const user = require('../graphql/Models').User
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const userService = require('../services/userService');

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


passport.serializeUser((user,done) =>{
    console.log("serialize")
    done(null,user)
})

passport.deserializeUser((req,user,done) => {
    console.log("deserialize")
    userService.findOne(user.userName).then((user) => {
        return done(null,user);
    })
})
router.post("/login",async(req,res) => {

    const body = req.body
    console.log(req.body)

    const selectionSet = `
    {
        userName
        password
    }
    `
    const result = await user.find({
        where: { userName: body.userName}
    })
    if(result.length === 1 ){
        const valid = await bcrypt.compare(body.password, result[0].password) && result[0].userName === body.userName
        if(valid){
            const token = jwt.sign(
                {userName: body.userName},
                 'secret',
                {expiresIn: '1h'}
                );
            result[0].token = token
            res.status(200).json(result[0])
        }
        else{
            res.status(403).json({message:"Invalid credentials"})
        }
    }else
    {
        console.log(result)
        res.status(400).json({message:"something went wrong"})
    }
    
})


router.post("/register",async(req,res) => {
    const body = req.body
    const selectionSet = `
    {
        userName
        password
    }
    `
    const result = await user.find({
        where: { userName: body.userName}
    })
    if(result.length === 1 ){
        res.status(400).json({message:"user already exists"})
    }else{
        const hash = await bcrypt.hash(body.password, 10)
        var newUser = await user.create({
            input:
            [{
                userName: body.userName,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                password: hash
            }]
        })
        
        newUser = newUser['users'];
        console.log(newUser)
        if(newUser.length === 1 && newUser[0].userName === body.userName){
            const token = jwt.sign(
                {userName: body.userName},
                 '1234',
                {expiresIn: '1h'}
                );
            const result = newUser[0]
            result.token = token
            console.log(result)
            res.status(200).json(result)
        }
        else{
            res.status(400).json({message:"something went wrong"})
        }
    }
    
})
module.exports= {
    router: router,
    passport: passport
}