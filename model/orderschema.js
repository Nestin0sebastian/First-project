    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const ordersSchema = new Schema({
     
    orderId: {
        type: String,
        default: function() {
            const randomString = Math.random().toString(36).substring(2, 15);
            return `order_${randomString}`;
        }},
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userdb'
        },
        date: {
            type: Date,
            default: Date.now,
            required: false,
        },
        totalAmount: {
            type: Number,
        },
        paymentMethod: {
            type: String,
            required: false
        },
        products: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products'
            },
            quantity: {
                type: Number,
                required: false,
            },
            salesPrice: {
                type: Number,
                required: false
            },
            total: {
                type: Number,
                required: false
            },
            cancelStatus: {
                type: String,
                default:"pending"
            },
            reason: {
                type: String,
            }
        }],
        address: {
            name: {
                type: String,
                required: false
            },
            mobile: {
                type: Number,
                required: false
            },
            homeAddress: {
                type: String,
                required: false
            },
            pincode: {
                type: Number,
                required: false
            },
            locality: {
                type: String,
                required: false
            },
            city: {
                type: String,
                required: false
            },
            state: {
                type: String,
                required: false
            },
            altphone: {
                type: Boolean,
                default: false,
            },
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        orderStatus: {
            type: String,
            default: 'pending'
        },
        deliveredDate: {
            type: Date,
            default: null,
        },
        deliveredData: {
            type: Date,
            default: null
        },
        paymentStatus: {
            type: String,
            default: 'pending'
        },
        reason: {
            type: String,
            default: 'pending'
        },
        cancelstatus: {
            type: Boolean,
                default: false,
        }

    }, {
        timestamps: true
    });

    const orderModel = mongoose.model('orders', ordersSchema);

    module.exports = orderModel;















