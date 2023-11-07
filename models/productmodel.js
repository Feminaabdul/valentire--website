const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productname:{
        type:String,
        required: true
    },
    stockquantity:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    mrp:{
        type:Number,
        required:true
      
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Array
    },
    status:{
        type:Boolean,
        default:true
    },
    material:{
        type:String,
        required:true
    },
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"offer"                                                                        
    },

})

const productmodel = mongoose.model("product",productSchema)
module.exports = productmodel