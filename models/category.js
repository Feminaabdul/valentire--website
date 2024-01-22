const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    } ,
      offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"offer"                                                                        
    },
},{timestamps:true})

const categoryModel = mongoose.model("category",categorySchema)
module.exports = categoryModel;