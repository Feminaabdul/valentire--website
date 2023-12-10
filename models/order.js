const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    Address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
        quantity: { type: Number, default: 1 },
        productPrice:{
            type:Number,
            required:true
        },
        totalPrice:{
            type:Number
        },
         isCancelled: {
            type: Boolean,
            default: false
        },
       
      returnStatus: { type: String, default: '' },
    
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
    deliveryDate: {
        type: Date,
    },
    status:{
        type:String,
        enum:['Processing', 'Shipped', 'Delivered', 'Pending', 'Cancelled'],

        default: 'Processing'
    },
    razorpayOrderId: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    orderWallet:{
        type:Number
    },
},
{timestamps:true}
)

const ordermodel = mongoose.model("order",orderSchema);
module.exports = ordermodel;