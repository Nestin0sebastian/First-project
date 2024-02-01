  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;



  const productSchema = new Schema({
      productImage: [{
          type:String
      }],
      productName: String,
    
      category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
      },
      description:String,
      currentQut: Number,
      price: Number,
      size:String,
    previous_price:Number,
      
      islist:{
        type:Boolean,
        default:false
      },
     
      isoffer:{
        type:Boolean,
        default:false
      }})

      


  const productmodel = mongoose.model('products', productSchema);


  module.exports =productmodel
