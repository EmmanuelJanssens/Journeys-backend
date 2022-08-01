const router = require('express').Router()
const user = require('../graphql/Models').User
const auth = require('../middleware/auth')

router.get("/:userName",auth,async(req,res) => {
    const userName = req.params.userName
    const result = await user.find({
        where: { userName: userName}
    })
    res.status(200).json(result[0])
})
router.get("/:userName/journeys",async(req,res) => {
    const userName = req.params.userName;
    const selectionSet = `
        {
            userName
            journeys{
                id
                title
                experiencesConnection{
                    edges{
                        date
                        description
                        images
                        order
                    }
                }
            }
        }
    `
    const users = await user.find({
        selectionSet,
        where: { userName: userName }
    });

    if(users.length > 1){
        throw new Error("More than one user found")
    }
    res.status(200).json(users[0]).end();
})

module.exports = router;
