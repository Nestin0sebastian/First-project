const userModel = require('../model/schema');



const isblocked= async (req,res,next)=>{
    const data=req.session.dataofuser._id
    const user = await userModel.findOne({ _id: data });
    if (user.isblocked){
    return res.redirect('/login')
    }
    return next()

}

module.exports={isblocked}