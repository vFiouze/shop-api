const jwt = require('jsonwebtoken')

module.exports = (req,res,next)=>{
    token = req.headers.authorization.split(" ")[1]
    try{
        var decoded = jwt.verify(token,process.env.JWT_KEY)
        req.userData = decoded
        next()
    }catch(err){
        res.status(401).json({
            message:"auth failed"
        })
    }
}