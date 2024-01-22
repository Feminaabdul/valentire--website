const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productname:{
        type:String,
       
    },
    stockquantity:{
        type:String,
      
    },
    price:{
        type:Number,
       
    },
    mrp:{
        type:Number,
        
      
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"category"  
        
    },
    description:{
        type:String,
       
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
        
    },
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"offer"                                                                        
    },

},{timestamps:true})

const productmodel = mongoose.model("product",productSchema)
module.exports = productmodel