const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const user = require('../graphql/Models').User;

/**
 * Service to handle everything related to authentication
 */
const authenticationService = {
  /**
   * Log a user in
   * @param {*} userName username
   * @param {*} password password
   * @returns logged in user
   */
  async login(userName, password) {
    const foundUser = await user.find({
      where: { userName },
    });

    if (foundUser.length === 1) {
      // test password
      const validPwd = await bcrypt.compare(password, foundUser[0].password)
                && foundUser[0].userName === userName;

      if (validPwd) {
        const token = jwt.sign(
          { userName },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_TOKEN_EXPIRATION },
        );

        foundUser[0].token = token;
        return foundUser[0];
      }
      throw new Error('Bad credentials');
    } else {
      throw new Error('Something went wrong');
    }
  },
  /**
   * register a new user
   * @param {*} userData data of the new user
   * @returns user registered
   */
  async register(userData) {
    const result = await user.find({
      where: { userName: userData.userName },
    });
    if (result.length === 1) {
      throw new Error('User already exists');
    } else {
      const hash = await bcrypt.hash(userData.password, 10);
      let newUser = await user.create({
        input:
                [{
                  userName: userData.userName,
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  email: userData.email,
                  password: hash,
                }],
      });

      newUser = newUser.users;
      if (newUser.length === 1 && newUser[0].userName === userData.userName) {
        const token = jwt.sign(
          { userName: userData.userName },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_TOKEN_EXPIRATION },
        );
        const userFound = newUser[0];
        userFound.token = token;

        return userFound;
      }

      throw new Error('Could not register');
    }
  },
};

module.exports = authenticationService;
