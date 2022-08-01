const router = require('express').Router()
const journey = require('../graphql/Models').Journey


router.get("/",async(req,res) => {
    const page = Number(req.query.page) ? Number(req.query.page):  1
    const limit = Number( req.query.limit) ? Number( req.query.limit) : null;
    const offset = Number(page) ? (Number(page)-1)*limit : 10; 
    const sort = req.query.sort? {name:req.query.sort} : null

    console.log(req.query)
    const selectionSet = `
    {
        id
        title
        start{
            lat
            lng
        }
        end{
            lat
            lng
        }
        creator{
            userName
            firstName
            lastName
            email
        }

    }
    `

    const journeysCount  = await  journey.aggregate({
        aggregate: {count: "*"},
    })

    const journeys = await journey.find({
        selectionSet,
        options: {
            offset,
            limit,
            sort
        },        
    });

    const result = {
        journeys,
        pageInfo: {
            pageCount: Math.ceil(journeysCount.count / limit),
            next: {
                hasNext: journeys.length === limit,
                page: page + 1,
                limit
            },
        }
    }
    return  res.json(result).end();
})



router.get("/:id", async(req,res)  =>{
    const id = req.params.id
    const selectionSet = `
        {
            id
            title
            start{
                lat
                lng
            }
            end{
                lat
                lng
            }
            creator{
                userName
                firstName
                lastName
                email
            }
            experiencesConnection{
                edges{
                    date
                    description
                    images
                    order
                    node{
                        id
                        name
                        coordinates{
                            lat
                            lng
                        }
                    }
                }
            }

        }
    `
    const journeyQuery = await journey.find({
        selectionSet,
        where: { id: id },
    });

    if (journeyQuery.length > 1){
        throw new Error("More than one journey found")
    }
    return res.json(journeyQuery[0]).end();
})


router.get("/:id/experiences", async(req,res)  =>{
    const id = req.params.id
    const selectionSet = `
        {
            id
            experiences: experiencesConnection{
                data: edges{
                    date
                    description
                    images
                    order
                    node{
                        id
                        name
                        coordinates{
                            lat
                            lng
                        }
                    }
                }
            }
        }
    `
    const journeyQuery = await journey.find({
        selectionSet,
        where: {
            id: id
            },
    });
    
    console.log(journeyQuery)
    if (journeyQuery.length > 1){
        throw new Error("More than one journey found")
    }
    return res.json(journeyQuery[0]).end();
})

router.get("/:journey_id/experiences/:poi_id", async(req,res)  =>{
    const journey_id = req.params.journey_id
    const poi_id = req.params.poi_id
    const selectionSet = `
        {
            id

        }  
    `
})


module.exports = router

