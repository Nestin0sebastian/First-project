const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Schema = mongoose.Schema;

const wishlistSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    products: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products' 
        },
        quantity: Number,
      },
    ],
    
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
