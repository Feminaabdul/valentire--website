const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const categoryModel = mongoose.model("category",categorySchema)
module.exports = categoryModel;