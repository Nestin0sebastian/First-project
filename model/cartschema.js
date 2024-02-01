const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const cartSchema = new Schema({
    user: {
      type: ObjectId,
      ref: 'User' 
    },  
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products' 
      },
      quantity: Number,
      isSelected:{
        type:Boolean,
        default:false,
      }
    }],
    totalAmount: Number ,
    appliedCoupon: {
      type: Boolean,
      default: false
  }
  });
  




  


  const cartmodel = mongoose.model('cart', cartSchema);


  module.exports =cartmodel
  