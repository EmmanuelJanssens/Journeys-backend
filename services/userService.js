const user = require('../graphql/Models').User;

const userService = {

  async findOne(userName) {
    const result = await user.find({
      where: { userName },
    });
    return result;
  },
};

module.exports = userService;
