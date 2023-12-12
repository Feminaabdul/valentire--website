const mongoose = require("mongoose")
const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Credit', 'Debit'],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

const walletSchema = new mongoose.Schema({
    balance: {
        type: Number,
        default: 0,
    },
    transactions: [transactionSchema],
});
const userSchema = new mongoose.Schema({
    name: {
        type: String,
       
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
  
   
   wishlist:[{    

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",

    }, quantity: {
        type: Number,
        default: 1
    },
    total: {
        type: Number,
        default: 0
    }

}] ,wallet: walletSchema
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
    }],

   

})

module.exports = mongoose.model("User", userSchema)