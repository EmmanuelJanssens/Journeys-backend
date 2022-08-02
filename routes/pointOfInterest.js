const asyncHandler = require('express-async-handler');
const { json } = require('neo4j-driver-core');
const router = require('express').Router()
const poiService = require('../services/poiService')

router.use(require('body-parser').json());


//get all pois arround a certain locationnnnn
 router.get("/",asyncHandler(async(req,res,next) => {
    var {offset,limit,sort,radius,lat,lng} = req.query;

    if(!Number(lat) ||  !Number(lng) || !Number(radius) ){
        return next("Bad request format, required lat,lng,radius")     
    }


    result =  await poiService.getPois(offset,limit,sort,radius,lat,lng)
    res.json(result).end()

}))

//get poi by id
router.get("/:id",asyncHandler(async(req,res,next) => {
    const id = req.params.id

    if(id == null){
        return next("Id is required")
    }

    result = await poiService.getPoi(id);
    res.json(result).end();
}))

//get experience list from poi
router.get("/:id/experiences",asyncHandler(async(req,res,next)=>{
    const id = req.params.id;
    const maxExperiences = req.query.maxExperiences;

    if(id == null){
        return next("Id is required")
    }

    result = await poiService.getPoiExperiences(id,Number(maxExperiences))
    res.json(result).end();
}))


//create a new poi
router.post("/",asyncHandler(async(req,res,next) => {
    console.log(req.body)
    result = await poiService.addPoi(req.body)
    return res.json(result).end();
}))

//update a poi
router.put("/:id",asyncHandler(async(req,res,next) => {
    console.log(req.body)
    result = await poiService.updatePoi(req.body)
    return res.json(result).end();
}))
module.exports=router