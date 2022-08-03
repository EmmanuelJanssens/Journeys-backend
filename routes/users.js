const router = require('express').Router();
const user = require('../graphql/Models').User;

router.get('/:userName/journeys', async (req, res) => {
  const { userName } = req.params;
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
    `;
  const users = await user.find({
    selectionSet,
    where: { userName },
  });

  if (users.length > 1) {
    throw new Error('More than one user found');
  }
  res.status(200).json(users[0]).end();
});

module.exports = router;
