


const checksession=(req,res,next)=>{
if (req.session.dataofuser){
    
    next()
}
else{
    res.redirect('/login')}



}



const loginback=(req,res,next)=>{
    if(req.session.dataofuser){
        res.redirect('/')
    }
    else{next()}
}



module.exports={checksession,loginback}