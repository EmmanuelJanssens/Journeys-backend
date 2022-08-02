const user = require('../graphql/Models').User
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const authenticationService = {
    async login(userName,password){

        const foundUser = await user.find({
            where: {userName: userName}
        })

        if(foundUser.length === 1) {
            //test password
            const validPwd = await bcrypt.compare(
                password,foundUser[0].password) &&
                foundUser[0].userName === userName;

            if(validPwd){

                const token  = jwt.sign(
                    {userName: userName},
                    'secret',
                    {expiresIn: '5h'}
                );

                foundUser[0].token = token
                return foundUser[0];
            }else{
                throw new Error("Bad credentials")
            }
        }else{
            throw new Error("Something went wrong")
        }
    },
    async register(userData){
       
    const result = await user.find({
        where: { userName: userData.userName}
    })
    if(result.length === 1 ){
        throw new Error("User already exists")
    }else{
        const hash = await bcrypt.hash(userData.password, 10)
        var newUser = await user.create({
            input:
            [{
                userName: userData.userName,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: hash
            }]
        })
        
        newUser = newUser['users'];
        if(newUser.length === 1 && newUser[0].userName === userData.userName){
            const token = jwt.sign(
                {userName: userData.userName},
                 '1234',
                {expiresIn: '5h'}
                );
            const result = newUser[0]
            result.token = token

            return result;
        }
        else{
            throw new Error("Could not register")
        }
    } 
    }
}

module.exports = authenticationService;