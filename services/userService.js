const {gql} = require('apollo-server-express');
const user = require('../graphql/Models').User
const uuid = require('uuid')

const userService = {

    async findOne(userName){
        const result = await user.find({
            where: { userName: userName}
        })
        return result
    }
};

module.exports = userService;