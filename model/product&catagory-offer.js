const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
    unique: true, // Make sure this is correct and suits your use case
  },
  Type: String,
  item: String,
  discount_percentage: Number,
  max_discount_amount: Number,
  start_date: Date,
  expire_date: Date,

  islist:{
    type:Boolean,
    default:false
  },
  status: {
    type: String,
    default: 'inActive'
}});

const offermodel = mongoose.model('Offer', offerSchema);

module.exports = offermodel;
