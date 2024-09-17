const jwt = require("jsonwebtoken")

const authUser = async(req,res,next)=>{
    const {token} = req.headers;
    if(!token){
       return res.status(500).json({
        success:false,
        message:"Not authorized Login agin"
       })  
    }
    
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
        
    }


}
module.exports = authUser;