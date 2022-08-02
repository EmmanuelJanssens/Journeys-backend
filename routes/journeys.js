const asyncHandler = require('express-async-handler');
const router = require('express').Router()
const journeyService = require('../services/journeyService')
const auth  = require('../routes/authentication')

router.use(require('body-parser').json());


router.get("/",async(req,res) => {
    var {offset,limit,sort} = req.query;

    result = await journeyService.getJourneys(offset,limit,sort)
    return  res.json(result).end();
})

router.get("/:id", async(req,res)  =>{
    const nexp = req.query.experiences
    const id = req.params.id
    result = await journeyService.getJourney(id,nexp);
    return res.json(result).end();
})

router.post("/",
            auth.passport.authenticate('jwt',{session: false}),
            asyncHandler(async(req,res,next)=>{
    
    result = await journeyService.addJourney(req.body,req.user[0])

    return res.json(result).end();
}))

module.exports = router

