const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponcode: {
        type: String,
        unique: true
    },
    users_used: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    discount_percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    description:{
        type:String
    },
    max_discount_amount: {
        type: Number,
        min: 0
    },
    min_amount: {
        type: Number,
        min: 0
    },
    max_amount: {
        type: Number,
        min: 0
    },

    status: {
        type: String,
        default: 'Active'
    },
    expire_date: {
        type: Date
    },
    islisted: {
        type: Boolean,
        default: false
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    isExpired: {
        type: Boolean,
        default: true
    },
    isuserused: {
        type: Boolean,
        default: false
    }
});

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = Coupon;
