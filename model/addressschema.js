const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const addressSchema = new Schema({
    addresses: [{
        fullname: {
            type: String,
            required: true
        },
        contact: {
            type: Number,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        locality: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdbs"
    }
}, {
    timestamps: true
});





const addressmodel = mongoose.model('address', addressSchema);


module.exports =addressmodel
