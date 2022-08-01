const jwt =  require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if( !token ) {
        return res.status(403).send("Token required for authentication");
    }

    try{
        const decoded = jwt.verify(token, '1234');
        req.user = decoded;
        next();
    }catch(err){
        return res.status(403).send("Invalid token");
    }
}

module.exports = verifyToken;