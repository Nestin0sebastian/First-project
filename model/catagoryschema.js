const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const catagorySchema = new Schema({
    name: String,
    image: String,
    description: String, 
    islist:{
      type:Boolean,
      default:false
    }})



const categorymodel = mongoose.model('category', catagorySchema);


module.exports = categorymodel
