const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, email: {
        type: String,
        required: true
    }, mobile: {
        type: Number,
        required: true
    }, password: {
        type: String,
        required: true
    }, is_admin: {
        type: Number,
        default: 0
    }, is_verified: {
        type: Number,
        default: 0
    }, token: {
        type: String,
        default: ""
    }, block: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
  
   
   wishlist:[{ type: mongoose.Schema.Types.ObjectId       ,

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",

    }

}]
   ,
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
        },
        quantity: {
            type: Number,
            default: 1
        },
        total: {
            type: Number,
            default: 0
        }
    }
    ]
})

module.exports = mongoose.model("User", userSchema)