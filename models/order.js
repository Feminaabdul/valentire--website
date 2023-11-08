const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    Address:{
        type:String,
        required:true
    },
    
    userName:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    paymentId:{
        type:String
    },
    products:[{
        productId:{
            type:String,
            ref:"product",
            required:true
        },
        count:{
            type:Number,
        },
        productPrice:{
            type:Number,
            required:true
        },
        totalPrice:{
            type:Number
        }
    }],
    totalAmount:{
        type:Number,
        required:true
    },
 
    discountAmount : {
        type:Number,
        default: 0
    },
    date:{
        type:Date
    },
    status:{
        type:String
    },
    orderWallet:{
        type:Number
    },
},
{timestamps:true}
)

const ordermodel = mongoose.model("order",orderSchema);
module.exports = ordermodel;