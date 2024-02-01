const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');


const SomeModelSchema = new Schema({
  firstname: String,
  lastname: String,
  email: String,
  contact: Number, 
  password: {
    type: String,
  },
  isblocked:{  
    type:Boolean,
    default:false
  },

refferalId:String,
referrer:{
  type:mongoose.Schema.Types.ObjectId,ref:'userdb'
},
wallet:{
  type:Number
},

  resetpasswordToken: String,
  resetTokenExpire: Date,




  
});

SomeModelSchema.methods=generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetpasswordToken = crypto
      .createHash('sha256') // Use a proper algorithm like sha256
      .update(resetToken)
      .digest('hex');

  this.resetpasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};



const model = mongoose.model('userdb', SomeModelSchema);


module.exports = model