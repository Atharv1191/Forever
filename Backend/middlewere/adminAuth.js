const jwt = require('jsonwebtoken')

const adminAuth = async(req,res,next)=>{
try {
    const {token} = req.headers
    if(!token){
        return res.status(401).json({
            success:false,
            message:'Not Authorized Login Again'
        })
    }
    const token_decode = jwt.verify(token,process.env.JWT_SECRET);
    if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
        return res.status(401).json({
            success:false,
            message:'Not Authorized Login Again'
        })
    }
    next()
       
} catch (error) {
    return res.status(401).json({
        success:false,
        message:error.message


    })
    
}
}
module.exports = adminAuth;