const asyncHandler = require('express-async-handler');
const router = require('express').Router()
const journeyService = require('../services/journeyService')

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

router.post("/",asyncHandler(async(req,res,next)=>{
    result = await journeyService.addJourney(req.body)
    return res.json(result).end();
}))

module.exports = router

