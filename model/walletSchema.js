const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    amount:{
        type:Number,
        required:true
    },
    type:{
        type:String,
        enum:['credit','debit'],
        required:true,
    },
    description:{
        type:String
    }
},{
    timestamps:true
})



const walletSchema=new mongoose.Schema({
 user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'userdb',
    required:true,
    unique:true,
 },
 balance:{
    type:Number,
    default:0,
    min:0,

 },
 transactions:[transactionsSchema],
 pendingOrder:{
    orderId:{
        type:String
    },
    amount:{
        type:Number,
        min:0,
    },currency:{
        type:String,
    },

 },

},
{
    timestamps:true,
})


const Wallet=mogoose.model('Wallet',walletSchema)
module.exports=Wallet